<template>
  <div class="ai-performance-dashboard space-y-6">
    <!-- Spectacular Header with Live Stats -->
    <div class="dashboard-header relative overflow-hidden">
      <WarhammerBackground
        faction="neutral"
        :time-of-day="'night'"
        :weather="'clear'"
        :intensity="'low'"
        class="absolute inset-0 opacity-30"
      />

      <div class="relative z-10 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <HyperText
              text="AI Command Center"
              class="text-3xl font-wh-display text-wh-empire-gold mb-2"
              :animation-duration="1500"
            />
            <SparklesText
              text="Monitoring 17 AI Agents across the realm"
              class="text-wh-wood-brown"
              :sparkles-count="6"
            />
          </div>

          <AIStatusIndicator compact />
        </div>

        <!-- Live Stats Grid -->
        <LiveStatsWidget
          title="System Performance"
          icon="activity"
          :stats="liveStats"
          :columns="4"
          size="lg"
          theme="glass"
          @refresh="refreshStats"
          @view-details="showDetailedView = true"
        />
      </div>
    </div>

    <!-- Health Status Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <WarhammerCard class="relative overflow-hidden">
        <BorderBeam v-if="overallHealth === 'healthy'" />
        <template #header>
          <div class="flex items-center space-x-2">
            <Icon name="activity" class="w-5 h-5 text-green-500" />
            <h3 class="font-semibold">Overall Health</h3>
          </div>
        </template>

        <div class="text-center">
          <NumberTicker
            :value="getHealthScore(overallHealth)"
            format="percentage"
            class="text-3xl font-bold mb-2"
            :class="getHealthColor(overallHealth)"
          />
          <p class="text-sm text-gray-600">System Status</p>
          <div class="mt-2">
            <WarhammerBadge
              :color="getHealthBadgeColor(overallHealth)"
              variant="soft"
              size="lg"
            >
              {{ overallHealth.toUpperCase() }}
            </WarhammerBadge>
          </div>
        </div>
      </WarhammerCard>

      <WarhammerCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <Icon name="zap" class="w-5 h-5 text-blue-500" />
            <h3 class="font-semibold">Response Time</h3>
          </div>
        </template>
        
        <div class="text-center">
          <div class="text-3xl font-bold mb-2 text-blue-600">
            {{ averageResponseTime }}ms
          </div>
          <p class="text-sm text-gray-600">Average Response</p>
        </div>
      </WarhammerCard>

      <WarhammerCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <Icon name="check-circle" class="w-5 h-5 text-green-500" />
            <h3 class="font-semibold">Success Rate</h3>
          </div>
        </template>
        
        <div class="text-center">
          <div class="text-3xl font-bold mb-2 text-green-600">
            {{ successRate }}%
          </div>
          <p class="text-sm text-gray-600">API Calls</p>
        </div>
      </WarhammerCard>
    </div>

    <!-- Provider Status -->
    <WarhammerCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">AI Provider Status</h3>
          <WarhammerButton
            variant="ghost"
            size="sm"
            @click="refreshHealth"
            :loading="isRefreshing"
          >
            <Icon name="refresh-cw" class="w-4 h-4" />
            Refresh
          </WarhammerButton>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="provider in providerStats"
          :key="provider.provider"
          class="provider-status p-4 border rounded-lg"
          :class="getProviderStatusClass(provider)"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                :class="getProviderHealthColor(provider)"
              ></div>
              <h4 class="font-medium capitalize">{{ provider.provider }}</h4>
              <WarhammerBadge
                :color="getProviderBadgeColor(provider)"
                variant="soft"
              >
                {{ getProviderHealth(provider.provider) }}
              </WarhammerBadge>
            </div>
            <div class="text-sm text-gray-600">
              {{ provider.totalRequests }} requests
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-gray-600">Success Rate</div>
              <div class="font-medium">{{ provider.uptime.toFixed(1) }}%</div>
            </div>
            <div>
              <div class="text-gray-600">Avg Response</div>
              <div class="font-medium">{{ Math.round(provider.averageResponseTime) }}ms</div>
            </div>
            <div>
              <div class="text-gray-600">Total Tokens</div>
              <div class="font-medium">{{ provider.totalTokens.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-gray-600">Last Error</div>
              <div class="font-medium text-red-600 truncate">
                {{ provider.lastError || 'None' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WarhammerCard>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Response Time Chart -->
      <WarhammerCard>
        <template #header>
          <h3 class="font-semibold">Response Time Trends</h3>
        </template>
        
        <div class="space-y-4">
          <div class="grid grid-cols-4 gap-4 text-sm">
            <div class="text-center">
              <div class="text-gray-600">P50</div>
              <div class="font-medium">{{ responseTimePercentiles.p50 }}ms</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600">P90</div>
              <div class="font-medium">{{ responseTimePercentiles.p90 }}ms</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600">P95</div>
              <div class="font-medium">{{ responseTimePercentiles.p95 }}ms</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600">P99</div>
              <div class="font-medium">{{ responseTimePercentiles.p99 }}ms</div>
            </div>
          </div>
          
          <!-- Simple visual representation -->
          <div class="space-y-2">
            <div
              v-for="provider in providerStats"
              :key="provider.provider"
              class="flex items-center space-x-3"
            >
              <div class="w-16 text-sm capitalize">{{ provider.provider }}</div>
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getResponseTimeBarColor(provider.averageResponseTime)"
                  :style="{ width: `${Math.min(100, (provider.averageResponseTime / 3000) * 100)}%` }"
                ></div>
              </div>
              <div class="w-16 text-sm text-right">{{ Math.round(provider.averageResponseTime) }}ms</div>
            </div>
          </div>
        </div>
      </WarhammerCard>

      <!-- Recent Activity -->
      <WarhammerCard>
        <template #header>
          <h3 class="font-semibold">Recent Activity</h3>
        </template>
        
        <div class="space-y-3">
          <div
            v-for="metric in recentMetrics.slice(0, 10)"
            :key="metric.id"
            class="flex items-center justify-between p-2 rounded"
            :class="metric.success ? 'bg-green-50' : 'bg-red-50'"
          >
            <div class="flex items-center space-x-3">
              <Icon
                :name="metric.success ? 'check-circle' : 'x-circle'"
                class="w-4 h-4"
                :class="metric.success ? 'text-green-500' : 'text-red-500'"
              />
              <div>
                <div class="text-sm font-medium capitalize">{{ metric.provider }}</div>
                <div class="text-xs text-gray-600">{{ metric.operation }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">{{ metric.responseTime }}ms</div>
              <div class="text-xs text-gray-600">
                {{ formatTime(metric.timestamp) }}
              </div>
            </div>
          </div>
          
          <div v-if="recentMetrics.length === 0" class="text-center py-8 text-gray-500">
            No recent activity
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Controls -->
    <WarhammerCard>
      <template #header>
        <h3 class="font-semibold">Performance Controls</h3>
      </template>
      
      <div class="flex flex-wrap gap-4">
        <WarhammerButton
          variant="outline"
          @click="exportMetrics"
        >
          <Icon name="download" class="w-4 h-4 mr-2" />
          Export Metrics
        </WarhammerButton>

        <WarhammerButton
          variant="outline"
          @click="clearMetrics"
          faction="chaos"
        >
          <Icon name="trash-2" class="w-4 h-4 mr-2" />
          Clear Metrics
        </WarhammerButton>

        <WarhammerButton
          variant="outline"
          @click="toggleMonitoring"
        >
          <Icon :name="isMonitoring ? 'pause' : 'play'" class="w-4 h-4 mr-2" />
          {{ isMonitoring ? 'Pause' : 'Resume' }} Monitoring
        </WarhammerButton>
      </div>
    </WarhammerCard>
  </div>
</template>

<script setup lang="ts">
const {
  providerStats,
  overallStats,
  recentMetrics,
  getProviderHealth,
  getResponseTimePercentiles,
  exportMetrics: exportMetricsData,
  clearMetrics: clearMetricsData,
  isMonitoring,
  toggleMonitoring
} = usePerformanceMonitoring()

const { healthCheck } = useUnifiedAIService()

// Local state
const isRefreshing = ref(false)
const showDetailedView = ref(false)

// Live stats for the widget
const liveStats = computed(() => [
  {
    id: 'response-time',
    label: 'Avg Response Time',
    value: overallStats.value.averageResponseTime,
    unit: 'ms',
    icon: 'zap',
    format: 'time' as const,
    trend: calculateTrend('responseTime'),
    sparkline: getSparklineData('responseTime'),
    type: 'primary' as const
  },
  {
    id: 'success-rate',
    label: 'Success Rate',
    value: overallStats.value.successRate,
    unit: '%',
    icon: 'check-circle',
    format: 'percentage' as const,
    trend: calculateTrend('successRate'),
    sparkline: getSparklineData('successRate'),
    type: 'success' as const
  },
  {
    id: 'total-requests',
    label: 'Total Requests',
    value: overallStats.value.totalRequests,
    icon: 'activity',
    format: 'number' as const,
    trend: calculateTrend('totalRequests'),
    sparkline: getSparklineData('totalRequests'),
    type: 'info' as const
  },
  {
    id: 'active-agents',
    label: 'Active AI Agents',
    value: providerStats.value.filter(p => getProviderHealth(p.provider) === 'healthy').length,
    icon: 'users',
    format: 'number' as const,
    trend: 0,
    sparkline: [],
    type: 'primary' as const
  }
])

// Computed properties
const overallHealth = computed(() => {
  const healthyProviders = providerStats.value.filter(p => getProviderHealth(p.provider) === 'healthy').length
  const totalProviders = providerStats.value.length
  
  if (totalProviders === 0) return 'unknown'
  if (healthyProviders === totalProviders) return 'healthy'
  if (healthyProviders > 0) return 'degraded'
  return 'unhealthy'
})

const averageResponseTime = computed(() => {
  return Math.round(overallStats.value.averageResponseTime)
})

const successRate = computed(() => {
  return overallStats.value.successRate.toFixed(1)
})

const responseTimePercentiles = computed(() => {
  return getResponseTimePercentiles()
})

// Methods
const refreshStats = async () => {
  isRefreshing.value = true
  try {
    await healthCheck()
  } catch (error) {
    console.error('Stats refresh failed:', error)
  } finally {
    isRefreshing.value = false
  }
}

const refreshHealth = async () => {
  await refreshStats()
}

const getHealthScore = (health: string): number => {
  const scores = {
    healthy: 100,
    degraded: 75,
    unhealthy: 25,
    unknown: 0
  }
  return scores[health as keyof typeof scores] || 0
}

const getHealthBadgeColor = (health: string): string => {
  const colors = {
    healthy: 'green',
    degraded: 'yellow',
    unhealthy: 'red',
    unknown: 'gray'
  }
  return colors[health as keyof typeof colors] || 'gray'
}

const calculateTrend = (metric: string): number => {
  // Simple trend calculation based on recent metrics
  const recent = recentMetrics.value.slice(0, 10)
  if (recent.length < 2) return 0

  const latest = recent[0]
  const previous = recent[Math.floor(recent.length / 2)]

  switch (metric) {
    case 'responseTime':
      return ((previous.responseTime - latest.responseTime) / previous.responseTime) * 100
    case 'successRate':
      const latestSuccess = recent.slice(0, 5).filter(m => m.success).length / 5
      const previousSuccess = recent.slice(5, 10).filter(m => m.success).length / 5
      return ((latestSuccess - previousSuccess) / previousSuccess) * 100
    case 'totalRequests':
      return 5 // Assume positive growth
    default:
      return 0
  }
}

const getSparklineData = (metric: string): number[] => {
  const recent = recentMetrics.value.slice(0, 20).reverse()

  switch (metric) {
    case 'responseTime':
      return recent.map(m => m.responseTime)
    case 'successRate':
      return recent.map((_, index) => {
        const chunk = recent.slice(Math.max(0, index - 4), index + 1)
        return (chunk.filter(m => m.success).length / chunk.length) * 100
      })
    case 'totalRequests':
      return recent.map((_, index) => index + 1)
    default:
      return []
  }
}

const getHealthColor = (health: string): string => {
  const colors = {
    healthy: 'text-green-600',
    degraded: 'text-yellow-600',
    unhealthy: 'text-red-600',
    unknown: 'text-gray-600'
  }
  return colors[health as keyof typeof colors] || 'text-gray-600'
}

const getProviderStatusClass = (provider: any): string => {
  const health = getProviderHealth(provider.provider)
  const classes = {
    healthy: 'border-green-200 bg-green-50',
    degraded: 'border-yellow-200 bg-yellow-50',
    unhealthy: 'border-red-200 bg-red-50'
  }
  return classes[health as keyof typeof classes] || 'border-gray-200'
}

const getProviderHealthColor = (provider: any): string => {
  const health = getProviderHealth(provider.provider)
  const colors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500'
  }
  return colors[health as keyof typeof colors] || 'bg-gray-500'
}

const getProviderBadgeColor = (provider: any): string => {
  const health = getProviderHealth(provider.provider)
  const colors = {
    healthy: 'green',
    degraded: 'yellow',
    unhealthy: 'red'
  }
  return colors[health as keyof typeof colors] || 'gray'
}

const getResponseTimeBarColor = (responseTime: number): string => {
  if (responseTime < 1000) return 'bg-green-500'
  if (responseTime < 2000) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatTime = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

const exportMetrics = () => {
  const data = exportMetricsData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-metrics-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const clearMetrics = () => {
  if (confirm('Are you sure you want to clear all performance metrics?')) {
    clearMetricsData()
  }
}

// Auto-refresh every 30 seconds
onMounted(() => {
  const interval = setInterval(refreshHealth, 30000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.provider-status {
  transition: all 0.2s ease;
}

.provider-status:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>