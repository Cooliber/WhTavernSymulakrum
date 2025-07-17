import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import MultiAgentChat from '../components/conversations/MultiAgentChat.vue'

// Mock the composables
vi.mock('#app', () => ({
  useI18n: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'conversations.multiAgent.title': 'Multi-Agent Conversation',
        'conversations.multiAgent.participants': 'Participants',
        'conversations.multiAgent.addAgent': 'Add Agent',
        'conversations.multiAgent.removeAgent': 'Remove Agent',
        'conversations.multiAgent.agentJoined': '{name} joined the conversation',
        'conversations.multiAgent.agentLeft': '{name} left the conversation',
        'conversations.typeMessage': 'Type a message...',
        'conversations.thinking': 'Thinking...',
        'conversations.selectCharacter': 'Select Character',
        'common.cancel': 'Cancel',
        'common.you': 'You'
      }
      
      let result = translations[key] || key
      if (params) {
        Object.keys(params).forEach(param => {
          result = result.replace(`{${param}}`, params[param])
        })
      }
      return result
    }
  })
}))

vi.mock('../composables/useUnifiedAIService', () => ({
  useUnifiedAIService: () => ({
    generateCompletion: vi.fn().mockResolvedValue({
      content: 'By Sigmar\'s hammer, that\'s an interesting point!',
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      tokens: 15,
      responseTime: 1200
    }),
    isInitialized: ref(true),
    healthCheck: vi.fn().mockResolvedValue({ 
      status: 'healthy',
      providers: {
        groq: { available: true, latency: 800 },
        cerebras: { available: true, latency: 1200 }
      }
    }),
    switchProvider: vi.fn(),
    getProviderStats: vi.fn().mockReturnValue({
      groq: { successRate: 98.5, avgResponseTime: 850 },
      cerebras: { successRate: 97.2, avgResponseTime: 1150 }
    })
  })
}))

vi.mock('../composables/useWarhammerAgents', () => ({
  useWarhammerAgents: () => ({
    getAgentById: vi.fn().mockImplementation((id: string) => ({
      id,
      name: id === 'marcus' ? 'Sir Marcus Ironforge' : 'Agent Name',
      faction: 'Empire',
      species: 'Human',
      career: 'Knight',
      personality: {
        traits: ['honorable', 'brave', 'loyal'],
        conversationStyle: 'formal',
        mood: 'determined',
        intelligence: 8,
        charisma: 7
      },
      knowledge: {
        domains: ['combat', 'politics', 'religion']
      },
      conversationPatterns: {
        speechPatterns: ['speaks formally', 'uses military terminology']
      }
    })),
    getAllAgents: vi.fn().mockReturnValue([
      { id: 'marcus', name: 'Sir Marcus Ironforge', faction: 'Empire' },
      { id: 'grimjaw', name: 'Grimjaw Ironbeard', faction: 'Dwarfs' },
      { id: 'elara', name: 'Elara Moonwhisper', faction: 'High Elves' }
    ])
  })
}))

vi.mock('../composables/useConversationMemory', () => ({
  useConversationMemory: () => ({
    recordInteraction: vi.fn(),
    getConversationContext: vi.fn().mockReturnValue('Previous conversation context...'),
    getAgentMemory: vi.fn().mockReturnValue({
      relationshipScore: 25,
      conversationStyle: 'friendly',
      personalityNotes: ['Likes to discuss combat tactics']
    })
  })
}))

vi.mock('../composables/usePerformanceMonitoring', () => ({
  usePerformanceMonitoring: () => ({
    recordAPICall: vi.fn().mockImplementation(async (provider, operation, apiCall) => {
      return await apiCall()
    }),
    recordMetric: vi.fn(),
    getProviderHealth: vi.fn().mockReturnValue('healthy'),
    overallStats: ref({
      totalRequests: 150,
      successfulRequests: 147,
      failedRequests: 3,
      successRate: 98.0,
      averageResponseTime: 950
    })
  })
}))

vi.mock('../composables/useWarhammerIcons', () => ({
  useWarhammerIcons: () => ({
    getIcon: (concept: string) => concept,
    getFactionColor: (faction: string) => 'blue',
    getRarityColor: (rarity: string) => 'green',
    getDifficultyColor: (difficulty: string) => 'red'
  })
}))

