<template>
  <div class="live-stats-widget" :class="[sizeClass, themeClass]">
    <!-- Header -->
    <div class="widget-header">
      <div class="flex items-center space-x-2">
        <Icon :name="icon" class="w-5 h-5 text-wh-empire-gold" />
        <h3 class="widget-title">{{ title }}</h3>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Live Indicator -->
        <div class="live-indicator">
          <div class="live-dot"></div>
          <span class="live-text">LIVE</span>
        </div>
        
        <!-- Refresh Button -->
        <button
          v-if="refreshable"
          class="refresh-btn"
          @click="refresh"
          :disabled="isRefreshing"
          :aria-label="$t('common.refresh')"
        >
          <Icon 
            name="refresh-cw" 
            class="w-4 h-4"
            :class="{ 'animate-spin': isRefreshing }"
          />
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid" :class="gridClass">
      <div
        v-for="stat in stats"
        :key="stat.id"
        class="stat-card"
        :class="getStatCardClass(stat)"
      >
        <!-- Stat Icon -->
        <div class="stat-icon">
          <Icon :name="stat.icon" class="w-6 h-6" />
        </div>

        <!-- Stat Content -->
        <div class="stat-content">
          <div class="stat-value">
            <NumberTicker
              :value="stat.value"
              :format="stat.format"
              :duration="animationDuration"
            />
            <span v-if="stat.unit" class="stat-unit">{{ stat.unit }}</span>
          </div>
          
          <div class="stat-label">{{ stat.label }}</div>
          
          <!-- Trend Indicator -->
          <div v-if="stat.trend" class="stat-trend" :class="getTrendClass(stat.trend)">
            <Icon :name="getTrendIcon(stat.trend)" class="w-3 h-3" />
            <span class="trend-value">{{ Math.abs(stat.trend) }}%</span>
          </div>
        </div>

        <!-- Sparkline -->
        <div v-if="stat.sparkline && stat.sparkline.length > 0" class="stat-sparkline">
          <svg class="sparkline-svg" viewBox="0 0 100 20">
            <polyline
              :points="generateSparklinePoints(stat.sparkline)"
              class="sparkline-line"
              :class="getSparklineClass(stat.trend)"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="showFooter" class="widget-footer">
      <div class="footer-info">
        <Icon name="clock" class="w-3 h-3 text-wh-wood-brown" />
        <span class="last-update">
          {{ $t('common.lastUpdate') }}: {{ formatTime(lastUpdate) }}
        </span>
      </div>
      
      <div v-if="showDetails" class="footer-actions">
        <WarhammerButton
          variant="ghost"
          size="xs"
          @click="$emit('view-details')"
        >
          {{ $t('common.viewDetails') }}
        </WarhammerButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatItem {
  id: string
  label: string
  value: number
  unit?: string
  icon: string
  format?: 'number' | 'currency' | 'percentage' | 'time'
  trend?: number // Percentage change
  sparkline?: number[]
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface Props {
  title: string
  icon: string
  stats: StatItem[]
  size?: 'sm' | 'md' | 'lg'
  theme?: 'default' | 'dark' | 'glass'
  columns?: 1 | 2 | 3 | 4
  refreshable?: boolean
  showFooter?: boolean
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  theme: 'default',
  columns: 2,
  refreshable: true,
  showFooter: true,
  showDetails: false,
  autoRefresh: true,
  refreshInterval: 30000
})

const emit = defineEmits<{
  refresh: []
  'view-details': []
}>()

// State
const isRefreshing = ref(false)
const lastUpdate = ref(new Date())

// Computed
const sizeClass = computed(() => {
  const sizes = {
    sm: 'widget-sm',
    md: 'widget-md',
    lg: 'widget-lg'
  }
  return sizes[props.size]
})

const themeClass = computed(() => {
  const themes = {
    default: 'widget-default',
    dark: 'widget-dark',
    glass: 'widget-glass'
  }
  return themes[props.theme]
})

const gridClass = computed(() => {
  const grids = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  return grids[props.columns]
})

const animationDuration = computed(() => {
  return props.size === 'sm' ? 500 : props.size === 'lg' ? 1500 : 1000
})

// Methods
const refresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    emit('refresh')
    lastUpdate.value = new Date()
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

const getStatCardClass = (stat: StatItem): string => {
  const typeClasses = {
    primary: 'stat-primary',
    success: 'stat-success',
    warning: 'stat-warning',
    danger: 'stat-danger',
    info: 'stat-info'
  }
  return typeClasses[stat.type || 'primary']
}

const getTrendClass = (trend: number): string => {
  if (trend > 0) return 'trend-up'
  if (trend < 0) return 'trend-down'
  return 'trend-neutral'
}

const getTrendIcon = (trend: number): string => {
  if (trend > 0) return 'trending-up'
  if (trend < 0) return 'trending-down'
  return 'minus'
}

const getSparklineClass = (trend?: number): string => {
  if (!trend) return 'sparkline-neutral'
  if (trend > 0) return 'sparkline-up'
  return 'sparkline-down'
}

