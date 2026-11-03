import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type PaperProps = {
  title: string
  onClose: () => void
  children: ReactNode
  variant?: string
}

export function Paper({ title, onClose, children, variant }: PaperProps) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const previously = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const selector = 'button:not([disabled]), [href], input:not([disabled]), textarea, select'
    const focusables = () => [...root.querySelectorAll<HTMLElement>(selector)]
    const closeButton = root.querySelector<HTMLElement>('[data-close]')
    closeButton?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previously?.focus()
    }
  }, [])

  return createPortal(
    <div className="paper-layer" onClick={() => onCloseRef.current()}>
      <div
        className={variant ? `paper paper-${variant}` : 'paper'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={ref}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="paper-bar">
          <p className="kicker" id={titleId}>
            {title}
          </p>
          <button type="button" className="seal quiet" data-close onClick={onClose}>
            დახურვა
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
