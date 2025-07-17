import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Import the composables we're testing
import { useUnifiedAIService } from '../composables/useUnifiedAIService'
import { useConversationMemory } from '../composables/useConversationMemory'
import { usePerformanceMonitoring } from '../composables/usePerformanceMonitoring'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock runtime config
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    groqApiKey: 'test-groq-key',
    cerebrasApiKey: 'test-cerebras-key',
    groqApiBase: 'https://api.groq.com/openai/v1',
    cerebrasApiBase: 'https://api.cerebras.ai/v1'
  })
}))

describe('AI Integration Tests', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Unified AI Service', () => {
    it('should initialize with correct configuration', () => {
      const { config, isInitialized } = useUnifiedAIService()
      
      expect(isInitialized.value).toBe(true)
      expect(config.value.providers).toHaveLength(2)
      expect(config.value.providers.some(p => p.name === 'groq')).toBe(true)
      expect(config.value.providers.some(p => p.name === 'cerebras')).toBe(true)
    })

    it('should generate completions using Groq API', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'By Sigmar\'s hammer, that\'s a fine question!'
          }
        }],
        usage: { total_tokens: 25 },
        model: 'llama-3.3-70b-versatile'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { generateCompletion } = useUnifiedAIService()
      
      const result = await generateCompletion([
        { role: 'user', content: 'Tell me about the Empire' }
      ], {
        preferredProvider: 'groq',
        maxTokens: 100
      })

      expect(result.content).toContain('Sigmar')
      expect(result.provider).toBe('groq')
      expect(result.tokens).toBe(25)
    })

    it('should generate completions using Cerebras API', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'The winds of magic flow through all things...'
          }
        }],
        usage: { total_tokens: 30 },
        model: 'llama-4-scout-17b-16e-instruct'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { generateCompletion } = useUnifiedAIService()
      
      const result = await generateCompletion([
        { role: 'user', content: 'Tell me about magic' }
      ], {
        preferredProvider: 'cerebras',
        maxTokens: 100
      })

      expect(result.content).toContain('magic')
      expect(result.provider).toBe('cerebras')
      expect(result.tokens).toBe(30)
    })

    it('should fallback to alternative provider on failure', async () => {
      // Mock Groq failure, Cerebras success
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Rate Limited'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Fallback response' } }],
            usage: { total_tokens: 15 }
          })
        })

      const { generateCompletion } = useUnifiedAIService()
      
      const result = await generateCompletion([
        { role: 'user', content: 'Test message' }
      ], {
        preferredProvider: 'groq'
      })

      expect(result.content).toBe('Fallback response')
      expect(result.provider).toBe('cerebras')
    })

    it('should handle streaming responses', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      })

      const { generateCompletion } = useUnifiedAIService()
      
      const result = await generateCompletion([
        { role: 'user', content: 'Stream test' }
      ], {
        stream: true
      })

      expect(result.content).toContain('Hello world')
    })

    it('should perform health checks', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'ping' } }]
          })
        })

      const { healthCheck } = useUnifiedAIService()
      
      const health = await healthCheck()
      
      expect(health.overall).toBe('healthy')
      expect(health.services.groq.available).toBe(true)
      expect(health.services.cerebras.available).toBe(true)
    })
  })

  describe('Conversation Memory', () => {
    it('should record interactions', () => {
      const { recordInteraction, getAgentMemory } = useConversationMemory()
      
      recordInteraction('marcus', 'Hello there!', 'Greetings, friend!')
      
      const memory = getAgentMemory('marcus')
      expect(memory.interactions).toHaveLength(1)
      expect(memory.interactions[0].playerMessage).toBe('Hello there!')
      expect(memory.interactions[0].agentResponse).toBe('Greetings, friend!')
    })

    it('should analyze sentiment correctly', () => {
      const { recordInteraction, getAgentMemory } = useConversationMemory()
      
      // Positive interaction
      recordInteraction('marcus', 'You are amazing!', 'Thank you!')
      let memory = getAgentMemory('marcus')
      expect(memory.relationshipScore).toBeGreaterThan(0)
      
      // Negative interaction
      recordInteraction('marcus', 'I hate this!', 'I apologize...')
      memory = getAgentMemory('marcus')
      expect(memory.interactions[1].sentiment).toBe('negative')
    })

    it('should extract topics from messages', () => {
      const { recordInteraction, getAgentMemory } = useConversationMemory()
      
      recordInteraction('marcus', 'Tell me about combat and magic', 'Combat requires skill...')
      
      const memory = getAgentMemory('marcus')
      const interaction = memory.interactions[0]
      expect(interaction.topics).toContain('combat')
      expect(interaction.topics).toContain('magic')
    })

    it('should build conversation context', () => {
      const { recordInteraction, getConversationContext } = useConversationMemory()
      
      recordInteraction('marcus', 'Hello', 'Greetings!')
      recordInteraction('marcus', 'How are you?', 'I am well, thank you.')
      
      const context = getConversationContext('marcus')
      expect(context).toContain('Hello')
      expect(context).toContain('How are you?')
      expect(context).toContain('relationship')
    })

    it('should update conversation style based on relationship', () => {
      const { recordInteraction, getAgentMemory } = useConversationMemory()
      
      // Multiple positive interactions
      for (let i = 0; i < 15; i++) {
        recordInteraction('marcus', 'You are great!', 'Thank you!')
      }
      
      const memory = getAgentMemory('marcus')
      expect(memory.conversationStyle).toBe('friendly')
      expect(memory.relationshipScore).toBeGreaterThan(50)
    })

    it('should limit interaction history', () => {
      const { recordInteraction, getAgentMemory } = useConversationMemory()
      
      // Add more than 50 interactions
      for (let i = 0; i < 60; i++) {
        recordInteraction('marcus', `Message ${i}`, `Response ${i}`)
      }
      
      const memory = getAgentMemory('marcus')
      expect(memory.interactions).toHaveLength(50)
      expect(memory.interactions[0].playerMessage).toBe('Message 10') // Should keep last 50
    })
  })

  describe('Performance Monitoring', () => {
    it('should record API call metrics', async () => {
      const { recordAPICall, metrics } = usePerformanceMonitoring()
      
      const mockApiCall = vi.fn().mockResolvedValue('success')
      
      await recordAPICall('groq', 'chat_completion', mockApiCall, 'llama-3.3-70b-versatile')
      
      expect(metrics.value).toHaveLength(1)
      expect(metrics.value[0].provider).toBe('groq')
      expect(metrics.value[0].operation).toBe('chat_completion')
      expect(metrics.value[0].success).toBe(true)
      expect(metrics.value[0].model).toBe('llama-3.3-70b-versatile')
    })

    it('should record failed API calls', async () => {
      const { recordAPICall, metrics } = usePerformanceMonitoring()
      
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'))
      
      try {
        await recordAPICall('cerebras', 'chat_completion', mockApiCall)
      } catch (error) {
        // Expected to throw
      }
      
      expect(metrics.value).toHaveLength(1)
      expect(metrics.value[0].success).toBe(false)
      expect(metrics.value[0].error).toBe('API Error')
    })

    it('should calculate provider statistics', () => {
      const { recordMetric, providerStats } = usePerformanceMonitoring()
      
      // Record some metrics
      recordMetric({
        provider: 'groq',
        operation: 'chat_completion',
        responseTime: 1000,
        success: true,
        tokenCount: 25
      })
      
      recordMetric({
        provider: 'groq',
        operation: 'chat_completion',
        responseTime: 1500,
        success: false,
        error: 'Rate limited'
      })
      
      const stats = providerStats.value
      const groqStats = stats.find(s => s.provider === 'groq')
      
      expect(groqStats).toBeDefined()
      expect(groqStats!.totalRequests).toBe(2)
      expect(groqStats!.successfulRequests).toBe(1)
      expect(groqStats!.failedRequests).toBe(1)
      expect(groqStats!.uptime).toBe(50)
    })

    it('should calculate response time percentiles', () => {
      const { recordMetric, getResponseTimePercentiles } = usePerformanceMonitoring()
      
      // Record metrics with various response times
      const responseTimes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      responseTimes.forEach(time => {
        recordMetric({
          provider: 'groq',
          operation: 'chat_completion',
          responseTime: time,
          success: true
        })
      })
      
      const percentiles = getResponseTimePercentiles('groq')
      
      expect(percentiles.p50).toBe(500)
      expect(percentiles.p90).toBe(900)
      expect(percentiles.p95).toBe(950)
    })

    it('should determine provider health', () => {
      const { recordMetric, getProviderHealth } = usePerformanceMonitoring()
      
      // Record healthy metrics
      for (let i = 0; i < 10; i++) {
        recordMetric({
          provider: 'groq',
          operation: 'chat_completion',
          responseTime: 1000,
          success: true
        })
      }
      
      expect(getProviderHealth('groq')).toBe('healthy')
      
      // Record some failures
      for (let i = 0; i < 5; i++) {
        recordMetric({
          provider: 'cerebras',
          operation: 'chat_completion',
          responseTime: 5000,
          success: false
        })
      }
      
      expect(getProviderHealth('cerebras')).toBe('unhealthy')
    })

    it('should export and import metrics', () => {
      const { recordMetric, exportMetrics, importMetrics, metrics } = usePerformanceMonitoring()
      
      recordMetric({
        provider: 'groq',
        operation: 'chat_completion',
        responseTime: 1000,
        success: true
      })
      
      const exported = exportMetrics()
      expect(exported).toContain('groq')
      
      // Clear metrics and import
      metrics.value.length = 0
      const imported = importMetrics(exported)
      
      expect(imported).toBe(true)
      expect(metrics.value).toHaveLength(1)
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete conversation flow', async () => {
      const { generateCompletion } = useUnifiedAIService()
      const { recordInteraction, getConversationContext } = useConversationMemory()
      const { recordAPICall } = usePerformanceMonitoring()
      
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'By Sigmar, well met!' } }],
          usage: { total_tokens: 20 }
        })
      })
      
      // Simulate conversation
      const userMessage = 'Hello, Sir Marcus!'
      
      const response = await recordAPICall('groq', 'chat_completion', async () => {
        return await generateCompletion([
          { role: 'user', content: userMessage }
        ])
      })
      
      recordInteraction('marcus', userMessage, response.content)
      
      const context = getConversationContext('marcus')
      
      expect(response.content).toContain('Sigmar')
      expect(context).toContain('Hello, Sir Marcus!')
    })

    it('should handle error recovery across services', async () => {
      const { generateCompletion } = useUnifiedAIService()
      const { recordInteraction } = useConversationMemory()
      
      // Mock API failure then success
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Fallback response' } }]
          })
        })
      
      const response = await generateCompletion([
        { role: 'user', content: 'Test error recovery' }
      ])
      
      recordInteraction('marcus', 'Test error recovery', response.content)
      
      expect(response.content).toBe('Fallback response')
    })

    it('should maintain performance under load', async () => {
      const { generateCompletion } = useUnifiedAIService()
      const { recordAPICall } = usePerformanceMonitoring()
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Load test response' } }]
        })
      })
      
      // Simulate concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        recordAPICall('groq', 'chat_completion', async () => {
          return await generateCompletion([
            { role: 'user', content: `Load test ${i}` }
          ])
        })
      )
      
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      
      expect(successful).toBeGreaterThan(8) // Allow for some failures under load
    })
  })
})