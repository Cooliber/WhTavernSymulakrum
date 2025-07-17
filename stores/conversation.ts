/**
 * Conversation Store for Warhammer Tavern v3
 * Manages conversation history, persistence, and multi-agent state
 */

export interface ConversationMessage {
  id: string
  content: string
  timestamp: Date
  isUser: boolean
  agent?: {
    id: string
    name: string
    faction: string
    color: string
  }
  metadata?: {
    provider?: string
    model?: string
    tokens?: number
    responseTime?: number
  }
}

export interface ConversationSession {
  id: string
  title: string
  participants: string[] // Agent IDs
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export const useConversationStore = defineStore('conversation', () => {
  // State
  const sessions = ref<Map<string, ConversationSession>>(new Map())
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null
    return sessions.value.get(currentSessionId.value) || null
  })

  const currentMessages = computed(() => {
    return currentSession.value?.messages || []
  })

  const activeSessions = computed(() => {
    return Array.from(sessions.value.values())
      .filter(session => session.isActive)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  })

  // Actions
  const createSession = (title?: string, participants: string[] = []): string => {
    const sessionId = generateSessionId()
    const now = new Date()
    
    const session: ConversationSession = {
      id: sessionId,
      title: title || `Tavern Conversation ${new Date().toLocaleDateString()}`,
      participants,
      messages: [],
      createdAt: now,
      updatedAt: now,
      isActive: true
    }
    
    sessions.value.set(sessionId, session)
    currentSessionId.value = sessionId
    
    // Persist to localStorage
    persistSession(session)
    
    return sessionId
  }

  const switchSession = (sessionId: string) => {
    if (sessions.value.has(sessionId)) {
      currentSessionId.value = sessionId
    }
  }

  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    if (!currentSession.value) {
      createSession()
    }
    
    const newMessage: ConversationMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    }
    
    currentSession.value!.messages.push(newMessage)
    currentSession.value!.updatedAt = new Date()
    
    // Persist changes
    persistSession(currentSession.value!)
    
    return newMessage
  }

  const updateMessage = (messageId: string, updates: Partial<ConversationMessage>) => {
    if (!currentSession.value) return
    
    const messageIndex = currentSession.value.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    Object.assign(currentSession.value.messages[messageIndex], updates)
    currentSession.value.updatedAt = new Date()
    
    persistSession(currentSession.value)
  }

  const deleteMessage = (messageId: string) => {
    if (!currentSession.value) return
    
    const messageIndex = currentSession.value.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    currentSession.value.messages.splice(messageIndex, 1)
    currentSession.value.updatedAt = new Date()
    
    persistSession(currentSession.value)
  }

  const addParticipant = (agentId: string) => {
    if (!currentSession.value) return
    
    if (!currentSession.value.participants.includes(agentId)) {
      currentSession.value.participants.push(agentId)
      currentSession.value.updatedAt = new Date()
      
      persistSession(currentSession.value)
    }
  }

  const removeParticipant = (agentId: string) => {
    if (!currentSession.value) return
    
    const index = currentSession.value.participants.indexOf(agentId)
    if (index > -1) {
      currentSession.value.participants.splice(index, 1)
      currentSession.value.updatedAt = new Date()
      
      persistSession(currentSession.value)
    }
  }

  const archiveSession = (sessionId: string) => {
    const session = sessions.value.get(sessionId)
    if (session) {
      session.isActive = false
      session.updatedAt = new Date()
      
      persistSession(session)
      
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = null
      }
    }
  }

  const deleteSession = (sessionId: string) => {
    sessions.value.delete(sessionId)
    
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = null
    }
    
    // Remove from localStorage
    if (process.client) {
      localStorage.removeItem(`conversation_${sessionId}`)
    }
  }

  const exportSession = (sessionId: string): string => {
    const session = sessions.value.get(sessionId)
    if (!session) return ''
    
    return JSON.stringify(session, null, 2)
  }

  const importSession = (sessionData: string): boolean => {
    try {
      const session: ConversationSession = JSON.parse(sessionData)
      
      // Validate session structure
      if (!session.id || !session.messages || !Array.isArray(session.messages)) {
        return false
      }
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt)
      session.updatedAt = new Date(session.updatedAt)
      session.messages.forEach(message => {
        message.timestamp = new Date(message.timestamp)
      })
      
      sessions.value.set(session.id, session)
      persistSession(session)
      
      return true
    } catch (error) {
      console.error('Failed to import session:', error)
      return false
    }
  }

  const clearAllSessions = () => {
    sessions.value.clear()
    currentSessionId.value = null
    
    if (process.client) {
      // Clear all conversation data from localStorage
      Object.keys(localStorage)
        .filter(key => key.startsWith('conversation_'))
        .forEach(key => localStorage.removeItem(key))
    }
  }

  const loadSessions = () => {
    if (!process.client) return
    
    try {
      // Load sessions from localStorage
      Object.keys(localStorage)
        .filter(key => key.startsWith('conversation_'))
        .forEach(key => {
          try {
            const sessionData = localStorage.getItem(key)
            if (sessionData) {
              const session: ConversationSession = JSON.parse(sessionData)
              
              // Convert date strings back to Date objects
              session.createdAt = new Date(session.createdAt)
              session.updatedAt = new Date(session.updatedAt)
              session.messages.forEach(message => {
                message.timestamp = new Date(message.timestamp)
              })
              
              sessions.value.set(session.id, session)
            }
          } catch (error) {
            console.error(`Failed to load session ${key}:`, error)
          }
        })
      
      console.log(`📚 Loaded ${sessions.value.size} conversation sessions`)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  // Utility functions
  const persistSession = (session: ConversationSession) => {
    if (!process.client) return
    
    try {
      localStorage.setItem(`conversation_${session.id}`, JSON.stringify(session))
    } catch (error) {
      console.error('Failed to persist session:', error)
    }
  }

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize store
  if (process.client) {
    loadSessions()
  }

  return {
    // State
    sessions: readonly(sessions),
    currentSessionId: readonly(currentSessionId),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    currentSession,
    currentMessages,
    activeSessions,
    
    // Actions
    createSession,
    switchSession,
    addMessage,
    updateMessage,
    deleteMessage,
    addParticipant,
    removeParticipant,
    archiveSession,
    deleteSession,
    exportSession,
    importSession,
    clearAllSessions,
    loadSessions
  }
})