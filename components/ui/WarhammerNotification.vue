<template>
  <Transition
    name="notification"
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-x-full opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform translate-x-full opacity-0"
  >
    <div
      v-if="visible"
      class="warhammer-notification"
      :class="[
        getTypeClass(type),
        sizeClass,
        positionClass
      ]"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- Background Effects -->
      <div class="notification-bg"></div>
      <BorderBeam v-if="type === 'success'" class="notification-border" />
      
      <!-- Content -->
      <div class="notification-content">
        <!-- Icon -->
        <div class="notification-icon">
          <Icon :name="getIcon(type)" :class="getIconClass(type)" />
        </div>

        <!-- Text Content -->
        <div class="notification-text">
          <h4 v-if="title" class="notification-title">
            {{ title }}
          </h4>
          <p class="notification-message">
            {{ message }}
          </p>
          
          <!-- Action Button -->
          <div v-if="action" class="notification-action mt-2">
            <UButton
              :variant="getActionVariant(type)"
              size="xs"
              @click="handleAction"
            >
              {{ action.label }}
            </UButton>
          </div>
        </div>

        <!-- Close Button -->
        <button
          v-if="closable"
          class="notification-close"
          @click="close"
          :aria-label="$t('common.close')"
        >
          <Icon name="x" class="w-4 h-4" />
        </button>
      </div>

      <!-- Progress Bar for Auto-dismiss -->
      <div
        v-if="autoClose && duration > 0"
        class="notification-progress"
        :style="{ animationDuration: `${duration}ms` }"
      ></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface NotificationAction {
  label: string
  handler: () => void
}

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info' | 'quest' | 'battle' | 'lore'
  title?: string
  message: string
  duration?: number
  autoClose?: boolean
  closable?: boolean
  size?: 'sm' | 'md' | 'lg'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  action?: NotificationAction
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000,
  autoClose: true,
  closable: true,
  size: 'md',
  position: 'top-right',
  persistent: false
})

const emit = defineEmits<{
  close: []
  action: []
}>()

// State
const visible = ref(true)
let autoCloseTimer: NodeJS.Timeout | null = null

// Computed
const sizeClass = computed(() => {
  const sizes = {
    sm: 'notification-sm',
    md: 'notification-md',
    lg: 'notification-lg'
  }
  return sizes[props.size]
})

const positionClass = computed(() => {
  const positions = {
    'top-right': 'notification-top-right',
    'top-left': 'notification-top-left',
    'bottom-right': 'notification-bottom-right',
    'bottom-left': 'notification-bottom-left',
    'center': 'notification-center'
  }
  return positions[props.position]
})

// Methods
const getTypeClass = (type: string): string => {
  const classes = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info',
    quest: 'notification-quest',
    battle: 'notification-battle',
    lore: 'notification-lore'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIcon = (type: string): string => {
  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info',
    quest: 'scroll',
    battle: 'sword',
    lore: 'book-open'
  }
  return icons[type as keyof typeof icons] || icons.info
}

const getIconClass = (type: string): string => {
  const classes = {
    success: 'w-5 h-5 text-green-600',
    error: 'w-5 h-5 text-red-600',
    warning: 'w-5 h-5 text-yellow-600',
    info: 'w-5 h-5 text-blue-600',
    quest: 'w-5 h-5 text-purple-600',
    battle: 'w-5 h-5 text-red-700',
    lore: 'w-5 h-5 text-indigo-600'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getActionVariant = (type: string): string => {
  const variants = {
    success: 'solid',
    error: 'solid',
    warning: 'outline',
    info: 'outline',
    quest: 'solid',
    battle: 'solid',
    lore: 'outline'
  }
  return variants[type as keyof typeof variants] || 'outline'
}

const close = () => {
  visible.value = false
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
  
  // Delay emit to allow transition
  setTimeout(() => {
    emit('close')
  }, 300)
}

const handleAction = () => {
  if (props.action) {
    props.action.handler()
    emit('action')
  }
}

const startAutoClose = () => {
  if (props.autoClose && props.duration > 0 && !props.persistent) {
    autoCloseTimer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// Lifecycle
onMounted(() => {
  startAutoClose()
})

onUnmounted(() => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
})

// Pause auto-close on hover
const pauseAutoClose = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
}

const resumeAutoClose = () => {
  startAutoClose()
}
</script>

<style scoped>
.warhammer-notification {
  @apply relative max-w-sm w-full bg-wh-parchment border-2 border-wh-wood-brown rounded-lg shadow-xl overflow-hidden;
  font-family: var(--wh-font-body);
}

.notification-bg {
  @apply absolute inset-0 opacity-10;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 69, 19, 0.1) 0%, transparent 50%);
}

