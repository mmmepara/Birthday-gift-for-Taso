import { useEffect, useRef } from 'react'

export function Starfield({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const stars = Array.from({ length: reduced ? 40 : 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      p: Math.random() * Math.PI * 2,
    }))
    let frame = 0

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (time: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const star of stars) {
        const twinkle = reduced ? 0.8 : 0.45 + Math.sin(time * 0.002 + star.p) * 0.4
        ctx.globalAlpha = Math.max(0.15, twinkle)
        ctx.fillStyle = '#f6efe4'
        ctx.beginPath()
        ctx.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
