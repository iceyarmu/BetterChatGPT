import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopupModal from '@components/PopupModal';
import { ConfigInterface, ModelOptions } from '@type/chat';
import DownChevronArrow from '@icon/DownChevronArrow';
import { modelOptions } from '@constants/chat';

const ConfigMenu = ({
  setIsModalOpen,
  config,
  setConfig,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  config: ConfigInterface;
  setConfig: (config: ConfigInterface) => void;
}) => {
  const [_model, _setModel] = useState<ModelOptions>(config.model);
  const { t } = useTranslation('model');

  const handleConfirm = () => {
    setConfig({
      model: _model,
    });
    setIsModalOpen(false);
  };

  return (
    <PopupModal
      title={t('configuration') as string}
      setIsModalOpen={setIsModalOpen}
      handleConfirm={handleConfirm}
      handleClickBackdrop={handleConfirm}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
        <ModelSelector _model={_model} _setModel={_setModel} />
      </div>
    </PopupModal>
  );
};

export const ModelSelector = ({
  _model,
  _setModel,
}: {
  _model: ModelOptions;
  _setModel: React.Dispatch<React.SetStateAction<ModelOptions>>;
}) => {
  const [dropDown, setDropDown] = useState<boolean>(false);

  return (
    <div className='mb-4'>
      <button
        className='btn btn-neutral btn-small flex gap-1'
        type='button'
        onClick={() => setDropDown((prev) => !prev)}
        aria-label='model'
      >
        {_model}
        <DownChevronArrow />
      </button>
      <div
        id='dropdown'
        className={`${
          dropDown ? '' : 'hidden'
        } absolute top-100 bottom-100 z-10 bg-white rounded-lg shadow-xl border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-800 opacity-90`}
      >
        <ul
          className='text-sm text-gray-700 dark:text-gray-200 p-0 m-0'
          aria-labelledby='dropdownDefaultButton'
        >
          {modelOptions.map((m) => (
            <li
              className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer'
              onClick={() => {
                _setModel(m);
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
  );
};

export default ConfigMenu;
