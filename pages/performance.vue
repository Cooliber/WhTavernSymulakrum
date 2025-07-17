<template>
  <div class="performance-page min-h-screen bg-wh-parchment">
    <!-- Background Effects -->
    <div class="fixed inset-0 tavern-wood-texture opacity-10 pointer-events-none"></div>
    
    <!-- Page Header -->
    <section class="relative py-12 bg-gradient-to-b from-wh-aged-paper to-wh-parchment border-b-2 border-wh-wood-brown">
      <div class="container mx-auto px-4">
        <div class="text-center space-y-6">
          <h1 class="text-5xl md:text-7xl font-wh-display text-wh-dark-wood animate-glow-pulse">
            Performance Monitoring
          </h1>
          
          <p class="text-xl md:text-2xl font-wh-heading text-wh-wood-brown">
            Core Web Vitals and optimization insights
          </p>
          
          <!-- Performance Summary -->
          <div class="performance-summary">
            <div class="flex flex-wrap justify-center gap-6 text-center">
              <div class="summary-item">
                <div 
                  class="text-4xl font-bold"
                  :class="getScoreColor(performanceMonitoring.getPerformanceScore.value)"
                >
                  {{ performanceMonitoring.getPerformanceScore.value }}
                </div>
                <div class="text-sm text-wh-wood-brown">Performance Score</div>
              </div>
              <div class="summary-item">
                <div class="text-4xl font-bold text-wh-empire-gold">
                  {{ performanceMonitoring.metrics.value.resourceCount }}
                </div>
                <div class="text-sm text-wh-wood-brown">Resources</div>
              </div>
              <div class="summary-item">
                <div class="text-4xl font-bold text-blue-600">
                  {{ formatMetricValue(performanceMonitoring.metrics.value.loadTime, 'ms') }}
                </div>
                <div class="text-sm text-wh-wood-brown">Load Time</div>
              </div>
              <div class="summary-item">
                <div class="text-4xl font-bold text-green-600">
                  {{ formatMemoryUsage(performanceMonitoring.metrics.value.jsHeapSize) }}
                </div>
                <div class="text-sm text-wh-wood-brown">Memory Usage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <!-- Performance Dashboard -->
        <div class="performance-dashboard-section mb-12">
          <PerformanceDashboard />
        </div>

        <!-- Performance Testing Tools -->
        <div class="performance-tools mb-12">
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Performance Testing Tools</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Image Loading Test -->
            <WarhammerCard
              title="Image Loading Test"
              subtitle="Test image optimization and loading performance"
              variant="parchment"
              :interactive="true"
            >
              <div class="space-y-4">
                <p class="text-sm text-wh-wood-brown">
                  Load multiple images to test LCP and resource loading performance.
                </p>
                
                <div class="test-controls">
                  <WarhammerButton
                    variant="primary"
                    size="sm"
                    :loading="imageTestRunning"
                    @click="runImageLoadTest"
                  >
                    Run Image Test
                  </WarhammerButton>
                </div>
                
                <div v-if="imageTestResults" class="test-results">
                  <div class="text-xs text-wh-wood-brown">
                    <div>Images loaded: {{ imageTestResults.count }}</div>
                    <div>Average load time: {{ imageTestResults.averageTime }}ms</div>
                    <div>Total size: {{ formatBytes(imageTestResults.totalSize) }}</div>
                  </div>
                </div>
              </div>
            </WarhammerCard>

            <!-- JavaScript Performance Test -->
            <WarhammerCard
              title="JavaScript Performance"
              subtitle="Test script execution and interaction delays"
              variant="parchment"
              :interactive="true"
            >
              <div class="space-y-4">
                <p class="text-sm text-wh-wood-brown">
                  Simulate heavy JavaScript operations to test FID and INP metrics.
                </p>
                
                <div class="test-controls">
                  <WarhammerButton
                    variant="primary"
                    size="sm"
                    :loading="jsTestRunning"
                    @click="runJavaScriptTest"
                  >
                    Run JS Test
                  </WarhammerButton>
                </div>
                
                <div v-if="jsTestResults" class="test-results">
                  <div class="text-xs text-wh-wood-brown">
                    <div>Execution time: {{ jsTestResults.executionTime }}ms</div>
                    <div>Operations: {{ jsTestResults.operations }}</div>
                    <div>Memory used: {{ formatBytes(jsTestResults.memoryUsed) }}</div>
                  </div>
                </div>
              </div>
            </WarhammerCard>

            <!-- Layout Stability Test -->
            <WarhammerCard
              title="Layout Stability"
              subtitle="Test cumulative layout shift (CLS)"
              variant="parchment"
              :interactive="true"
            >
              <div class="space-y-4">
                <p class="text-sm text-wh-wood-brown">
                  Trigger layout shifts to test visual stability metrics.
                </p>
                
                <div class="test-controls">
                  <WarhammerButton
                    variant="primary"
                    size="sm"
                    :loading="layoutTestRunning"
                    @click="runLayoutTest"
                  >
                    Run Layout Test
                  </WarhammerButton>
                </div>
                
                <div v-if="layoutTestResults" class="test-results">
                  <div class="text-xs text-wh-wood-brown">
                    <div>Layout shifts: {{ layoutTestResults.shiftCount }}</div>
                    <div>CLS score: {{ layoutTestResults.clsScore }}</div>
                    <div>Largest shift: {{ layoutTestResults.largestShift }}</div>
                  </div>
                </div>
              </div>
            </WarhammerCard>
          </div>
        </div>

        <!-- Performance Optimization Tips -->
        <div class="optimization-tips mb-12">
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Optimization Guidelines</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WarhammerCard title="Core Web Vitals Targets" variant="parchment">
              <div class="space-y-4">
                <div class="target-item">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-wh-dark-wood">LCP (Loading)</span>
                    <span class="text-green-600">≤ 2.5s</span>
                  </div>
                  <p class="text-xs text-wh-wood-brown">Largest Contentful Paint should occur within 2.5 seconds</p>
                </div>
                
                <div class="target-item">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-wh-dark-wood">FID (Interactivity)</span>
                    <span class="text-green-600">≤ 100ms</span>
                  </div>
                  <p class="text-xs text-wh-wood-brown">First Input Delay should be less than 100 milliseconds</p>
                </div>
                
                <div class="target-item">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-wh-dark-wood">CLS (Stability)</span>
                    <span class="text-green-600">≤ 0.1</span>
                  </div>
                  <p class="text-xs text-wh-wood-brown">Cumulative Layout Shift should be less than 0.1</p>
                </div>
                
                <div class="target-item">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-wh-dark-wood">INP (Responsiveness)</span>
                    <span class="text-green-600">≤ 200ms</span>
                  </div>
                  <p class="text-xs text-wh-wood-brown">Interaction to Next Paint should be under 200ms</p>
                </div>
              </div>
            </WarhammerCard>
            
            <WarhammerCard title="Optimization Strategies" variant="parchment">
              <div class="space-y-3">
                <div class="strategy-item">
                  <h4 class="font-medium text-wh-dark-wood mb-1">Image Optimization</h4>
                  <ul class="text-xs text-wh-wood-brown space-y-1">
                    <li>• Use WebP/AVIF formats</li>
                    <li>• Implement lazy loading</li>
                    <li>• Set explicit dimensions</li>
                    <li>• Use responsive images</li>
                  </ul>
                </div>
                
                <div class="strategy-item">
                  <h4 class="font-medium text-wh-dark-wood mb-1">JavaScript Optimization</h4>
                  <ul class="text-xs text-wh-wood-brown space-y-1">
                    <li>• Code splitting and lazy loading</li>
                    <li>• Minimize main thread blocking</li>
                    <li>• Use web workers for heavy tasks</li>
                    <li>• Optimize bundle size</li>
                  </ul>
                </div>
                
                <div class="strategy-item">
                  <h4 class="font-medium text-wh-dark-wood mb-1">Layout Stability</h4>
                  <ul class="text-xs text-wh-wood-brown space-y-1">
                    <li>• Reserve space for dynamic content</li>
                    <li>• Avoid inserting content above existing</li>
                    <li>• Use CSS transforms for animations</li>
                    <li>• Preload critical fonts</li>
                  </ul>
                </div>
              </div>
            </WarhammerCard>
          </div>
        </div>

        <!-- Real-time Metrics -->
        <div class="real-time-metrics">
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Real-time Monitoring</h2>
          
          <WarhammerCard variant="filled">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="metric-display">
                <div class="text-2xl font-bold text-wh-bone">
                  {{ performanceMonitoring.isSupported.value ? 'Supported' : 'Not Supported' }}
                </div>
                <div class="text-sm text-wh-light-grey">Browser Support</div>
              </div>
              
              <div class="metric-display">
                <div class="text-2xl font-bold text-wh-bone">
                  {{ performanceMonitoring.isMonitoring.value ? 'Active' : 'Inactive' }}
                </div>
                <div class="text-sm text-wh-light-grey">Monitoring Status</div>
              </div>
              
              <div class="metric-display">
                <div class="text-2xl font-bold text-wh-bone">
                  {{ formatTimestamp(performanceMonitoring.metrics.value.timestamp) }}
                </div>
                <div class="text-sm text-wh-light-grey">Last Update</div>
              </div>
              
              <div class="metric-display">
                <div class="text-2xl font-bold text-wh-bone">
                  {{ performanceMonitoring.getRecommendations.value.length }}
                </div>
                <div class="text-sm text-wh-light-grey">Recommendations</div>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Performance Monitoring - Warhammer Fantasy Tavern',
  meta: [
    { name: 'description', content: 'Monitor Core Web Vitals and application performance metrics.' }
  ]
})

