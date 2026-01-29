import { EventSourceData, ResponsesStreamEvent, ParsedStreamData, ChatCompletionsStreamEvent } from '@type/api';

// 将 Responses API 事件转换为统一格式
const convertToUnifiedFormat = (event: ResponsesStreamEvent): ParsedStreamData | null => {
  switch (event.type) {
    case 'response.output_text.delta':
      return { content: event.delta };

    case 'response.reasoning.delta':
    case 'response.reasoning_text.delta':
    case 'response.reasoning_summary_text.delta':
      return { reasoning: event.delta };

    case 'response.completed':
      return { done: true };

    case 'response.failed':
    case 'error':
      return { error: event.error?.message || 'Unknown error' };

    // 忽略其他事件类型（response.created, response.in_progress 等）
    default:
      return null;
  }
};

export const parseEventSource = (
  data: string
): '[DONE]' | ParsedStreamData[] => {
  const result: ParsedStreamData[] = [];

  // 按行分割并处理
  const lines = data.split('\n');

  for (const line of lines) {
    // 跳过空行和非 data 行
    if (!line.startsWith('data: ')) continue;

    const jsonString = line.slice(6).trim(); // 移除 'data: ' 前缀

    // 处理结束标记
    if (jsonString === '[DONE]') {
      return '[DONE]';
    }

    try {
      const event: ResponsesStreamEvent = JSON.parse(jsonString);
      const parsed = convertToUnifiedFormat(event);
      if (parsed) {
        result.push(parsed);
      }
    } catch {
      // JSON 解析失败，可能是不完整的数据，跳过
      continue;
    }
  }

  return result;
};

// 解析 Chat Completions API 流式事件
export const parseCompletionsEventSource = (
  data: string
): '[DONE]' | ParsedStreamData[] => {
  const result: ParsedStreamData[] = [];
  const lines = data.split('\n');

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const jsonString = line.slice(6).trim();

    if (jsonString === '[DONE]') {
      return '[DONE]';
    }

    try {
      const event: ChatCompletionsStreamEvent = JSON.parse(jsonString);
      const delta = event.choices?.[0]?.delta;
      if (delta?.content) {
        result.push({ content: delta.content });
      }
      if (delta?.reasoning_content) {
        result.push({ reasoning: delta.reasoning_content });
      }
      if (event.choices?.[0]?.finish_reason === 'stop') {
        result.push({ done: true });
      }
    } catch {
      continue;
    }
  }

  return result;
};

export const createMultipartRelatedBody = (
  metadata: object,
  file: File,
  boundary: string
): Blob => {
  const encoder = new TextEncoder();

  const metadataPart = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}\r\n`
  );
  const filePart = encoder.encode(
    `--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`
  );
  const endBoundary = encoder.encode(`\r\n--${boundary}--`);

  return new Blob([metadataPart, filePart, file, endBoundary], {
    type: 'multipart/related; boundary=' + boundary,
  });
};
