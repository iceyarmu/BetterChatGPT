// 基础模型配置接口（用于类型校验）
interface ModelConfigBase {
  modelName: string;
  reasoning?: string;
  displayName?: string;
  apiName?: string;
  isCompletions?: boolean;  // 使用 Chat Completions API 而不是 Responses API
  webSearch?: string; // 网络搜索强度，如 'high'、'medium'、'low'
}

// 模型配置列表 (使用 as const + satisfies 保留字面量类型并校验结构)
export const ModelConfigs = [
  {
    modelName: 'gpt-5.5',
    apiName: 'gpt-5.5',
    reasoning: 'none',
    displayName: 'GPT 5.5',
  },
  {
    modelName: 'gpt-5.5-thinking',
    apiName: 'gpt-5.5',
    reasoning: 'medium',
    webSearch: 'medium',
    displayName: 'GPT 5.5 Thinking',
  },
  {
    modelName: 'gpt-5-nano',
    reasoning: 'minimal',
  },
  {
    modelName: 'claude-opus-4-7',
    apiName: 'claude-opus-4-7',
    reasoning: 'high',
    webSearch: 'high',
    displayName: 'Claude Opus 4.7',
  },
  {
    modelName: 'claude-sonnet-4-6',
    apiName: 'claude-sonnet-4-6',
    reasoning: 'high',
    webSearch: 'high',
    displayName: 'Claude Sonnet 4.6',
  },
  {
    modelName: 'gemini-3.1-pro',
    apiName: 'gemini-3.1-pro-preview',
    reasoning: 'high',
    webSearch: 'high',
    displayName: 'Gemini 3.1 Pro',
  },
  {
    modelName: 'gemini-3-flash',
    apiName: 'gemini-3-flash-preview',
    reasoning: 'high',
    webSearch: 'high',
    displayName: 'Gemini 3 Flash',
  },
  // {
  //   modelName: 'gemini-2.5-flash-lite',
  // },
  // {
  //   modelName: 'deepseek-r1',
  //   displayName: 'DeepSeek R1',
  // },
  {
    modelName: 'grok-4.20',
    reasoning: 'high',
    displayName: 'Grok 4.2',
  },
] as const satisfies readonly ModelConfigBase[];

// 从配置中提取所有模型名作为类型
export type ModelOptions = typeof ModelConfigs[number]['modelName'];

// 导出的模型配置接口
export interface ModelConfig {
  modelName: ModelOptions;
  reasoning?: string;
  displayName?: string;
  apiName?: string;
  isCompletions?: boolean;  // 使用 Chat Completions API 而不是 Responses API
  webSearch?: string; // 网络搜索强度，如 'high'、'medium'、'low'
}

// 辅助函数：获取模型配置
export const getModelConfig = (model: ModelOptions): ModelConfig | undefined => {
  return (ModelConfigs as readonly ModelConfig[]).find(c => c.modelName === model);
};

// 辅助函数：获取可见模型列表（用于 UI）
export const getVisibleModels = (): ModelConfig[] => {
  return (ModelConfigs as readonly ModelConfig[]).filter(c => !!c.displayName);
};

// 辅助函数：获取所有模型名列表（用于验证）
export const getAllModelNames = (): ModelOptions[] => {
  return (ModelConfigs as readonly ModelConfig[]).map(c => c.modelName);
};

// 默认模型
export const defaultModel: ModelOptions = 'gpt-5.5';

// 自动标题生成使用的模型
export const defaultTitleModel: ModelOptions = 'gpt-5-nano';
