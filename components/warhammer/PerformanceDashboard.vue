<template>
  <div class="performance-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-2">
            Performance Dashboard
          </h2>
          <p class="text-wh-wood-brown">
            Core Web Vitals and performance metrics monitoring
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <div class="performance-score">
            <div class="text-center">
              <div 
                class="text-3xl font-bold"
                :class="getScoreColor(performanceMonitoring.getPerformanceScore.value)"
              >
                {{ performanceMonitoring.getPerformanceScore.value }}
              </div>
              <div class="text-xs text-wh-wood-brown">Overall Score</div>
            </div>
          </div>
          
          <WarhammerButton
            variant="outline"
            size="sm"
            icon-left="refresh-cw"
            :loading="!performanceMonitoring.isSupported.value"
            @click="refreshMetrics"
          >
            Refresh
          </WarhammerButton>
          
          <WarhammerButton
            variant="ghost"
            size="sm"
            icon-left="download"
            @click="exportData"
          >
            Export
          </WarhammerButton>
        </div>
      </div>
    </div>

    <!-- Core Web Vitals -->
    <div class="core-web-vitals mb-8">
      <h3 class="text-lg font-wh-heading text-wh-dark-wood mb-4">Core Web Vitals</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Largest Contentful Paint (LCP) -->
        <WarhammerCard variant="parchment" size="sm">
          <div class="metric-card">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-wh-heading text-wh-dark-wood">LCP</h4>
              <div 
                class="metric-badge"
                :class="getMetricBadgeClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.lcp, 'lcp'))"
              >
                {{ performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.lcp, 'lcp') }}
              </div>
            </div>
            
            <div class="metric-value mb-2">
              <span class="text-2xl font-bold text-wh-dark-wood">
                {{ formatMetricValue(performanceMonitoring.metrics.value.lcp, 'ms') }}
              </span>
            </div>
            
            <div class="metric-description text-xs text-wh-wood-brown mb-3">
              Largest Contentful Paint measures loading performance
            </div>
            
            <div class="metric-progress">
              <div class="w-full bg-wh-aged-paper rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressBarClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.lcp, 'lcp'))"
                  :style="{ width: `${getProgressPercentage(performanceMonitoring.metrics.value.lcp, 'lcp')}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-wh-wood-brown mt-1">
                <span>0ms</span>
                <span>{{ performanceMonitoring.thresholds.lcp.needsImprovement }}ms</span>
              </div>
            </div>
          </div>
        </WarhammerCard>

        <!-- First Input Delay (FID) -->
        <WarhammerCard variant="parchment" size="sm">
          <div class="metric-card">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-wh-heading text-wh-dark-wood">FID</h4>
              <div 
                class="metric-badge"
                :class="getMetricBadgeClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.fid, 'fid'))"
              >
                {{ performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.fid, 'fid') }}
              </div>
            </div>
            
            <div class="metric-value mb-2">
              <span class="text-2xl font-bold text-wh-dark-wood">
                {{ formatMetricValue(performanceMonitoring.metrics.value.fid, 'ms') }}
              </span>
            </div>
            
            <div class="metric-description text-xs text-wh-wood-brown mb-3">
              First Input Delay measures interactivity
            </div>
            
            <div class="metric-progress">
              <div class="w-full bg-wh-aged-paper rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressBarClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.fid, 'fid'))"
                  :style="{ width: `${getProgressPercentage(performanceMonitoring.metrics.value.fid, 'fid')}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-wh-wood-brown mt-1">
                <span>0ms</span>
                <span>{{ performanceMonitoring.thresholds.fid.needsImprovement }}ms</span>
              </div>
            </div>
          </div>
        </WarhammerCard>

        <!-- Cumulative Layout Shift (CLS) -->
        <WarhammerCard variant="parchment" size="sm">
          <div class="metric-card">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-wh-heading text-wh-dark-wood">CLS</h4>
              <div 
                class="metric-badge"
                :class="getMetricBadgeClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.cls, 'cls'))"
              >
                {{ performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.cls, 'cls') }}
              </div>
            </div>
            
            <div class="metric-value mb-2">
              <span class="text-2xl font-bold text-wh-dark-wood">
                {{ formatMetricValue(performanceMonitoring.metrics.value.cls, '') }}
              </span>
            </div>
            
            <div class="metric-description text-xs text-wh-wood-brown mb-3">
              Cumulative Layout Shift measures visual stability
            </div>
            
            <div class="metric-progress">
              <div class="w-full bg-wh-aged-paper rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressBarClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.cls, 'cls'))"
                  :style="{ width: `${getProgressPercentage(performanceMonitoring.metrics.value.cls, 'cls')}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-wh-wood-brown mt-1">
                <span>0</span>
                <span>{{ performanceMonitoring.thresholds.cls.needsImprovement }}</span>
              </div>
            </div>
          </div>
        </WarhammerCard>

        <!-- Interaction to Next Paint (INP) -->
        <WarhammerCard variant="parchment" size="sm">
          <div class="metric-card">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-wh-heading text-wh-dark-wood">INP</h4>
              <div 
                class="metric-badge"
                :class="getMetricBadgeClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.inp, 'inp'))"
              >
                {{ performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.inp, 'inp') }}
              </div>
            </div>
            
            <div class="metric-value mb-2">
              <span class="text-2xl font-bold text-wh-dark-wood">
                {{ formatMetricValue(performanceMonitoring.metrics.value.inp, 'ms') }}
              </span>
            </div>
            
            <div class="metric-description text-xs text-wh-wood-brown mb-3">
              Interaction to Next Paint measures responsiveness
            </div>
            
            <div class="metric-progress">
              <div class="w-full bg-wh-aged-paper rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressBarClass(performanceMonitoring.getMetricRating(performanceMonitoring.metrics.value.inp, 'inp'))"
                  :style="{ width: `${getProgressPercentage(performanceMonitoring.metrics.value.inp, 'inp')}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-wh-wood-brown mt-1">
                <span>0ms</span>
                <span>{{ performanceMonitoring.thresholds.inp.needsImprovement }}ms</span>
              </div>
            </div>
          </div>
        </WarhammerCard>
      </div>
    </div>

    <!-- Additional Metrics -->
    <div class="additional-metrics mb-8">
      <h3 class="text-lg font-wh-heading text-wh-dark-wood mb-4">Additional Metrics</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WarhammerCard variant="filled" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-wh-bone">
              {{ formatMetricValue(performanceMonitoring.metrics.value.ttfb, 'ms') }}
            </div>
            <div class="text-sm text-wh-light-grey">Time to First Byte</div>
          </div>
        </WarhammerCard>
        
        <WarhammerCard variant="filled" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-wh-bone">
              {{ formatMetricValue(performanceMonitoring.metrics.value.fcp, 'ms') }}
            </div>
            <div class="text-sm text-wh-light-grey">First Contentful Paint</div>
          </div>
        </WarhammerCard>
        
        <WarhammerCard variant="filled" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-wh-bone">
              {{ performanceMonitoring.metrics.value.resourceCount }}
            </div>
            <div class="text-sm text-wh-light-grey">Resources Loaded</div>
          </div>
        </WarhammerCard>
      </div>
    </div>

    <!-- Performance Recommendations -->
    <div v-if="performanceMonitoring.getRecommendations.value.length > 0" class="recommendations">
      <h3 class="text-lg font-wh-heading text-wh-dark-wood mb-4">Performance Recommendations</h3>
      
      <WarhammerCard variant="parchment">
        <div class="space-y-3">
          <div
            v-for="(recommendation, index) in performanceMonitoring.getRecommendations.value"
            :key="index"
            class="recommendation-item flex items-start space-x-3 p-3 bg-wh-aged-paper rounded border border-wh-wood-brown"
          >
            <WarhammerIcon name="lightbulb" size="sm" class="text-yellow-500 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm text-wh-dark-wood">{{ recommendation }}</p>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Monitoring Status -->
    <div class="monitoring-status mt-6">
      <div class="flex items-center justify-between p-4 bg-wh-aged-paper rounded border border-wh-wood-brown">
        <div class="flex items-center space-x-3">
          <div
            class="w-3 h-3 rounded-full"
            :class="performanceMonitoring.isMonitoring.value ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-sm text-wh-dark-wood">
            {{ performanceMonitoring.isMonitoring.value ? 'Monitoring Active' : 'Monitoring Inactive' }}
          </span>
        </div>
        
        <div class="text-xs text-wh-wood-brown">
          Last updated: {{ formatTimestamp(performanceMonitoring.metrics.value.timestamp) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceThresholds } from '~/composables/usePerformanceMonitoring'

// Performance monitoring composable
const performanceMonitoring = usePerformanceMonitoring()

// Methods
const refreshMetrics = () => {
  if (!performanceMonitoring.isMonitoring.value) {
    performanceMonitoring.startMonitoring()
  }
}

const exportData = () => {
  const data = performanceMonitoring.exportMetrics()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-metrics-${Date.now()}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

const formatMetricValue = (value: number | null, unit: string): string => {
  if (value === null) return 'N/A'
  return `${value}${unit}`
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const getMetricBadgeClass = (rating: string): string => {
  const classes = {
    'good': 'bg-green-100 text-green-800',
    'needs-improvement': 'bg-yellow-100 text-yellow-800',
    'poor': 'bg-red-100 text-red-800',
    'unknown': 'bg-gray-100 text-gray-800'
  }
  return `px-2 py-1 text-xs rounded-full ${classes[rating as keyof typeof classes] || classes.unknown}`
}

const getProgressBarClass = (rating: string): string => {
  const classes = {
    'good': 'bg-green-500',
    'needs-improvement': 'bg-yellow-500',
    'poor': 'bg-red-500',
    'unknown': 'bg-gray-500'
  }
  return classes[rating as keyof typeof classes] || classes.unknown
}

const getProgressPercentage = (value: number | null, metric: keyof PerformanceThresholds): number => {
  if (value === null) return 0
  
  const threshold = performanceMonitoring.thresholds[metric]
  const maxValue = threshold.needsImprovement * 1.5
  
  return Math.min((value / maxValue) * 100, 100)
}

const formatTimestamp = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

// Lifecycle
onMounted(() => {
  performanceMonitoring.startMonitoring()
})

onUnmounted(() => {
  performanceMonitoring.stopMonitoring()
})
</script>

<style scoped>
.performance-dashboard {
  font-family: var(--wh-font-body);
}

.metric-card {
  min-height: 200px;
}

.metric-value {
  min-height: 3rem;
  display: flex;
  align-items: center;
}

.recommendation-item {
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.performance-score {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .metric-card,
  .recommendation-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .recommendation-item {
    transition: none !important;
  }
  
  .recommendation-item:hover {
    transform: none !important;
  }
}
</style>
