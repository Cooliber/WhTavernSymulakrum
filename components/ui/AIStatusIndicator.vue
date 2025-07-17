<template>
  <div class="ai-status-indicator">
    <!-- Compact Status Display -->
    <div v-if="compact" class="flex items-center space-x-2">
      <div
        class="w-3 h-3 rounded-full transition-all duration-300"
        :class="getStatusColor(overallHealth)"
      ></div>
      <span class="text-sm font-medium text-wh-wood-brown">
        AI {{ overallHealth.toUpperCase() }}
      </span>
    </div>

    <!-- Detailed Status Display -->
    <div v-else class="ai-status-detailed space-y-3">
      <!-- Overall Status -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-4 h-4 rounded-full transition-all duration-300"
            :class="getStatusColor(overallHealth)"
          ></div>
          <span class="font-semibold text-wh-dark-wood">
            AI System Status
          </span>
        </div>
        <WarhammerBadge
          :color="getBadgeColor(overallHealth)"
          variant="soft"
          size="sm"
        >
          {{ overallHealth.toUpperCase() }}
        </WarhammerBadge>
      </div>

      <!-- Provider Status Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="provider in providerStats"
          :key="provider.provider"
          class="provider-status-card p-3 rounded-lg border transition-all duration-200"
          :class="getProviderCardClass(provider)"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="getProviderStatusColor(provider)"
              ></div>
              <span class="text-sm font-medium capitalize">
                {{ provider.provider }}
              </span>
            </div>
            <span class="text-xs text-gray-600">
              {{ Math.round(provider.averageResponseTime) }}ms
            </span>
          </div>
          
          <div class="flex justify-between text-xs text-gray-600">
            <span>{{ provider.uptime.toFixed(1) }}% uptime</span>
            <span>{{ provider.totalRequests }} calls</span>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-metrics grid grid-cols-3 gap-3 text-center">
        <div class="metric">
          <div class="text-lg font-bold text-blue-600">
            {{ Math.round(overallStats.averageResponseTime) }}ms
          </div>
          <div class="text-xs text-gray-600">Avg Response</div>
        </div>
        <div class="metric">
          <div class="text-lg font-bold text-green-600">
            {{ overallStats.successRate.toFixed(1) }}%
          </div>
          <div class="text-xs text-gray-600">Success Rate</div>
        </div>
        <div class="metric">
          <div class="text-lg font-bold text-purple-600">
            {{ overallStats.totalRequests }}
          </div>
          <div class="text-xs text-gray-600">Total Calls</div>
        </div>
      </div>

      <!-- Recent Activity Indicator -->
      <div v-if="recentActivity.length > 0" class="recent-activity">
        <div class="flex items-center space-x-2 mb-2">
          <Icon name="activity" class="w-4 h-4 text-gray-600" />
          <span class="text-sm font-medium text-gray-700">Recent Activity</span>
        </div>
        <div class="flex space-x-1">
          <div
            v-for="activity in recentActivity.slice(0, 10)"
            :key="activity.id"
            class="w-2 h-2 rounded-full"
            :class="activity.success ? 'bg-green-400' : 'bg-red-400'"
            :title="`${activity.provider}: ${activity.responseTime}ms`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  compact?: boolean
  showMetrics?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showMetrics: true,
  autoRefresh: true,
  refreshInterval: 5000
})

// Composables
const { 
  providerStats, 
  overallStats, 
  recentMetrics,
  getProviderHealth 
} = usePerformanceMonitoring()

const { healthCheck } = useUnifiedAIService()

// Computed properties
const overallHealth = computed(() => {
  const healthyProviders = providerStats.value.filter(p => 
    getProviderHealth(p.provider) === 'healthy'
  ).length
  const totalProviders = providerStats.value.length
  
  if (totalProviders === 0) return 'unknown'
  if (healthyProviders === totalProviders) return 'healthy'
  if (healthyProviders > 0) return 'degraded'
  return 'unhealthy'
})

const recentActivity = computed(() => {
  return recentMetrics.value.slice(0, 20).reverse()
})

// Methods
const getStatusColor = (status: string): string => {
  const colors = {
    healthy: 'bg-green-500 shadow-green-500/50',
    degraded: 'bg-yellow-500 shadow-yellow-500/50',
    unhealthy: 'bg-red-500 shadow-red-500/50',
    unknown: 'bg-gray-500 shadow-gray-500/50'
  }
  return `${colors[status as keyof typeof colors] || colors.unknown} shadow-lg animate-pulse`
}

const getBadgeColor = (status: string): string => {
  const colors = {
    healthy: 'green',
    degraded: 'yellow',
    unhealthy: 'red',
    unknown: 'gray'
  }
  return colors[status as keyof typeof colors] || 'gray'
}

const getProviderCardClass = (provider: any): string => {
  const health = getProviderHealth(provider.provider)
  const classes = {
    healthy: 'border-green-200 bg-green-50/50',
    degraded: 'border-yellow-200 bg-yellow-50/50',
    unhealthy: 'border-red-200 bg-red-50/50'
  }
  return classes[health as keyof typeof classes] || 'border-gray-200'
}

const getProviderStatusColor = (provider: any): string => {
  const health = getProviderHealth(provider.provider)
  const colors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500'
  }
  return colors[health as keyof typeof colors] || 'bg-gray-500'
}

// Auto-refresh functionality
let refreshInterval: NodeJS.Timeout | null = null

const startAutoRefresh = () => {
  if (props.autoRefresh && !refreshInterval) {
    refreshInterval = setInterval(async () => {
      try {
        await healthCheck()
      } catch (error) {
        console.error('Auto health check failed:', error)
      }
    }, props.refreshInterval)
  }
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
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

watch(() => props.refreshInterval, () => {
  if (props.autoRefresh) {
    stopAutoRefresh()
    startAutoRefresh()
  }
})
</script>

<style scoped>
.ai-status-indicator {
  font-family: var(--wh-font-body);
}

.provider-status-card {
  transition: all 0.2s ease;
}

.provider-status-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.recent-activity {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .provider-status-card {
    transition: none !important;
  }
  
  .provider-status-card:hover {
    transform: none !important;
  }
  
  .animate-pulse {
    animation: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .provider-status-card {
    border-width: 2px;
  }
  
  .metric {
    border-width: 2px;
  }
}
</style>