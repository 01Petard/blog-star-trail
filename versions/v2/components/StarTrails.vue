<script setup>
import {onMounted, onUnmounted, ref} from 'vue'

const props = defineProps({
  showComet: {
    type: Boolean,
    default: true,
  },
})

const skyRef = ref(null)
const starCanvasRef = ref(null)
const meteorCanvasRef = ref(null)
const starTrailColors = [
  '#d48e9c',
  '#cf8fb8',
  '#d89a85',
  '#d2aa7f',
  '#cec07e',
  '#b7cb83',
  '#91c28f',
  '#86c4aa',
  '#82c2bd',
  '#84b8ca',
  '#8da9cf',
  '#9b9ace',
  '#b093cc',
  '#c08ebd',
]
const clockwise = 1
const particleColors = ['#e5fbff', '#83e2ff', '#929fff', '#d47cff', '#ff91c6']
const filamentColors = ['rgba(174,244,255,.68)', 'rgba(114,196,255,.55)', 'rgba(151,130,255,.48)', 'rgba(237,116,215,.38)']
const filaments = Array.from({ length: 16 }, (_, index) => ({
  angle: -0.48 + (index - 7.5) * 0.042,
  length: 110 + (index % 8) * 29,
  curve: (index % 2 ? 1 : -1) * (12 + index * 1.9),
  phase: index * 1.83,
  width: 0.7 + (index % 4) * 0.36,
  color: filamentColors[index % filamentColors.length],
}))
let frameId = 0
let resizeObserver
let handleVisibility