describe('MultiAgentChat Component - AI Integration', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(MultiAgentChat, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          Teleport: true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Basic Rendering', () => {
    it('should render the chat interface', () => {
      expect(wrapper.find('.multi-agent-chat').exists()).toBe(true)
      expect(wrapper.find('.chat-header').exists()).toBe(true)
      expect(wrapper.find('.messages-area').exists()).toBe(true)
      expect(wrapper.find('.input-area').exists()).toBe(true)
    })

    it('should display active agents', () => {
      const agentIndicators = wrapper.findAll('.agent-indicator')
      expect(agentIndicators.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('Sir Marcus')
    })

    it('should show participant count', () => {
      const participantText = wrapper.find('.chat-header p')
      expect(participantText.text()).toContain('Participants: 1')
    })
  })

  describe('Message Input and Sending', () => {
    it('should handle message input', async () => {
      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Hello, tavern!')
      expect(textarea.element.value).toBe('Hello, tavern!')
    })

    it('should send messages when button is clicked', async () => {
      const textarea = wrapper.find('textarea')
      const sendButton = wrapper.find('button[type="button"]')
      
      await textarea.setValue('Test message')
      await sendButton.trigger('click')
      await nextTick()
      
      expect(wrapper.text()).toContain('Test message')
    })

    it('should send messages on Enter key', async () => {
      const textarea = wrapper.find('textarea')
      
      await textarea.setValue('Enter key message')
      await textarea.trigger('keydown.enter')
      await nextTick()
      
      expect(wrapper.text()).toContain('Enter key message')
    })

    it('should disable send button when input is empty', () => {
      const sendButton = wrapper.find('button[type="button"]')
      expect(sendButton.attributes('disabled')).toBeDefined()
    })

    it('should enable send button when input has text', async () => {
      const textarea = wrapper.find('textarea')
      const sendButton = wrapper.find('button[type="button"]')
      
      await textarea.setValue('Some text')
      await nextTick()
      
      expect(sendButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('AI-Powered Agent Responses', () => {
    it('should generate AI responses for agents', async () => {
      const initialMessageCount = wrapper.vm.messages.length
      
      await wrapper.vm.sendMessage('Tell me about the Empire')
      
      // Wait for AI response generation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.vm.messages.length).toBeGreaterThan(initialMessageCount)
      
      // Check that AI response was generated
      const agentMessages = wrapper.vm.messages.filter((m: any) => !m.isUser)
      expect(agentMessages.length).toBeGreaterThan(0)
      expect(agentMessages[0].content).toContain('Sigmar')
    })

    it('should use different AI providers alternately', async () => {
      const mockGenerateCompletion = vi.fn()
        .mockResolvedValueOnce({ content: 'Groq response', provider: 'groq' })
        .mockResolvedValueOnce({ content: 'Cerebras response', provider: 'cerebras' })
      
      wrapper.vm.generateCompletion = mockGenerateCompletion
      
      await wrapper.vm.sendMessage('First message')
      await wrapper.vm.sendMessage('Second message')
      
      expect(mockGenerateCompletion).toHaveBeenCalledTimes(2)
    })

    it('should handle AI service errors gracefully', async () => {
      const mockGenerateCompletion = vi.fn().mockRejectedValue(new Error('API Error'))
      wrapper.vm.generateCompletion = mockGenerateCompletion
      
      await wrapper.vm.sendMessage('Error test message')
      
      // Should still add user message
      expect(wrapper.vm.messages.some((m: any) => m.content === 'Error test message')).toBe(true)
      
      // Should show fallback response
      await new Promise(resolve => setTimeout(resolve, 100))
      const agentMessages = wrapper.vm.messages.filter((m: any) => !m.isUser)
      expect(agentMessages.length).toBeGreaterThan(0)
    })

    it('should include conversation context in AI prompts', async () => {
      // Send multiple messages to build context
      await wrapper.vm.sendMessage('My name is John')
      await new Promise(resolve => setTimeout(resolve, 50))
      
      await wrapper.vm.sendMessage('What is my name?')
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Should have context from previous messages
      expect(wrapper.vm.messages.length).toBeGreaterThan(2)
    })

    it('should track response performance metrics', async () => {
      const startTime = Date.now()
      
      await wrapper.vm.sendMessage('Performance test')
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Should complete within reasonable time (2 seconds)
      expect(responseTime).toBeLessThan(2000)
    })
  })

  describe('Agent Management', () => {
    it('should show agent selector when add agent button is clicked', async () => {
      const addAgentButton = wrapper.find('button:contains("Add Agent")')
      await addAgentButton.trigger('click')
      await nextTick()
      
      expect(wrapper.vm.showAgentSelector).toBe(true)
    })

    it('should add new agents to conversation', async () => {
      wrapper.vm.showAgentSelector = true
      await nextTick()
      
      const initialCount = wrapper.vm.activeAgents.length
      const availableAgent = wrapper.vm.availableAgents[0]
      
      await wrapper.vm.addAgent(availableAgent)
      
      expect(wrapper.vm.activeAgents.length).toBe(initialCount + 1)
      expect(wrapper.vm.showAgentSelector).toBe(false)
    })

    it('should remove agents from conversation', async () => {
      const initialCount = wrapper.vm.activeAgents.length
      expect(initialCount).toBeGreaterThan(0)
      
      const agentToRemove = wrapper.vm.activeAgents[0]
      await wrapper.vm.removeAgent(agentToRemove.id)
      
      expect(wrapper.vm.activeAgents.length).toBe(initialCount - 1)
    })

    it('should show typing indicators', async () => {
      wrapper.vm.activeAgents[0].isTyping = true
      await nextTick()
      
      expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    })
  })

  describe('Message Display and Formatting', () => {
    it('should display messages with correct styling', async () => {
      const userMessage = {
        id: '1',
        content: 'User message',
        timestamp: new Date(),
        isUser: true
      }
      wrapper.vm.messages.push(userMessage)
      
      const agentMessage = {
        id: '2',
        content: 'Agent response',
        timestamp: new Date(),
        isUser: false,
        agent: wrapper.vm.activeAgents[0],
        metadata: { provider: 'groq', responseTime: 1200 }
      }
      wrapper.vm.messages.push(agentMessage)
      
      await nextTick()
      
      const messages = wrapper.findAll('.message-bubble')
      expect(messages.length).toBe(2)
    })

    it('should show AI metadata for agent messages', async () => {
      const agentMessage = {
        id: '1',
        content: 'AI-generated response',
        timestamp: new Date(),
        isUser: false,
        agent: wrapper.vm.activeAgents[0],
        metadata: { 
          provider: 'groq', 
          model: 'llama-3.3-70b-versatile',
          responseTime: 1200,
          tokens: 25
        }
      }
      wrapper.vm.messages.push(agentMessage)
      
      await nextTick()
      
      // Should display metadata
      expect(wrapper.text()).toContain('groq')
    })
  })

  describe('Conversation Export and Import', () => {
    it('should export conversation with AI metadata', () => {
      wrapper.vm.messages = [
        { 
          id: '1', 
          content: 'Hello', 
          isUser: true, 
          timestamp: new Date() 
        },
        { 
          id: '2', 
          content: 'AI response', 
          isUser: false, 
          agent: { id: 'marcus', name: 'Marcus' }, 
          timestamp: new Date(),
          metadata: { 
            provider: 'groq', 
            model: 'llama-3.3-70b-versatile',
            responseTime: 1200,
            tokens: 25
          }
        }
      ]
      
      const exported = wrapper.vm.exportConversation()
      expect(exported).toContain('Hello')
      expect(exported).toContain('AI response')
      expect(exported).toContain('groq')
      expect(exported).toContain('llama-3.3-70b-versatile')
    })
  })

  describe('Performance and Error Handling', () => {
    it('should handle concurrent AI requests', async () => {
      const promises = [
        wrapper.vm.sendMessage('Message 1'),
        wrapper.vm.sendMessage('Message 2'),
        wrapper.vm.sendMessage('Message 3')
      ]
      
      await Promise.all(promises)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Should handle all messages
      expect(wrapper.vm.messages.length).toBeGreaterThanOrEqual(3)
    })

    it('should respect rate limits', async () => {
      // Send many messages quickly
      const promises = Array.from({ length: 10 }, (_, i) => 
        wrapper.vm.sendMessage(`Rate limit test ${i}`)
      )
      
      await Promise.allSettled(promises)
      
      // Should not crash or throw errors
      expect(wrapper.vm.messages.length).toBeGreaterThan(0)
    })

    it('should maintain conversation state during errors', async () => {
      const initialMessages = [...wrapper.vm.messages]
      
      // Simulate error
      const mockError = vi.fn().mockRejectedValue(new Error('Network error'))
      wrapper.vm.generateCompletion = mockError
      
      await wrapper.vm.sendMessage('Error test')
      
      // Should maintain previous messages
      expect(wrapper.vm.messages.length).toBeGreaterThanOrEqual(initialMessages.length)
    })
  })

  describe('Accessibility and UX', () => {
    it('should have proper ARIA labels', () => {
      const textarea = wrapper.find('textarea')
      const sendButton = wrapper.find('button[type="button"]')
      
      expect(textarea.attributes('aria-label')).toBeDefined()
      expect(sendButton.attributes('aria-label')).toBeDefined()
    })

    it('should support keyboard navigation', async () => {
      const textarea = wrapper.find('textarea')
      
      // Should focus on textarea
      await textarea.trigger('focus')
      expect(document.activeElement).toBe(textarea.element)
      
      // Should send on Ctrl+Enter
      await textarea.setValue('Keyboard test')
      await textarea.trigger('keydown.enter', { ctrlKey: true })
      
      expect(wrapper.vm.messages.some((m: any) => m.content === 'Keyboard test')).toBe(true)
    })

    it('should show loading states during AI generation', async () => {
      await wrapper.vm.sendMessage('Loading test')
      
      // Should show loading indicator
      expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    })
  })
})