<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
})

// 项目与博客共用 32px 几何网格，色彩同时用于轮廓、细节与底座。
const marks = {
  GL: {
    outline: 'M9 6H5v21h21v-4M10 5h17v17H10Z',
    detail: 'm13 18 4-5 4 3 3-4',
    accent: 'm15 8 2 2-2 2-2-2Z',
  },
  TF: {
    outline: 'M5 25V17l6-4v12m5 0V11l6-4v18',
    detail: 'M5 28h22',
    accent: 'm25 5 3-2v22h-3Z',
  },
  PV: {
    outline: 'M11 5h16v22H11ZM7 8v16M3 11v10',
    detail: 'm15 21 4-7 4 7M15 10h3',
    accent: 'M24 8h1v16h-1Z',
  },
  RT: {
    outline: 'M6 11a11 11 0 1 1 0 10M5 5v7h7M16 8v8l6 4',
    detail: 'M5 17h5m-7 4h7',
    accent: 'M15 15h2v2h-2Z',
  },
  AW: {
    outline: 'm16 7 9 5v10l-9 5-9-5V12ZM7 12l9 5 9-5M16 17v10',
    detail: 'M4 9V4h5m14 0h5v5M4 23v5h5m14 0h5v-5',
    accent: 'm16 7 9 5-9 5-9-5Z',
  },
  AX: {
    outline: 'M4 26 16 5l12 21ZM10 26l6-10 6 10',
    detail: 'M7 21h18M13 11h6',
    accent: 'm16 5 3 5h-6Z',
  },
  AI: {
    outline: 'M16 5c8 0 11 3 11 11s-3 11-11 11S5 24 5 16 8 5 16 5ZM8 8l16 16M24 8 8 24',
    detail: 'M16 5v5m11 6h-5m-6 11v-5M5 16h5',
    accent: 'm16 12 4 4-4 4-4-4Z',
  },
  AG: {
    outline: 'm8 4 4 4-4 4-4-4Zm16 16 4 4-4 4-4-4ZM8 12v8h12M12 8h8v12',
    detail: 'M8 16h8v8h4',
    accent: 'm20 12 4 4-4 4-4-4Z',
  },
  SA: {
    outline: 'M7 5h7v22H7ZM14 9h-3m3 5h-4m4 5h-3M20 27V13m5 14V5',
    detail: 'M18 9h4m1-8h4M20 13l-2 3m2-3 2 3',
    accent: 'M18 25h4v2h-4Zm5 0h4v2h-4Z',
  },
  BT: {
    outline: 'm5 11 11-6 11 6M7 13v13m6-13v13m6-13v13m6-13v13M4 27h24',
    detail: 'M5 11h22M10 8h12',
    accent: 'M15 16h2v10h-2Z',
  },
  IP: {
    outline: 'M27 16a11 11 0 1 1-11-11M16 5c-6 6-6 16 0 22M16 5c3 3 4.5 6.8 4.5 11M5 16h22',
    detail: 'M7 10h12M7 22h18M16 16v11',
    accent: 'm24 3 3 3-3 3-3-3Z',
  },
  OFF: {
    outline: 'M21 6a11 11 0 1 0 5 5M16 8v9l6 3',
    detail: 'M16 25v-2M7 16h2M10 8l1 2',
    accent: 'M24 4h4v4h-4Z',
  },
  HM: {
    outline: 'm18 5 9 9-9 9-4-4M14 27l-9-9 9-9 4 4M11 16l5 5 5-5-5-5Z',
    detail: 'm5 9 4-4m14 22 4-4',
    accent: 'm16 13 3 3-3 3-3-3Z',
  },
  ST: {
    outline: 'M24 16a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8 13c-4 .7-6 2-5.5 3.7 1 3.2 27 1.8 27-2.3 0-1.1-2-1.8-5.5-2',
    detail: 'M11 11c2-2 5-3 8-2',
    accent: 'M24 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0',
  },
  HD: {
    outline: 'M7 18 11 9l8-3 7 9-5 10-11-1ZM7 18l9-2 3-10M16 16l5 9m-5-9 10-1',
    detail: 'm11 9 5 7-6 8',
    accent: 'M9 9a2 2 0 1 0 4 0 2 2 0 1 0-4 0M14 16a2 2 0 1 0 4 0 2 2 0 1 0-4 0M24 15a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  },
  PX: {
    outline: 'M5 5h9v9H5Zm0 13h9v9H5Zm13 0h9v9h-9Z',
    detail: 'M18 5h4m5 5v4',
    accent: 'm24 3 5 5-5 5-5-5Z',
  },
  FM: {
    outline: 'm16 4 11 4v8c0 6-6 10-11 13C11 26 5 22 5 16V8ZM11 16l3 3 7-7',
    detail: 'm8 10 8-3 8 3',
    accent: 'm16 23 5-3-5 6-5-6Z',
  },
  AF: {
    outline: 'M15 6H5v21h19V17M9 12h5m-5 5h6m-6 5h10',
    detail: 'M24 3v10m-5-5h10',
    accent: 'm24 3 1.5 3.5L29 8l-3.5 1.5L24 13l-1.5-3.5L19 8l3.5-1.5Z',
  },
  TM: {
    outline: 'M25 5H5v22h22V12M10 11l5 5-5 5m8 0h5',
    detail: 'M5 8V5h3m16 22h3v-3',
    accent: 'M25 4h3v3h-3Z',
  },
  PT: {
    outline: 'M8 5h16v23l-8-5-8 5ZM16 10v9m0-5-4-3m4 7 4-3',
    detail: 'M5 8v20',
    accent: 'm16 7 3 3-3 3-3-3Z',
  },
  CODE_BLOG: {
    outline: 'M16 9C12 6 8 5 4 6v19c4-1 8 0 12 3 4-3 8-4 12-3V6c-4-1-8 0-12 3ZM16 9v19',
    detail: 'm10 12-3 3 3 3m10-6 3 3-3 3M7 22l6 1m6 0 6-1',
    accent: 'M21 5h3v7l-1.5-1-1.5 1Z',
  },
  ARCHIVE_BLOG: {
    outline: 'M8 4h12M8 4v24h17v-9M5 9h6m-6 6h6m-6 6h6m15-16 3 3-10 10-5 2 2-5Z',
    detail: 'M12 24h9m0-14 3 3',
    accent: 'm26 5 3 3-3 3-3-3Z',
  },
}

const mark = computed(() => marks[props.name] || marks.AW)
</script>

<template>
  <span class="card-icon" aria-hidden="true">
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" focusable="false">
      <path class="card-icon-detail" :d="mark.detail" />
      <path :d="mark.outline" />
      <path class="card-icon-accent" :d="mark.accent" stroke="none" />
    </svg>
  </span>
</template>

<style scoped>
.card-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid hsl(var(--mark-tone) / 0.36);
  border-radius: 12px;
  background:
    linear-gradient(
      145deg,
      hsl(var(--mark-tone) / 0.3),
      hsl(var(--mark-tone) / 0.07) 75%
    ),
    #0b1730;
  color: var(--mark-ink);
  box-shadow:
    inset 0 1px 0 #e0edff0d,
    0 3px 8px #01081824;
  transition:
    border-color 220ms,
    background-color 220ms;
}
.card-icon svg {
  display: block;
  width: 30px;
  height: 30px;
}
.card-icon-detail {
  color: var(--mark-accent);
  opacity: 0.8;
}
.card-icon-accent {
  fill: var(--mark-accent);
  fill-opacity: 0.85;
}
.project-card .card-icon {
  grid-area: icon;
}
:is(.project-card, .blog-grid > a):is(:hover, :focus-visible) .card-icon {
  border-color: hsl(var(--mark-tone) / 0.7);
  background-color: #162744;
}
</style>
