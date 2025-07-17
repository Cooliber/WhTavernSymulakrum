/**
 * Groq API Server Endpoint
 * Handles chat completions using Groq's API with streaming support
 */

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)
    
    // Validate API key
    if (!config.groqApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Groq API key not configured'
      })
    }
    
    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: messages array required'
      })
    }
    
    // Prepare request to Groq API
    const groqRequest = {
      model: body.model || 'llama-3.3-70b-versatile',
      messages: body.messages,
      max_tokens: body.max_tokens || 1024,
      temperature: body.temperature || 0.7,
      stream: body.stream || false,
      stop: body.stop || null
    }
    
    // Call Groq API
    const response = await fetch(`${config.groqApiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Warhammer-Tavern-v3/1.0'
      },
      body: JSON.stringify(groqRequest)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API Error:', response.status, errorText)
      
      throw createError({
        statusCode: response.status,
        statusMessage: `Groq API error: ${response.statusText}`,
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
      provider: 'groq',
      timestamp: new Date().toISOString(),
      model_used: groqRequest.model
    }
    
    return responseData
    
  } catch (error) {
    console.error('Groq endpoint error:', error)
    
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