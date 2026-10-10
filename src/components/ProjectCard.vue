<script setup>
defineProps({
  project: { type: Object, required: true },
})

const icons = {
  RT: 'i-lucide-rotate-ccw-clock',
  FM: 'i-lucide-shield-check',
  GL: 'i-lucide-images',
  AF: 'i-lucide-puzzle',
  TF: 'i-lucide-chart-no-axes-combined',
  AI: 'i-lucide-bot',
  AG: 'i-lucide-workflow',
  HM: 'i-lucide-lock-keyhole',
  ST: 'i-lucide-orbit',
  HD: 'i-lucide-hand',
  PX: 'i-lucide-grid-2x2',
  TM: 'i-lucide-square-terminal',
  BT: 'i-lucide-university',
  IP: 'i-lucide-globe',
  OFF: 'i-lucide-clock',
  PT: 'i-lucide-folder-bookmark',
}
const colors = { RT: 'purple', FM: 'blue', GL: 'pink', AF: 'purple', TF: 'pink', AI: 'amber', AG: 'purple', HM: 'amber', ST: 'amber', HD: 'purple', PX: 'blue', TM: 'blue', BT: 'blue', IP: 'blue', OFF: 'rose', PT: 'amber' }
</script>

<template>
  <a class="project-card liquid-glass" :href="project.url" target="_blank" rel="noopener noreferrer" :aria-label="`${project.name}，在新标签页打开`">
    <span class="project-icon" :class="colors[project.icon]" aria-hidden="true">
      <i :class="icons[project.icon]" />
    </span>
    <div class="project-copy">
      <h3>{{ project.name }}</h3>
      <p>{{ project.description }}</p>
    </div>
    <div class="project-footer">
      <div class="project-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
    </div>
  </a>
</template>
