<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import MiniPlayer from '@/components/MiniPlayer.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import StarTrails from '@/components/StarTrails.vue'
import { siteConfig } from '@/config'
import { categories, heroTitles, projects } from '@/data'

const reducedMotion = ref(false)
const scrolled = ref(false)
const pageHidden = ref(false)
const footerElement = ref(null)
const footerVisible = ref(false)
const heroElement = ref(null)
const immersiveButton = ref(null)
const immersive = ref(false)
const immersiveControlsVisible = ref(true)
const fullscreenPending = ref(false)
const heroTitle = heroTitles[Math.floor(Math.random() * heroTitles.length)]
const showcases = categories.map(category => ({
  ...category,
  projects: projects
    .filter(project => project.category === category.id)
    .sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY)),
}))
const blogs = [
  { title: '代码港湾', description: '个人知识库，学习与随笔', link: 'https://01petard.github.io/blog-vue-vitepress/', action: '迎接未来', icon: 'i-lucide-book-open', color: 'blue' },
  { title: '花火の红玉宫', description: '旧时博客与过往记录', link: 'https://01petard.github.io/', action: '回到过去', icon: 'i-lucide-notebook-pen', color: 'pink' },
]
const socialLinks = [
  { title: 'GitHub', description: '开源代码与项目', link: 'https://github.com/01Petard/', image: '/scenery/github.svg', color: 'github' },
  { title: 'Bilibili', description: '视频与日常', link: 'https://space.bilibili.com/12764212/', image: '/scenery/bilibili.svg', color: 'bilibili' },
  { title: '留言板', description: '交流想法与灵感', link: 'https://doc.bugstack.top/about.html', icon: 'i-lucide-mail', color: 'message' },
]
let preference
let footerObserver
let immersiveControlsTimer = 0
let nativeImmersive = false
let previousScrollY = 0

function revealImmersiveControls() {
  window.clearTimeout(immersiveControlsTimer)
  immersiveControlsVisible.value = true
  if (!immersive.value)
    return
  immersiveControlsTimer = window.setTimeout(() => {
    if (!immersiveButton.value?.matches(':focus-visible'))
      immersiveControlsVisible.value = false
  }, 2000)
}

function restorePage() {
  if (!immersive.value)
    return
  immersive.value = false
  nativeImmersive = false
  window.clearTimeout(immersiveControlsTimer)
  immersiveControlsVisible.value = true
  document.documentElement.classList.remove('is-sky-immersive')
  nextTick(() => {
    window.scrollTo({ top: previousScrollY, behavior: 'instant' })
    immersiveButton.value?.focus({ preventScroll: true })
  })
}

function syncFullscreen() {
  if (document.fullscreenElement === heroElement.value)
    nativeImmersive = true
  else if (nativeImmersive)
    restorePage()
}

async function toggleImmersive() {
  if (fullscreenPending.value)
    return
  if (immersive.value) {
    if (document.fullscreenElement === heroElement.value) {
      try {
        await document.exitFullscreen()
      }
      catch {
        revealImmersiveControls()
        return
      }
    }
    restorePage()
    return
  }
  previousScrollY = window.scrollY
  immersive.value = true
  document.documentElement.classList.add('is-sky-immersive')
  revealImmersiveControls()
  fullscreenPending.value = true
  await nextTick()
  try {
    if (document.fullscreenEnabled && heroElement.value.requestFullscreen)
      await heroElement.value.requestFullscreen()
  }
  catch {
    // 全屏 API 被拒绝或不可用时，仍保留铺满窗口的沉浸模式。
  }
  finally {
    fullscreenPending.value = false
  }
}

function handleImmersiveKey(event) {
  if (!immersive.value)
    return
  if (event.key === 'Escape') {
    event.preventDefault()
    toggleImmersive()
  }
  else {
    revealImmersiveControls()
    if (event.key === 'Tab') {
      event.preventDefault()
      immersiveButton.value?.focus()
    }
  }
}

function syncScroll() {
  scrolled.value = window.scrollY > 24
}

function syncVisibility() {
  pageHidden.value = document.hidden
}

function syncPreference() {
  reducedMotion.value = preference.matches
}

onMounted(() => {
  // footer 进入视口时抬高音乐入口，避免遮挡两行文字和定位图标。
  footerObserver = new IntersectionObserver(([entry]) => {
    footerVisible.value = entry.isIntersecting
  })
  footerObserver.observe(footerElement.value)
  syncScroll()
  syncVisibility()
  window.addEventListener('scroll', syncScroll, { passive: true })
  document.addEventListener('visibilitychange', syncVisibility)
  document.addEventListener('fullscreenchange', syncFullscreen)
  document.addEventListener('keydown', handleImmersiveKey)
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncPreference()
  preference.addEventListener('change', syncPreference)
})

onUnmounted(() => {
  footerObserver?.disconnect()
  window.removeEventListener('scroll', syncScroll)
  document.removeEventListener('visibilitychange', syncVisibility)
  document.removeEventListener('fullscreenchange', syncFullscreen)
  document.removeEventListener('keydown', handleImmersiveKey)
  window.clearTimeout(immersiveControlsTimer)
  document.documentElement.classList.remove('is-sky-immersive')
  if (document.fullscreenElement === heroElement.value)
    document.exitFullscreen().catch(() => {})
  preference?.removeEventListener('change', syncPreference)
})
</script>

