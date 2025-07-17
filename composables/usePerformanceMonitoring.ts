/**
 * Performance Monitoring Composable
 * Tracks AI API performance, response times, and system metrics
 */

import { ref, computed, readonly } from 'vue'

export interface PerformanceMetric {
  id: string
  timestamp: Date
  provider: 'groq' | 'cerebras' | 'fallback'
  operation: 'chat_completion' | 'health_check' | 'model_list'
  responseTime: number
  tokenCount?: number
  success: boolean
  error?: string
  model?: string
}

export interface ProviderStats {
  provider: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  totalTokens: number
  uptime: number
  lastError?: string
  lastErrorTime?: Date
}

export const usePerformanceMonitoring = () => {
  // State
  const metrics = ref<PerformanceMetric[]>([])
  const isMonitoring = ref(true)
  const maxMetrics = ref(1000) // Keep last 1000 metrics

  // Computed stats
  const providerStats = computed((): ProviderStats[] => {
    const stats: Record<string, ProviderStats> = {}
    
    metrics.value.forEach(metric => {
      if (!stats[metric.provider]) {
        stats[metric.provider] = {
          provider: metric.provider,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          totalTokens: 0,
          uptime: 0
        }
      }
      
      const stat = stats[metric.provider]
      stat.totalRequests++
      
      if (metric.success) {
        stat.successfulRequests++
      } else {
        stat.failedRequests++
        stat.lastError = metric.error
        stat.lastErrorTime = metric.timestamp
      }
      
      stat.totalTokens += metric.tokenCount || 0
    })
    
    // Calculate averages and uptime
    Object.values(stats).forEach(stat => {
      const providerMetrics = metrics.value.filter(m => m.provider === stat.provider)
      
      if (providerMetrics.length > 0) {
        stat.averageResponseTime = providerMetrics.reduce((sum, m) => sum + m.responseTime, 0) / providerMetrics.length
        stat.uptime = (stat.successfulRequests / stat.totalRequests) * 100
      }
    })
    
    return Object.values(stats)
  })

  const overallStats = computed(() => {
    const total = metrics.value.length
    const successful = metrics.value.filter(m => m.success).length
    const failed = total - successful
    
    const avgResponseTime = total > 0 
      ? metrics.value.reduce((sum, m) => sum + m.responseTime, 0) / total 
      : 0
    
    const totalTokens = metrics.value.reduce((sum, m) => sum + (m.tokenCount || 0), 0)
    
    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageResponseTime: avgResponseTime,
      totalTokens
    }
  })

  const recentMetrics = computed(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return metrics.value.filter(m => m.timestamp > oneHourAgo)
  })

  // Methods
  const recordMetric = (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => {
    if (!isMonitoring.value) return
    
    const newMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    
    metrics.value.push(newMetric)
    
    // Keep only the most recent metrics
    if (metrics.value.length > maxMetrics.value) {
      metrics.value = metrics.value.slice(-maxMetrics.value)
    }
    
    // Persist to storage
    persistMetrics()
  }

  const startTimer = () => {
    return Date.now()
  }

  const endTimer = (startTime: number): number => {
    return Date.now() - startTime
  }

  const recordAPICall = async <T>(
    provider: 'groq' | 'cerebras' | 'fallback',
    operation: 'chat_completion' | 'health_check' | 'model_list',
    apiCall: () => Promise<T>,
    model?: string
  ): Promise<T> => {
    const startTime = startTimer()
    
    try {
      const result = await apiCall()
      const responseTime = endTimer(startTime)
      
      recordMetric({
        provider,
        operation,
        responseTime,
        success: true,
        model
      })
      
      return result
    } catch (error) {
      const responseTime = endTimer(startTime)
      
      recordMetric({
        provider,
        operation,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        model
      })
      
      throw error
    }
  }

  const getProviderHealth = (provider: string): 'healthy' | 'degraded' | 'unhealthy' => {
    const recentProviderMetrics = recentMetrics.value.filter(m => m.provider === provider)
    
    if (recentProviderMetrics.length === 0) return 'unhealthy'
    
    const successRate = recentProviderMetrics.filter(m => m.success).length / recentProviderMetrics.length
    const avgResponseTime = recentProviderMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentProviderMetrics.length
    
    if (successRate >= 0.95 && avgResponseTime < 2000) return 'healthy'
    if (successRate >= 0.8 && avgResponseTime < 5000) return 'degraded'
    return 'unhealthy'
  }

  const getResponseTimePercentiles = (provider?: string) => {
    const relevantMetrics = provider 
      ? metrics.value.filter(m => m.provider === provider && m.success)
      : metrics.value.filter(m => m.success)
    
    if (relevantMetrics.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 }
    }
    
    const sortedTimes = relevantMetrics
      .map(m => m.responseTime)
      .sort((a, b) => a - b)
    
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * sortedTimes.length) - 1
      return sortedTimes[Math.max(0, index)]
    }
    
    return {
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99)
    }
  }

  const getErrorRate = (provider?: string, timeWindow?: number): number => {
    const windowStart = timeWindow ? new Date(Date.now() - timeWindow) : new Date(0)
    
    const relevantMetrics = metrics.value.filter(m => {
      const matchesProvider = !provider || m.provider === provider
      const inTimeWindow = m.timestamp >= windowStart
      return matchesProvider && inTimeWindow
    })
    
    if (relevantMetrics.length === 0) return 0
    
    const errorCount = relevantMetrics.filter(m => !m.success).length
    return (errorCount / relevantMetrics.length) * 100
  }

  const getTokensPerSecond = (provider?: string): number => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const relevantMetrics = metrics.value.filter(m => {
      const matchesProvider = !provider || m.provider === provider
      const inTimeWindow = m.timestamp >= oneMinuteAgo
      const hasTokens = m.tokenCount && m.tokenCount > 0
      return matchesProvider && inTimeWindow && hasTokens && m.success
    })
    
    if (relevantMetrics.length === 0) return 0
    
    const totalTokens = relevantMetrics.reduce((sum, m) => sum + (m.tokenCount || 0), 0)
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0) / 1000 // Convert to seconds
    
    return totalTime > 0 ? totalTokens / totalTime : 0
  }

  const exportMetrics = (): string => {
    return JSON.stringify({
      metrics: metrics.value,
      exportedAt: new Date().toISOString(),
      summary: overallStats.value
    }, null, 2)
  }

  const importMetrics = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.metrics && Array.isArray(parsed.metrics)) {
        // Convert timestamp strings back to Date objects
        const importedMetrics = parsed.metrics.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        
        metrics.value = [...metrics.value, ...importedMetrics]
        
        // Keep only the most recent metrics
        if (metrics.value.length > maxMetrics.value) {
          metrics.value = metrics.value.slice(-maxMetrics.value)
        }
        
        persistMetrics()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to import metrics:', error)
      return false
    }
  }

  const clearMetrics = () => {
    metrics.value = []
    if (process.client) {
      localStorage.removeItem('performance_metrics')
    }
  }

  const persistMetrics = () => {
    if (!process.client) return
    
    try {
      // Only persist recent metrics to avoid storage bloat
      const recentMetricsToStore = metrics.value.slice(-500)
      localStorage.setItem('performance_metrics', JSON.stringify(recentMetricsToStore))
    } catch (error) {
      console.error('Failed to persist metrics:', error)
    }
  }

  const loadMetrics = () => {
    if (!process.client) return
    
    try {
      const stored = localStorage.getItem('performance_metrics')
      if (stored) {
        const storedMetrics = JSON.parse(stored)
        
        // Convert timestamp strings back to Date objects
        metrics.value = storedMetrics.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        
        console.log(`📊 Loaded ${metrics.value.length} performance metrics`)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const toggleMonitoring = () => {
    isMonitoring.value = !isMonitoring.value
  }

  // Initialize
  if (process.client) {
    loadMetrics()
  }

  return {
    // State
    metrics: readonly(metrics),
    isMonitoring: readonly(isMonitoring),
    maxMetrics,
    
    // Computed
    providerStats,
    overallStats,
    recentMetrics,
    
    // Methods
    recordMetric,
    startTimer,
    endTimer,
    recordAPICall,
    getProviderHealth,
    getResponseTimePercentiles,
    getErrorRate,
    getTokensPerSecond,
    exportMetrics,
    importMetrics,
    clearMetrics,
    toggleMonitoring,
    loadMetrics
  }
}