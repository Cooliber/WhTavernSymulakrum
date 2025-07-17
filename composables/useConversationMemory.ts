/**
 * Conversation Memory Composable
 * Manages agent memory, context, and conversation history for AI interactions
 */

import { ref, readonly } from 'vue'

export interface AgentMemory {
  agentId: string
  playerId: string
  interactions: ConversationInteraction[]
  relationshipScore: number
  lastInteraction: Date
  personalityNotes: string[]
  topicPreferences: Record<string, number>
  conversationStyle: 'friendly' | 'formal' | 'hostile' | 'neutral'
}

export interface ConversationInteraction {
  id: string
  timestamp: Date
  playerMessage: string
  agentResponse: string
  sentiment: 'positive' | 'negative' | 'neutral'
  topics: string[]
  context: string
}

export const useConversationMemory = () => {
  // State
  const agentMemories = ref<Map<string, AgentMemory>>(new Map())
  const conversationContext = ref<string>('')
  const isLoading = ref(false)

  // Load memories from storage
  const loadMemories = () => {
    if (!process.client) return
    
    try {
      const stored = localStorage.getItem('agent_memories')
      if (stored) {
        const memoriesData = JSON.parse(stored)
        
        // Convert plain objects back to Map with proper Date objects
        Object.entries(memoriesData).forEach(([key, memory]: [string, any]) => {
          memory.lastInteraction = new Date(memory.lastInteraction)
          memory.interactions.forEach((interaction: any) => {
            interaction.timestamp = new Date(interaction.timestamp)
          })
          agentMemories.value.set(key, memory)
        })
        
        console.log(`🧠 Loaded memories for ${agentMemories.value.size} agents`)
      }
    } catch (error) {
      console.error('Failed to load agent memories:', error)
    }
  }

  // Save memories to storage
  const saveMemories = () => {
    if (!process.client) return
    
    try {
      const memoriesData = Object.fromEntries(agentMemories.value)
      localStorage.setItem('agent_memories', JSON.stringify(memoriesData))
    } catch (error) {
      console.error('Failed to save agent memories:', error)
    }
  }

  // Get or create agent memory
  const getAgentMemory = (agentId: string, playerId: string = 'default'): AgentMemory => {
    const memoryKey = `${agentId}_${playerId}`
    
    if (!agentMemories.value.has(memoryKey)) {
      const newMemory: AgentMemory = {
        agentId,
        playerId,
        interactions: [],
        relationshipScore: 0,
        lastInteraction: new Date(),
        personalityNotes: [],
        topicPreferences: {},
        conversationStyle: 'neutral'
      }
      
      agentMemories.value.set(memoryKey, newMemory)
    }
    
    return agentMemories.value.get(memoryKey)!
  }

  // Record a new interaction
  const recordInteraction = (
    agentId: string,
    playerMessage: string,
    agentResponse: string,
    playerId: string = 'default'
  ) => {
    const memory = getAgentMemory(agentId, playerId)
    
    // Analyze sentiment and topics
    const sentiment = analyzeSentiment(playerMessage)
    const topics = extractTopics(playerMessage)
    
    const interaction: ConversationInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      playerMessage,
      agentResponse,
      sentiment,
      topics,
      context: conversationContext.value
    }
    
    memory.interactions.push(interaction)
    memory.lastInteraction = new Date()
    
    // Update relationship score based on sentiment
    updateRelationshipScore(memory, sentiment)
    
    // Update topic preferences
    updateTopicPreferences(memory, topics, sentiment)
    
    // Update conversation style
    updateConversationStyle(memory)
    
    // Keep only last 50 interactions to prevent memory bloat
    if (memory.interactions.length > 50) {
      memory.interactions = memory.interactions.slice(-50)
    }
    
    saveMemories()
  }

  // Get conversation context for an agent
  const getConversationContext = (agentId: string, playerId: string = 'default'): string => {
    const memory = getAgentMemory(agentId, playerId)
    
    if (memory.interactions.length === 0) {
      return `This is your first conversation with the player.`
    }
    
    const recentInteractions = memory.interactions.slice(-5)
    const relationshipDescription = getRelationshipDescription(memory.relationshipScore)
    const styleDescription = getStyleDescription(memory.conversationStyle)
    
    let context = `Relationship with player: ${relationshipDescription} (score: ${memory.relationshipScore})\n`
    context += `Your conversation style with them: ${styleDescription}\n`
    
    if (memory.personalityNotes.length > 0) {
      context += `Notes about the player: ${memory.personalityNotes.slice(-3).join(', ')}\n`
    }
    
    if (recentInteractions.length > 0) {
      context += `\nRecent conversation history:\n`
      recentInteractions.forEach((interaction, index) => {
        context += `${index + 1}. Player: "${interaction.playerMessage}"\n`
        context += `   You: "${interaction.agentResponse}"\n`
      })
    }
    
    return context
  }

  // Add personality note about the player
  const addPersonalityNote = (agentId: string, note: string, playerId: string = 'default') => {
    const memory = getAgentMemory(agentId, playerId)
    
    if (!memory.personalityNotes.includes(note)) {
      memory.personalityNotes.push(note)
      
      // Keep only last 10 notes
      if (memory.personalityNotes.length > 10) {
        memory.personalityNotes = memory.personalityNotes.slice(-10)
      }
      
      saveMemories()
    }
  }

  // Get agent's preferred topics
  const getPreferredTopics = (agentId: string, playerId: string = 'default'): string[] => {
    const memory = getAgentMemory(agentId, playerId)
    
    return Object.entries(memory.topicPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)
  }

  // Clear memory for an agent
  const clearAgentMemory = (agentId: string, playerId: string = 'default') => {
    const memoryKey = `${agentId}_${playerId}`
    agentMemories.value.delete(memoryKey)
    saveMemories()
  }

  // Clear all memories
  const clearAllMemories = () => {
    agentMemories.value.clear()
    if (process.client) {
      localStorage.removeItem('agent_memories')
    }
  }

  // Utility functions
  const analyzeSentiment = (message: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'like', 'enjoy', 'happy', 'pleased']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'upset', 'disappointed', 'frustrated']
    
    const lowerMessage = message.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  const extractTopics = (message: string): string[] => {
    const topicKeywords = {
      'combat': ['fight', 'battle', 'war', 'sword', 'weapon', 'armor', 'enemy'],
      'magic': ['spell', 'magic', 'wizard', 'enchant', 'potion', 'ritual'],
      'trade': ['buy', 'sell', 'gold', 'coin', 'merchant', 'trade', 'price'],
      'politics': ['empire', 'king', 'lord', 'noble', 'law', 'rule', 'govern'],
      'religion': ['sigmar', 'god', 'pray', 'temple', 'priest', 'faith', 'blessing'],
      'travel': ['journey', 'road', 'travel', 'destination', 'map', 'path'],
      'rumors': ['rumor', 'gossip', 'news', 'heard', 'whisper', 'story']
    }
    
    const lowerMessage = message.toLowerCase()
    const topics: string[] = []
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic)
      }
    })
    
    return topics
  }

  const updateRelationshipScore = (memory: AgentMemory, sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        memory.relationshipScore = Math.min(100, memory.relationshipScore + 5)
        break
      case 'negative':
        memory.relationshipScore = Math.max(-100, memory.relationshipScore - 5)
        break
      case 'neutral':
        // Slight drift towards neutral over time
        if (memory.relationshipScore > 0) {
          memory.relationshipScore = Math.max(0, memory.relationshipScore - 1)
        } else if (memory.relationshipScore < 0) {
          memory.relationshipScore = Math.min(0, memory.relationshipScore + 1)
        }
        break
    }
  }

  const updateTopicPreferences = (memory: AgentMemory, topics: string[], sentiment: 'positive' | 'negative' | 'neutral') => {
    const scoreChange = sentiment === 'positive' ? 2 : sentiment === 'negative' ? -1 : 0
    
    topics.forEach(topic => {
      memory.topicPreferences[topic] = (memory.topicPreferences[topic] || 0) + scoreChange
    })
  }

  const updateConversationStyle = (memory: AgentMemory) => {
    const score = memory.relationshipScore
    
    if (score > 50) {
      memory.conversationStyle = 'friendly'
    } else if (score < -50) {
      memory.conversationStyle = 'hostile'
    } else if (score > 20) {
      memory.conversationStyle = 'neutral'
    } else {
      memory.conversationStyle = 'formal'
    }
  }

  const getRelationshipDescription = (score: number): string => {
    if (score > 75) return 'very friendly'
    if (score > 50) return 'friendly'
    if (score > 25) return 'cordial'
    if (score > -25) return 'neutral'
    if (score > -50) return 'unfriendly'
    if (score > -75) return 'hostile'
    return 'very hostile'
  }

  const getStyleDescription = (style: string): string => {
    switch (style) {
      case 'friendly': return 'warm and welcoming'
      case 'formal': return 'polite but distant'
      case 'hostile': return 'cold and suspicious'
      default: return 'neutral and professional'
    }
  }

  // Initialize
  if (process.client) {
    loadMemories()
  }

  return {
    // State
    agentMemories: readonly(agentMemories),
    conversationContext,
    isLoading: readonly(isLoading),
    
    // Methods
    getAgentMemory,
    recordInteraction,
    getConversationContext,
    addPersonalityNote,
    getPreferredTopics,
    clearAgentMemory,
    clearAllMemories,
    loadMemories,
    saveMemories
  }
}