const generateSparklinePoints = (data: number[]): string => {
  if (data.length < 2) return ''
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 20 - ((value - min) / range) * 20
      return `${x},${y}`
    })
    .join(' ')
}

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

// Auto-refresh
let refreshTimer: NodeJS.Timeout | null = null

const startAutoRefresh = () => {
  if (props.autoRefresh && !refreshTimer) {
    refreshTimer = setInterval(refresh, props.refreshInterval)
  }
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Lifecycle
onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// Watch for prop changes
watch(() => props.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})
</script>

<style scoped>
.live-stats-widget {
  @apply bg-wh-parchment border-2 border-wh-wood-brown rounded-lg overflow-hidden;
  font-family: var(--wh-font-body);
}

/* Size variants */
.widget-sm {
  @apply text-sm;
}

.widget-md {
  @apply text-base;
}

.widget-lg {
  @apply text-lg;
}

/* Theme variants */
.widget-default {
  @apply bg-wh-parchment border-wh-wood-brown;
}

.widget-dark {
  @apply bg-wh-dark-wood border-wh-empire-gold text-wh-parchment;
}

.widget-glass {
  @apply bg-white/10 border-white/20 backdrop-blur-md;
}

/* Header */
.widget-header {
  @apply flex items-center justify-between p-4 border-b border-wh-wood-brown/20 bg-gradient-to-r from-wh-aged-paper to-wh-parchment;
}

.widget-title {
  @apply font-wh-heading font-semibold text-wh-dark-wood;
}

.live-indicator {
  @apply flex items-center space-x-1;
}

.live-dot {
  @apply w-2 h-2 bg-green-500 rounded-full;
  animation: pulse-dot 2s ease-in-out infinite;
}

.live-text {
  @apply text-xs font-medium text-green-600;
}

.refresh-btn {
  @apply p-1 rounded-md text-wh-wood-brown hover:text-wh-dark-wood hover:bg-wh-aged-paper transition-colors duration-200 disabled:opacity-50;
}

/* Stats Grid */
.stats-grid {
  @apply grid gap-4 p-4;
}

.stat-card {
  @apply relative p-4 rounded-lg border border-wh-wood-brown/10 bg-gradient-to-br from-white/50 to-wh-aged-paper/30 transition-all duration-200 hover:shadow-md;
}

.stat-card:hover {
  @apply transform -translate-y-1 shadow-lg;
}

/* Stat card types */
.stat-primary {
  @apply border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/30;
}

.stat-success {
  @apply border-green-200 bg-gradient-to-br from-green-50 to-green-100/30;
}

.stat-warning {
  @apply border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/30;
}

.stat-danger {
  @apply border-red-200 bg-gradient-to-br from-red-50 to-red-100/30;
}

.stat-info {
  @apply border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/30;
}

/* Stat content */
.stat-icon {
  @apply absolute top-3 right-3 text-wh-empire-gold/60;
}

.stat-content {
  @apply space-y-1;
}

.stat-value {
  @apply flex items-baseline space-x-1;
}

.stat-value .number-ticker {
  @apply text-2xl font-bold text-wh-dark-wood;
}

.widget-sm .stat-value .number-ticker {
  @apply text-lg;
}

.widget-lg .stat-value .number-ticker {
  @apply text-3xl;
}

.stat-unit {
  @apply text-sm text-wh-wood-brown;
}

.stat-label {
  @apply text-sm text-wh-wood-brown font-medium;
}

/* Trend indicator */
.stat-trend {
  @apply flex items-center space-x-1 text-xs;
}

.trend-up {
  @apply text-green-600;
}

.trend-down {
  @apply text-red-600;
}

.trend-neutral {
  @apply text-gray-600;
}

.trend-value {
  @apply font-medium;
}

/* Sparkline */
.stat-sparkline {
  @apply mt-2;
}

.sparkline-svg {
  @apply w-full h-5;
}

.sparkline-line {
  @apply fill-none stroke-2;
}

.sparkline-up {
  @apply stroke-green-500;
}

.sparkline-down {
  @apply stroke-red-500;
}

.sparkline-neutral {
  @apply stroke-gray-500;
}

/* Footer */
.widget-footer {
  @apply flex items-center justify-between p-3 border-t border-wh-wood-brown/20 bg-wh-aged-paper/30;
}

.footer-info {
  @apply flex items-center space-x-1 text-xs text-wh-wood-brown;
}

.last-update {
  @apply font-medium;
}

/* Animations */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .stat-card:hover {
    transform: none !important;
  }
  
  .live-dot {
    animation: none !important;
  }
  
  .refresh-btn .animate-spin {
    animation: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .stat-card {
    @apply border-2;
  }
  
  .widget-header {
    @apply border-b-2;
  }
  
  .widget-footer {
    @apply border-t-2;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .widget-header {
    @apply flex-col space-y-2 items-start;
  }
  
  .stats-grid {
    @apply grid-cols-1 gap-3 p-3;
  }
  
  .stat-card {
    @apply p-3;
  }
}
</style>