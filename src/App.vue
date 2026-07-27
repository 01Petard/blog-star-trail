<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import MiniPlayer from '@/components/MiniPlayer.vue'
import { siteConfig } from '@/config'
import StarTrails from './components/StarTrails.vue'

const data = reactive({
  titleList: [
    '热爱……',
    '敬畏之心！',
    '赞美之心！',
    '我很好奇！',
    '你好，请多指教',
    '*舒缓的现代音乐*',
    '希望能成为有趣的人',
    '相信美好的事情即将发生',
    '平凡的日常正奇迹的发生着',
    '你所热爱的<br/>就是你的生活',
    '给时光以生命<br/>给岁月以文明',
    '路虽远行则将至<br/>事虽难做则必成',
    '一望无际的迷雾中<br/>有人在寻找光明',
    '当你在凝视着网页的时候<br/>网页也正在凝视着你',
  ],
  navLinks: [{
    name: '博 客',
    link: 'https://01petard.github.io/blog-vue-vitepress/',
  }, {
    name: '留 言',
    link: 'https://01petard.github.io/messageboard/',
  }],

  myProjects: [{
    name: 'Wi-Fi 设备分析器',
    description: '看看谁在你的 Wi-Fi 网络里',
    link: 'https://wifi-device-inspector.vercel.app/',
  }, {
    name: 'Agent智能管理平台',
    description: '自定义个性化的智能体，帮你打工吧！',
    link: 'https://github.com/01Petard/ai-agent-station-web/',
  }, {
    name: '哈基米加密解密工具',
    description: '你还在为不会说曼波语而烦恼吗？快来试试哈基米加密解密工具吧！',
    link: 'https://hajimi.bugstack.icu/',
  }, {
    name: '粒子土星',
    description: '粒子特效模拟土星视觉效果',
    link: 'https://saturn.bugstack.icu/',
  }, {
    name: '手势捕捉',
    description: '实时捕捉识别手部动作轨迹',
    link: 'https://hand.bugstack.icu/',
  }, {
    name: '像素变形生成器',
    description: '一键生成创意像素形变图',
    link: 'https://pixel.bugstack.icu/',
  }, {
    name: '复古终端风格起始页',
    description: '专注于提升效率和专注力的终端风格的仪表盘',
    link: 'https://start.bugstack.icu/',
  }, {
    name: '北京理工大学访客预约系统',
    description: '比官方更好用的预约软件',
    link: 'https://bit.bugstack.icu/',
  }, {
    name: 'What Is Your IPv4',
    description: '黑客帝国风格的公网出口查询',
    link: 'https://ip.bugstack.icu/',
  }, {
    name: '离下班还有多久',
    description: '牛 马 一 定 要 休 息',
    link: 'https://shutdown.bugstack.icu/',
  }, {
    name: 'Pintree收藏夹',
    description: '配置型个人收藏夹',
    link: 'https://01petard.github.io/Pintree-fav/',
  }],

  myBlogs: [{
    name: '代码港湾',
    description: '个人知识库，学习&随笔',
    link: 'https://01petard.github.io/blog-vue-vitepress/',
  }, {
    name: '花火の红玉宫',
    description: '旧时博客',
    link: 'https://01petard.github.io/',
  }],

  socialLinks: [{
    icon: '<i i-ant-design-user-outlined />',
    link: 'https://www.bugstack.icu/',
    label: 'Star-Trail',
  }, {
    icon: '<i i-ant-design-github-outlined />',
    link: 'https://github.com/01Petard/',
    label: 'Github',
  }, {
    icon: '<i i-ant-design-bilibili-outlined />',
    link: 'https://space.bilibili.com/12764212/',
    label: 'Bilibili',
  }],
})

// 两仪式
const avatar = 'https://cdn.jsdelivr.net/gh/01Petard/imageURL@main/img/202503221816953.png'
// 双生视界
// const avatar = 'https://cdn.jsdelivr.net/gh/01Petard/imageURL@main/img/202601151736130.jpg'

