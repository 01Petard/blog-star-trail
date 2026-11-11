<script setup>
import { cardColors } from '@v3/card-colors'
import CardIcon from '@v3/components/CardIcon.vue'

defineProps({
  project: { type: Object, required: true },
})
</script>

<template>
  <a class="project-card liquid-glass" :style="cardColors[project.icon]" :href="project.url" target="_blank" rel="noopener noreferrer" :aria-label="`${project.name}，在新标签页打开`">
    <CardIcon :name="project.icon" />
    <div class="project-copy">
      <h3>{{ project.name }}</h3>
      <p>{{ project.description }}</p>
    </div>
    <div class="project-footer">
      <div class="project-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
    </div>
  </a>
</template>
