<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'NuxtLink' ? to : undefined"
    :disabled="disabled"
    :aria-pressed="pressed"
    :aria-expanded="expanded"
    :aria-describedby="ariaDescribedBy"
    class="warhammer-button tavern-button"
    :class="[
      sizeClasses,
      variantClasses,
      factionClasses,
      stateClasses,
      {
        'wh-focus-ring': !disabled,
        'cursor-not-allowed opacity-60': disabled,
        'animate-pulse': loading && !prefersReducedMotion
      }
    ]"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Loading Spinner -->
    <WarhammerIcon
      v-if="loading"
      name="loading"
      :size="iconSize"
      class="animate-spin mr-2"
      aria-hidden="true"
    />
    
    <!-- Leading Icon -->
    <WarhammerIcon
      v-else-if="iconLeft"
      :name="iconLeft"
      :size="iconSize"
      :faction="faction"
      class="mr-2"
      aria-hidden="true"
    />
    
    <!-- Button Content -->
    <span class="button-content">
      <slot />
    </span>
    
    <!-- Trailing Icon -->
    <WarhammerIcon
      v-if="iconRight && !loading"
      :name="iconRight"
      :size="iconSize"
      :faction="faction"
      class="ml-2"
      aria-hidden="true"
    />
    
    <!-- Badge -->
    <span
      v-if="badge && !loading"
      class="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
      :class="badgeClasses"
      aria-hidden="true"
    >
      {{ badge }}
    </span>
  </component>
</template>

<script setup lang="ts">
interface Props {
  // Core button props
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  // Warhammer-specific
  faction?: 'empire' | 'chaos' | 'dwarfs' | 'elves' | 'orcs' | 'undead'
  
  // Navigation
  tag?: 'button' | 'a' | 'NuxtLink'
  type?: 'button' | 'submit' | 'reset'
  href?: string
  to?: string | object
  
  // Icons
  iconLeft?: string
  iconRight?: string
  
  // States
  disabled?: boolean
  loading?: boolean
  pressed?: boolean
  expanded?: boolean
  
  // Visual
  badge?: string | number
  badgeColor?: string
  
  // Accessibility
  ariaDescribedBy?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
  type: 'button',
  disabled: false,
  loading: false
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
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg'
  }
  return sizeMap[props.size] as 'xs' | 'sm' | 'md' | 'lg'
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-1 text-xs min-h-[32px]',
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[52px]'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold border-2 border-yellow-400 hover:from-yellow-500 hover:to-yellow-400 active:from-yellow-700 active:to-yellow-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-500 text-white font-medium border-2 border-gray-400 hover:from-gray-500 hover:to-gray-400 active:from-gray-700 active:to-gray-600 shadow-md hover:shadow-lg',
    outline: 'bg-transparent text-yellow-400 font-medium border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black active:bg-yellow-500',
    ghost: 'bg-transparent text-yellow-400 font-medium hover:bg-yellow-400/10 active:bg-yellow-400/20',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold border-2 border-red-400 hover:from-red-500 hover:to-red-400 active:from-red-700 active:to-red-600 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold border-2 border-green-400 hover:from-green-500 hover:to-green-400 active:from-green-700 active:to-green-600 shadow-lg hover:shadow-xl'
  }
  return variants[props.variant]
})

const factionClasses = computed(() => {
  if (!props.faction) return ''
  
  const factions = {
    empire: 'empire-banner border-blue-400 text-blue-900',
    chaos: 'chaos-banner border-red-400 text-red-100',
    dwarfs: 'bg-gradient-to-r from-orange-600 to-orange-500 border-orange-400 text-orange-100',
    elves: 'elves-banner border-green-400 text-green-100',
    orcs: 'bg-gradient-to-r from-green-800 to-green-700 border-green-600 text-green-100',
    undead: 'bg-gradient-to-r from-purple-800 to-purple-700 border-purple-600 text-purple-100'
  }
  return factions[props.faction]
})

const stateClasses = computed(() => {
  const classes = []
  
  if (props.pressed) {
    classes.push('shadow-inner transform scale-95')
  }
  
  if (!props.disabled && !props.loading) {
    classes.push('transition-all duration-200 transform hover:scale-105 active:scale-95')
  }
  
  return classes.join(' ')
})

const badgeClasses = computed(() => {
  if (props.badgeColor) {
    return `bg-${props.badgeColor}-500`
  }
  return 'bg-red-500'
})

// Methods
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Enter and Space for accessibility
  if ((event.key === 'Enter' || event.key === ' ') && props.tag !== 'button') {
    event.preventDefault()
    handleClick(event as unknown as MouseEvent)
  }
}
</script>

<style scoped>
.warhammer-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-family: var(--wh-font-heading);
  text-decoration: none;
  outline: none;
  overflow: hidden;
}

/* Enhanced focus styles for accessibility */
.warhammer-button:focus-visible {
  outline: 2px solid var(--wh-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.2);
}

/* Disabled state */
.warhammer-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none !important;
}

/* Loading state */
.warhammer-button[aria-busy="true"] {
  cursor: wait;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .warhammer-button {
    border-width: 2px;
    border-style: solid;
  }
  
  .warhammer-button.variant-primary {
    background: var(--wh-empire-gold);
    color: var(--wh-black);
    border-color: var(--wh-black);
  }
  
  .warhammer-button.variant-secondary {
    background: var(--wh-grey);
    color: var(--wh-bone);
    border-color: var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .warhammer-button {
    transition: none !important;
    animation: none !important;
  }
  
  .warhammer-button:hover {
    transform: none !important;
  }
}

/* Touch device optimizations */
@media (pointer: coarse) {
  .warhammer-button {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Print styles */
@media print {
  .warhammer-button {
    background: white !important;
    color: black !important;
    border: 1px solid black !important;
    box-shadow: none !important;
  }
}
</style>
