import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../utils'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  hideClose?: boolean
}

const sizeStyles = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-4xl',
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  hideClose = false,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-[400]',
          'data-[state=open]:animate-fade-in',
          'data-[state=closed]:animate-fade-out',
        )} />

        {/* Content — desktop: centered modal, mobile: bottom sheet */}
        <Dialog.Content
          className={cn(
            'fixed z-[401] bg-white shadow-4 outline-none',
            'data-[state=open]:animate-scale-in',
            // Desktop: centered
            'md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:rounded-2xl md:w-full',
            sizeStyles[size],
            // Mobile: bottom sheet
            'max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-t-2xl',
            'max-md:data-[state=open]:animate-slide-up',
            className,
          )}
        >
          {/* Header */}
          {(title || !hideClose) && (
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex-1 min-w-0 pr-4">
                {title && (
                  <Dialog.Title className="text-lg font-semibold text-text-primary">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-sm text-text-secondary mt-1">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {!hideClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="shrink-0 -mt-1 -mr-2"
                  aria-label="Close"
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={cn('px-6', !title && 'pt-6', !footer && 'pb-6')}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Confirm dialog
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div />
  </Modal>
)
