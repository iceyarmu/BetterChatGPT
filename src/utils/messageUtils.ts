import { MessageInterface } from '@type/chat';

export const limitMessages = (
  messages: MessageInterface[],
  groupSize: number = 6
): MessageInterface[] => {
  if (messages.length === 0) return [];

  // 1. 如果消息很少（≤2组+1），直接返回全部
  if (messages.length <= groupSize * 2 + 1) {
    return messages;
  }

  // 2. 第一条消息必须保留
  const firstMsg = messages[0];
  const restMsgs = messages.slice(1);

  // 3. 每 groupSize 条消息作为一组，保留最近两组
  const totalGroups = Math.ceil(restMsgs.length / groupSize);
  const keepGroups = 2;
  const startGroupIndex = Math.max(0, totalGroups - keepGroups);
  const startIndex = startGroupIndex * groupSize;

  // 4. 截取最近两组
  const keptMsgs = restMsgs.slice(startIndex);

  // 5. 组装结果：第一条 + 最近两组
  return [firstMsg, ...keptMsgs];
};
