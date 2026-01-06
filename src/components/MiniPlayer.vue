<script setup>
import { onMounted, ref, watch } from 'vue'

defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '背景音乐' },
})

const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.4)

onMounted(() => {
  // 等用户第一次点击页面再取消静音
  const enableAudio = () => {
    if (audioRef.value) {
      audioRef.value.muted = false
      audioRef.value.volume = volume.value
    }
    document.removeEventListener('click', enableAudio)
  }
  document.addEventListener('click', enableAudio)
})

function togglePlay() {
  if (!audioRef.value)
    return
  if (isPlaying.value) {
    audioRef.value.pause()
  }
  else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function updateTime() {
  if (!audioRef.value)
    return
  currentTime.value = audioRef.value.currentTime
}

function seek() {
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
}

watch(volume, (val) => {
  if (audioRef.value) {
    audioRef.value.volume = val
  }
})

function initAudio() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 w-72 flex flex-col gap-2 rounded-2xl bg-white/10 p-4 text-white shadow-lg backdrop-blur-xl">
    <!-- 歌曲标题 -->
    <!--    <div class="font-bold text-sm truncate">{{ title }}</div> -->

    <!-- 控制区 -->
    <div class="flex items-center justify-between">
      <!-- 播放按钮 -->
      <button class="text-white transition hover:text-yellow-300" @click="togglePlay">
        <!-- ▶️ 播放图标 -->
        <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24">
          <path d="M5 3v18l15-9L5 3z" />
        </svg>

        <!-- ⏸️ 暂停图标 -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
        </svg>
      </button>

      <!-- 进度条 -->
      <input
        v-model="currentTime"
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        class="mx-3 w-full accent-white"
        @input="seek"
      >

      <!-- 音量控制 -->
      <input
        v-model="volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        class="w-16 accent-white"
      >
    </div>

    <!-- 隐藏 audio 标签 -->
    <audio
      ref="audioRef"
      :src="src"
      autoplay
      muted
      loop
      @timeupdate="updateTime"
      @canplay="initAudio"
    />
  </div>
</template>

<style scoped>
input[type='range'] {
  height: 4px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
