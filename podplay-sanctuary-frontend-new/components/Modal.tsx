
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Icon from './Icon';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg bg-primary-bg text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]}`}>
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <Dialog.Title as="h3" className="text-lg font-display font-semibold leading-6 text-text-primary">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="p-1 rounded-full text-text-muted hover:bg-tertiary-bg hover:text-text-secondary focus:outline-none"
                      onClick={onClose}
                    >
                      <Icon name="xMark" className="h-6 w-6" />
                    </button>
                  </div>
                )}
                <div className="px-6 py-5">
                  {children}
                </div>
                {footer && (
                  <div className="px-6 py-4 border-t border-border bg-secondary-bg sm:flex sm:flex-row-reverse">
                    {footer}
                  </div>
                )}
                 {!title && ( // Add a close button if no title bar provided one
                    <button
                        type="button"
                        className="absolute top-3 right-3 p-1 rounded-full text-text-muted hover:bg-tertiary-bg hover:text-text-secondary focus:outline-none"
                        onClick={onClose}
                    >
                        <Icon name="xMark" className="h-5 w-5" />
                    </button>
                 )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