let frameId = 0
let handleScroll
let reunionObserver
const reunionScene = ref(null)
const reunionVisible = ref(false)

onMounted(() => {
  const background = document.getElementById('background')
  handleScroll = () => {
    cancelAnimationFrame(frameId)
    frameId = requestAnimationFrame(() => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 1.15), 1)
      background.style.setProperty('--scroll-progress', progress)
    })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  if ('IntersectionObserver' in window) {
    reunionObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting)
        return

      reunionVisible.value = true
      reunionObserver.disconnect()
    }, { threshold: 0.12 })
    reunionObserver.observe(reunionScene.value)
  }
  else {
    reunionVisible.value = true
  }
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  window.removeEventListener('scroll', handleScroll)
  reunionObserver?.disconnect()
})
</script>

<template>
  <!-- 导航 -->
  <nav absolute fixed bottom-4 left-4 z-20>
    <div v-for="(item, index) in data.navLinks" :key="index" my-6 text-3 text-white wv>
      <a :href="item.link" text-white tracking-widest opacity-75 hover:opacity-100>
        {{ item.name }}
      </a>
    </div>
  </nav>

  <!-- 主体 -->
  <main absolute top-75vh z-10 w-full bg-transparent>
    <!-- 大标题 -->
    <section absolute ml-15vw>
      <div class="hero-title" text-10 text-white font-bold tracking-widest v-html="data.titleList[Math.floor(Math.random() * data.titleList.length)]" />
      <div flex items-center>
        <div mr-4 flex gap-2>
          <div h-3 w-3 rounded-full bg-red />
          <div h-3 w-3 rounded-full bg-yellow />
          <div h-3 w-3 rounded-full bg-green />
        </div>
        <div text-4 text-white tracking-widest>
          天天快乐
        </div>
      </div>
    </section>
    <!-- 个人简介 -->
    <section mx-9vw mt-90>
      <!-- 关于我 -->
      <div text-bold mb-4 ml-10 text-8 text-white>
        About Me
      </div>
      <div>
        <MiniPlayer src="/mengdenglong.mp3" title="梦灯笼" />
      </div>
      <div mx-10 mb-10 flex justify-between>
        <div class="text-white/80">
          <p leading-10>
            嗨，你好，我是小黄同学。热爱编程、数码、游戏。
          </p>
          <p leading-10>
            热爱软件工程和 IT 互联网事业，希望能成为一名优秀的开发者。
          </p>
          <p leading-10>
            我们正在让这个世界变得更加美好，通过代码的重复使用和延展构建完美体系。
          </p>
          <p leading-10>
            We're making the world a better place. Through constructing elegant hierarchies for maximum code reuse and extensibility.
          </p>
        </div>
        <img hidden h-25 w-25 rounded-full transition md:block hover:-translate-y--2 :src="avatar" alt="avatar">
      </div>

      <!-- 我的技能 -->
      <!-- <div text-bold mb-2 ml-10 text-8 text-white>
          My Skills
        </div> -->

      <!-- 我的项目 -->
      <!-- Projects -->
      <div text-bold mb-2 ml-10 text-8 text-white>
        Projects
      </div>
      <div grid grid-cols-1 mx-10 mb-10 gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2>
        <div
          v-for="(item, index) in data.myProjects"
          :key="index"
          class="project-item"
        >
          <a class="project-link" :href="item.link">
            <div
              class="project-card bg-white/5 hover:bg-white/10"
              flex-col rounded-lg p-2 shadow-md transition backdrop-blur-3xl backdrop-opacity-60 hover:backdrop-opacity-100 hover:-translate-y-2
              :title="`${item.name}\n${item.description}`"
            >
              <div class="project-title" text-bold text-white opacity-75>
                {{ item.name }}
              </div>
              <div class="project-description" mt-1 text-3 text-white opacity-50>
                {{ item.description }}
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- 我的博客 -->
      <!-- Blogs -->
      <div text-bold mb-2 ml-10 text-8 text-white>
        Blogs
      </div>
      <div grid grid-cols-1 mx-10 mb-10 gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2>
        <div
          v-for="(item, index) in data.myBlogs"
          :key="index"
        >
          <a :href="item.link">
            <div class="bg-white/5 hover:bg-white/10" flex-col rounded-lg p-2 shadow-md transition backdrop-blur-3xl backdrop-opacity-60 hover:backdrop-opacity-100 hover:-translate-y-2>
              <div text-bold text-white opacity-75>
                {{ item.name }}
              </div>
              <div mt-1 text-3 text-white opacity-50>
                {{ item.description }}
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- 社交链接 -->
      <!--   水平居中   -->
      <div text-bold mb-2 ml-10 text-8 text-white>
        Find Me
      </div>
      <div flex flex-wrap justify-between>
        <div v-for="(item, index) in data.socialLinks" :key="index" mx-10 my-4 class="basis-1/4">
          <a
            class="bg-white/5 hover:bg-white/10"
            flex-col items-center justify-between rounded-lg p-2 shadow-md transition backdrop-blur-3xl backdrop-opacity-60 hover:backdrop-opacity-100 hover:-translate-y-2 :href="item.link"
          >
            <div mb-1 f-c-c text-white v-html="item.icon" />
            <div text-bold text-white opacity-75>{{ item.label }}</div>
          </a>
        </div>
      </div>

      <!--  左对齐    -->
      <!--      &lt;!&ndash; Find Me &ndash;&gt; -->
      <!--      <div text-bold mb-2 ml-10 text-8 text-white> -->
      <!--        Find Me -->
      <!--      </div> -->
      <!--      <div grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mx-10 mb-10> -->
      <!--        <div -->
      <!--          v-for="(item, index) in data.socialLinks" -->
      <!--          :key="index" -->
      <!--        > -->
      <!--          <a -->
      <!--            :href="item.link" -->
      <!--            class="flex flex-col items-center justify-between p-2 rounded-lg shadow-md bg-white/5 hover:bg-white/10 transition backdrop-blur-3xl backdrop-opacity-60 hover:backdrop-opacity-100 hover:-translate-y-2" -->
      <!--          > -->
      <!--            <div class="mb-1 text-white f-c-c" v-html="item.icon"></div> -->
      <!--            <div class="text-white text-sm font-bold opacity-75">{{ item.label }}</div> -->
      <!--          </a> -->
      <!--        </div> -->
      <!--      </div> -->
    </section>

    <!-- 黄昏相遇与页脚 -->
    <section class="reunion-footer">
      <figure
        ref="reunionScene"
        class="reunion-scene"
        :class="{ 'is-visible': reunionVisible }"
        aria-label="黄昏中相见的两个人"
      >
        <img
          src="/yourname.avif"
          alt="黄昏中隔着霞光伸手相见的两个人"
          loading="lazy"
          decoding="async"
        >
      </figure>

      <footer class="site-footer">
        <div class="text-white/60" f-c-c>
          <i i-ant-design-environment-outlined mr-1 />
          <p>路虽远行则将至，事虽难做则必成</p>
          <i i-ant-design-environment-outlined ml-1 />
        </div>
        <div class="text-white/60" mt-1 f-c-c gap-3>
          <div>
            <a href="https://beian.miit.gov.cn/" target="_blank">
              浙ICP备2024084383号
            </a>
          </div>
          <div>
            ©2025 小黄同学
          </div>
        </div>
      </footer>
    </section>
  </main>

  <!-- 背景 -->
  <div id="background" absolute left-0 top-0 z-0 h-130vh w-full>
    <div class="dusk-haze" />
    <!-- 星轨背景 -->
    <StarTrails :show-comet="siteConfig.effects.comet" bg-black pb-45vh />
  </div>
