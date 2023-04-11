import React from 'react';
import useStore from '@store/store';

import PlusIcon from '@icon/PlusIcon';

import { ChatInterface } from '@type/chat';
import { generateDefaultChat } from '@constants/chat';
import { useTranslation } from 'react-i18next';

const NewMessageButton = React.memo(
  ({ messageIndex }: { messageIndex: number }) => {
    const setChats = useStore((state) => state.setChats);
    const currentChatIndex = useStore((state) => state.currentChatIndex);
    const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
    const { t } = useTranslation();

    const addChat = () => {
      const chats = useStore.getState().chats;
      if (chats) {
        const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
        let titleIndex = 2;
        let title = `${t('newChat')} ${titleIndex}`;

        while (chats.some((chat) => chat.title === title)) {
          titleIndex += 1;
          title = `${t('newChat')} ${titleIndex}`;
        }

        updatedChats.unshift(generateDefaultChat(title));
        setChats(updatedChats);
        setCurrentChatIndex(0);
      }
    };

    const addMessage = () => {
      if (currentChatIndex === -1) {
        addChat();
      } else {
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].messages.splice(messageIndex + 1, 0, {
          content: '',
          role: 'user',
        });
        setChats(updatedChats);
      }
    };

    return (
      <div className='h-0 w-0 relative' key={messageIndex}>
        <div
          className='absolute top-0 right-0 translate-x-1/2 translate-y-[-50%] text-gray-600 dark:text-white cursor-pointer bg-gray-200 dark:bg-gray-600/80 rounded-full p-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-800/80 transition-bg duration-200'
          onClick={addMessage}
        >
          <PlusIcon />
        </div>
      </div>
    );
  }
);

export default NewMessageButton;
