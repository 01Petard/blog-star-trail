export const siteConfig = Object.freeze({
  profile: Object.freeze({
    // 切换为 'anya' 即可使用另一张头像，保留老博客的两份素材。
    avatar: 'shiki',
    avatars: Object.freeze({
      // 两仪式
      shiki: 'https://cdn.jsdelivr.net/gh/01Petard/imageURL@main/img/202503221816953.png',
      // 阿尼娅·容格
      anya: 'https://cdn.jsdelivr.net/gh/01Petard/imageURL@main/img/202601151736130.jpg',
    }),
  }),
  music: Object.freeze({
    tracks: Object.freeze([
      Object.freeze({ src: '/mengdenglong.mp3', title: '夢燈籠', artist: 'RADWIMPS', cover: '/scenery/music_cover.jpg' }),
    ]),
  }),
  effects: Object.freeze({
    comet: true,
    sky: Object.freeze({
      seed: 92817,
      // 相机和自转轴的角度以度为单位，轴心位置为容器比例。
      cameraYaw: 0,
      cameraPitch: 50,
      cameraRoll: -12,
      mobileCameraYaw: 53.68,
      mobileCameraPitch: 34.06,
      mobileCameraRoll: -4,
      axisAzimuth: 9.72344,
      axisAltitude: 58.24727,
      // 轴心落在容器右上角，仅露出向左下展开的四分之一穹顶；保留等距广角透视。
      axisCenterX: 1,
      axisCenterY: 0,
      horizontalFov: 126,
      verticalFov: 118,
      desktopVisibleTrails: 760,
      desktopPoleTrails: 54,
      mobilePoleTrails: 24,
      poleSpread: 0.18,
      mobileVisibleTrails: 320,
      // 弧段长度以弧度为单位，轨道周期以秒为单位。
      minArc: 0.05,
      maxArc: 0.19,
      minLineWidth: 0.6,
      maxLineWidth: 1.4,
      orbitPeriod: 600,
      // 屏幕中的环绕方向：-1 为顺时针，1 为逆时针。
      orbitDirection: -1,
      // 按首屏高度设置底部淡出范围，末端星轨完全透明。
      trailFadeStart: 0.7,
      trailFadeEnd: 1,
      desktopStars: 70,
      mobileStars: 36,
      textAttenuation: 0.35,
      textPadding: 24,
      maxDpr: 1.75,
      mobileMaxDpr: 1.5,
      desktopFps: 30,
      mobileFps: 24,
      cometX: 0.607,
      cometY: 0.515,
      mobileCometX: 0.8,
      mobileCometY: 0.22,
      cometTailLength: 0.3,
      mobileCometTailLength: 0.26,
      // Canvas 尾部角度为弧度；负值使尾巴伸向右上。
      cometTailAngle: -0.49,
      cometTailCurve: -0.035,
      // 尺寸以参考图中约 650px 的尾长为基准，随实际尾长同比缩放。
      cometTailWidth: 40,
      cometHaloWidth: 90,
      cometPinkSeparation: 30,
      cometCoreLength: 90,
      cometCoreRadius: 1.35,
      cometGlowRadius: 24,
      cometShimmerPeriod: 3.1,
      cometSecondaryPeriod: 4.7,
      cometGlowPeriod: 5.4,
      cometTailFlowSpeed: 0.085,
      desktopTailParticles: 180,
      mobileTailParticles: 24,
    }),
  }),
})
