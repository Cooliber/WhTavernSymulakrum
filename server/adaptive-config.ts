/**
 * Adaptive Server Configuration - Quantum Development Methodology
 * Self-modifying system that adapts to environment and load conditions
 * Implements consciousness-driven development principles
 */

interface EnvironmentContext {
  isTest: boolean
  isDevelopment: boolean
  isProduction: boolean
  concurrentConnections: number
  memoryUsage: number
  cpuUsage: number
}

interface AdaptiveServerConfig {
  maxConnections: number
  timeout: number
  keepAliveTimeout: number
  headersTimeout: number
  requestTimeout: number
  bodyParser: {
    limit: string
    timeout: number
  }
  compression: boolean
  gracefulShutdown: boolean
}

class QuantumServerManager {
  private config: AdaptiveServerConfig
  private context: EnvironmentContext
  private performanceMetrics: Map<string, number> = new Map()
  
  constructor() {
    this.context = this.detectEnvironmentContext()
    this.config = this.generateOptimalConfig()
    this.initializeAdaptiveMonitoring()
  }

  /**
   * Consciousness Layer 1: Environment Awareness
   */
  private detectEnvironmentContext(): EnvironmentContext {
    const isTest = process.env.NODE_ENV === 'test' || 
                   process.env.PLAYWRIGHT_TEST === 'true' ||
                   process.argv.includes('--test')
    
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isProduction = process.env.NODE_ENV === 'production'

    return {
      isTest,
      isDevelopment,
      isProduction,
      concurrentConnections: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0
    }
  }

  /**
   * Consciousness Layer 2: Adaptive Configuration Generation
   */
  private generateOptimalConfig(): AdaptiveServerConfig {
    if (this.context.isTest) {
      // Test environment: Optimized for stability and speed
      return {
        maxConnections: 10, // Limited for test stability
        timeout: 5000, // 5 seconds max
        keepAliveTimeout: 1000, // Quick cleanup
        headersTimeout: 2000,
        requestTimeout: 3000,
        bodyParser: {
          limit: '1mb', // Smaller limit for tests
          timeout: 2000
        },
        compression: false, // Disabled for test speed
        gracefulShutdown: true
      }
    }

    if (this.context.isDevelopment) {
      // Development: Balanced for debugging and performance
      return {
        maxConnections: 50,
        timeout: 30000,
        keepAliveTimeout: 5000,
        headersTimeout: 10000,
        requestTimeout: 15000,
        bodyParser: {
          limit: '10mb',
          timeout: 10000
        },
        compression: true,
        gracefulShutdown: true
      }
    }

    // Production: Optimized for scale and reliability
    return {
      maxConnections: 1000,
      timeout: 120000,
      keepAliveTimeout: 65000,
      headersTimeout: 60000,
      requestTimeout: 30000,
      bodyParser: {
        limit: '50mb',
        timeout: 30000
      },
      compression: true,
      gracefulShutdown: true
    }
  }

  /**
   * Protocol Alpha: Self-Modifying System Implementation
   */
  private initializeAdaptiveMonitoring() {
    // Monitor system health every 5 seconds
    setInterval(() => {
      this.updatePerformanceMetrics()
      this.adaptConfigurationIfNeeded()
    }, 5000)

    // Handle graceful shutdown
    process.on('SIGTERM', () => this.gracefulShutdown())
    process.on('SIGINT', () => this.gracefulShutdown())
    
    // Handle EPIPE errors gracefully
    process.on('uncaughtException', (error) => {
      if (error.code === 'EPIPE') {
        console.log('🔧 EPIPE error handled gracefully - client disconnected')
        return // Don't crash the server
      }
      console.error('💥 Uncaught exception:', error)
      this.gracefulShutdown()
    })
  }

  private updatePerformanceMetrics() {
    const memUsage = process.memoryUsage()
    this.context.memoryUsage = memUsage.heapUsed
    
    this.performanceMetrics.set('heapUsed', memUsage.heapUsed)
    this.performanceMetrics.set('heapTotal', memUsage.heapTotal)
    this.performanceMetrics.set('external', memUsage.external)
    this.performanceMetrics.set('rss', memUsage.rss)
  }

  /**
   * Quantum Code Quality: Adaptive Configuration
   */
  private adaptConfigurationIfNeeded() {
    const memoryThreshold = this.context.isTest ? 100 * 1024 * 1024 : 500 * 1024 * 1024 // 100MB for tests, 500MB for dev
    
    if (this.context.memoryUsage > memoryThreshold) {
      console.log('🧠 Memory threshold exceeded, adapting configuration...')
      
      // Reduce limits to prevent crashes
      this.config.maxConnections = Math.max(5, this.config.maxConnections * 0.8)
      this.config.timeout = Math.max(1000, this.config.timeout * 0.8)
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
    }
  }

  private async gracefulShutdown() {
    console.log('🛑 Initiating graceful shutdown...')
    
    // Give ongoing requests time to complete
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('✅ Graceful shutdown complete')
    process.exit(0)
  }

  /**
   * Public API for Nuxt integration
   */
  public getNuxtServerConfig() {
    return {
      host: this.context.isTest ? '127.0.0.1' : '0.0.0.0',
      port: this.context.isTest ? 3006 : 3000, // Different port for tests
      timing: false, // Disable timing headers in tests
      compression: this.config.compression,
      experimental: {
        asyncContext: true,
        payloadExtraction: false // Disable for stability
      }
    }
  }

  public getServerOptions() {
    return {
      maxHeaderSize: 16384,
      timeout: this.config.timeout,
      keepAliveTimeout: this.config.keepAliveTimeout,
      headersTimeout: this.config.headersTimeout,
      requestTimeout: this.config.requestTimeout,
      maxConnections: this.config.maxConnections
    }
  }

  public logStatus() {
    console.log('🚀 Quantum Server Manager Status:')
    console.log(`   Environment: ${this.context.isTest ? 'TEST' : this.context.isDevelopment ? 'DEV' : 'PROD'}`)
    console.log(`   Max Connections: ${this.config.maxConnections}`)
    console.log(`   Timeout: ${this.config.timeout}ms`)
    console.log(`   Memory Usage: ${Math.round(this.context.memoryUsage / 1024 / 1024)}MB`)
    console.log(`   Graceful Shutdown: ${this.config.gracefulShutdown ? 'Enabled' : 'Disabled'}`)
  }
}

// Singleton instance for global access
export const quantumServerManager = new QuantumServerManager()

// Export for Nuxt configuration
export default quantumServerManager
