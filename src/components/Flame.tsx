import { useEffect, useRef } from 'react'

type FlameProps = {
  alive: boolean
  wind: { current: number }
  reduced: boolean
  seed?: number
}

type Puff = { x: number; y: number; r: number; life: number; drift: number }

/**
 * A candle flame anchored to its wick. The base never moves: wind only bends
 * the tip, so the flame always looks attached. Lighting springs it into life,
 * going out leans it away and leaves a curl of smoke.
 */
function drawFlame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  life: number,
  wind: number,
  reduced: boolean,
  seed: number,
) {
  const baseX = width / 2
  const baseY = height * 0.93
  const size = Math.min(width * 0.5, height * 0.36)
  const gust = Math.min(1, Math.abs(wind))
  const calm = reduced ? 0 : 1
  const flicker =
    1 +
    calm * (Math.sin(time * 0.012 + seed * 1.7) * 0.05 + Math.sin(time * 0.031 + seed) * 0.03) +
    calm * gust * Math.sin(time * 0.06 + seed * 3) * 0.12
  const tall = size * 1.9 * life * flicker * (1 - gust * 0.25)
  const wide = size * 0.42 * Math.min(1, life * 1.3) * (1 + gust * 0.1)
  const sway = calm * (Math.sin(time * 0.009 + seed * 2.3) * 0.06 + Math.sin(time * 0.021 + seed) * 0.03)
  const lean = (wind * 0.9 + sway) * tall
  const tipY = baseY - tall
  const midX = baseX + lean * 0.35

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const haloY = baseY - tall * 0.42
  const haloR = Math.max(1, Math.min(width / 2, haloY, height - haloY) * 0.98)
  const halo = ctx.createRadialGradient(midX, haloY, 0, midX, haloY, haloR)
  halo.addColorStop(0, `rgba(255, 196, 120, ${0.34 * life})`)
  halo.addColorStop(0.45, `rgba(255, 150, 70, ${0.1 * life})`)
  halo.addColorStop(1, 'rgba(255, 120, 40, 0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(midX, haloY, haloR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const body = (scale: number, top: number, fill: CanvasGradient | string) => {
    const w = wide * scale
    const h = tall * top
    const tx = baseX + lean * top
    const ty = baseY - h
    ctx.beginPath()
    ctx.moveTo(baseX, baseY + w * 0.25)
    ctx.bezierCurveTo(baseX - w * 1.25, baseY - h * 0.05, baseX - w * 0.95 + lean * 0.25, baseY - h * 0.62, tx, ty)
    ctx.bezierCurveTo(baseX + w * 0.95 + lean * 0.25, baseY - h * 0.62, baseX + w * 1.25, baseY - h * 0.05, baseX, baseY + w * 0.25)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }

  const outer = ctx.createLinearGradient(0, baseY, 0, tipY)
  outer.addColorStop(0, `rgba(255, 140, 50, ${0.75 * life})`)
  outer.addColorStop(0.35, `rgba(255, 120, 40, ${0.9 * life})`)
  outer.addColorStop(0.8, `rgba(255, 90, 30, ${0.55 * life})`)
  outer.addColorStop(1, 'rgba(255, 70, 20, 0)')
  body(1, 1, outer)

  const mid = ctx.createLinearGradient(0, baseY, 0, tipY)
  mid.addColorStop(0, `rgba(255, 214, 120, ${life})`)
  mid.addColorStop(0.6, `rgba(255, 190, 90, ${0.9 * life})`)
  mid.addColorStop(1, 'rgba(255, 170, 70, 0)')
  body(0.68, 0.82, mid)

  const core = ctx.createLinearGradient(0, baseY, 0, baseY - tall * 0.5)
  core.addColorStop(0, `rgba(255, 252, 236, ${life})`)
  core.addColorStop(1, 'rgba(255, 240, 200, 0)')
  body(0.36, 0.5, core)

  ctx.save()
  ctx.globalAlpha = 0.7 * life
  const blue = ctx.createRadialGradient(baseX, baseY, 0, baseX, baseY, wide * 0.9)
  blue.addColorStop(0, 'rgba(120, 160, 255, 0.85)')
  blue.addColorStop(1, 'rgba(90, 120, 255, 0)')
  ctx.fillStyle = blue
  ctx.beginPath()
  ctx.ellipse(baseX, baseY, wide * 0.7, wide * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSmoke(ctx: CanvasRenderingContext2D, puffs: Puff[]) {
  for (const puff of puffs) {
    ctx.fillStyle = `rgba(214, 206, 198, ${0.28 * puff.life})`
    ctx.beginPath()
    ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function Flame({ alive, wind, reduced, seed = 1 }: FlameProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const life = useRef(alive ? 1 : 0)
  const velocity = useRef(0)
  const wasAlive = useRef(alive)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let frame = 0
    let last = performance.now()
    const puffs: Puff[] = []
    let smokeLeft = 0

    if (wasAlive.current && !alive && !reduced) smokeLeft = 900
    wasAlive.current = alive

    const loop = (time: number) => {
      const dt = Math.min(48, time - last) / 16.67
      last = time
      const cssWidth = canvas.offsetWidth
      const cssHeight = canvas.offsetHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.max(1, Math.floor(cssWidth * dpr))
      const height = Math.max(1, Math.floor(cssHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssWidth, cssHeight)

      const target = alive ? 1 : 0
      if (reduced) {
        life.current += (target - life.current) * 0.35
      } else if (alive) {
        velocity.current += (target - life.current) * 0.09 * dt
        velocity.current *= Math.pow(0.8, dt)
        life.current = Math.max(0, life.current + velocity.current * dt)
      } else {
        life.current = Math.max(0, life.current - 0.09 * dt)
      }

      const w = alive ? wind.current : wind.current + (1 - life.current) * 0.6
      if (cssWidth > 1 && life.current > 0.01) {
        drawFlame(ctx, cssWidth, cssHeight, time, Math.min(1.15, life.current), w, reduced, seed)
      }

      if (smokeLeft > 0) {
        smokeLeft -= dt * 16.67
        if (Math.random() < 0.5) {
          puffs.push({
            x: cssWidth / 2,
            y: cssHeight * 0.9,
            r: 1.5 + Math.random() * 1.5,
            life: 1,
            drift: (Math.random() - 0.5) * 0.4 + wind.current * 0.6,
          })
        }
      }
      for (let i = puffs.length - 1; i >= 0; i -= 1) {
        const puff = puffs[i]!
        puff.y -= 0.9 * dt
        puff.x += (puff.drift + Math.sin((time + i * 90) * 0.006) * 0.35) * dt
        puff.r += 0.07 * dt
        puff.life -= 0.016 * dt
        if (puff.life <= 0) puffs.splice(i, 1)
      }
      drawSmoke(ctx, puffs)

      if (!alive && life.current <= 0.01 && smokeLeft <= 0 && puffs.length === 0) return
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [alive, reduced, seed, wind])

  return <canvas ref={ref} className="flame-canvas" aria-hidden="true" />
}
