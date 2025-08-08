import { MessageInterface, ModelOptions, TotalTokenUsed } from '@type/chat';

import useStore from '@store/store';

import { Tiktoken } from '@dqbd/tiktoken/lite';
const cl100k_base = await import('@dqbd/tiktoken/encoders/cl100k_base.json');

const encoder = new Tiktoken(
  cl100k_base.bpe_ranks,
  {
    ...cl100k_base.special_tokens,
    '<|im_start|>': 100264,
    '<|im_end|>': 100265,
    '<|im_sep|>': 100266,
  },
  cl100k_base.pat_str
);

const removeThinkTags = (message: MessageInterface): MessageInterface => {
  return {
    ...message,
    content: message.content.replace(/<think>.*?<\/think>/gs, ''),
    reasoning: undefined,
  };
};

// https://github.com/dqbd/tiktoken/issues/23#issuecomment-1483317174
export const getChatGPTEncoding = (
  messages: MessageInterface[],
  model: ModelOptions
) => {
  const isGpt3 = false;//model === 'gpt-3.5-turbo' || model === 'gpt-3.5-turbo-16k';

  const msgSep = isGpt3 ? '\n' : '';
  const roleSep = isGpt3 ? '\n' : '<|im_sep|>';

  const serialized = //[
    messages
      .map(({ role, content }) => {
        return `<|im_start|>${role}${roleSep}${content}<|im_end|>`;
      })
      .join(msgSep);//,
    // `<|im_start|>assistant${roleSep}`,
  // ].join(msgSep);

  return encoder.encode(serialized, 'all');
};


const countTokens = (messages: MessageInterface[], model: ModelOptions) => {
  if (messages.length === 0) return 0;
  const messagesWithoutThink = messages.map(message => removeThinkTags(message));
  return getChatGPTEncoding(messagesWithoutThink, model).length;
}

export const countCurrentTokens = (messages: MessageInterface[], model: ModelOptions) : number[] => {
  if (messages.length === 0) return [0,0];
  let roundMessages = messages.slice(-6).slice(0, -1);
  let promptTokens = getChatGPTEncoding(roundMessages, model).length + 49;
  let completionTokens = getChatGPTEncoding([messages[messages.length-1]], model).length - 4;
  return [promptTokens, completionTokens];
};

export const countTotalTokens = (messages: MessageInterface[], model: ModelOptions) : number[] => {
  if (messages.length === 0) return [0,0];
  let promptTokens = 0;
  let completionTokens = 0;
  let roundMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    roundMessages.push(message);
    if (message.role === 'assistant') {
      const [prompt, completion] = countCurrentTokens(roundMessages, model);
      promptTokens += prompt;
      completionTokens += completion;
    }
  }
  return [promptTokens, completionTokens];
};

const genSystemMessage = () : MessageInterface => {
  const date = new Date();
  const dateString =
    date.getFullYear() +
    '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + date.getDate()).slice(-2) +
    ' ' +
    ('0' + date.getHours()).slice(-2) +
    ':' +
    ('0' + date.getMinutes()).slice(-2);
  return {
    role: 'system',
    content: "You are ChatGPT 5, a large language model trained by OpenAI. Carefully heed the user's instructions. Respond using Markdown. Current time: " + dateString 
  }
}

export const limitMessageTokens = (
  messages: MessageInterface[],
  limit: number = 4096,
  model: ModelOptions
): MessageInterface[] => {
  const limitedMessages: MessageInterface[] = [];
  let tokenCount = 0;
  let messageCount = 0;
  const maxMessages = 6;

  const isSystemFirstMessage = messages[0]?.role === 'system';
  let retainSystemMessage = false;

  // Check if the first message is a system message and if it fits within the token limit
  if (isSystemFirstMessage) {
    const systemTokenCount = countTokens([messages[0]], model);
    if (systemTokenCount < limit) {
      tokenCount += systemTokenCount;
      retainSystemMessage = true;
    }
  }

  // Iterate through messages in reverse order, adding them to the limitedMessages array
  // until the token limit is reached (excludes first message)
  for (let i = messages.length - 1; i >= 1; i--) {
    const count = countTokens([messages[i]], model);
    if (count + tokenCount > limit - 250 || messageCount > maxMessages) break;
    tokenCount += count;
    messageCount++;
    limitedMessages.unshift(removeThinkTags(messages[i]));
  }

  // Process first message
  if (retainSystemMessage) {
    // Insert the system message in the third position from the end
    limitedMessages.splice(-3, 0, removeThinkTags(messages[0]));
  } else if (!isSystemFirstMessage) {
    // Check if the first message (non-system) can fit within the limit
    const firstMessageTokenCount = countTokens([messages[0]], model);
    if (firstMessageTokenCount + tokenCount < limit) {
      limitedMessages.unshift(removeThinkTags(messages[0]));
    }
  }

  return limitedMessages;
};

export const updateTotalTokenUsed = ( 
  model: ModelOptions,
  messages: MessageInterface[]
) => {
  const setTotalTokenUsed = useStore.getState().setTotalTokenUsed;
  const updatedTotalTokenUsed: TotalTokenUsed = JSON.parse(
    JSON.stringify(useStore.getState().totalTokenUsed)
  );

  const [newPromptTokens, newCompletionTokens] = countCurrentTokens(messages, model);
  const { promptTokens = 0, completionTokens = 0 } =
    updatedTotalTokenUsed[model] ?? {};

  updatedTotalTokenUsed[model] = {
    promptTokens: promptTokens + newPromptTokens,
    completionTokens: completionTokens + newCompletionTokens,
  };
  setTotalTokenUsed(updatedTotalTokenUsed);
};

export default countTokens;
