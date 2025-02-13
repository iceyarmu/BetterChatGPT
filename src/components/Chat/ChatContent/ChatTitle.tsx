import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';
import useStore from '@store/store';
import ConfigMenu from '@components/ConfigMenu';
import { ChatInterface, ConfigInterface, ModelOptions } from '@type/chat';
import { _defaultChatConfig, modelOptions } from '@constants/chat';

const ChatTitle = React.memo(() => {
  const { t } = useTranslation('model');
  const config = useStore(
    (state) =>
      state.chats &&
      state.chats.length > 0 &&
      state.currentChatIndex >= 0 &&
      state.currentChatIndex < state.chats.length
        ? state.chats[state.currentChatIndex].config
        : undefined,
    shallow
  );
  const setChats = useStore((state) => state.setChats);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dropDown, setDropDown] = useState<boolean>(false);
  const setDefaultChatConfig = useStore((state) => state.setDefaultChatConfig);

  const setConfig = (config: ConfigInterface) => {
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    updatedChats[currentChatIndex].config = config;
    setChats(updatedChats);
    setDefaultChatConfig(config);
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  // for migrating from old ChatInterface to new ChatInterface (with config)
  useEffect(() => {
    const chats = useStore.getState().chats;
    if (chats && chats.length > 0 && currentChatIndex !== -1 && !config) {
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
      updatedChats[currentChatIndex].config = { ..._defaultChatConfig };
      setChats(updatedChats);
    }
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentChatIndex]);

  return config ? (
    <>
      <div
        ref={dropdownRef}
        className='flex gap-x-4 gap-y-1 flex-wrap w-full items-center justify-center border-b border-black/10 bg-gray-50 p-3 dark:border-gray-900/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer'>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'
        onClick={() => {
          setDropDown(!dropDown);
        }}>
          {t('model')}: {config.model}
          <div
            id='dropdown'
            className={`${
              dropDown ? '' : 'hidden'
            } absolute top-100 bottom-100 mt-1 z-10 bg-white rounded-lg shadow-xl border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-800 opacity-95`}
          >
            <ul
              className='text-sm text-gray-700 dark:text-gray-200 p-0 m-0'
              aria-labelledby='dropdownDefaultButton'
            >
              {modelOptions.map((m) => (
                <li
                  className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer'
                  onClick={() => {
                    setConfig({ ...config, model: m });
                    setDropDown(false);
                  }}
                  key={m}
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'
        onClick={() => {
          setIsModalOpen(true);
        }}>
          {/* {t('token.label')}: {config.max_tokens} */}
        </div>
        {/* <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('temperature.label')}: {config.temperature}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('topP.label')}: {config.top_p}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('presencePenalty.label')}: {config.presence_penalty}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('frequencyPenalty.label')}: {config.frequency_penalty}
        </div> */}
      </div>
      {isModalOpen && (
        <ConfigMenu
          setIsModalOpen={setIsModalOpen}
          config={config}
          setConfig={setConfig}
        />
      )}
    </>
  ) : (
    <></>
  );
});

export default ChatTitle;