</template>

<style lang="scss" scoped>
.hero-title {
  text-shadow: 0 3px 28px rgba(159, 177, 255, 0.3);
}

.project-item,
.project-link {
  display: block;
  height: 100%;
}

.project-card {
  height: 4.75rem;
  overflow: hidden;
  cursor: pointer;
}

.project-title,
.project-description {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.reunion-footer {
  position: relative;
  width: 100%;
  margin-top: clamp(2rem, 5vw, 5rem);
}

.site-footer {
  position: absolute;
  z-index: 2;
  bottom: clamp(0.4rem, 1vw, 0.75rem);
  left: 50%;
  width: max-content;
  max-width: 94vw;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(0.62rem, 0.78vw, 0.75rem);
  line-height: 1.35;
  text-align: center;
  text-shadow: 0 2px 12px rgba(15, 12, 25, 0.72);
  transform: translateX(-50%);
}

.site-footer a {
  color: inherit;
}

.reunion-scene {
  position: relative;
  width: 100%;
  height: clamp(90px, 10.42vw, 200px);
  margin-top: 0;
  overflow: hidden;
  line-height: 0;
  opacity: 0;
  filter: blur(6px) saturate(0.82);
  transform: translate3d(0, 48px, 0) scale(0.985);
  transition:
    opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1),
    filter 1.4s ease-out,
    transform 1.8s cubic-bezier(0.22, 1, 0.36, 1);
  contain: layout paint;
}

