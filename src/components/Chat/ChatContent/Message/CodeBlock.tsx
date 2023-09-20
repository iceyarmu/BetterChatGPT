import React, { useRef, useState } from 'react';

import CopyIcon from '@icon/CopyIcon';
import TickIcon from '@icon/TickIcon';

const CodeBlock = ({
  lang,
  codeChildren,
}: {
  lang: string;
  codeChildren: React.ReactNode & React.ReactNode[];
}) => {
  const codeRef = useRef<HTMLElement>(null);

  return (
    <div className='bg-black rounded-md'>
      <CodeBar lang={lang} codeRef={codeRef} />
      <div className='p-4 overflow-y-auto'>
        <code ref={codeRef} className={`!whitespace-pre hljs language-${lang}`}>
          {codeChildren}
        </code>
      </div>
    </div>
  );
};

const CodeBar = React.memo(
  ({
    lang,
    codeRef,
  }: {
    lang: string;
    codeRef: React.RefObject<HTMLElement>;
  }) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);
    return (
      <div className='flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans'>
        <span className=''>{lang}</span>
        <button
          className='flex ml-auto gap-2'
          aria-label='copy codeblock'
          onClick={async () => {
            const codeString = codeRef.current?.textContent;
            if (codeString) {
              // Navigator clipboard api needs a secure context (https)
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(codeString).then(() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 3000);
                });
              } else {
                  // Use the 'out of viewport hidden text area' trick
                  const textArea = document.createElement("textarea");
                  textArea.value = codeString;
                  // Move textarea out of the viewport so it's not visible
                  textArea.style.position = "absolute";
                  textArea.style.left = "-999999px";
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
            }
          }}
        >
          {isCopied ? (
            <>
              <TickIcon />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon />
              Copy code
            </>
          )}
        </button>
      </div>
    );
  }
);
export default CodeBlock;
