import { blogs, categories } from '@v3/data'

// 黄金角分散相邻色位的色相，深浅与饱和度分层，保持深色界面中的辨识度。
export const cardPalette = Array.from({ length: 256 }, (_, index) => {
  const hue = ((338 + index * 137.507764) % 360).toFixed(2)
  const saturation = 60 + (index % 4) * 5
  const lightness = 55 + (Math.floor(index / 4) % 3) * 4
  return {
    '--mark-tone': `${hue} ${saturation}% ${lightness}%`,
    '--mark-ink': `hsl(${hue} ${saturation}% 80%)`,
    '--mark-accent': `hsl(${hue} ${saturation}% 72%)`,
  }
})

const iconNames = [
  ...categories.flatMap(category => category.projects.map(project => project.icon)),
  ...blogs.map(blog => blog.icon),
]

export const cardColors = Object.fromEntries(
  [...new Set(iconNames)].map((icon, index) => [icon, cardPalette[index]]),
)
