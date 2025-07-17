<template>
  <div 
    class="warhammer-loader"
    :class="[sizeClass, positionClass]"
    role="status"
    :aria-label="ariaLabel"
  >
    <!-- Background Overlay -->
    <div v-if="overlay" class="loader-overlay"></div>

    <!-- Loader Content -->
    <div class="loader-content">
      <!-- Main Spinner -->
      <div class="loader-spinner" :class="spinnerSizeClass">
        <!-- Outer Ring -->
        <div class="spinner-ring outer-ring">
          <div class="ring-segment" v-for="i in 8" :key="`outer-${i}`"></div>
        </div>
        
        <!-- Inner Ring -->
        <div class="spinner-ring inner-ring">
          <div class="ring-segment" v-for="i in 6" :key="`inner-${i}`"></div>
        </div>

        <!-- Center Icon -->
        <div class="spinner-center">
          <Icon :name="getIcon(type)" class="spinner-icon" />
        </div>
      </div>

      <!-- Loading Text -->
      <div v-if="showText" class="loader-text">
        <h3 v-if="title" class="loader-title">{{ title }}</h3>
        <p class="loader-message">{{ message }}</p>
        
        <!-- Progress Bar -->
        <div v-if="showProgress && progress !== undefined" class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ Math.round(progress) }}%</span>
        </div>

        <!-- Animated Dots -->
        <div v-if="showDots" class="loading-dots">
          <span class="dot" v-for="i in 3" :key="i"></span>
        </div>
      </div>

      <!-- Cancel Button -->
      <WarhammerButton
        v-if="cancellable"
        variant="ghost"
        size="sm"
        class="mt-4"
        @click="$emit('cancel')"
      >
        {{ cancelText }}
      </WarhammerButton>
    </div>

    <!-- Decorative Elements -->
    <div v-if="decorative" class="loader-decorations">
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="decoration decoration-3"></div>
      <div class="decoration decoration-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'default' | 'quest' | 'battle' | 'magic' | 'travel' | 'craft'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'center' | 'inline'
  title?: string
  message?: string
  progress?: number
  showProgress?: boolean
  showText?: boolean
  showDots?: boolean
  overlay?: boolean
  decorative?: boolean
  cancellable?: boolean
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'md',
  position: 'center',
  message: 'Loading...',
  showProgress: false,
  showText: true,
  showDots: true,
  overlay: true,
  decorative: true,
  cancellable: false,
  cancelText: 'Cancel'
})

const emit = defineEmits<{
  cancel: []
}>()

// Computed properties
const sizeClass = computed(() => {
  const sizes = {
    sm: 'loader-sm',
    md: 'loader-md',
    lg: 'loader-lg',
    xl: 'loader-xl'
  }
  return sizes[props.size]
})

const positionClass = computed(() => {
  const positions = {
    center: 'loader-center',
    inline: 'loader-inline'
  }
  return positions[props.position]
})

const spinnerSizeClass = computed(() => {
  const sizes = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
    xl: 'spinner-xl'
  }
  return sizes[props.size]
})

const ariaLabel = computed(() => {
  if (props.progress !== undefined) {
    return `${props.message} ${Math.round(props.progress)}% complete`
  }
  return props.message
})

// Methods
const getIcon = (type: string): string => {
  const icons = {
    default: 'loader',
    quest: 'scroll',
    battle: 'sword',
    magic: 'sparkles',
    travel: 'map',
    craft: 'hammer'
  }
  return icons[type as keyof typeof icons] || icons.default
}
</script>

<style scoped>
.warhammer-loader {
  @apply relative;
  font-family: var(--wh-font-body);
}

.loader-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm z-50;
}

.loader-content {
  @apply relative z-10 flex flex-col items-center justify-center text-center;
}

/* Position variants */
.loader-center {
  @apply fixed inset-0 flex items-center justify-center z-50;
}

.loader-inline {
  @apply flex items-center justify-center p-8;
}

/* Size variants */
.loader-sm .loader-content {
  @apply space-y-2;
}

.loader-md .loader-content {
  @apply space-y-4;
}

.loader-lg .loader-content {
  @apply space-y-6;
}

.loader-xl .loader-content {
  @apply space-y-8;
}

/* Spinner */
.loader-spinner {
  @apply relative;
}

.spinner-sm {
  @apply w-12 h-12;
}

.spinner-md {
  @apply w-16 h-16;
}

.spinner-lg {
  @apply w-24 h-24;
}

.spinner-xl {
  @apply w-32 h-32;
}

.spinner-ring {
  @apply absolute inset-0 rounded-full;
}

.outer-ring {
  @apply border-4 border-yellow-500/20;
  animation: spin-clockwise 3s linear infinite;
}

.inner-ring {
  @apply border-2 border-amber-700/30;
  animation: spin-counter-clockwise 2s linear infinite;
}

.ring-segment {
  @apply absolute w-2 h-2 bg-yellow-500 rounded-full;
  animation: pulse-segment 1.5s ease-in-out infinite;
}

