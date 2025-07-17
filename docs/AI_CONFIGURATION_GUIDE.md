# AI Configuration Guide - Warhammer Tavern v3

## Overview

The Warhammer Tavern v3 features a sophisticated multi-agent AI system powered by Groq and Cerebras APIs. This guide covers setup, configuration, and usage of the AI-powered conversation system.

## Table of Contents

1. [API Setup](#api-setup)
2. [Environment Configuration](#environment-configuration)
3. [AI Service Architecture](#ai-service-architecture)
4. [Agent Configuration](#agent-configuration)
5. [Performance Monitoring](#performance-monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Features](#advanced-features)

## API Setup

### Groq API

1. **Get API Key**
   - Visit [Groq Console](https://console.groq.com/)
   - Create an account or sign in
   - Navigate to API Keys section
   - Generate a new API key

2. **Supported Models**
   - `llama-3.3-70b-versatile` (recommended for conversations)
   - `llama-3.1-8b-instant` (faster responses)
   - `mixtral-8x7b-32768` (longer context)

### Cerebras API

1. **Get API Key**
   - Visit [Cerebras Cloud](https://cloud.cerebras.ai/)
   - Create an account or sign in
   - Access API credentials
   - Generate API key

2. **Supported Models**
   - `llama-4-scout-17b-16e-instruct` (recommended)
   - `llama-3.1-8b` (faster alternative)

## Environment Configuration

### Required Environment Variables

Create a `.env` file in your project root:

```bash
# AI API Configuration
GROQ_API_KEY=your_groq_api_key_here
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Optional: Custom API endpoints
GROQ_API_BASE=https://api.groq.com/openai/v1
CEREBRAS_API_BASE=https://api.cerebras.ai/v1

# Application Configuration
NUXT_SESSION_PASSWORD=a-random-password-with-at-least-32-characters

# Performance Configuration
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
CACHE_TTL=3600

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### Netlify Deployment

For Netlify deployment, set environment variables in your Netlify dashboard:

1. Go to Site Settings → Environment Variables
2. Add the following variables:
   - `GROQ_API_KEY`
   - `CEREBRAS_API_KEY`
   - `NUXT_SESSION_PASSWORD`
   - `NODE_ENV=production`
   - `NITRO_PRESET=netlify`

## AI Service Architecture

### Unified AI Service

The `useUnifiedAIService` composable provides:

- **Provider Management**: Automatic switching between Groq and Cerebras
- **Fallback System**: Graceful degradation when APIs fail
- **Load Balancing**: Distributes requests across providers
- **Error Handling**: Comprehensive error recovery
- **Performance Monitoring**: Real-time metrics tracking

### Key Features

```typescript
const { generateCompletion, healthCheck, switchProvider } = useUnifiedAIService()

// Generate AI response with automatic provider selection
const response = await generateCompletion([
  { role: 'user', content: 'Hello!' }
], {
  preferredProvider: 'groq',
  maxTokens: 150,
  temperature: 0.8
})

// Check API health
const health = await healthCheck()
console.log(health.overall) // 'healthy', 'partial', or 'unhealthy'
```

## Agent Configuration

### Agent Personality System

Each Warhammer agent has a detailed personality profile:

```typescript
interface AgentPersonality {
  traits: string[]           // ['honorable', 'brave', 'loyal']
  conversationStyle: string  // 'formal', 'casual', 'gruff'
  mood: string              // 'determined', 'cheerful', 'suspicious'
  intelligence: number      // 1-10 scale
  charisma: number         // 1-10 scale
}
```

### Available Agents

1. **Sir Marcus Ironforge** (Empire Knight)
   - Honorable, formal speech
   - Expert in combat and politics
   - Uses Sigmar references

2. **Grimjaw Ironbeard** (Dwarf Warrior)
   - Gruff, direct communication
   - Knowledge of crafting and grudges
   - Traditional dwarf expressions

3. **Elara Moonwhisper** (High Elf Mage)
   - Elegant, mystical speech
   - Magic and ancient lore expert
   - Elven wisdom and perspective

4. **Valdris the Vigilant** (Witch Hunter)
   - Suspicious, intense personality
   - Corruption detection specialist
   - Religious fervor and paranoia

### Customizing Agent Responses

Agents use dynamic system prompts based on their profiles:

```typescript
const systemPrompt = `You are ${agent.name}, a ${agent.species} ${agent.career}.

PERSONALITY:
- Traits: ${personality.traits.join(', ')}
- Style: ${personality.conversationStyle}
- Mood: ${personality.mood}

INSTRUCTIONS:
- Stay in character
- Use Warhammer Fantasy lore
- Keep responses 1-3 sentences
- Reference your background when relevant`
```

## Performance Monitoring

### Metrics Tracking

The system automatically tracks:

- **Response Times**: Per provider and overall
- **Success Rates**: API call success/failure ratios
- **Token Usage**: Consumption tracking
- **Error Rates**: Failure analysis
- **Provider Health**: Real-time status monitoring

### Accessing Metrics

```typescript
const { providerStats, overallStats, getProviderHealth } = usePerformanceMonitoring()

// Get provider statistics
console.log(providerStats.value)
// Output: { groq: { successRate: 98.5, avgResponseTime: 850 }, ... }

// Check provider health
const health = getProviderHealth('groq')
console.log(health) // 'healthy', 'degraded', or 'unhealthy'
```

### Performance Thresholds

- **Healthy**: >95% success rate, <2s response time
- **Degraded**: >80% success rate, <5s response time
- **Unhealthy**: <80% success rate or >5s response time

## Troubleshooting

### Common Issues

#### 1. API Key Errors

**Problem**: `401 Unauthorized` or `API key not configured`

**Solutions**:
- Verify API keys are correctly set in environment variables
- Check for typos in key values
- Ensure keys have proper permissions
- Test keys directly with API providers

#### 2. Rate Limiting

**Problem**: `429 Too Many Requests`

**Solutions**:
- Implement request queuing
- Increase rate limit windows
- Use multiple API keys (if allowed)
- Switch to alternative provider

#### 3. Slow Response Times

**Problem**: Responses taking >5 seconds

**Solutions**:
- Check network connectivity
- Monitor provider status pages
- Reduce max_tokens parameter
- Use faster models (e.g., 8B instead of 70B)

#### 4. Memory Issues

**Problem**: High memory usage or crashes

**Solutions**:
- Clear conversation history periodically
- Limit concurrent requests
- Reduce context window size
- Implement conversation pruning

### Debug Mode

Enable debug logging:

```bash
DEBUG=ai:* npm run dev
```

This will log:
- API requests and responses
- Provider switching decisions
- Error details and stack traces
- Performance metrics

## Advanced Features

### Conversation Memory

The system maintains persistent memory for each agent:

```typescript
const { recordInteraction, getConversationContext } = useConversationMemory()

// Record conversation
recordInteraction('marcus', 'Hello there!', 'Greetings, friend!')

// Get context for future interactions
const context = getConversationContext('marcus')
// Includes relationship score, conversation style, and history
```

### Streaming Responses

Enable real-time response streaming:

```typescript
const response = await generateCompletion(messages, {
  stream: true,
  onChunk: (chunk) => {
    console.log('Received:', chunk)
    // Update UI with partial response
  }
})
```

### Custom Provider Configuration

Add custom AI providers:

```typescript
const customProvider: AIProvider = {
  name: 'custom',
  baseUrl: 'https://api.custom-ai.com/v1',
  model: 'custom-model',
  apiKey: 'custom-key'
}

// Register provider
config.value.providers.push(customProvider)
```

### Batch Processing

Process multiple conversations simultaneously:

```typescript
const conversations = [
  { agent: 'marcus', message: 'Hello' },
  { agent: 'grimjaw', message: 'How are you?' }
]

const responses = await Promise.all(
  conversations.map(conv => 
    generateCompletion([{ role: 'user', content: conv.message }], {
      agentId: conv.agent
    })
  )
)
```

## API Reference

### useUnifiedAIService()

Main AI service composable.

**Returns:**
- `generateCompletion(messages, options)`: Generate AI response
- `healthCheck()`: Check API health status
- `switchProvider(provider)`: Manually switch provider
- `getProviderStats()`: Get performance statistics
- `isInitialized`: Reactive initialization status

### useConversationMemory()

Conversation memory management.

**Returns:**
- `recordInteraction(agentId, userMessage, agentResponse)`: Save interaction
- `getConversationContext(agentId)`: Get agent's memory context
- `getAgentMemory(agentId)`: Get full agent memory
- `clearAgentMemory(agentId)`: Reset agent memory

### usePerformanceMonitoring()

Performance tracking and monitoring.

**Returns:**
- `recordAPICall(provider, operation, apiCall)`: Track API call
- `getProviderHealth(provider)`: Get provider health status
- `providerStats`: Reactive provider statistics
- `overallStats`: Reactive overall statistics

## Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Monitor usage for anomalies

2. **Performance Optimization**
   - Cache frequent responses
   - Use appropriate model sizes
   - Implement request queuing
   - Monitor response times

3. **Error Handling**
   - Always implement fallbacks
   - Log errors for debugging
   - Provide user-friendly error messages
   - Test failure scenarios

4. **Memory Management**
   - Limit conversation history
   - Clear unused agent memories
   - Monitor memory usage
   - Implement cleanup routines

5. **User Experience**
   - Show typing indicators
   - Stream responses when possible
   - Handle network interruptions
   - Provide offline fallbacks

## Support

For additional support:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review API provider documentation
3. Monitor system logs for errors
4. Test with minimal configurations

## Changelog

### v3.0.0
- Initial multi-agent AI system
- Groq and Cerebras integration
- Performance monitoring
- Conversation memory
- Netlify deployment support