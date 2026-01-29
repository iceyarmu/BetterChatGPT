import React from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { ParsedStreamData } from '@type/api';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource, parseCompletionsEventSource } from '@api/helper';
import { limitMessageTokens } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { defaultTitleModel, getModelConfig } from '@constants/config';
import { responsesAPIEndpoint, defaultAPIKey } from '@constants/auth';

const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = responsesAPIEndpoint;  // 仅作为占位符，实际端点由模型配置决定
  const apiKey = defaultAPIKey;
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);

  const generateTitle = async (
    message: MessageInterface[]
  ): Promise<string> => {
    let config = {..._defaultChatConfig};
    config.model = defaultTitleModel;

    // getChatCompletion 现在返回 { content, reasoning }
    const result = await getChatCompletion(
      apiEndpoint,
      message,
      config,
      apiKey || undefined
    );

    return result.content;
  };

  const handleSubmit = async () => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
    });

    setChats(updatedChats);
    setGenerating(true);

    try {
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      const messages = limitMessageTokens(
        chats[currentChatIndex].messages,
        100000,
        chats[currentChatIndex].config.model
      );
      if (messages.length === 0) throw new Error('Message exceed max token!');

      // 获取流式响应
      stream = await getChatCompletionStream(
        apiEndpoint,
        messages,
        chats[currentChatIndex].config,
        apiKey || undefined
      );

      if (stream) {
        if (stream.locked)
          throw new Error(
            'Oops, the stream is locked right now. Please try again'
          );
        const reader = stream.getReader();
        let reading = true;
        let partial = '';

        while (reading && useStore.getState().generating) {
          const { done, value } = await reader.read();

          // 根据模型配置选择解析器
          const modelConfig = getModelConfig(chats[currentChatIndex].config.model);
          const isCompletions = modelConfig?.isCompletions;
          const result = isCompletions
            ? parseCompletionsEventSource(partial + new TextDecoder().decode(value))
            : parseEventSource(partial + new TextDecoder().decode(value));
          partial = '';

          if (result === '[DONE]' || done) {
            reading = false;
          } else {
            // 处理 Responses API 格式的流式数据
            const resultString = (result as ParsedStreamData[]).reduce(
              (output: string[], curr) => {
                // 检查是否完成或出错
                if (curr.done) {
                  reading = false;
                }
                if (curr.error) {
                  throw new Error(curr.error);
                }

                // 提取 content 和 reasoning
                if (curr.content) {
                  output[0] += curr.content;
                }
                if (curr.reasoning) {
                  output[1] += curr.reasoning;
                }

                return output;
              },
              ['', '']
            );

            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            const updatedMessages = updatedChats[currentChatIndex].messages;
            const message = updatedMessages[updatedMessages.length - 1];
            message.content += resultString[0];
            if (resultString[1]) {
              if (!message.reasoning) {
                message.reasoning = '';
              }
              message.reasoning += resultString[1];
            }
            setChats(updatedChats);
          }
        }
        if (useStore.getState().generating) {
          reader.cancel('Cancelled by user');
        } else {
          reader.cancel('Generation completed');
        }
        reader.releaseLock();
        stream.cancel();
      }

      // generate title for new chats
      const currChats = useStore.getState().chats;
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;
        let assistant_message =
          currChats[currentChatIndex].messages[messages_length - 1].content;
        let user_message =
          currChats[currentChatIndex].messages[messages_length - 2].content;

        if (assistant_message.length > 200) {
          assistant_message = assistant_message.substring(0, 100) + ' ... ' + assistant_message.substring(assistant_message.length-100, assistant_message.length);;
        }
        if (user_message.length > 200) {
          user_message = user_message.substring(0, 100) + ' ... ' + user_message.substring(user_message.length-100, user_message.length);;
        }

        const message: MessageInterface = {
          role: 'user',
          content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
        };

        let title = (await generateTitle([message])).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);
      }
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.log(err, (e as Error).stack);
      setError(err);
    }
    setGenerating(false);
  };

  return { handleSubmit, error };
};

export default useSubmit;
