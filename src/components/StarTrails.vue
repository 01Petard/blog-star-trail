<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createSkyEffects } from '@/effects/sky'

const props = defineProps({
  showComet: { type: Boolean, default: true },
  paused: { type: Boolean, default: false },
  immersive: { type: Boolean, default: false },
})
const canvas = ref(null)
let effect
onMounted(() => {
  effect = createSkyEffects(canvas.value, { comet: props.showComet })
  effect.setPaused(props.paused)
  if (props.immersive)
    effect.setImmersive(true)
})
watch(() => props.paused, value => effect?.setPaused(value))
watch(() => props.immersive, value => effect?.setImmersive(value), { flush: 'post' })
onUnmounted(() => effect?.destroy())
</script>

<template>
  <canvas ref="canvas" class="sky-effects" aria-hidden="true" />
</template>
