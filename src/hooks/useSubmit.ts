import React from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { ParsedStreamData } from '@type/api';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens, updateTotalTokenUsed } from '@utils/messageUtils';
import { _defaultChatConfig, modelMaxToken } from '@constants/chat';
import { defaultAPIEndpoint, defaultAPIKey } from '@constants/auth';

const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = defaultAPIEndpoint;
  const apiKey = defaultAPIKey;
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);

  const generateTitle = async (
    message: MessageInterface[]
  ): Promise<string> => {
    let config = {..._defaultChatConfig};
    config.model = 'gpt-5-nano';

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
        modelMaxToken[chats[currentChatIndex].config.model],
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
          const result = parseEventSource(
            partial + new TextDecoder().decode(value)
          );
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

      // update tokens used in chatting
      const currChats = useStore.getState().chats;
      const countTotalTokens = useStore.getState().countTotalTokens;

      if (currChats && countTotalTokens) {
        const model = currChats[currentChatIndex].config.model;
        const messages = currChats[currentChatIndex].messages;
        updateTotalTokenUsed(
          model,
          messages
        );
      }

      // generate title for new chats
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

        // update tokens used for generating title
        if (countTotalTokens) {
          const model = 'gpt-5-nano';
          updateTotalTokenUsed(model, [message, {
            role: 'assistant',
            content: title,
          }]);
        }
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
