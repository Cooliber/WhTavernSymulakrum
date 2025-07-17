/**
 * AI Services Health Check Endpoint
 * Tests connectivity and availability of Groq and Cerebras APIs
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {
      groq: {
        configured: !!config.groqApiKey,
        available: false,
        latency: null as number | null,
        error: null as string | null
      },
      cerebras: {
        configured: !!config.cerebrasApiKey,
        available: false,
        latency: null as number | null,
        error: null as string | null
      }
    },
    overall: 'unhealthy' as 'healthy' | 'partial' | 'unhealthy'
  }
  
  // Test Groq API
  if (config.groqApiKey) {
    try {
      const startTime = Date.now()
      
      const response = await fetch(`${config.groqApiBase}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'User-Agent': 'Warhammer-Tavern-v3/1.0'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      healthStatus.services.groq.latency = Date.now() - startTime
      
      if (response.ok) {
        healthStatus.services.groq.available = true
      } else {
        healthStatus.services.groq.error = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      healthStatus.services.groq.error = error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  // Test Cerebras API
  if (config.cerebrasApiKey) {
    try {
      const startTime = Date.now()
      
      // Cerebras doesn't have a models endpoint, so we'll test with a minimal chat completion
      const response = await fetch(`${config.cerebrasApiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.cerebrasApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Warhammer-Tavern-v3/1.0'
        },
        body: JSON.stringify({
          model: 'llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      healthStatus.services.cerebras.latency = Date.now() - startTime
      
      if (response.ok) {
        healthStatus.services.cerebras.available = true
      } else {
        healthStatus.services.cerebras.error = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      healthStatus.services.cerebras.error = error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  // Determine overall health
  const availableServices = Object.values(healthStatus.services).filter(s => s.available).length
  const configuredServices = Object.values(healthStatus.services).filter(s => s.configured).length
  
  if (availableServices === configuredServices && configuredServices > 0) {
    healthStatus.overall = 'healthy'
  } else if (availableServices > 0) {
    healthStatus.overall = 'partial'
  } else {
    healthStatus.overall = 'unhealthy'
  }
  
  // Set appropriate HTTP status
  if (healthStatus.overall === 'unhealthy') {
    setResponseStatus(event, 503)
  } else if (healthStatus.overall === 'partial') {
    setResponseStatus(event, 206)
  }
  
  return healthStatus
})