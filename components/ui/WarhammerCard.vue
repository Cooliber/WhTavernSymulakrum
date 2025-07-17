<template>
  <article
    class="warhammer-card"
    :class="[
      sizeClasses,
      variantClasses,
      factionClasses,
      interactiveClasses,
      {
        'animate-medieval-entrance': animated && !prefersReducedMotion,
        'performance-optimized': optimized
      }
    ]"
    :style="customStyles"
    :tabindex="interactive ? 0 : undefined"
    :role="interactive ? 'button' : undefined"
    :aria-pressed="interactive && pressed ? 'true' : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Card Header -->
    <header v-if="$slots.header || title" class="warhammer-card-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <WarhammerIcon
            v-if="icon"
            :name="icon"
            :faction="faction"
            :size="iconSize"
            class="flex-shrink-0"
          />
          <div>
            <h3 v-if="title" class="warhammer-card-title">
              {{ title }}
            </h3>
            <p v-if="subtitle" class="warhammer-card-subtitle">
              {{ subtitle }}
            </p>
          </div>
        </div>
        
        <!-- Header Actions -->
        <div v-if="$slots.actions" class="flex items-center space-x-2">
          <slot name="actions" />
        </div>
      </div>
      
      <!-- Custom Header Content -->
      <slot name="header" />
    </header>
    
    <!-- Card Image -->
    <div v-if="image || $slots.image" class="warhammer-card-image">
      <OptimizedImage
        v-if="image"
        :src="image"
        :alt="imageAlt || title || 'Card image'"
        :width="imageWidth"
        :height="imageHeight"
        :loading="imageLoading"
        class="w-full h-full object-cover"
      />
      <slot name="image" />
    </div>
    
    <!-- Card Content -->
    <div v-if="$slots.default || content" class="warhammer-card-content">
      <p v-if="content" class="text-base leading-relaxed">
        {{ content }}
      </p>
      <slot />
    </div>
    
    <!-- Card Footer -->
    <footer v-if="$slots.footer" class="warhammer-card-footer">
      <slot name="footer" />
    </footer>
    
    <!-- Status Badge -->
    <div
      v-if="status"
      class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full"
      :class="statusClasses"
    >
      {{ status }}
    </div>
    
    <!-- Rarity Indicator -->
    <div
      v-if="rarity"
      class="absolute top-0 left-0 w-full h-1"
      :class="rarityClasses"
    ></div>
    
    <!-- Glow Effect for Special Cards -->
    <div
      v-if="glowing"
      class="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
      :class="glowClasses"
    ></div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  // Content
  title?: string
  subtitle?: string
  content?: string
  icon?: string
  
  // Image
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  imageLoading?: 'lazy' | 'eager'
  
  // Styling
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'parchment'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  
  // Warhammer-specific
  faction?: 'empire' | 'chaos' | 'dwarfs' | 'elves' | 'orcs' | 'undead'
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact'
  
  // Interactive
  interactive?: boolean
  pressed?: boolean
  
  // Visual effects
  animated?: boolean
  glowing?: boolean
  optimized?: boolean
  
  // Status
  status?: string
  statusColor?: 'success' | 'warning' | 'error' | 'info'
  
  // Custom styling
  customBackground?: string
  customBorder?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  imageLoading: 'lazy',
  animated: true,
  optimized: true
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  }
})

// Computed properties
const iconSize = computed(() => {
  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl'
  }
  return sizeMap[props.size] as 'sm' | 'md' | 'lg' | 'xl'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'p-3 space-y-2',
    md: 'p-4 space-y-3',
    lg: 'p-6 space-y-4',
    xl: 'p-8 space-y-6'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-wh-parchment border border-wh-aged-paper shadow-md',
    elevated: 'bg-wh-parchment border border-wh-aged-paper shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-wh-empire-gold',
    filled: 'bg-wh-dark-wood text-wh-bone border border-wh-copper',
    parchment: 'bg-wh-aged-paper border-2 border-wh-wood-brown tavern-wood-texture'
  }
  return variants[props.variant]
})

const factionClasses = computed(() => {
  if (!props.faction) return ''
  
  const factions = {
    empire: 'border-l-4 border-l-blue-500',
    chaos: 'border-l-4 border-l-red-500',
    dwarfs: 'border-l-4 border-l-orange-500',
    elves: 'border-l-4 border-l-green-500',
    orcs: 'border-l-4 border-l-green-800',
    undead: 'border-l-4 border-l-purple-500'
  }
  return factions[props.faction]
})

const interactiveClasses = computed(() => {
  if (!props.interactive) return ''
  
  return 'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
})

const statusClasses = computed(() => {
  const colors = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  return colors[props.statusColor || 'info']
})

const rarityClasses = computed(() => {
  if (!props.rarity) return ''
  
  const rarities = {
    common: 'bg-gray-400',
    uncommon: 'bg-green-400',
    rare: 'bg-blue-400',
    epic: 'bg-purple-400',
    legendary: 'bg-orange-400',
    artifact: 'bg-red-400'
  }
  return rarities[props.rarity]
})

const glowClasses = computed(() => {
  if (!props.glowing) return ''
  
  if (props.rarity === 'legendary') {
    return 'bg-gradient-to-r from-orange-400 to-yellow-400 animate-pulse'
  }
  if (props.rarity === 'artifact') {
    return 'bg-gradient-to-r from-red-400 to-pink-400 animate-pulse'
  }
  return 'bg-gradient-to-r from-yellow-400 to-yellow-300 animate-pulse'
})

const customStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.customBackground) {
    styles.backgroundColor = props.customBackground
  }
  
  if (props.customBorder) {
    styles.borderColor = props.customBorder
  }
  
  return styles
})

// Methods
const handleClick = (event: MouseEvent) => {
  if (props.interactive) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.interactive && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    handleClick(event as unknown as MouseEvent)
  }
}
</script>

<style scoped>
.warhammer-card {
  position: relative;
  border-radius: 0.5rem;
  font-family: var(--wh-font-body);
  overflow: hidden;
  background-clip: padding-box;
}

.warhammer-card-header {
  border-bottom: 1px solid rgba(139, 69, 19, 0.2);
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

.warhammer-card-title {
  font-family: var(--wh-font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--wh-dark-wood);
  margin: 0;
}

.warhammer-card-subtitle {
  font-size: 0.875rem;
  color: var(--wh-wood-brown);
  margin: 0.25rem 0 0 0;
}

.warhammer-card-content {
  color: var(--wh-dark-wood);
  line-height: 1.6;
}

.warhammer-card-image {
  margin: -1rem -1rem 1rem -1rem;
  overflow: hidden;
}

.warhammer-card-footer {
  border-top: 1px solid rgba(139, 69, 19, 0.2);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .warhammer-card {
    border: 2px solid var(--wh-bone);
    background: var(--wh-black);
    color: var(--wh-bone);
  }
  
  .warhammer-card-title {
    color: var(--wh-bone);
  }
  
  .warhammer-card-subtitle,
  .warhammer-card-content {
    color: var(--wh-light-grey);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .warhammer-card {
    animation: none !important;
    transition: none !important;
  }
  
  .warhammer-card:hover {
    transform: none !important;
  }
}

/* Print styles */
@media print {
  .warhammer-card {
    background: white !important;
    color: black !important;
    border: 1px solid black !important;
    box-shadow: none !important;
  }
  
  .warhammer-card-title {
    color: black !important;
  }
}
</style>
