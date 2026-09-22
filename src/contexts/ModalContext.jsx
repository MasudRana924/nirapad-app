import React, {createContext, useContext, useState, useCallback} from 'react';
import AppModal from '../components/common/AppModal';

const ModalContext = createContext();

export const ModalProvider = ({children}) => {
  const [modalState, setModalState] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmDestructive: false,
    onConfirm: undefined,
    onClose: undefined,
  });

  const showModal = useCallback(options => {
    setModalState({
      visible: true,
      type: options.type || 'error',
      title: options.title || '',
      message: options.message || '',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      confirmDestructive: options.confirmDestructive || false,
      onConfirm: options.onConfirm,
      onClose: options.onClose,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  /** Common error modal for Login → all screens */
  const showError = useCallback(
    (message, title = 'Error') => {
      showModal({
        type: 'error',
        title,
        message: message || 'Something went wrong. Please try again.',
      });
    },
    [showModal],
  );

  const showSuccess = useCallback(
    (message, title = 'Success') => {
      showModal({
        type: 'success',
        title,
        message: message || '',
      });
    },
    [showModal],
  );

  const showConfirm = useCallback(
    ({
      title = 'Confirm',
      message = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmDestructive = false,
      onConfirm,
      onClose,
    } = {}) => {
      showModal({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        confirmDestructive,
        onConfirm,
        onClose,
      });
    },
    [showModal],
  );

  const handleClose = () => {
    if (modalState.onClose) {
      modalState.onClose();
    }
    hideModal();
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideModal();
  };

  return (
    <ModalContext.Provider
      value={{showModal, hideModal, showError, showSuccess, showConfirm}}>
      {children}
      <AppModal
        visible={modalState.visible}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        confirmDestructive={modalState.confirmDestructive}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </ModalContext.Provider>
  );
};

export const useAppModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useAppModal must be used within a ModalProvider');
  }
  return context;
};