<template>
  <a v-show="!immersive" class="skip-link" href="#projects">跳到项目</a>
  <main>
    <section id="top" ref="heroElement" class="hero" :class="{ 'is-immersive': immersive, 'is-idle': immersive && !immersiveControlsVisible }" :aria-labelledby="immersive ? undefined : 'hero-title'" :aria-label="immersive ? '沉浸式星空' : undefined" @pointermove="revealImmersiveControls" @pointerdown="revealImmersiveControls">
      <div class="hero-backdrop" aria-hidden="true" />
      <StarTrails :show-comet="siteConfig.effects.comet" :paused="reducedMotion" :immersive="immersive" />
      <div v-show="!immersive" class="hero-shade" aria-hidden="true" />
      <button ref="immersiveButton" type="button" class="immersive-toggle" :aria-pressed="immersive" :aria-label="immersive ? '退出全屏' : '进入全屏'" :title="immersive ? '退出（Esc）' : '全屏'" :disabled="fullscreenPending" @click="toggleImmersive" @focus="revealImmersiveControls" @blur="revealImmersiveControls">
        <i :class="immersive ? 'i-lucide-minimize' : 'i-lucide-maximize'" aria-hidden="true" /><span>{{ immersive ? '退出' : '全屏' }}</span>
      </button>
      <div v-show="!immersive" :inert="immersive" class="hero-inner content-container">
        <div class="hero-copy">
          <h1 id="hero-title">
            {{ heroTitle }}
          </h1>
          <div class="window-dots" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
        <img src="/scenery/quote-hero.svg" class="opening-quote" alt="即使身处黑暗，也要向着光而行" width="350" height="140">
        <a class="explore-link" :class="{ 'is-still': scrolled || pageHidden }" href="#about" aria-label="向下探索内容"><i class="i-lucide-chevron-down" aria-hidden="true" /><span>向下探索</span></a>
      </div>
    </section>
    <div v-if="immersive" class="hero-spacer" aria-hidden="true" />
    <div class="lower-scene" :class="{ 'is-obscured': immersive }" :inert="immersive" :aria-hidden="immersive || undefined">
      <div class="content-wrap">
        <div class="content-container">
          <section id="about" class="about" aria-labelledby="about-title">
            <div class="section-heading">
              <h2 id="about-title">
                About Me
              </h2>
            </div>
            <div class="about-body">
              <div class="about-copy">
                <p>嗨，你好，我是小黄同学。热爱编程、数码、游戏。</p>
                <p>热爱软件工程和 IT 互联网事业，希望能成为一名优秀的开发者。</p>
                <p>我们正在让这个世界变得更加美好，通过代码的重复使用和延展构建完美体系。</p>
                <p lang="en">
                  We're making the world a better place. Through constructing elegant hierarchies for maximum code reuse and extensibility.
                </p>
              </div>
              <a class="about-avatar" href="https://github.com/01Petard/" target="_blank" rel="noopener noreferrer" aria-label="访问小黄同学的 GitHub">
                <img :src="siteConfig.profile.avatars[siteConfig.profile.avatar]" alt="小黄同学的头像" width="100" height="100" loading="lazy" decoding="async">
              </a>
            </div>
          </section>
          <section id="projects" class="projects-section" aria-labelledby="projects-title">
            <div class="section-heading">
              <h2 id="projects-title">
                Projects
              </h2>
            </div>
            <section v-for="showcase in showcases" :key="showcase.id" class="project-showcase" :aria-labelledby="`showcase-${showcase.id}`">
              <h3 :id="`showcase-${showcase.id}`" class="showcase-title">
                {{ showcase.label }}
              </h3>
              <div class="showcase-grid">
                <ProjectCard v-for="project in showcase.projects" :key="project.url" :project="project" />
              </div>
            </section>
          </section>
          <section id="blogs" class="blogs-section" aria-labelledby="blogs-title">
            <div class="section-heading">
              <h2 id="blogs-title">
                Blogs
              </h2>
            </div>
            <div class="blog-grid social-grid">
              <a v-for="blog in blogs" :key="blog.link" class="liquid-glass" :href="blog.link" target="_blank" rel="noopener noreferrer">
                <span class="social-icon" :class="blog.color" aria-hidden="true"><i :class="blog.icon" /></span><span class="blog-copy">{{ blog.title }}<small>{{ blog.description }}</small></span>
              </a>
            </div>
          </section>
          <section id="find" class="find-section" aria-labelledby="find-title">
            <div class="section-heading">
              <h2 id="find-title">
                Find Me
              </h2>
            </div>
            <div class="social-grid">
              <a v-for="social in socialLinks" :key="social.link" class="liquid-glass" :href="social.link" target="_blank" rel="noopener noreferrer"><span class="social-icon" :class="social.color"><img v-if="social.image" :src="social.image" alt="" width="24" height="24"><i v-else :class="social.icon" aria-hidden="true" /></span><span>{{ social.title }}<small>{{ social.description }}</small></span><i class="social-arrow i-lucide-arrow-up-right" aria-hidden="true" /></a>
            </div>
          </section>
        </div>
      </div>
      <section class="reunion" aria-label="黄昏中伸手相见的两个人">
        <img src="/scenery/quote-footer.svg" class="footer-signature" alt="你的名字，是我见过最美的光" width="350" height="140" loading="lazy">
        <footer ref="footerElement" class="site-footer content-container">
          <p class="footer-motto">
            <i class="i-lucide-map-pin" aria-hidden="true" /><span>路虽远行则将至，事虽难做则必成</span><i class="i-lucide-map-pin" aria-hidden="true" />
          </p>
          <p class="footer-meta">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2024084383号</a><span>© {{ new Date().getFullYear() }} 小黄同学</span>
          </p>
        </footer>
      </section>
    </div>
  </main>
  <MiniPlayer src="/mengdenglong.mp3" title="夢燈籠" :tracks="siteConfig.music.tracks" :docked="scrolled" :raised="footerVisible" :suppressed="immersive" />
</template>
