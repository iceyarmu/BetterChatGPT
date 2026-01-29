import { ShareGPTSubmitBodyInterface, ResponsesApiResponse } from '@type/api';
import { ConfigInterface, MessageInterface } from '@type/chat';
import { getModelConfig } from '@constants/config';

// 从 Responses API 响应中提取内容
const extractResponseContent = (data: ResponsesApiResponse): { content: string; reasoning?: string } => {
  let content = '';
  let reasoning = '';

  for (const item of data.output || []) {
    if (item.type === 'message' && item.content) {
      for (const part of item.content) {
        if (part.type === 'output_text' && part.text) {
          content += part.text;
        }
      }
    } else if (item.type === 'reasoning' && item.summary) {
      for (const part of item.summary) {
        if (part.type === 'output_text' && part.text) {
          reasoning += part.text;
        }
      }
    }
  }

  return { content, reasoning: reasoning || undefined };
};

export const getChatCompletion = async (
  endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  // 分离 system message 作为 instructions
  const systemMessages = messages.filter(m => m.role === 'system');
  const inputMessages = messages.filter(m => m.role !== 'system');

  // 从配置获取模型信息
  const modelConfig = getModelConfig(config.model);
  const model = modelConfig?.apiName || config.model;
  const reasoning = modelConfig?.reasoning ? { effort: modelConfig.reasoning } : undefined;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      input: inputMessages.map(m => ({ role: m.role, content: m.content })),
      instructions: systemMessages.length > 0
        ? systemMessages.map(m => m.content).join('\n')
        : undefined,
      reasoning,
    }),
  });

  if (!response.ok) throw new Error(await response.text());

  const data: ResponsesApiResponse = await response.json();
  return extractResponseContent(data);
};

export const getChatCompletionStream = async (
  endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  // 分离 system message 作为 instructions
  const systemMessages = messages.filter(m => m.role === 'system');
  const inputMessages = messages.filter(m => m.role !== 'system');

  // 从配置获取模型信息
  const modelConfig = getModelConfig(config.model);
  const model = modelConfig?.apiName || config.model;
  const reasoning = modelConfig?.reasoning ? { effort: modelConfig.reasoning } : undefined;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      input: inputMessages.map(m => ({ role: m.role, content: m.content })),
      instructions: systemMessages.length > 0
        ? systemMessages.map(m => m.content).join('\n')
        : undefined,
      stream: true,
      reasoning,
    }),
  });

  if (response.status === 404 || response.status === 405) {
    const text = await response.text();

    if (text.includes('model_not_found')) {
      throw new Error(
        text +
          '\nMessage from ChatGPT:\nPlease ensure that you have access to the GPT-4 API!'
      );
    } else {
      throw new Error(
        'Message from ChatGPT:\nInvalid API endpoint! We recommend you to check your free API endpoint.'
      );
    }
  }

  if (response.status === 429 || !response.ok) {
    const text = await response.text();
    let error = text;
    if (text.includes('insufficient_quota')) {
      error +=
        '\nMessage from ChatGPT:\nWe recommend changing your API endpoint or API key';
    } else if (response.status === 429) {
      error += '\nRate limited!';
    }
    throw new Error(error);
  }

  const stream = response.body;
  return stream;
};

export const submitShareGPT = async (body: ShareGPTSubmitBodyInterface) => {
  const request = await fetch('https://sharegpt.com/api/conversations', {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const response = await request.json();
  const { id } = response;
  const url = `https://shareg.pt/${id}`;
  window.open(url, '_blank');
};
