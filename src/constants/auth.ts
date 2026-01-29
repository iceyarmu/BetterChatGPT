// 基础 API 路径
export const officialAPIEndpoint = import.meta.env.VITE_DEFAULT_API_ENDPOINT || '/v4';

// Responses API 端点
export const responsesAPIEndpoint = `${officialAPIEndpoint}/responses`;

// Chat Completions API 端点
export const completionsAPIEndpoint = `${officialAPIEndpoint}/chat/completions`;

export const defaultAPIKey = import.meta.env.VITE_OPENAI_API_KEY || '';
