import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import useStore from '@store/store';

import PopupModal from '@components/PopupModal';

import { responsesAPIEndpoint } from '@constants/auth';

const ApiMenu = ({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation(['main', 'api']);

  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);

  const [_apiKey, _setApiKey] = useState<string>(apiKey || '');

  const handleSave = () => {
    setApiKey(_apiKey);
    setIsModalOpen(false);
  };

  return (
    <PopupModal
      title={t('api') as string}
      setIsModalOpen={setIsModalOpen}
      handleConfirm={handleSave}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
        <div className='flex gap-2 items-center mb-6'>
          <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm'>
            {t('apiEndpoint.inputLabel', { ns: 'api' })}
          </div>
          <div className='text-gray-800 dark:text-white p-3 text-sm bg-gray-200 dark:bg-gray-600 rounded-md w-full h-8 flex items-center'>
            {responsesAPIEndpoint}
          </div>
        </div>

        <div className='flex gap-2 items-center justify-center mt-2'>
          <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm'>
            {t('apiKey.inputLabel', { ns: 'api' })}
          </div>
          <input
            type='text'
            className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
            value={_apiKey}
            onChange={(e) => {
              _setApiKey(e.target.value);
            }}
          />
        </div>

        <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm flex flex-col gap-3 leading-relaxed'>
          <p className='mt-4'>
            <Trans
              i18nKey='apiKey.howTo'
              ns='api'
              components={[
                <a
                  href='https://platform.openai.com/account/api-keys'
                  className='link'
                  target='_blank'
                />,
              ]}
            />
          </p>

          <p>{t('securityMessage', { ns: 'api' })}</p>
        </div>
      </div>
    </PopupModal>
  );
};

export default ApiMenu;
