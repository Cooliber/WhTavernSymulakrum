<template>
  <span
    class="warhammer-badge inline-flex items-center font-medium"
    :class="[
      sizeClasses,
      variantClasses,
      colorClasses,
      factionClasses,
      {
        'animate-pulse': animated && !prefersReducedMotion,
        'cursor-pointer': interactive
      }
    ]"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Leading Icon -->
    <WarhammerIcon
      v-if="iconLeft"
      :name="iconLeft"
      :size="iconSize"
      class="mr-1"
      aria-hidden="true"
    />
    
    <!-- Badge Content -->
    <span class="badge-content">
      <slot>{{ label }}</slot>
    </span>
    
    <!-- Trailing Icon -->
    <WarhammerIcon
      v-if="iconRight"
      :name="iconRight"
      :size="iconSize"
      class="ml-1"
      aria-hidden="true"
    />
    
    <!-- Close Button -->
    <button
      v-if="closable"
      class="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current"
      @click.stop="$emit('close')"
      :aria-label="closeLabel"
    >
      <WarhammerIcon name="x" :size="iconSize" />
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  // Content
  label?: string
  
  // Styling
  variant?: 'solid' | 'soft' | 'outline' | 'ghost'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray' | 'yellow' | 'red' | 'green' | 'blue' | string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  
  // Warhammer-specific
  faction?: 'empire' | 'chaos' | 'dwarfs' | 'elves' | 'orcs' | 'undead'
  
  // Icons
  iconLeft?: string
  iconRight?: string
  
  // Interactive
  interactive?: boolean
  closable?: boolean
  closeLabel?: string
  
  // Visual effects
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  color: 'primary',
  size: 'sm',
  closeLabel: 'Remove',
  animated: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  close: []
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
    sm: 'xs',
    md: 'sm',
    lg: 'sm'
  }
  return sizeMap[props.size] as 'xs' | 'sm'
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs rounded',
    sm: 'px-2 py-1 text-xs rounded-md',
    md: 'px-2.5 py-1.5 text-sm rounded-md',
    lg: 'px-3 py-2 text-sm rounded-lg'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    solid: '',
    soft: 'bg-opacity-20',
    outline: 'border bg-transparent',
    ghost: 'bg-transparent hover:bg-opacity-10'
  }
  return variants[props.variant]
})

const colorClasses = computed(() => {
  const colors = {
    primary: getColorVariant('#DAA520', '#B8860B'), // Gold
    secondary: getColorVariant('#8B4513', '#A0522D'), // Brown
    success: getColorVariant('#22C55E', '#16A34A'), // Green
    warning: getColorVariant('#F59E0B', '#D97706'), // Amber
    error: getColorVariant('#EF4444', '#DC2626'), // Red
    info: getColorVariant('#3B82F6', '#2563EB'), // Blue
    gray: getColorVariant('#6B7280', '#4B5563'), // Gray
    yellow: getColorVariant('#EAB308', '#CA8A04'), // Yellow
    red: getColorVariant('#EF4444', '#DC2626'), // Red
    green: getColorVariant('#22C55E', '#16A34A'), // Green
    blue: getColorVariant('#3B82F6', '#2563EB') // Blue
  }
  return colors[props.color]
})

const factionClasses = computed(() => {
  if (!props.faction) return ''
  
  const factions = {
    empire: 'ring-1 ring-blue-400',
    chaos: 'ring-1 ring-red-400',
    dwarfs: 'ring-1 ring-orange-400',
    elves: 'ring-1 ring-green-400',
    orcs: 'ring-1 ring-green-700',
    undead: 'ring-1 ring-purple-400'
  }
  return factions[props.faction]
})

// Helper function to generate color variants
function getColorVariant(primary: string, secondary: string) {
  if (props.variant === 'solid') {
    return `bg-[${primary}] text-white`
  } else if (props.variant === 'soft') {
    return `bg-[${primary}] text-[${secondary}]`
  } else if (props.variant === 'outline') {
    return `border-[${primary}] text-[${primary}]`
  } else {
    return `text-[${primary}] hover:bg-[${primary}]`
  }
}

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
.warhammer-badge {
  font-family: var(--wh-font-body);
  white-space: nowrap;
  vertical-align: middle;
}

.badge-content {
  line-height: 1;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .warhammer-badge {
    border: 1px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .warhammer-badge {
    animation: none !important;
    transition: none !important;
  }
}
</style>
