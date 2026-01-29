// ========== Responses API Types ==========

// Responses API 流式事件类型
export type ResponsesStreamEventType =
  | 'response.created'
  | 'response.in_progress'
  | 'response.output_item.added'
  | 'response.output_text.delta'
  | 'response.output_text.done'
  | 'response.reasoning.delta'
  | 'response.reasoning.done'
  | 'response.reasoning_text.delta'
  | 'response.reasoning_text.done'
  | 'response.reasoning_summary_text.delta'
  | 'response.reasoning_summary_text.done'
  | 'response.reasoning_summary_part.added'
  | 'response.reasoning_summary_part.done'
  | 'response.completed'
  | 'response.failed'
  | 'error';

// 流式事件接口
export interface ResponsesStreamEvent {
  type: ResponsesStreamEventType;
  delta?: string;
  text?: string;
  item_id?: string;
  output_index?: number;
  content_index?: number;
  sequence_number?: number;
  response?: ResponsesApiResponse;
  error?: {
    type: string;
    message: string;
  };
}

// 非流式响应
export interface ResponsesApiResponse {
  id: string;
  object: 'response';
  created_at: number;
  status: 'completed' | 'failed' | 'in_progress' | 'cancelled';
  model: string;
  output: ResponsesOutputItem[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    reasoning_tokens?: number;
  };
}

export interface ResponsesOutputItem {
  type: 'message' | 'reasoning';
  id: string;
  role?: 'assistant';
  content?: ResponsesContentPart[];
  summary?: ResponsesContentPart[];
}

export interface ResponsesContentPart {
  type: 'output_text' | 'refusal';
  text?: string;
  refusal?: string;
}

// 统一的解析结果格式
export interface ParsedStreamData {
  content?: string;
  reasoning?: string;
  done?: boolean;
  error?: string;
}

export type EventSourceData = ResponsesStreamEvent | ParsedStreamData | '[DONE]';

// ========== ShareGPT Types ==========

export interface ShareGPTSubmitBodyInterface {
  avatarUrl: string;
  items: {
    from: 'gpt' | 'human';
    value: string;
  }[];
}
