/**
 * Cerebras API Server Endpoint
 * Handles chat completions using Cerebras's API with streaming support
 */

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)
    
    // Validate API key
    if (!config.cerebrasApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Cerebras API key not configured'
      })
    }
    
    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: messages array required'
      })
    }
    
    // Prepare request to Cerebras API
    const cerebrasRequest = {
      model: body.model || 'llama-4-scout-17b-16e-instruct',
      messages: body.messages,
      max_tokens: body.max_tokens || 1024,
      temperature: body.temperature || 0.7,
      stream: body.stream || false,
      stop: body.stop || null
    }
    
    // Call Cerebras API
    const response = await fetch(`${config.cerebrasApiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.cerebrasApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Warhammer-Tavern-v3/1.0'
      },
      body: JSON.stringify(cerebrasRequest)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cerebras API Error:', response.status, errorText)
      
      throw createError({
        statusCode: response.status,
        statusMessage: `Cerebras API error: ${response.statusText}`,
        data: { error: errorText }
      })
    }
    
    // Handle streaming response
    if (body.stream) {
      setHeader(event, 'Content-Type', 'text/event-stream')
      setHeader(event, 'Cache-Control', 'no-cache')
      setHeader(event, 'Connection', 'keep-alive')
      
      // Stream the response
      const reader = response.body?.getReader()
      if (!reader) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to get response stream'
        })
      }
      
      return sendStream(event, async (stream) => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = new TextDecoder().decode(value)
            stream.write(chunk)
          }
        } catch (error) {
          console.error('Streaming error:', error)
        } finally {
          reader.releaseLock()
        }
      })
    }
    
    // Handle regular response
    const data = await response.json()
    
    // Add metadata
    const responseData = {
      ...data,
      provider: 'cerebras',
      timestamp: new Date().toISOString(),
      model_used: cerebrasRequest.model
    }
    
    return responseData
    
  } catch (error) {
    console.error('Cerebras endpoint error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: { error: error.message }
    })
  }
})