onMounted(() => {
  const canvas = meteorCanvasRef.value
  const starLayer = starCanvasRef.value
  const context = canvas.getContext('2d')
  const starContext = starLayer.getContext('2d')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const trailHistory = []
  const particles = []
  const dynamicStars = []
  const dynamicStarBatches = Array.from({ length: starTrailColors.length * 3 }, () => [])
  const particleBatches = Array.from({ length: particleColors.length * 3 }, () => [])
  const filamentBatches = Array.from({ length: filamentColors.length }, () => [])
  let width = 0
  let height = 0
  let isCompact = false
  let lastTime = 0
  let lastBurst = 0
  let startTime = 0

  function paintStars() {
    const skyWidth = skyRef.value.clientWidth
    const skyHeight = skyRef.value.clientHeight
    const size = Math.ceil(Math.hypot(skyWidth, skyHeight) * 1.68)
    const fieldDpr = Math.min(window.devicePixelRatio || 1, 1.25)
    starLayer.width = Math.round(size * fieldDpr)
    starLayer.height = Math.round(size * fieldDpr)
    starLayer.style.width = `${size}px`
    starLayer.style.height = `${size}px`
    starContext.setTransform(fieldDpr, 0, 0, fieldDpr, 0, 0)
    const count = Math.min(3528, Math.max(2117, Math.round(skyWidth * skyHeight / 319)))

    const batches = Array.from({ length: starTrailColors.length * 3 }, () => [])
    for (let index = 0; index < count; index++) {
      const distance = Math.sqrt(Math.random()) * size * 0.5
      const angle = Math.random() * Math.PI * 2
      const radiusRatio = distance / (size * 0.5)
      const trailLength = (12 + radiusRatio * 148) * (0.86 + Math.random() * 0.28)
      const colorIndex = Math.floor(Math.random() * starTrailColors.length)
      const brightness = Math.min(2, Math.floor(Math.random() * 3))
      batches[colorIndex * 3 + brightness].push([distance, angle, trailLength])
    }

    batches.forEach((batch, batchIndex) => {
      const brightness = batchIndex % 3
      starContext.globalAlpha = 0.42 + brightness * 0.23
      starContext.strokeStyle = starTrailColors[Math.floor(batchIndex / 3)]
      starContext.lineWidth = 2.025 + brightness * 0.825
      starContext.lineCap = 'round'
      starContext.beginPath()
      batch.forEach(([distance, angle, trailLength]) => {
        const startAngle = angle - clockwise * trailLength / Math.max(distance, 1)
        starContext.moveTo(
          size / 2 + Math.cos(startAngle) * distance,
          size / 2 + Math.sin(startAngle) * distance,
        )
        starContext.arc(size / 2, size / 2, distance, startAngle, angle)
      })
      starContext.stroke()
    })
    starContext.globalAlpha = 1
  }

  function resize() {
    width = canvas.clientWidth
    height = canvas.clientHeight
    isCompact = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    trailHistory.length = 0
    particles.length = 0
    paintStars()
    createDynamicStars()
  }

  function resetDynamicStar(star, time, initial = false) {
    const centerX = width * 0.78
    const centerY = height * 0.08
    const maxDistance = Math.hypot(
      Math.max(centerX, width - centerX),
      Math.max(centerY, height - centerY),
    )
    star.distance = Math.sqrt(Math.random()) * maxDistance * 1.04
    star.angle = Math.random() * Math.PI * 2
    star.life = 4200 + Math.random() * 6200
    star.bornAt = initial
      ? -Math.random() * star.life
      : time + Math.random() * 1400
    const radiusRatio = Math.min(star.distance / maxDistance, 1)
    star.maxTrail = (18 + radiusRatio ** 1.12 * 182) * (0.88 + Math.random() * 0.24)
    star.colorIndex = Math.floor(Math.random() * starTrailColors.length)
    star.brightness = Math.floor(Math.random() * 3)
    star.width = 0.65 + Math.random() * 1.05
  }

  function createDynamicStars() {
    dynamicStars.length = 0
    const count = isCompact ? 84 : 168
    for (let index = 0; index < count; index++) {
      const star = {}
      resetDynamicStar(star, 0, true)
      dynamicStars.push(star)
    }
  }

  function drawDynamicStars(time) {
    dynamicStarBatches.forEach((batch) => {
      batch.length = 0
    })

    const centerX = width * 0.78
    const centerY = height * 0.08
    dynamicStars.forEach((star) => {
      if (time < star.bornAt)
        return
      const age = time - star.bornAt
      if (age >= star.life) {
        resetDynamicStar(star, time)
        return
      }

      const phase = age / star.life
      const travelAngle = star.maxTrail / Math.max(star.distance, 1)
      if (phase < 0.56) {
        const progress = phase / 0.56
        const eased = progress * progress * (3 - 2 * progress)
        star.startAngle = star.angle
        star.currentAngle = star.angle + clockwise * travelAngle * eased
      }
      else {
        const progress = (phase - 0.56) / 0.44
        const eased = progress * progress * (3 - 2 * progress)
        star.startAngle = star.angle + clockwise * travelAngle * eased
        star.currentAngle = star.angle + clockwise * travelAngle
      }
      dynamicStarBatches[star.colorIndex * 3 + star.brightness].push(star)
    })

    context.save()
    context.globalCompositeOperation = 'screen'
    context.lineCap = 'round'
    dynamicStarBatches.forEach((batch, batchIndex) => {
      if (!batch.length)
        return
      const brightness = batchIndex % 3
      context.globalAlpha = 0.38 + brightness * 0.28
      context.strokeStyle = starTrailColors[Math.floor(batchIndex / 3)]
      context.lineWidth = 2.25 + brightness * 0.975
      context.beginPath()
      batch.forEach((star) => {
        context.moveTo(
          centerX + Math.cos(star.startAngle) * star.distance,
          centerY + Math.sin(star.startAngle) * star.distance,
        )
        context.arc(centerX, centerY, star.distance, star.startAngle, star.currentAngle)
      })
      context.stroke()
    })
    context.restore()
  }

  function meteorPosition(time) {
    const phase = Math.max(0, time / 1000 - 0.5)
    if (phase < 4.8) {
      const progress = phase / 4.8
      const eased = progress < 0.5
        ? 16 * progress ** 5
        : 1 - (-2 * progress + 2) ** 5 / 2
      const arc = Math.sin(eased * Math.PI)
      return {
        x: width * (1.12 - 0.84 * eased),
        y: height * (0.02 + 0.56 * eased - 0.09 * arc),
        alpha: Math.min(phase * 1.5, 1),
        anchored: false,
      }
    }

    return {
      x: width * 0.28 + Math.sin(time * 0.00115) * 8 + Math.sin(time * 0.0027) * 2.5,
      y: height * 0.58 + Math.cos(time * 0.00135) * 6 + Math.sin(time * 0.0022) * 2,
      alpha: 1,
      anchored: true,
    }
  }

  function emitParticle(x, y, spark = false) {
    const angle = spark ? Math.random() * Math.PI * 2 : -0.48 + (Math.random() - 0.5) * 0.76
    const speed = spark ? 70 + Math.random() * 220 : 120 + Math.random() * 340
    const life = spark ? 0.7 + Math.random() * 1.1 : 1.3 + Math.random() * 2.3
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: spark ? Math.cos(angle) * speed : Math.cos(angle) * speed,
      vy: spark ? Math.sin(angle) * speed : Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: spark ? 0.85 + Math.random() * 2.15 : 1 + Math.random() * 4.1,
      colorIndex: Math.floor(Math.random() * particleColors.length),
      turbulence: 4 + Math.random() * 7,
      phase: Math.random() * Math.PI * 2,
      age: 0,
      smoke: !spark && Math.random() > 0.76,
    })
  }

  function drawMeteor(time, delta) {
    const meteor = meteorPosition(reduceMotion ? 7200 : time)
    if (meteor.alpha <= 0)
      return

    if (meteor.anchored) {
      const seconds = delta / 1000
      trailHistory.forEach((point) => {
        point.x += 122 * seconds
        point.y -= 61 * seconds
      })
    }

    const previous = trailHistory[trailHistory.length - 1]
    if (!previous || Math.hypot(previous.x - meteor.x, previous.y - meteor.y) > 2)
      trailHistory.push({ x: meteor.x, y: meteor.y })
    let removeCount = Math.max(0, trailHistory.length - 420)
    while (trailHistory[removeCount]?.x > width * 1.12)
      removeCount++
    if (removeCount)
      trailHistory.splice(0, removeCount)

    if (!reduceMotion) {
      const emitCount = isCompact ? 1 : 2
      for (let index = 0; index < emitCount; index++)
        emitParticle(meteor.x, meteor.y)
      if (time - lastBurst > 620) {
        const burstCount = isCompact ? 6 : 10
        for (let index = 0; index < burstCount; index++)
          emitParticle(meteor.x, meteor.y, true)
        lastBurst = time
      }
      const particleLimit = isCompact ? 120 : 220
      if (particles.length > particleLimit)
        particles.splice(0, particles.length - particleLimit)
    }

    const oldest = trailHistory[0] || meteor
    const tailGradient = context.createLinearGradient(meteor.x, meteor.y, oldest.x, oldest.y)
    tailGradient.addColorStop(0, `rgba(245, 253, 255, ${meteor.alpha})`)
    tailGradient.addColorStop(0.12, `rgba(101, 226, 255, ${meteor.alpha * 0.95})`)
    tailGradient.addColorStop(0.46, `rgba(103, 110, 255, ${meteor.alpha * 0.68})`)
    tailGradient.addColorStop(0.74, `rgba(218, 94, 244, ${meteor.alpha * 0.34})`)
    tailGradient.addColorStop(1, 'rgba(255, 90, 180, 0)')

    const drawTrail = (lineWidth, alpha, blur) => {
      if (trailHistory.length < 2)
        return
      context.save()
      context.globalAlpha = alpha
      context.strokeStyle = tailGradient
      context.lineWidth = lineWidth
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.shadowColor = 'rgba(105, 174, 255, 0.8)'
      context.shadowBlur = blur
      context.beginPath()
      context.moveTo(trailHistory[0].x, trailHistory[0].y)
      for (let index = 1; index < trailHistory.length - 1; index += 5) {
        const point = trailHistory[index]
        const next = trailHistory[Math.min(index + 5, trailHistory.length - 1)]
        context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2)
      }
      context.lineTo(meteor.x, meteor.y)
      context.stroke()
      context.restore()
    }

    context.globalCompositeOperation = 'lighter'
    drawTrail(62, 0.075, 22)
    drawTrail(17, 0.3, 10)
    drawTrail(2.7, 0.96, 0)

    const seconds = delta / 1000
    particleBatches.forEach((batch) => {
      batch.length = 0
    })
    let liveParticleCount = 0
    for (let index = 0; index < particles.length; index++) {
      const particle = particles[index]
      particle.life -= seconds
      if (particle.life <= 0)
        continue
      particle.age += seconds
      particle.vy += Math.sin(particle.age * particle.turbulence + particle.phase) * 18 * seconds
      particle.x += particle.vx * seconds
      particle.y += particle.vy * seconds
      particle.vx *= 0.992
      particle.vy *= 0.992
      const opacity = Math.min(1, particle.life / (particle.maxLife * 0.42)) * meteor.alpha
      const opacityBucket = Math.min(2, Math.floor(opacity * 3))
      particleBatches[particle.colorIndex * 3 + opacityBucket].push(particle)
      particles[liveParticleCount++] = particle
    }
    particles.length = liveParticleCount

    context.shadowBlur = 0
    context.lineCap = 'round'
    particleBatches.forEach((batch, batchIndex) => {
      if (!batch.length)
        return
      const opacityBucket = batchIndex % 3
      context.globalAlpha = (0.2 + opacityBucket * 0.27) * meteor.alpha
      context.strokeStyle = particleColors[Math.floor(batchIndex / 3)]
      context.lineWidth = 1 + opacityBucket * 0.4
      context.beginPath()
      batch.forEach((particle) => {
        const tailScale = particle.smoke ? 0.055 : 0.035
        context.moveTo(particle.x, particle.y)
        context.lineTo(particle.x - particle.vx * tailScale, particle.y - particle.vy * tailScale)
      })
      context.stroke()
    })
    context.globalAlpha = 1

    filamentBatches.forEach((batch) => {
      batch.length = 0
    })
    filaments.forEach((filament, index) => {
      filamentBatches[index % filamentColors.length].push(filament)
    })
    filamentBatches.forEach((batch, colorIndex) => {
      context.globalAlpha = meteor.alpha * 0.66
      context.strokeStyle = filamentColors[colorIndex]
      context.lineWidth = 1.3
      context.beginPath()
      batch.forEach((filament) => {
        const wave = Math.sin(time * 0.0024 + filament.phase)
        const angle = filament.angle + wave * 0.035
        const length = filament.length * (0.9 + wave * 0.1)
        context.moveTo(meteor.x + 4, meteor.y)
        context.quadraticCurveTo(
          meteor.x + Math.cos(angle) * length * 0.45,
          meteor.y + Math.sin(angle) * length * 0.45 + filament.curve * wave,
          meteor.x + Math.cos(angle) * length,
          meteor.y + Math.sin(angle) * length,
        )
      })
      context.stroke()
    })
    context.globalAlpha = 1

    const cometAngle = -0.48
    context.save()
    context.translate(
      meteor.x + Math.cos(cometAngle) * 18,
      meteor.y + Math.sin(cometAngle) * 18,
    )
    context.rotate(cometAngle)
    context.scale(1.75, 0.72)
    const coma = context.createRadialGradient(0, 0, 0, 0, 0, 78)
    coma.addColorStop(0, `rgba(242,253,255,${meteor.alpha * 0.92})`)
    coma.addColorStop(0.16, `rgba(166,235,255,${meteor.alpha * 0.68})`)
    coma.addColorStop(0.42, `rgba(92,177,255,${meteor.alpha * 0.3})`)
    coma.addColorStop(0.7, `rgba(117,104,255,${meteor.alpha * 0.1})`)
    coma.addColorStop(1, 'rgba(104,92,255,0)')
    context.fillStyle = coma
    context.beginPath()
    context.arc(0, 0, 78, 0, Math.PI * 2)
    context.fill()
    context.restore()

    context.save()
    context.translate(meteor.x, meteor.y)
    context.rotate(cometAngle)
    const nucleus = context.createLinearGradient(-22, 0, 24, 0)
    nucleus.addColorStop(0, '#ffffff')
    nucleus.addColorStop(0.5, '#e9fbff')
    nucleus.addColorStop(1, '#93e8ff')
    context.fillStyle = nucleus
    context.shadowColor = 'rgba(173, 238, 255, 0.85)'
    context.shadowBlur = 12
    context.beginPath()
    context.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
    context.globalCompositeOperation = 'source-over'
  }

  function render(time = 0) {
    if (!startTime)
      startTime = time
    const delta = Math.min(time - lastTime || 16, 50)
    lastTime = time
    context.clearRect(0, 0, width, height)
    if (props.showComet) {
      drawDynamicStars(time - startTime)
      drawMeteor(time - startTime, delta)
    }

    if (!reduceMotion && !document.hidden)
      frameId = requestAnimationFrame(render)
  }

  resizeObserver = new ResizeObserver(() => {
    resize()
    if (reduceMotion)
      render()
  })
  resizeObserver.observe(skyRef.value)

  handleVisibility = () => {
    cancelAnimationFrame(frameId)
    lastTime = 0
    if (!document.hidden && !reduceMotion)
      frameId = requestAnimationFrame(render)
  }
  document.addEventListener('visibilitychange', handleVisibility)
  resize()
  render()
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div ref="skyRef" class="star-sky">
    <canvas ref="starCanvasRef" class="star-field" aria-hidden="true" />
    <canvas ref="meteorCanvasRef" class="meteor-layer" aria-hidden="true" />
    <div class="twilight-glow" />
  </div>
</template>

<style scoped>
.star-sky {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #02050e, #10132b 46%, #302139 74%, #08070d);
}

.star-field {
  position: absolute;
  top: 8%;
  left: 78%;
  display: block;
  transform: translate(-50%, -50%);
  transform-origin: center;
  animation: rotate-stars 190s linear infinite;
  animation-direction: normal;
  opacity: 0.52;
  will-change: transform;
}

.meteor-layer {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100vh;
  pointer-events: none;
}

@keyframes rotate-stars {
  to {
    transform: translate(-50%, -50%) rotate(1turn);
  }
}

.twilight-glow {
  position: absolute;
  right: -12vw;
  bottom: 4%;
  width: 70vw;
  height: 24vw;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(211, 103, 141, 0.18), rgba(91, 83, 164, 0.08) 44%, transparent 72%);
  filter: blur(45px);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .star-field {
    animation: none;
  }
}
</style>
