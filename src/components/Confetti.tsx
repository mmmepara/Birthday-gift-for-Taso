import { useEffect, useRef } from 'react'

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  spin: number
  flip: number
  flipSpeed: number
  color: string
  shape: 'rect' | 'dot' | 'ribbon'
  life: number
}

const COLORS = ['#e4c27a', '#f0b36a', '#e7b2ae', '#c47b84', '#f6efe4', '#8eae98', '#f3a3b7', '#fff1c4']

export function Confetti({ active, reduced }: { active: boolean; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pieces: Piece[] = []
    let frame = 0
    let width = window.innerWidth
    let height = window.innerHeight
    const started = performance.now()
    let last = started

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const make = (x: number, y: number, angle: number, speed: number): Piece => {
      const roll = Math.random()
      const shape: Piece['shape'] = roll < 0.7 ? 'rect' : roll < 0.85 ? 'dot' : 'ribbon'
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: shape === 'ribbon' ? 4 : 6 + Math.random() * 6,
        h: shape === 'ribbon' ? 18 + Math.random() * 12 : 9 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.25,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.08 + Math.random() * 0.14,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#e4c27a',
        shape,
        life: 1,
      }
    }

    const scale = Math.min(1.3, Math.max(0.7, width / 1100))
    const cannon = (fromLeft: boolean, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const base = fromLeft ? -Math.PI / 2 + 0.5 : -Math.PI / 2 - 0.5
        const angle = base + (Math.random() - 0.5) * 0.7
        const speed = (14 + Math.random() * 12) * scale
        pieces.push(make(fromLeft ? -10 : width + 10, height * 0.92, angle, speed))
      }
    }
    const drizzle = (count: number) => {
      for (let i = 0; i < count; i += 1) {
        pieces.push(make(Math.random() * width, -20 - Math.random() * 60, Math.PI / 2, 1 + Math.random() * 2))
      }
    }

    if (reduced) {
      drizzle(40)
    } else {
      cannon(true, 90)
      cannon(false, 90)
    }
    let waves = 0

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67
      last = now
      const age = now - started
      if (!reduced && waves < 2 && age > 380 + waves * 380) {
        waves += 1
        cannon(true, 35)
        cannon(false, 35)
      }
      if (!reduced && age < 4200 && Math.random() < 0.45 * dt) drizzle(1)

      ctx.clearRect(0, 0, width, height)
      for (let i = pieces.length - 1; i >= 0; i -= 1) {
        const p = pieces[i]!
        p.vx *= Math.pow(0.985, dt)
        p.vy = p.vy * Math.pow(0.985, dt) + 0.32 * dt
        if (p.vy > 3.2) p.vy = 3.2 + (p.vy - 3.2) * 0.9
        p.vx += Math.sin(now * 0.002 + i) * 0.03 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt
        p.flip += p.flipSpeed * dt
        if (p.y > height + 40) p.life -= 0.05 * dt
        if (age > 6500) p.life -= 0.012 * dt
        if (p.life <= 0 || p.x < -80 || p.x > width + 80) {
          pieces.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.min(1, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        const squash = Math.cos(p.flip)
        ctx.scale(1, squash)
        ctx.fillStyle = p.color
        if (p.shape === 'dot') {
          ctx.beginPath()
          ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'ribbon') {
          ctx.beginPath()
          ctx.moveTo(-p.w / 2, -p.h / 2)
          ctx.quadraticCurveTo(p.w * 2, 0, -p.w / 2, p.h / 2)
          ctx.lineTo(p.w / 2, p.h / 2)
          ctx.quadraticCurveTo(p.w * 3, 0, p.w / 2, -p.h / 2)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.fillStyle = `rgba(255, 255, 255, ${0.25 * Math.max(0, squash)})`
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * 0.35)
        }
        ctx.restore()
      }
      if (pieces.length > 0 || age < 4500) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [active, reduced])

  if (!active) return null
  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}
