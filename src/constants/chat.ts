import { v4 as uuidv4 } from 'uuid';
import { ChatInterface, ConfigInterface, ModelOptions } from '@type/chat';
import useStore from '@store/store';

const date = new Date();
const dateString =
  date.getFullYear() +
  '-' +
  ('0' + (date.getMonth() + 1)).slice(-2) +
  '-' +
  ('0' + date.getDate()).slice(-2);

// default system message obtained using the following method: https://twitter.com/DeminDimin/status/1619935545144279040
export const _defaultSystemMessage = ``;

//这里注册所有可选择的模型列表
export const modelOptions: ModelOptions[] = [
  'gpt-5.1',
  'gpt-5.1-thinking',
  'gpt-4.1',
  'gpt-4o',
  'claude-opus-4-5-thinking',
  'claude-sonnet-4-5-thinking',
  'deepseek-r1',
  'gemini-3-pro',
  'grok-4',
  'grok-4.1-fast',
];

export const defaultModel = 'gpt-5.1';

export const modelMaxToken = {
  'gpt-5.1': 400000,
  'gpt-5.1-thinking': 400000,
  'gpt-5.1-chat-latest': 400000,
  'gpt-5': 400000,
  'gpt-5-nano': 400000,
  'gpt-4.1': 1000000,
  'gpt-4.1-nano': 1000000,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'o3': 200000,
  'o4-mini-high': 200000,
  'claude-opus-4-5-thinking': 200000,
  'claude-sonnet-4-5-thinking': 200000,
  'deepseek-r1': 128000,
  'gemini-3-pro': 1000000,
  'grok-4': 2000000,
  'grok-4.1-fast': 2000000,
};

export const modelCost = {
  'gpt-5.1': {
    prompt: { price: 1.25, unit: 1000000 },
    completion: { price: 10, unit: 1000000 },
  },
  'gpt-5.1-thinking': {
    prompt: { price: 1.25, unit: 1000000 },
    completion: { price: 10, unit: 1000000 },
  },
  'gpt-5.1-chat-latest': {
    prompt: { price: 1.25, unit: 1000000 },
    completion: { price: 10, unit: 1000000 },
  },
  'gpt-5': {
    prompt: { price: 1.25, unit: 1000000 },
    completion: { price: 10, unit: 1000000 },
  },
  'gpt-5-nano': {
    prompt: { price: 0.05, unit: 1000000 },
    completion: { price: 0.4, unit: 1000000 },
  },
  'gpt-4.1': {
    prompt: { price: 2, unit: 1000000 },
    completion: { price: 8, unit: 1000000 },
  },
  'gpt-4.1-nano': {
    prompt: { price: 0.1, unit: 1000000 },
    completion: { price: 0.4, unit: 1000000 },
  },
  'gpt-4o': {
    prompt: { price: 2.50, unit: 1000000 },
    completion: { price: 10.00, unit: 1000000 },
  },
  'gpt-4o-mini': {
    prompt: { price: 0.15, unit: 1000000 },
    completion: { price: 0.60, unit: 1000000 },
  },
  'o3': {
    prompt: { price: 2, unit: 1000000 },
    completion: { price: 8, unit: 1000000 },
  },
  'o4-mini-high': {
    prompt: { price: 1.10, unit: 1000000 },
    completion: { price: 4.40, unit: 1000000 },
  },
  'claude-opus-4-5-thinking': {
    prompt: { price: 5.00, unit: 1000000 },
    completion: { price: 25.00, unit: 1000000 },
  },
  'claude-sonnet-4-5-thinking': {
    prompt: { price: 3.00, unit: 1000000 },
    completion: { price: 15.00, unit: 1000000 },
  },
  'deepseek-r1': {
    prompt: { price: 3.00, unit: 1000000 },
    completion: { price: 8.00, unit: 1000000 },
  },
  'gemini-3-pro': {
    prompt: { price: 2, unit: 1000000 },
    completion: { price: 12.00, unit: 1000000 },
  },
  'grok-4': {
    prompt: { price: 3, unit: 1000000 },
    completion: { price: 15.00, unit: 1000000 },
  },
  'grok-4.1-fast': {
    prompt: { price: 0.2, unit: 1000000 },
    completion: { price: 0.5, unit: 1000000 },
  },
};

export const defaultUserMaxToken = 4096;

export const _defaultChatConfig: ConfigInterface = {
  model: defaultModel,
  max_tokens: defaultUserMaxToken,
  temperature: 1,
  presence_penalty: 0,
  top_p: 1,
  frequency_penalty: 0,
};

export const generateDefaultChat = (
  title?: string,
  folder?: string
): ChatInterface => ({
  id: uuidv4(),
  title: title ? title : 'New Chat',
  messages:
    useStore.getState().defaultSystemMessage.length > 0
      ? [{ role: 'system', content: useStore.getState().defaultSystemMessage }]
      : [],
  config: { ...useStore.getState().defaultChatConfig },
  titleSet: false,
  folder,
});

export const codeLanguageSubset = [
  'python',
  'javascript',
  'java',
  'go',
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'graphql',
  'json',
  'kotlin',
  'less',
  'lua',
  'makefile',
  'markdown',
  'objectivec',
  'perl',
  'php',
  'php-template',
  'plaintext',
  'python-repl',
  'r',
  'ruby',
  'rust',
  'scss',
  'shell',
  'sql',
  'swift',
  'typescript',
  'vbnet',
  'wasm',
  'xml',
  'yaml',
];
