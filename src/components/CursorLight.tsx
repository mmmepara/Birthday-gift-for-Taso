import { useEffect, useRef } from 'react'

export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const onMove = (event: PointerEvent) => {
      node.style.transform = `translate3d(${event.clientX - 90}px, ${event.clientY - 90}px, 0)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return <div ref={ref} className="cursor-light" aria-hidden="true" />
}
