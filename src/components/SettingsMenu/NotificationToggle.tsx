import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Toggle';
import useNotification from '@hooks/useNotification';

const NotificationToggle = () => {
  const { t } = useTranslation();
  const { isSupported, permission, requestPermission } = useNotification();

  const setNotificationEnabled = useStore((state) => state.setNotificationEnabled);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().notificationEnabled
  );

  useEffect(() => {
    setNotificationEnabled(isChecked);
  }, [isChecked]);

  // Hide toggle if browser doesn't support notifications
  if (!isSupported) {
    return null;
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      if (permission === 'granted') {
        setIsChecked(true);
      } else if (permission === 'default') {
        const result = await requestPermission();
        if (result === 'granted') {
          setIsChecked(true);
        }
        // If denied, keep off
      }
      // If already denied, do nothing (can't request again)
    } else {
      setIsChecked(false);
    }
  };

  return (
    <Toggle
      label={t('notificationEnabled') as string}
      isChecked={isChecked}
      setIsChecked={(value) => {
        const newValue = typeof value === 'function' ? value(isChecked) : value;
        handleToggle(newValue);
      }}
    />
  );
};

export default NotificationToggle;
