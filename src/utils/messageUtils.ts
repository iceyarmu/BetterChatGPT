import { MessageInterface, ModelOptions } from '@type/chat';

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
  const msgSep = '';
  const roleSep = '<|im_sep|>';

  const serialized = messages
    .map(({ role, content }) => {
      return `<|im_start|>${role}${roleSep}${content}<|im_end|>`;
    })
    .join(msgSep);

  return encoder.encode(serialized, 'all');
};

const countTokens = (messages: MessageInterface[], model: ModelOptions) => {
  if (messages.length === 0) return 0;
  const messagesWithoutThink = messages.map(message => removeThinkTags(message));
  return getChatGPTEncoding(messagesWithoutThink, model).length;
}

export const limitMessageTokens = (
  messages: MessageInterface[],
  limit: number = 100000,
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

export default countTokens;
