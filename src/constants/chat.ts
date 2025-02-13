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

export const modelOptions: ModelOptions[] = [
  // 'gpt-3.5-turbo',
  // 'gpt-3.5-turbo-16k',
  // 'gpt-4',
  // 'gpt-4-turbo',
  // 'qwen2.5-coder:32b',
  // 'claude-3-5-haiku',
  // 'deepseek-v3'
  'gpt-4o',
  'gpt-4o-mini',
  'o3-mini',
  'claude-3-5-sonnet',
  'deepseek-r1',
];

export const defaultModel = 'gpt-4o';

export const modelMaxToken = {
  // 'gpt-3.5-turbo': 16384,
  // 'gpt-3.5-turbo-0301': 16384,
  // 'gpt-3.5-turbo-0613': 16384,
  // 'gpt-3.5-turbo-16k': 16384,
  // 'gpt-3.5-turbo-16k-0613': 16384,
  // 'gpt-3.5-turbo-1106': 16384,
  // 'gpt-3.5-turbo-0125': 16384,
  // 'gpt-4': 8192,
  // 'gpt-4-0314': 8192,
  // 'gpt-4-0613': 8192,
  // 'gpt-4-32k': 32768,
  // 'gpt-4-32k-0314': 32768,
  // 'gpt-4-32k-0613': 32768,
  // 'gpt-4-1106-preview': 128000,
  // 'gpt-4-turbo-preview': 128000,
  // 'gpt-4-turbo': 128000,
  // 'gpt-4-turbo-2024-04-09': 128000,
  // 'gpt-4o-2024-05-13': 128000,
  // 'qwen2.5-coder:32b': 32768,
  // 'claude-3-5-haiku': 200000,
  // 'deepseek-v3': 65536,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'o3-mini': 200000,
  'claude-3-5-sonnet': 200000,
  'deepseek-r1': 128000,
};

export const modelCost = {
  // 'gpt-3.5-turbo': {
  //   prompt: { price: 0.50, unit: 1000000 },
  //   completion: { price: 1.50, unit: 1000000 },
  // },
  // 'gpt-3.5-turbo-0301': {
  //   prompt: { price: 0.0015, unit: 1000 },
  //   completion: { price: 0.002, unit: 1000 },
  // },
  // 'gpt-3.5-turbo-0613': {
  //   prompt: { price: 0.0015, unit: 1000 },
  //   completion: { price: 0.002, unit: 1000 },
  // },
  // 'gpt-3.5-turbo-16k': {
  //   prompt: { price: 3.00, unit: 1000000 },
  //   completion: { price: 4.00, unit: 1000000 },
  // },
  // 'gpt-3.5-turbo-16k-0613': {
  //   prompt: { price: 0.003, unit: 1000 },
  //   completion: { price: 0.004, unit: 1000 },
  // },
  // 'gpt-3.5-turbo-1106': {
  //   prompt: { price: 0.001, unit: 1000 },
  //   completion: { price: 0.002, unit: 1000 },
  // },
  // 'gpt-3.5-turbo-0125': {
  //   prompt: { price: 0.0005, unit: 1000 },
  //   completion: { price: 0.0015, unit: 1000 },
  // },
  // 'gpt-4': {
  //   prompt: { price: 30.00, unit: 1000000 },
  //   completion: { price: 60.00, unit: 1000000 },
  // },
  // 'gpt-4-0314': {
  //   prompt: { price: 0.03, unit: 1000 },
  //   completion: { price: 0.06, unit: 1000 },
  // },
  // 'gpt-4-0613': {
  //   prompt: { price: 0.03, unit: 1000 },
  //   completion: { price: 0.06, unit: 1000 },
  // },
  // 'gpt-4-32k': {
  //   prompt: { price: 0.06, unit: 1000 },
  //   completion: { price: 0.12, unit: 1000 },
  // },
  // 'gpt-4-32k-0314': {
  //   prompt: { price: 0.06, unit: 1000 },
  //   completion: { price: 0.12, unit: 1000 },
  // },
  // 'gpt-4-32k-0613': {
  //   prompt: { price: 0.06, unit: 1000 },
  //   completion: { price: 0.12, unit: 1000 },
  // },
  // 'gpt-4-1106-preview': {
  //   prompt: { price: 0.01, unit: 1000 },
  //   completion: { price: 0.03, unit: 1000 },
  // },
  // 'gpt-4-turbo-preview': {
  //   prompt: { price: 0.01, unit: 1000 },
  //   completion: { price: 0.03, unit: 1000 },
  // },
  // 'gpt-4-turbo': {
  //   prompt: { price: 0.01, unit: 1000 },
  //   completion: { price: 0.03, unit: 1000 },
  // },
  // 'gpt-4-turbo-2024-04-09': {
  //   prompt: { price: 0.01, unit: 1000 },
  //   completion: { price: 0.03, unit: 1000 },
  // },
  // 'gpt-4o-2024-05-13': {
  //   prompt: { price: 0.005, unit: 1000 },
  //   completion: { price: 0.015, unit: 1000 },
  // },
  // 'qwen2.5-coder:32b': {
  //   prompt: { price: 0.07, unit: 1000000 },
  //   completion: { price: 0.16, unit: 1000000 },
  // },
  // 'claude-3-5-haiku': {
  //   prompt: { price: 0.08, unit: 1000000 },
  //   completion: { price: 4.00, unit: 1000000 },
  // },
  // 'deepseek-v3': {
  //   prompt: { price: 0.49, unit: 1000000 },
  //   completion: { price: 0.89, unit: 1000 },
  // },
  'gpt-4o': {
    prompt: { price: 2.50, unit: 1000000 },
    completion: { price: 10.00, unit: 1000000 },
  },
  'gpt-4o-mini': {
    prompt: { price: 0.15, unit: 1000000 },
    completion: { price: 0.60, unit: 1000000 },
  },
  'o3-mini': {
    prompt: { price: 1.10, unit: 1000000 },
    completion: { price: 4.40, unit: 1000000 },
  },
  'claude-3-5-sonnet': {
    prompt: { price: 3.00, unit: 1000000 },
    completion: { price: 15.00, unit: 1000000 },
  },
  'deepseek-r1': {
    prompt: { price: 3.00, unit: 1000000 },
    completion: { price: 8.00, unit: 1000000 },
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
