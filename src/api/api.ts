import { ShareGPTSubmitBodyInterface, ResponsesApiResponse, ChatCompletionsResponse } from '@type/api';
import { ConfigInterface, MessageInterface } from '@type/chat';
import { getModelConfig } from '@constants/config';
import { completionsAPIEndpoint, responsesAPIEndpoint } from '@constants/auth';

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
  _endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const modelConfig = getModelConfig(config.model);
  const model = modelConfig?.apiName || config.model;
  const isCompletions = modelConfig?.isCompletions;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  if (isCompletions) {
    // Chat Completions API
    const response = await fetch(completionsAPIEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const data: ChatCompletionsResponse = await response.json();
    return { content: data.choices[0]?.message?.content || '' };
  } else {
    // Responses API
    const systemMessages = messages.filter(m => m.role === 'system');
    const inputMessages = messages.filter(m => m.role !== 'system');
    const reasoning = modelConfig?.reasoning ? { effort: modelConfig.reasoning } : undefined;

    const response = await fetch(responsesAPIEndpoint, {
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
  }
};

export const getChatCompletionStream = async (
  _endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const modelConfig = getModelConfig(config.model);
  const model = modelConfig?.apiName || config.model;
  const isCompletions = modelConfig?.isCompletions;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  let response: Response;

  if (isCompletions) {
    // Chat Completions API
    response = await fetch(completionsAPIEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });
  } else {
    // Responses API
    const systemMessages = messages.filter(m => m.role === 'system');
    const inputMessages = messages.filter(m => m.role !== 'system');
    const reasoning = modelConfig?.reasoning ? { effort: modelConfig.reasoning } : undefined;

    response = await fetch(responsesAPIEndpoint, {
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
  }

  // 错误处理
  if (response.status === 404 || response.status === 405) {
    const text = await response.text();
    if (text.includes('model_not_found')) {
      throw new Error(text + '\nPlease ensure that you have access to this model!');
    } else {
      throw new Error('Invalid API endpoint!');
    }
  }

  if (response.status === 429 || !response.ok) {
    const text = await response.text();
    let error = text;
    if (text.includes('insufficient_quota')) {
      error += '\nInsufficient quota. Please check your API key.';
    } else if (response.status === 429) {
      error += '\nRate limited!';
    }
    throw new Error(error);
  }

  return response.body;
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