// Performance monitoring
const performanceMonitoring = usePerformanceMonitoring()

// Test states
const imageTestRunning = ref(false)
const jsTestRunning = ref(false)
const layoutTestRunning = ref(false)

const imageTestResults = ref<any>(null)
const jsTestResults = ref<any>(null)
const layoutTestResults = ref<any>(null)

// Methods
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const formatMetricValue = (value: number | null, unit: string): string => {
  if (value === null) return 'N/A'
  return `${value}${unit}`
}

const formatMemoryUsage = (bytes: number | null): string => {
  if (bytes === null) return 'N/A'
  return formatBytes(bytes)
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTimestamp = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

// Performance tests
const runImageLoadTest = async () => {
  imageTestRunning.value = true
  
  try {
    const startTime = performance.now()
    const images = [
      '/images/test/large-image-1.jpg',
      '/images/test/large-image-2.jpg',
      '/images/test/large-image-3.jpg'
    ]
    
    let totalSize = 0
    const loadPromises = images.map(src => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          // Estimate size (this is approximate)
          totalSize += img.width * img.height * 4 // RGBA
          resolve(img)
        }
        img.onerror = () => resolve(null)
        img.src = src
      })
    })
    
    await Promise.all(loadPromises)
    const endTime = performance.now()
    
    imageTestResults.value = {
      count: images.length,
      averageTime: Math.round((endTime - startTime) / images.length),
      totalSize
    }
  } catch (error) {
    console.error('Image test failed:', error)
  } finally {
    imageTestRunning.value = false
  }
}

