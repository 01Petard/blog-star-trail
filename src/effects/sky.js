import { siteConfig } from '@/config'

// 独立 Canvas 层：视觉计时只在首屏可见、页签激活且未暂停时推进。
export function createSkyEffects(canvas, { comet = true, ...options } = {}) {
  const context = canvas.getContext('2d', { alpha: true })
  if (!context)
    return { setPaused() {}, setImmersive() {}, destroy() {} }
  const config = { ...siteConfig.effects.sky, ...options }
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const radians = Math.PI / 180
  const axisAzimuth = config.axisAzimuth * radians
  const axisAltitude = config.axisAltitude * radians
  const axis = [Math.sin(axisAzimuth) * Math.cos(axisAltitude), Math.sin(axisAltitude), Math.cos(axisAzimuth) * Math.cos(axisAltitude)]
  const palette = ['#7fdfff', '#94bfff', '#7fdfff', '#94bfff', '#b5a0f0', '#e2a0cf', '#d7b579', '#83cdba']
  let width = 1
  let height = 1
  let mobile = false
  let focal = 1
  let lensX = 0
  let lensY = 0
  let cameraRight = []
  let cameraUp = []
  let cameraForward = []
  let trails = []
  let stars = []
  let trailFadeMask
  let protectedRegions = []
  let frame = 0
  let previous = 0
  let elapsed = 0
  let paused = false
  let immersive = false
  let visible = false
  let destroyed = false
  let pageHidden = false
  let seed = config.seed

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    mobile = width < 600
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? config.mobileMaxDpr : config.maxDpr)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    trailFadeMask = context.createLinearGradient(0, height * config.trailFadeStart, 0, height * config.trailFadeEnd)
    trailFadeMask.addColorStop(0, '#00000000')
    trailFadeMask.addColorStop(0.25, '#00000028')
    trailFadeMask.addColorStop(0.5, '#00000080')
    trailFadeMask.addColorStop(0.75, '#000000d7')
    trailFadeMask.addColorStop(1, '#000000ff')
    const yaw = (mobile ? config.mobileCameraYaw : config.cameraYaw) * radians
    const pitch = (mobile ? config.mobileCameraPitch : config.cameraPitch) * radians
    const roll = (mobile ? config.mobileCameraRoll : config.cameraRoll) * radians
    cameraForward = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)]
    const right = [Math.cos(yaw), 0, -Math.sin(yaw)]
    const up = [-Math.sin(yaw) * Math.sin(pitch), Math.cos(pitch), -Math.cos(yaw) * Math.sin(pitch)]
    cameraRight = right.map((value, index) => value * Math.cos(roll) + up[index] * Math.sin(roll))
    cameraUp = up.map((value, index) => value * Math.cos(roll) - right[index] * Math.sin(roll))
    // 等距广角投影保留角距离：径向压缩、切向舒展，使天球纬圈具有仰视透视。
    // 立体投影会把所有纬圈映射成圆，无法呈现参考图的侧倾穹顶。
    focal = Math.max(width / (config.horizontalFov * radians), height / (config.verticalFov * radians))
    const poleX = axis[0] * cameraRight[0] + axis[1] * cameraRight[1] + axis[2] * cameraRight[2]
    const poleY = axis[0] * cameraUp[0] + axis[1] * cameraUp[1] + axis[2] * cameraUp[2]
    const poleZ = axis[0] * cameraForward[0] + axis[1] * cameraForward[1] + axis[2] * cameraForward[2]
    const poleAngle = Math.acos(Math.max(-1, Math.min(1, poleZ)))
    const poleScale = focal * poleAngle / Math.max(0.000001, Math.hypot(poleX, poleY))
    lensX = width * config.axisCenterX - poleX * poleScale
    lensY = height * config.axisCenterY + poleY * poleScale
    seed = config.seed
    const count = mobile ? config.mobileVisibleTrails : config.desktopVisibleTrails
    trails = []
    const pole = project({ parallel: axis, radial: [0, 0, 0], tangent: [0, 0, 0] }, 0)
    const poleCount = mobile ? config.mobilePoleTrails : config.desktopPoleTrails
    // 根据镜头覆盖的立体角确定整颗天球的星点数量，转动到背面后仍保持相近的可见密度。
    let solidAngle = 0
    for (let row = 0; row < 16; row++) {
      for (let column = 0; column < 16; column++) {
        const x = (column + 0.5) * width / 16 - lensX
        const y = (row + 0.5) * height / 16 - lensY
        const angle = Math.hypot(x, y) / focal
        if (angle < Math.PI)
          solidAngle += width * height / (256 * focal ** 2) * (angle < 0.000001 ? 1 : Math.sin(angle) / angle)
      }
    }
    const sphereCount = Math.round((count - poleCount) * 4 * Math.PI / solidAngle)
    for (let index = 0; index < poleCount + sphereCount; index++) {
      let point
      if (index < poleCount) {
        const angle = random() * Math.PI * 2
        const radius = (0.18 + Math.sqrt(random()) * 0.82) * width * config.poleSpread
        const x = pole.x + Math.cos(angle) * radius - lensX
        const y = lensY - pole.y - Math.sin(angle) * radius
        const distance = Math.hypot(x, y)
        const projectionAngle = distance / focal
        const local = [Math.sin(projectionAngle) * x / distance, Math.sin(projectionAngle) * y / distance, Math.cos(projectionAngle)]
        point = cameraRight.map((value, component) => value * local[0] + cameraUp[component] * local[1] + cameraForward[component] * local[2])
      }
      else {
        const y = random() * 2 - 1
        const angle = random() * Math.PI * 2
        const radius = Math.sqrt(1 - y * y)
        point = [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
      }
      const dot = axis[0] * point[0] + axis[1] * point[1] + axis[2] * point[2]
      const parallel = axis.map(value => value * dot)
      trails.push({
        parallel,
        radial: point.map((value, component) => value - parallel[component]),
        tangent: [axis[1] * point[2] - axis[2] * point[1], axis[2] * point[0] - axis[0] * point[2], axis[0] * point[1] - axis[1] * point[0]],
        length: index < poleCount ? 0.25 + random() * 0.5 : config.minArc + random() * (config.maxArc - config.minArc),
        opacity: 0.52 + random() * 0.4,
        line: config.minLineWidth + random() * (config.maxLineWidth - config.minLineWidth),
        color: palette[Math.floor(random() * palette.length)],
      })
    }
    stars = Array.from({ length: mobile ? config.mobileStars : config.desktopStars }, () => ({ x: random() * width, y: random() * height * 0.9, r: 0.3 + random() * 0.5, phase: random() * Math.PI * 2, opacity: 0.14 + random() * 0.22 }))
    updateProtectedRegions(rect)
    draw(preference.matches ? 0 : elapsed)
  }

  function updateProtectedRegions(rect = canvas.getBoundingClientRect()) {
    protectedRegions = []
    if (immersive)
      return
    const hero = canvas.closest('.hero')
    for (const element of hero?.querySelectorAll('.hero-copy h1, .hero-copy p, .hero-actions a, .music-player') || []) {
      let regions
      if (element.matches('h1, p')) {
        const range = document.createRange()
        range.selectNodeContents(element)
        regions = range.getClientRects()
      }
      else {
        regions = [element.getBoundingClientRect()]
      }
      for (const region of regions) {
        protectedRegions.push({
          left: region.left - rect.left,
          right: region.right - rect.left,
          top: region.top - rect.top,
          bottom: region.bottom - rect.top,
        })
      }
    }
  }

  function project(trail, angle) {
    // Rodrigues 轴旋转：每颗星在天球自己的纬圈上运动，不在屏幕上旋转椭圆图层。
    const cosine = Math.cos(angle)
    const sine = Math.sin(angle)
    const x = trail.parallel[0] + trail.radial[0] * cosine + trail.tangent[0] * sine
    const y = trail.parallel[1] + trail.radial[1] * cosine + trail.tangent[1] * sine
    const z = trail.parallel[2] + trail.radial[2] * cosine + trail.tangent[2] * sine
    const localX = x * cameraRight[0] + y * cameraRight[1] + z * cameraRight[2]
    const localY = x * cameraUp[0] + y * cameraUp[1] + z * cameraUp[2]
    const localZ = x * cameraForward[0] + y * cameraForward[1] + z * cameraForward[2]
    const angleFromCamera = Math.acos(Math.max(-1, Math.min(1, localZ)))
    const scale = focal * angleFromCamera / Math.max(0.000001, Math.hypot(localX, localY))
    return { x: lensX + localX * scale, y: lensY - localY * scale }
  }

  function contentOpacity(x, y) {
    let opacity = 1
    for (const region of protectedRegions) {
      const distance = Math.hypot(Math.max(region.left - x, 0, x - region.right), Math.max(region.top - y, 0, y - region.bottom))
      const blend = Math.min(1, distance / config.textPadding)
      opacity = Math.min(opacity, config.textAttenuation + (1 - config.textAttenuation) * blend * blend * (3 - 2 * blend))
    }
    return opacity
  }

  function drawComet(time) {
    if (!comet)
      return
    const x = width * (mobile ? config.mobileCometX : config.cometX)
    const y = height * (mobile ? config.mobileCometY : config.cometY)
    const length = width * (mobile ? config.mobileCometTailLength : config.cometTailLength)
    const bend = length * config.cometTailCurve
    const shimmer = 0.875 + 0.075 * Math.sin(time * Math.PI * 2 / config.cometShimmerPeriod)
      + 0.05 * Math.sin(time * Math.PI * 2 / config.cometSecondaryPeriod + 1.3)
    const breath = 0.8 + 0.2 * Math.sin(time * Math.PI * 2 / config.cometGlowPeriod + 0.6)
    context.save()
    context.globalCompositeOperation = 'screen'
    context.translate(x, y)
    context.rotate(config.cometTailAngle)
    const scale = length / 650
    // 每层从同一尖端出发，先舒展再收束。亮度沿尾部衰减，避免等宽光束和硬边。
    function plume(tailLength, halfWidth, stops, opacity, separation = 0, blur = 0) {
      const gradient = context.createLinearGradient(0, 0, tailLength, 0)
      for (const [position, color, alpha] of stops) {
        const energy = 0.92 + 0.08 * Math.sin(position * Math.PI * 6 - time * 1.4)
        const hex = Math.round(255 * alpha * energy).toString(16).padStart(2, '0')
        gradient.addColorStop(position, `${color}${hex}`)
      }
      context.globalAlpha = opacity
      context.filter = blur ? `blur(${blur * scale}px)` : 'none'
      context.fillStyle = gradient
      context.beginPath()
      for (let side = -1; side <= 1; side += 2) {
        for (let step = 0; step <= 32; step++) {
          const position = side === -1 ? step / 32 : 1 - step / 32
          const spread = Math.sin(Math.PI * position) ** 0.8 * (1 - position) ** 0.45
          const center = tailLength * config.cometTailCurve * Math.sin(Math.PI * position) + separation * position ** 0.85
          const px = position * tailLength
          const py = center + side * halfWidth * spread * scale
          if (side === -1 && step === 0)
            context.moveTo(px, py)
          else
            context.lineTo(px, py)
        }
      }
      context.closePath()
      context.fill()
      context.filter = 'none'
    }
    const blue = [[0, '#77e8ff', 0.8], [0.1, '#32cfff', 1], [0.3, '#208cf5', 0.95], [0.58, '#226add', 0.62], [0.82, '#2857c9', 0.3], [1, '#294fbd', 0]]
    const pink = [[0, '#90dfff', 0], [0.12, '#ab83e6', 0.45], [0.33, '#cf67c4', 0.85], [0.6, '#b65ec3', 0.6], [0.86, '#8958be', 0.15], [1, '#8958be', 0]]
    plume(length, config.cometHaloWidth / 2, blue, 0.4 * breath, -6 * scale, 9)
    plume(length, 13, pink, 0.45, config.cometPinkSeparation * scale, 5)
    plume(length, config.cometTailWidth / 2, blue, 0.78, 0, 2.2)
    plume(length * 0.97, 3.8, pink, 0.65, config.cometPinkSeparation * scale, 1.2)
    plume(length * 0.92, 3.5, [[0, '#d4fdff', 0.95], [0.1, '#62e4ff', 1], [0.35, '#28a8ff', 0.8], [0.7, '#4485f2', 0.3], [1, '#4da5ef', 0]], 0.7, -5 * scale, 0.7)
    // 不同长度与曲率的细丝打散光带边缘，保留参考图中的纤维层次。
    for (let index = 0; index < 14; index++) {
      const extent = length * (0.54 + ((index * 37) % 47) / 100)
      const separation = ((index * 17) % 31 - 18) * scale
      const gradient = context.createLinearGradient(0, 0, extent, 0)
      gradient.addColorStop(0, '#8cecff00')
      gradient.addColorStop(0.12, '#65dfff30')
      gradient.addColorStop(0.35, '#428efa50')
      gradient.addColorStop(0.48, '#428efa20')
      gradient.addColorStop(0.6, '#428efa40')
      gradient.addColorStop(1, '#386ee500')
      context.strokeStyle = gradient
      context.lineWidth = (0.6 + index % 3 * 0.4) * scale
      context.globalAlpha = 0.65 + 0.1 * Math.sin(time * 0.8 + index * 1.7)
      context.beginPath()
      for (let step = 0; step <= 40; step++) {
        const position = step / 40
        const px = position * extent
        const py = bend * Math.sin(Math.PI * px / length) + separation * Math.sin(Math.PI * position / 2)
          + Math.sin(position * 10 + index) * position * 1.4 * scale
        if (step === 0)
          context.moveTo(px, py)
        else
          context.lineTo(px, py)
      }
      context.stroke()
    }
    // 彗核是一段向尾部拉开的白蓝尖芒，光晕沿尾轴延伸，不形成白色圆球。
    plume(config.cometCoreLength * scale * 1.35, 13, blue, 0.5 * breath, 0, 4)
    plume(config.cometCoreLength * scale, 6, [[0, '#f4feff', 1], [0.12, '#ffffff', 1], [0.36, '#e2fcff', 1], [0.65, '#91ecff', 0.9], [1, '#62d7ff', 0]], shimmer, 0, 0.7)
    const particles = mobile ? config.mobileTailParticles : config.desktopTailParticles
    for (let index = 0; index < particles; index++) {
      const position = (index / particles + time * config.cometTailFlowSpeed) % 1
      const edgeFade = Math.min(1, position / 0.08, (1 - position) / 0.2)
      const offset = Math.sin(index * 2.4 + position * 4) * (5 + position * 24) * scale
      context.globalAlpha = edgeFade * (1 - position) * (0.2 + index % 5 * 0.065)
      context.fillStyle = index % 4 === 0 ? '#dba8ef' : '#a5e7ff'
      context.beginPath()
      context.ellipse(position * length, bend * Math.sin(Math.PI * position) + offset, (0.9 + index % 4 * 0.5) * scale, 0.75 * scale, 0, 0, Math.PI * 2)
      context.fill()
    }
    const radius = config.cometGlowRadius * scale * (0.92 + breath * 0.12)
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius)
    glow.addColorStop(0, '#7cddffc0')
    glow.addColorStop(0.25, '#4acbff90')
    glow.addColorStop(0.6, '#3399f52c')
    glow.addColorStop(1, '#267af000')
    context.save()
    context.translate(7 * scale, 0)
    context.scale(1.8, 0.65)
    context.globalAlpha = breath
    context.fillStyle = glow
    context.beginPath()
    context.arc(0, 0, radius, 0, Math.PI * 2)
    context.fill()
    context.restore()
    context.globalAlpha = shimmer
    context.fillStyle = '#f1fcff'
    context.beginPath()
    context.arc(0, 0, config.cometCoreRadius * scale, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  function draw(time) {
    context.clearRect(0, 0, width, height)
    for (const star of stars) {
      context.globalAlpha = star.opacity * (0.8 + 0.2 * Math.sin(time * 0.5 + star.phase)) * contentOpacity(star.x, star.y)
      context.fillStyle = '#cfe0ff'
      context.beginPath()
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      context.fill()
    }
    const phase = config.orbitDirection * time * Math.PI * 2 / config.orbitPeriod
    context.lineCap = 'round'
    for (const trail of trails) {
      const points = []
      for (let part = 0; part <= 8; part++)
        points.push(project(trail, phase - trail.length + trail.length * part / 8))
      // 反向运动时翻转弧段采样顺序，保持几何不变，让亮端仍位于运动前方。
      if (config.orbitDirection < 0)
        points.reverse()
      // 广角镜头背向相机的极点存在接缝，不能把接缝两侧连成横穿首屏的直线。
      if (points.some((point, index) => index > 0 && Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y) > Math.max(width, height) * 0.5))
        continue
      if (points.every(point => point.x < 0) || points.every(point => point.x > width)
        || points.every(point => point.y < 0) || points.every(point => point.y > height)) {
        continue
      }
      const start = points[0]
      const end = points[8]
      const span = Math.hypot(end.x - start.x, end.y - start.y)
      if (span < 2 || span > Math.max(width, height) * 6)
        continue
      const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y)
      gradient.addColorStop(0, `${trail.color}00`)
      gradient.addColorStop(0.18, `${trail.color}65`)
      gradient.addColorStop(0.7, `${trail.color}d0`)
      gradient.addColorStop(1, trail.color)
      context.strokeStyle = gradient
      context.lineWidth = trail.line
      context.globalAlpha = trail.opacity * contentOpacity(points[4].x, points[4].y)
      context.beginPath()
      context.moveTo(start.x, start.y)
      for (let part = 1; part <= 8; part++)
        context.lineTo(points[part].x, points[part].y)
      context.stroke()
    }
    context.globalAlpha = 1
    // 只擦除星空层的透明度，彗星随后绘制，底图保持原样。
    context.save()
    context.globalCompositeOperation = 'destination-out'
    context.fillStyle = trailFadeMask
    context.fillRect(0, height * config.trailFadeStart, width, height * (1 - config.trailFadeStart))
    context.restore()
    drawComet(time)
  }

  function active() {
    return !destroyed && !paused && !preference.matches && visible && !document.hidden && !pageHidden
  }
  function tick(now) {
    frame = 0
    if (!active())
      return
    if (!previous)
      previous = now
    if (now - previous >= 1000 / (mobile ? config.mobileFps : config.desktopFps)) {
      elapsed += Math.min((now - previous) / 1000, 0.1)
      previous = now
      draw(elapsed)
    }
    frame = requestAnimationFrame(tick)
  }
  function sync() {
    cancelAnimationFrame(frame)
    frame = 0
    previous = 0
    if (active())
      frame = requestAnimationFrame(tick)
  }
  function onPreference() {
    draw(preference.matches ? 0 : elapsed)
    sync()
  }
  function onPageHide() {
    pageHidden = true
    sync()
  }
  function onPageShow() {
    pageHidden = false
    sync()
  }
  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  resizeObserver.observe(canvas)
  intersectionObserver.observe(canvas)
  document.addEventListener('visibilitychange', sync)
  window.addEventListener('pagehide', onPageHide)
  window.addEventListener('pageshow', onPageShow)
  preference.addEventListener('change', onPreference)
  resize()
  return {
    setPaused(value) {
      paused = Boolean(value)
      sync()
    },
    setImmersive(value) {
      immersive = Boolean(value)
      updateProtectedRegions()
      draw(preference.matches ? 0 : elapsed)
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      preference.removeEventListener('change', onPreference)
      context.clearRect(0, 0, width, height)
    },
  }
}
