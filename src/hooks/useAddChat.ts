import React from 'react';
import useStore from '@store/store';
import { generateDefaultChat } from '@constants/chat';
import { ChatInterface } from '@type/chat';
import { useTranslation } from 'react-i18next';

const useAddChat = () => {
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const { t } = useTranslation();

  const addChat = (folder?:string) => {
    const chats = useStore.getState().chats;
    if (chats) {
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
      let titleIndex = 2;
      let title = `${t('newChat')} ${titleIndex}`;

      while (chats.some((chat) => chat.title === title)) {
        titleIndex += 1;
        title = `${t('newChat')} ${titleIndex}`;
      }

      updatedChats.unshift(generateDefaultChat(title, folder));
      setChats(updatedChats);
      setCurrentChatIndex(0);
    }
  };

  return addChat;
};

export default useAddChat;