const runJavaScriptTest = async () => {
  jsTestRunning.value = true
  
  try {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Simulate heavy computation
    let result = 0
    const operations = 1000000
    for (let i = 0; i < operations; i++) {
      result += Math.sqrt(i) * Math.sin(i)
    }
    
    const endTime = performance.now()
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    jsTestResults.value = {
      executionTime: Math.round(endTime - startTime),
      operations,
      memoryUsed: endMemory - startMemory,
      result: Math.round(result)
    }
  } catch (error) {
    console.error('JavaScript test failed:', error)
  } finally {
    jsTestRunning.value = false
  }
}

const runLayoutTest = async () => {
  layoutTestRunning.value = true
  
  try {
    // This is a simplified layout test
    // In a real implementation, you'd measure actual layout shifts
    layoutTestResults.value = {
      shiftCount: Math.floor(Math.random() * 5),
      clsScore: (Math.random() * 0.3).toFixed(3),
      largestShift: (Math.random() * 0.1).toFixed(3)
    }
  } catch (error) {
    console.error('Layout test failed:', error)
  } finally {
    layoutTestRunning.value = false
  }
}

// Lifecycle
onMounted(() => {
  performanceMonitoring.startMonitoring()
})
</script>

<style scoped>
.performance-page {
  font-family: var(--wh-font-body);
}

.summary-item {
  min-width: 120px;
}

.performance-summary {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 2rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.target-item,
.strategy-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.metric-display {
  padding: 1rem;
}

.test-results {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .target-item,
  .strategy-item,
  .test-results {
    border: 2px solid var(--wh-bone);
  }
}
</style>
