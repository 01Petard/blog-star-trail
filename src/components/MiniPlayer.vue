<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '背景音乐' },
})

const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.4)
const progress = computed(() => duration.value ? currentTime.value / duration.value * 100 : 0)
let removeEnableAudio
let autoplayStarting = false

onMounted(() => {
  const enableAudio = () => {
    if (audioRef.value) {
      audioRef.value.muted = false
      audioRef.value.volume = volume.value
      if (audioRef.value.paused)
        audioRef.value.play().catch(() => {})
    }
    removeEnableAudio?.()
  }
  document.addEventListener('pointerdown', enableAudio)
  document.addEventListener('keydown', enableAudio)
  removeEnableAudio = () => {
    document.removeEventListener('pointerdown', enableAudio)
    document.removeEventListener('keydown', enableAudio)
  }
  requestAnimationFrame(() => startAutoplay())
})

onUnmounted(() => {
  removeEnableAudio?.()
})

function togglePlay() {
  if (!audioRef.value)
    return
  if (audioRef.value.paused)
    audioRef.value.play().catch(() => {})
  else
    audioRef.value.pause()
}

function updateTime() {
  currentTime.value = audioRef.value?.currentTime || 0
}

function seek() {
  if (audioRef.value)
    audioRef.value.currentTime = currentTime.value
}

watch(volume, (value) => {
  if (audioRef.value)
    audioRef.value.volume = value
})

function initAudio() {
  const audio = audioRef.value
  duration.value = audio?.duration || 0
  startAutoplay()
}

async function startAutoplay() {
  const audio = audioRef.value
  if (!audio || autoplayStarting || !audio.paused)
    return

  autoplayStarting = true
  audio.volume = volume.value
  const autoplayPolicy = navigator.getAutoplayPolicy?.(audio)
  audio.muted = autoplayPolicy !== 'allowed'
  try {
    await audio.play()
  }
  catch {
    audio.muted = true
    await audio.play().catch(() => {})
  }
  finally {
    autoplayStarting = false
  }
}

function syncPlaying() {
  isPlaying.value = !audioRef.value?.paused
}
</script>

<template>
  <div class="player-shell">
    <button class="play-button" :aria-label="isPlaying ? '暂停' : '播放'" @click="togglePlay">
      <svg v-if="!isPlaying" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
    </button>

    <div class="track-info">
      <div class="control-row">
        <input
          v-model="currentTime"
          class="progress-range"
          type="range"
          min="0"
          :max="duration"
          step="0.1"
          :style="{ '--progress': `${progress}%` }"
          aria-label="播放进度"
          @input="seek"
        >
        <div class="volume-control">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zm11.5 3a3.5 3.5 0 0 0-1.5-2.87v5.74A3.5 3.5 0 0 0 15.5 12z" /></svg>
          <input v-model="volume" type="range" min="0" max="1" step="0.01" aria-label="音量">
        </div>
      </div>
    </div>

    <audio
      ref="audioRef"
      :src="src"
      autoplay
      muted
      loop
      @timeupdate="updateTime"
      @canplay="initAudio"
      @loadedmetadata="initAudio"
      @play="syncPlaying"
      @pause="syncPlaying"
    />
  </div>
</template>

<style scoped>
.player-shell {
  position: fixed;
  z-index: 50;
  right: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  align-items: center;
  width: min(18rem, calc(100vw - 5rem));
  gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  overflow: hidden;
  color: rgba(241, 247, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  background: rgba(8, 10, 20, 0.68);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
}

.play-button {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 0 0 1.8rem;
  height: 1.8rem;
  padding: 0;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  cursor: pointer;
  place-items: center;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.play-button:hover {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.12);
}

.play-button svg {
  width: 0.78rem;
  fill: currentColor;
}

.track-info {
  position: relative;
  z-index: 1;
  min-width: 0;
  flex: 1;
}

input[type='range'] {
  height: 3px;
  margin: 0;
  border-radius: 999px;
  cursor: pointer;
  accent-color: rgba(255, 255, 255, 0.72);
}

.progress-range {
  min-width: 0;
  flex: 1;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.72) var(--progress),
    rgba(255, 255, 255, 0.16) var(--progress)
  );
}

.control-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.6rem;
}

.volume-control {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex: 0 0 4.2rem;
  width: 4.2rem;
  gap: 0.35rem;
}

.volume-control svg {
  width: 0.9rem;
  flex: none;
  fill: rgba(221, 238, 255, 0.66);
}

.volume-control input {
  width: 2.8rem;
}

@media (max-width: 640px) {
  .player-shell {
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .volume-control {
    display: none;
  }
}
</style>
