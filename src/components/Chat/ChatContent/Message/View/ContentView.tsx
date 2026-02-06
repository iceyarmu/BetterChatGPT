import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  memo,
  useState,
} from 'react';

import ReactMarkdown from 'react-markdown';
import { CodeProps, ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';

import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import useStore from '@store/store';

import TickIcon from '@icon/TickIcon';
import CrossIcon from '@icon/CrossIcon';

import useSubmit from '@hooks/useSubmit';

import { ChatInterface } from '@type/chat';

import { codeLanguageSubset } from '@constants/chat';

import RefreshButton from './Button/RefreshButton';
import UpButton from './Button/UpButton';
import DownButton from './Button/DownButton';
import CopyButton from './Button/CopyButton';
import EditButton from './Button/EditButton';
import DeleteButton from './Button/DeleteButton';
import MarkdownModeButton from './Button/MarkdownModeButton';
import ReasoningBlock from './ReasoningBlock';

import CodeBlock from '../CodeBlock';

// 预处理 Markdown 内容：修复代码围栏格式 + LaTeX 分隔符转换
const preprocessContent = (content: string): string => {
  // === 第一步：修复未独占一行的代码围栏 ===
  // AI 模型有时生成的代码块围栏（```）未独立成行，
  // 导致 CommonMark 解析器无法识别为代码块

  // Fix 1: 开始围栏未独立成行
  // 匹配行内文本紧接 ``` 的情况（如 "text```csharp"）
  let processed = content.replace(/([^\n`])(`{3,}\w*)\s*$/gm, '$1\n$2');

  // Fix 2a: 结束围栏后有尾随文本（有空格）
  // "``` some text" → "```\nsome text"
  processed = processed.replace(/^(\s*`{3,})\s+(\S)/gm, '$1\n$2');

  // Fix 2b: 结束围栏后直接紧跟非单词字符文本（无空格）
  // "```体来操作" → "```\n体来操作"
  // 排除 \w 以避免误匹配开始围栏的语言标识（如 ```csharp）
  processed = processed.replace(/^(\s*`{3,})([^\s\w`])/gm, '$1\n$2');

  // === 第二步：转换 LaTeX 分隔符 ===
  // 将 \[...\] 转为 $$...$$，将 \(...\) 转为 $...$
  // 跳过代码块以避免误处理

  // 使用时间戳占位符，避免与原文冲突
  const placeholder = `__CODEBLOCK_${Date.now()}_`;
  const codeBlocks: string[] = [];

  // 保护代码块：支持 3+ 个反引号的代码块和内联代码
  processed = processed.replace(/(`{3,})[\s\S]*?\1|`[^`]*`/g, (match) => {
    codeBlocks.push(match);
    return `${placeholder}${codeBlocks.length - 1}__`;
  });

  // 转换 LaTeX 分隔符
  // 注意：不使用 lookbehind (?<!\\) 以保证浏览器兼容性（Safari < 16.4）
  // \[...\] → $$...$$（跳过 \\[ 即 LaTeX 换行符）
  processed = processed.replace(/(?:^|[^\\])\\\[([\s\S]*?)\\\]/g, (match, p1) => {
    const prefix = match.startsWith('\\[') ? '' : match[0];
    return `${prefix}$$${p1}$$`;
  });
  // \(...\) → $...$
  processed = processed.replace(/(?:^|[^\\])\\\(([\s\S]*?)\\\)/g, (match, p1) => {
    const prefix = match.startsWith('\\(') ? '' : match[0];
    return `${prefix}$${p1}$`;
  });

  // 修复加粗标记紧邻中文引号的问题
  // CommonMark 规范要求 ** 后不能紧跟标点（除非 ** 前是空白/标点）
  // 在 ** 和中文引号之间插入零宽空格以满足规范
  const CJK_QUOTES = '\u201C\u201D\u2018\u2019\u300C\u300D\u300E\u300F';
  // 开始标记：**" → **\u200B"
  processed = processed.replace(
    new RegExp(`\\*\\*([${CJK_QUOTES}])`, 'g'),
    '**\u200B$1'
  );
  // 结束标记："** → "\u200B**
  processed = processed.replace(
    new RegExp(`([${CJK_QUOTES}])\\*\\*`, 'g'),
    '$1\u200B**'
  );

  // 恢复代码块
  const placeholderRegex = new RegExp(`${placeholder}(\\d+)__`, 'g');
  processed = processed.replace(placeholderRegex, (_, index) => {
    return codeBlocks[parseInt(index)];
  });

  return processed;
};

const ContentView = memo(
  ({
    role,
    content,
    setIsEdit,
    messageIndex,
    reasoning,
  }: {
    role: string;
    content: string;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    messageIndex: number;
    reasoning?: string;
  }) => {
    const { handleSubmit } = useSubmit();

    const [isDelete, setIsDelete] = useState<boolean>(false);

    const currentChatIndex = useStore((state) => state.currentChatIndex);
    const setChats = useStore((state) => state.setChats);
    const lastMessageIndex = useStore((state) =>
      state.chats ? state.chats[state.currentChatIndex].messages.length - 1 : 0
    );
    const inlineLatex = useStore((state) => state.inlineLatex);
    const markdownMode = useStore((state) => state.markdownMode);
    const generating = useStore((state) => state.generating);

    const handleDelete = () => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      updatedChats[currentChatIndex].messages.splice(messageIndex, 1);
      setChats(updatedChats);
    };

    const handleMove = (direction: 'up' | 'down') => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;
      const temp = updatedMessages[messageIndex];
      if (direction === 'up') {
        updatedMessages[messageIndex] = updatedMessages[messageIndex - 1];
        updatedMessages[messageIndex - 1] = temp;
      } else {
        updatedMessages[messageIndex] = updatedMessages[messageIndex + 1];
        updatedMessages[messageIndex + 1] = temp;
      }
      setChats(updatedChats);
    };

    const handleMoveUp = () => {
      handleMove('up');
    };

    const handleMoveDown = () => {
      handleMove('down');
    };

    const handleRefresh = () => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;
      updatedMessages.splice(updatedMessages.length - 1, 1);
      setChats(updatedChats);
      handleSubmit();
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
    };

    const showReasoningBlock = role === 'assistant' && (
      (reasoning && reasoning.trim() !== '') ||
      (generating && messageIndex === lastMessageIndex && !content)
    );

    return (
      <>
        {/* Reasoning Block */}
        {showReasoningBlock && (
          <ReasoningBlock
            reasoning={reasoning || ''}
            isGenerating={generating && messageIndex === lastMessageIndex && !content}
          />
        )}

        {/* Content */}
        <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark'>
          {markdownMode ? (
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                [remarkMath, { singleDollarTextMath: inlineLatex }],
              ]}
              rehypePlugins={[
                rehypeKatex,
                [
                  rehypeHighlight,
                  {
                    detect: true,
                    ignoreMissing: true,
                    subset: codeLanguageSubset,
                  },
                ],
              ]}
              linkTarget='_new'
              components={{
                code,
                p,
              }}
            >
              {preprocessContent(content)}
            </ReactMarkdown>
          ) : (
            <span className='whitespace-pre-wrap'>{content}</span>
          )}
        </div>
        <div className='flex justify-end gap-2 w-full mt-2'>
          {isDelete || (
            <>
              {!useStore.getState().generating &&
                role === 'assistant' &&
                messageIndex === lastMessageIndex && (
                  <RefreshButton onClick={handleRefresh} />
                )}
              {messageIndex !== 0 && <UpButton onClick={handleMoveUp} />}
              {messageIndex !== lastMessageIndex && (
                <DownButton onClick={handleMoveDown} />
              )}

              <MarkdownModeButton />
              <CopyButton onClick={handleCopy} />
              <EditButton setIsEdit={setIsEdit} />
              <DeleteButton setIsDelete={setIsDelete} />
            </>
          )}
          {isDelete && (
            <>
              <button
                className='p-1 hover:text-white'
                aria-label='cancel'
                onClick={() => setIsDelete(false)}
              >
                <CrossIcon />
              </button>
              <button
                className='p-1 hover:text-white'
                aria-label='confirm'
                onClick={handleDelete}
              >
                <TickIcon />
              </button>
            </>
          )}
        </div>
      </>
    );
  }
);

const code = memo((props: CodeProps) => {
  const { inline, className, children } = props;
  const match = /language-(\w+)/.exec(className || '');
  const lang = match && match[1];

  if (inline) {
    return <code className={className}>{children}</code>;
  } else {
    return <CodeBlock lang={lang || 'text'} codeChildren={children} />;
  }
});

const p = memo(
  (
    props?: Omit<
      DetailedHTMLProps<
        HTMLAttributes<HTMLParagraphElement>,
        HTMLParagraphElement
      >,
      'ref'
    > &
      ReactMarkdownProps
  ) => {
    return <p className='whitespace-pre-wrap'>{props?.children}</p>;
  }
);

export default ContentView;