.reunion-scene.is-visible {
  opacity: 1;
  filter: blur(0) saturate(0.9);
  transform: translate3d(0, 0, 0) scale(1);
}

.reunion-scene img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right center;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.16) 12%,
    rgba(0, 0, 0, 0.48) 28%,
    rgba(0, 0, 0, 0.82) 32%,
    #000 44%,
    #000 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.16) 12%,
    rgba(0, 0, 0, 0.48) 28%,
    rgba(0, 0, 0, 0.82) 32%,
    #000 44%,
    #000 100%
  );
}

.reunion-scene.is-visible img {
  animation: reunion-float 11s ease-in-out 1.8s infinite;
}

@keyframes reunion-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -3px, 0);
  }
}

#background.fixed {
  position: absolute;
}

#background {
  --scroll-progress: 0;
  position: fixed;
  height: 145vh;
  transform: translate3d(0, calc(var(--scroll-progress) * -38vh), 0);
  will-change: transform;
}

.dusk-haze {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    radial-gradient(ellipse at 72% 72%, rgba(255, 205, 169, 0.62), transparent 36%),
    radial-gradient(ellipse at 28% 66%, rgba(225, 142, 187, 0.4), transparent 44%),
    radial-gradient(ellipse at 50% 92%, rgba(247, 151, 132, 0.46), transparent 54%),
    linear-gradient(
      to bottom,
      rgba(41, 84, 145, 0.2) 8%,
      rgba(110, 92, 169, 0.34) 40%,
      rgba(207, 126, 173, 0.5) 62%,
      rgba(239, 144, 151, 0.56) 78%,
      rgba(252, 177, 143, 0.42) 100%
    );
  opacity: calc(var(--scroll-progress) * 0.82);
  pointer-events: none;
}

.dusk-haze::after {
  position: absolute;
  right: -8%;
  bottom: 20%;
  left: -8%;
  height: 17%;
  background:
    radial-gradient(ellipse at 18% 70%, rgba(255, 238, 222, 0.25), transparent 28%),
    radial-gradient(ellipse at 63% 55%, rgba(255, 225, 213, 0.2), transparent 34%);
  filter: blur(22px);
  content: '';
}

@media (prefers-reduced-motion: reduce) {
  .reunion-scene,
  .reunion-scene.is-visible {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }

  .reunion-scene.is-visible img {
    animation: none;
  }
}
</style>
