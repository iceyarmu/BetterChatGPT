import React from 'react';
import useStore from '@store/store';
import { MessageInterface } from '@type/chat';
import { generateDefaultChat } from '@constants/chat';
import { useTranslation } from 'react-i18next';

const useInitialiseNewChat = () => {
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const { t } = useTranslation();

  const initialiseNewChat = () => {
    setChats([generateDefaultChat(t('newChat') || undefined)]);
    setCurrentChatIndex(0);
  };

  return initialiseNewChat;
};

export default useInitialiseNewChat;