.outer-ring .ring-segment:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); animation-delay: 0s; }
.outer-ring .ring-segment:nth-child(2) { top: 15%; right: 15%; animation-delay: 0.2s; }
.outer-ring .ring-segment:nth-child(3) { top: 50%; right: 0; transform: translateY(-50%); animation-delay: 0.4s; }
.outer-ring .ring-segment:nth-child(4) { bottom: 15%; right: 15%; animation-delay: 0.6s; }
.outer-ring .ring-segment:nth-child(5) { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: 0.8s; }
.outer-ring .ring-segment:nth-child(6) { bottom: 15%; left: 15%; animation-delay: 1s; }
.outer-ring .ring-segment:nth-child(7) { top: 50%; left: 0; transform: translateY(-50%); animation-delay: 1.2s; }
.outer-ring .ring-segment:nth-child(8) { top: 15%; left: 15%; animation-delay: 1.4s; }

.inner-ring .ring-segment {
  @apply bg-amber-700;
}

.inner-ring .ring-segment:nth-child(1) { top: 20%; left: 50%; transform: translateX(-50%); animation-delay: 0.1s; }
.inner-ring .ring-segment:nth-child(2) { top: 50%; right: 20%; transform: translateY(-50%); animation-delay: 0.3s; }
.inner-ring .ring-segment:nth-child(3) { bottom: 20%; left: 50%; transform: translateX(-50%); animation-delay: 0.5s; }
.inner-ring .ring-segment:nth-child(4) { top: 50%; left: 20%; transform: translateY(-50%); animation-delay: 0.7s; }
.inner-ring .ring-segment:nth-child(5) { top: 30%; right: 30%; animation-delay: 0.9s; }
.inner-ring .ring-segment:nth-child(6) { bottom: 30%; left: 30%; animation-delay: 1.1s; }

.spinner-center {
  @apply absolute inset-0 flex items-center justify-center;
}

.spinner-icon {
  @apply text-yellow-500;
  animation: icon-pulse 2s ease-in-out infinite;
}

.spinner-sm .spinner-icon {
  @apply w-4 h-4;
}

.spinner-md .spinner-icon {
  @apply w-6 h-6;
}

.spinner-lg .spinner-icon {
  @apply w-8 h-8;
}

.spinner-xl .spinner-icon {
  @apply w-12 h-12;
}

/* Text */
.loader-text {
  @apply text-amber-900;
}

.loader-title {
  @apply text-lg font-semibold mb-2;
}

.loader-sm .loader-title {
  @apply text-base;
}

.loader-lg .loader-title {
  @apply text-xl;
}

.loader-xl .loader-title {
  @apply text-2xl;
}

.loader-message {
  @apply text-sm text-amber-700;
}

.loader-lg .loader-message {
  @apply text-base;
}

.loader-xl .loader-message {
  @apply text-lg;
}

/* Progress Bar */
.progress-container {
  @apply flex items-center space-x-3 mt-3;
}

.progress-bar {
  @apply flex-1 h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-700/20;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-yellow-500 to-amber-700 transition-all duration-300 ease-out;
}

.progress-text {
  @apply text-xs font-medium text-amber-700 min-w-[3rem] text-right;
}

/* Loading Dots */
.loading-dots {
  @apply flex space-x-1 mt-2;
}

.dot {
  @apply w-2 h-2 bg-yellow-500 rounded-full;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

/* Decorative Elements */
.loader-decorations {
  @apply absolute inset-0 pointer-events-none;
}

.decoration {
  @apply absolute w-1 h-1 bg-wh-empire-gold/30 rounded-full;
  animation: float 4s ease-in-out infinite;
}

.decoration-1 {
  @apply top-1/4 left-1/4;
  animation-delay: 0s;
}

.decoration-2 {
  @apply top-1/4 right-1/4;
  animation-delay: 1s;
}

.decoration-3 {
  @apply bottom-1/4 left-1/4;
  animation-delay: 2s;
}

.decoration-4 {
  @apply bottom-1/4 right-1/4;
  animation-delay: 3s;
}

/* Animations */
@keyframes spin-clockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-counter-clockwise {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes pulse-segment {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes icon-pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  25% { transform: translateY(-10px) rotate(90deg); opacity: 0.7; }
  50% { transform: translateY(-5px) rotate(180deg); opacity: 1; }
  75% { transform: translateY(-15px) rotate(270deg); opacity: 0.7; }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .outer-ring,
  .inner-ring,
  .ring-segment,
  .spinner-icon,
  .dot,
  .decoration {
    animation: none !important;
  }
  
  .progress-fill {
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .loader-overlay {
    @apply bg-black/80;
  }
  
  .outer-ring {
    @apply border-yellow-400;
  }
  
  .inner-ring {
    @apply border-yellow-600;
  }
  
  .ring-segment {
    @apply bg-yellow-400;
  }
  
  .progress-bar {
    @apply border-2 border-yellow-600;
  }
}
</style>