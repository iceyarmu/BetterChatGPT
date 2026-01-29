// 基础模型配置接口（用于类型校验）
interface ModelConfigBase {
  modelName: string;
  reasoning?: string;
  displayName?: string;
  displayHidden?: boolean;
  apiName?: string;
  isCompletions?: boolean;  // 使用 Chat Completions API 而不是 Responses API
}

// 模型配置列表 (使用 as const + satisfies 保留字面量类型并校验结构)
export const ModelConfigs = [
  { modelName: 'gpt-5.2', apiName: 'gpt-5.2-chat-latest', reasoning: 'none', displayName: 'GPT 5.2' },
  { modelName: 'gpt-5.2-thinking', apiName: 'gpt-5.2', reasoning: 'high', displayName: 'GPT 5.2 Thinking' },
  { modelName: 'gpt-5-nano', reasoning: 'minimal', displayHidden: true },
  { modelName: 'gpt-4.1', displayName: 'GPT 4.1' },
  { modelName: 'gpt-4o', displayName: 'GPT 4o' },
  { modelName: 'claude-opus-4-5', apiName: 'claude-opus-4-5-thinking', isCompletions: true, displayName: 'Claude Opus 4.5' },
  { modelName: 'claude-sonnet-4-5', apiName: 'claude-sonnet-4-5-thinking', isCompletions: true, displayName: 'Claude Sonnet 4.5' },
  { modelName: 'deepseek-r1', displayName: 'DeepSeek R1' },
  { modelName: 'gemini-3-pro', isCompletions: true, displayName: 'Gemini 3 Pro' },
  { modelName: 'grok-4.1-fast', reasoning: 'high', displayName: 'Grok 4.1' },
] as const satisfies readonly ModelConfigBase[];

// 从配置中提取所有模型名作为类型
export type ModelOptions = typeof ModelConfigs[number]['modelName'];

// 导出的模型配置接口
export interface ModelConfig {
  modelName: ModelOptions;
  reasoning?: string;
  displayName?: string;
  displayHidden?: boolean;
  apiName?: string;
  isCompletions?: boolean;  // 使用 Chat Completions API 而不是 Responses API
}

// 辅助函数：获取模型配置
export const getModelConfig = (model: ModelOptions): ModelConfig | undefined => {
  return (ModelConfigs as readonly ModelConfig[]).find(c => c.modelName === model);
};

// 辅助函数：获取可见模型列表（用于 UI）
export const getVisibleModels = (): ModelConfig[] => {
  return (ModelConfigs as readonly ModelConfig[]).filter(c => !c.displayHidden);
};

// 辅助函数：获取所有模型名列表（用于验证）
export const getAllModelNames = (): ModelOptions[] => {
  return (ModelConfigs as readonly ModelConfig[]).map(c => c.modelName);
};

// 默认模型
export const defaultModel: ModelOptions = 'gpt-5.2';

// 自动标题生成使用的模型
export const defaultTitleModel: ModelOptions = 'gpt-5-nano';