.notification-border {
  @apply absolute inset-0 pointer-events-none;
}

.notification-content {
  @apply relative flex items-start space-x-3 p-4;
}

.notification-icon {
  @apply flex-shrink-0 mt-0.5;
}

.notification-text {
  @apply flex-1 min-w-0;
}

.notification-title {
  @apply text-sm font-wh-heading font-semibold text-wh-dark-wood mb-1;
}

.notification-message {
  @apply text-sm text-wh-wood-brown leading-relaxed;
}

.notification-close {
  @apply flex-shrink-0 ml-4 p-1 rounded-md text-wh-wood-brown hover:text-wh-dark-wood hover:bg-wh-aged-paper transition-colors duration-200;
}

.notification-action {
  @apply mt-2;
}

.notification-progress {
  @apply absolute bottom-0 left-0 h-1 bg-gradient-to-r from-wh-empire-gold to-wh-wood-brown;
  animation: progress-bar linear forwards;
  width: 100%;
}

/* Size variants */
.notification-sm {
  @apply max-w-xs;
}

.notification-sm .notification-content {
  @apply p-3;
}

.notification-sm .notification-title {
  @apply text-xs;
}

.notification-sm .notification-message {
  @apply text-xs;
}

.notification-md {
  @apply max-w-sm;
}

.notification-lg {
  @apply max-w-md;
}

.notification-lg .notification-content {
  @apply p-5;
}

/* Type variants */
.notification-success {
  @apply border-green-300 bg-green-50;
}

.notification-error {
  @apply border-red-300 bg-red-50;
}

.notification-warning {
  @apply border-yellow-300 bg-yellow-50;
}

.notification-info {
  @apply border-blue-300 bg-blue-50;
}

.notification-quest {
  @apply border-purple-300 bg-purple-50;
}

.notification-battle {
  @apply border-red-400 bg-red-100;
}

.notification-lore {
  @apply border-indigo-300 bg-indigo-50;
}

/* Position variants */
.notification-top-right {
  @apply fixed top-4 right-4 z-50;
}

.notification-top-left {
  @apply fixed top-4 left-4 z-50;
}

.notification-bottom-right {
  @apply fixed bottom-4 right-4 z-50;
}

.notification-bottom-left {
  @apply fixed bottom-4 left-4 z-50;
}

.notification-center {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50;
}

/* Animations */
@keyframes progress-bar {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Hover effects */
.warhammer-notification:hover .notification-progress {
  animation-play-state: paused;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .notification-progress {
    animation: none !important;
  }
  
  .notification-enter-active,
  .notification-leave-active {
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .warhammer-notification {
    @apply border-4;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notification-success {
    @apply bg-green-900 border-green-600;
  }
  
  .notification-error {
    @apply bg-red-900 border-red-600;
  }
  
  .notification-warning {
    @apply bg-yellow-900 border-yellow-600;
  }
  
  .notification-info {
    @apply bg-blue-900 border-blue-600;
  }
  
  .notification-quest {
    @apply bg-purple-900 border-purple-600;
  }
  
  .notification-battle {
    @apply bg-red-900 border-red-500;
  }
  
  .notification-lore {
    @apply bg-indigo-900 border-indigo-600;
  }
}
</style>