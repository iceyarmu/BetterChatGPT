import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

import DownChevronArrow from '@icon/DownChevronArrow';
import CopyIcon from '@icon/CopyIcon';
import TickIcon from '@icon/TickIcon';

interface ReasoningBlockProps {
  reasoning: string;
  isGenerating?: boolean;
}

const ReasoningBlock = memo(({ reasoning, isGenerating }: ReasoningBlockProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [dotCount, setDotCount] = useState<number>(1);

  useEffect(() => {
    if (isGenerating) {
      const timer = setInterval(() => {
        setDotCount(prev => prev >= 6 ? 1 : prev + 1);
      }, 500);
      return () => clearInterval(timer);
    }
  }, [isGenerating]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reasoning.trim()) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(reasoning).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = reasoning;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
  };

  const hasContent = reasoning && reasoning.trim() !== '';

  if (!hasContent && !isGenerating) return null;

  return (
    <div className='mb-4 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden'>
      <div
        className='flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 cursor-pointer select-none'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
          <DownChevronArrow
            className={`transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
          />
          <span className='font-medium'>
            {isGenerating && !hasContent ? (
              <>{t('thinking')}{'.'.repeat(dotCount)}</>
            ) : (
              t('thinkingBlock')
            )}
          </span>
        </div>

        {/* Copy button */}
        {hasContent && (
          <button
            className='flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            onClick={handleCopy}
            aria-label='copy reasoning'
          >
            {isCopied ? (
              <>
                <TickIcon />
                <span>Copied!</span>
              </>
            ) : (
              <CopyIcon />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {isExpanded && hasContent && (
        <div className='px-4 py-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50'>
          <div className='prose prose-sm dark:prose-invert max-w-none opacity-80'>
            <ReactMarkdown>{reasoning}</ReactMarkdown>
          </div>
          {isGenerating && (
            <div className='mt-3 italic opacity-60'>
              {t('thinking')}{'.'.repeat(dotCount)}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ReasoningBlock;
