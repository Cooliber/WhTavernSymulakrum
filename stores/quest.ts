import { defineStore } from 'pinia'

export interface Quest {
  id: string
  title: string
  description: string
  briefDescription: string
  type: 'main' | 'side' | 'daily' | 'guild' | 'personal'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  status: 'available' | 'active' | 'completed' | 'failed' | 'expired'
  objectives: QuestObjective[]
  rewards: QuestReward[]
  requirements: QuestRequirement[]
  location: string
  questGiver: string
  questGiverPortrait?: string
  timeLimit?: number // in hours
  maxPartySize: number
  minLevel: number
  maxLevel?: number
  tags: string[]
  lore: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  assignedTo: string[] // character IDs
  progress: QuestProgress
}

export interface QuestObjective {
  id: string
  description: string
  type: 'kill' | 'collect' | 'deliver' | 'explore' | 'interact' | 'survive'
  target?: string
  currentCount: number
  requiredCount: number
  completed: boolean
  optional: boolean
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'reputation' | 'skill'
  amount: number
  itemId?: string
  itemName?: string
  description: string
}

export interface QuestRequirement {
  type: 'level' | 'skill' | 'item' | 'quest' | 'reputation'
  value: string | number
  description: string
  met: boolean
}

export interface QuestProgress {
  startedAt?: Date
  completionPercentage: number
  objectivesCompleted: number
  totalObjectives: number
  notes: string[]
}

export interface AdventureParty {
  id: string
  name: string
  description: string
  leaderId: string
  memberIds: string[]
  maxSize: number
  currentQuest?: string
  status: 'forming' | 'active' | 'completed' | 'disbanded'
  createdAt: Date
  scheduledSession?: Date
  sessionNotes: string[]
}

export interface CreateQuestRequest {
  title: string
  description: string
  briefDescription: string
  type: Quest['type']
  difficulty: Quest['difficulty']
  objectives: Omit<QuestObjective, 'id' | 'currentCount' | 'completed'>[]
  rewards: QuestReward[]
  requirements: Omit<QuestRequirement, 'met'>[]
  location: string
  questGiver: string
  timeLimit?: number
  maxPartySize: number
  minLevel: number
  maxLevel?: number
  tags: string[]
  lore: string
}

export interface UpdateQuestRequest {
  title?: string
  description?: string
  status?: Quest['status']
  objectives?: QuestObjective[]
  progress?: Partial<QuestProgress>
  assignedTo?: string[]
}

export const useQuestStore = defineStore('quest', () => {
  // State
  const quests = ref<Quest[]>([])
  const activeQuests = ref<Quest[]>([])
  const parties = ref<AdventureParty[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getQuestById = computed(() => {
    return (id: string) => quests.value.find(quest => quest.id === id)
  })

  const getQuestsByType = computed(() => {
    return (type: Quest['type']) => quests.value.filter(quest => quest.type === type)
  })

  const getQuestsByDifficulty = computed(() => {
    return (difficulty: Quest['difficulty']) => quests.value.filter(quest => quest.difficulty === difficulty)
  })

  const getAvailableQuests = computed(() => {
    return quests.value.filter(quest => quest.status === 'available')
  })

  const getActiveQuestsForCharacter = computed(() => {
    return (characterId: string) => activeQuests.value.filter(quest => 
      quest.assignedTo.includes(characterId)
    )
  })

  const getPartyById = computed(() => {
    return (id: string) => parties.value.find(party => party.id === id)
  })

  const totalQuests = computed(() => quests.value.length)
  const completedQuests = computed(() => quests.value.filter(q => q.status === 'completed').length)
  const questCompletionRate = computed(() => {
    return totalQuests.value > 0 ? (completedQuests.value / totalQuests.value) * 100 : 0
  })

  // Actions
  const fetchQuests = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock quest data
      quests.value = [
        {
          id: '1',
          title: 'The Missing Merchant',
          description: 'A wealthy merchant has gone missing on the road to Altdorf. His wagon was found abandoned with signs of struggle. Investigate his disappearance and bring him back safely.',
          briefDescription: 'Find the missing merchant on the Altdorf road',
          type: 'main',
          difficulty: 'medium',
          status: 'available',
          objectives: [
            {
              id: 'obj1',
              description: 'Search the abandoned wagon for clues',
              type: 'explore',
              currentCount: 0,
              requiredCount: 1,
              completed: false,
              optional: false
            },
            {
              id: 'obj2',
              description: 'Follow the trail into the forest',
              type: 'explore',
              currentCount: 0,
              requiredCount: 1,
              completed: false,
              optional: false
            },
            {
              id: 'obj3',
              description: 'Rescue the merchant from bandits',
              type: 'interact',
              currentCount: 0,
              requiredCount: 1,
              completed: false,
              optional: false
            }
          ],
          rewards: [
            { type: 'experience', amount: 150, description: '150 Experience Points' },
            { type: 'gold', amount: 50, description: '50 Gold Crowns' },
            { type: 'reputation', amount: 1, description: 'Increased reputation with Merchants Guild' }
          ],
          requirements: [
            { type: 'level', value: 2, description: 'Minimum level 2', met: true }
          ],
          location: 'Altdorf Road',
          questGiver: 'Captain Heinrich',
          questGiverPortrait: '/images/npcs/captain-heinrich.jpg',
          timeLimit: 72,
          maxPartySize: 4,
          minLevel: 2,
          maxLevel: 5,
          tags: ['investigation', 'rescue', 'bandits'],
          lore: 'The roads around Altdorf have become increasingly dangerous with bandit activity.',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          assignedTo: [],
          progress: {
            completionPercentage: 0,
            objectivesCompleted: 0,
            totalObjectives: 3,
            notes: []
          }
        },
        {
          id: '2',
          title: 'Rat Infestation',
          description: 'The tavern cellar has been overrun by giant rats. Clear them out before they spread disease or damage the ale stores.',
          briefDescription: 'Clear giant rats from the tavern cellar',
          type: 'daily',
          difficulty: 'easy',
          status: 'available',
          objectives: [
            {
              id: 'obj1',
              description: 'Kill giant rats in the cellar',
              type: 'kill',
              target: 'Giant Rat',
              currentCount: 0,
              requiredCount: 8,
              completed: false,
              optional: false
            },
            {
              id: 'obj2',
              description: 'Find and seal the rat holes',
              type: 'interact',
              currentCount: 0,
              requiredCount: 3,
              completed: false,
              optional: true
            }
          ],
          rewards: [
            { type: 'experience', amount: 75, description: '75 Experience Points' },
            { type: 'gold', amount: 20, description: '20 Gold Crowns' },
            { type: 'item', amount: 1, itemId: 'health-potion', itemName: 'Health Potion', description: 'Minor Health Potion' }
          ],
          requirements: [
            { type: 'level', value: 1, description: 'Minimum level 1', met: true }
          ],
          location: 'Tavern Cellar',
          questGiver: 'Innkeeper Wilhelm',
          maxPartySize: 2,
          minLevel: 1,
          maxLevel: 3,
          tags: ['extermination', 'tavern', 'rats'],
          lore: 'Giant rats are a common problem in urban areas, often growing large from feeding on refuse.',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          assignedTo: [],
          progress: {
            completionPercentage: 0,
            objectivesCompleted: 0,
            totalObjectives: 2,
            notes: []
          }
        }
      ]

      // Mock active quests
      activeQuests.value = []

      // Mock parties
      parties.value = [
        {
          id: '1',
          name: 'The Iron Hawks',
          description: 'A seasoned adventuring party specializing in combat missions',
          leaderId: '1', // Sir Marcus Brightblade
          memberIds: ['1'],
          maxSize: 4,
          status: 'forming',
          createdAt: new Date('2024-01-12'),
          sessionNotes: ['Looking for a healer and a wizard', 'Next session planned for weekend']
        }
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch quests'
    } finally {
      loading.value = false
    }
  }

  const createQuest = async (data: CreateQuestRequest): Promise<Quest> => {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const newQuest: Quest = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'available',
        objectives: data.objectives.map(obj => ({
          ...obj,
          id: Math.random().toString(36).substr(2, 9),
          currentCount: 0,
          completed: false
        })),
        requirements: data.requirements.map(req => ({ ...req, met: false })),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: [],
        progress: {
          completionPercentage: 0,
          objectivesCompleted: 0,
          totalObjectives: data.objectives.length,
          notes: []
        }
      }

      quests.value.push(newQuest)
      return newQuest
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create quest'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQuest = async (id: string, data: UpdateQuestRequest): Promise<Quest> => {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const questIndex = quests.value.findIndex(quest => quest.id === id)
      if (questIndex === -1) {
        throw new Error('Quest not found')
      }

      const updatedQuest = {
        ...quests.value[questIndex],
        ...data,
        updatedAt: new Date()
      }

      quests.value[questIndex] = updatedQuest

      // Update active quests if needed
      if (data.status === 'active' && !activeQuests.value.find(q => q.id === id)) {
        activeQuests.value.push(updatedQuest)
      } else if (data.status !== 'active') {
        const activeIndex = activeQuests.value.findIndex(q => q.id === id)
        if (activeIndex > -1) {
          activeQuests.value.splice(activeIndex, 1)
        }
      }

      return updatedQuest
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update quest'
      throw err
    } finally {
      loading.value = false
    }
  }

  const acceptQuest = async (questId: string, characterId: string): Promise<void> => {
    const quest = getQuestById.value(questId)
    if (!quest) throw new Error('Quest not found')

    if (quest.assignedTo.includes(characterId)) {
      throw new Error('Character already assigned to this quest')
    }

    await updateQuest(questId, {
      status: 'active',
      assignedTo: [...quest.assignedTo, characterId]
    })
  }

  const completeQuest = async (questId: string): Promise<void> => {
    await updateQuest(questId, {
      status: 'completed',
      progress: {
        completionPercentage: 100,
        objectivesCompleted: getQuestById.value(questId)?.objectives.length || 0,
        totalObjectives: getQuestById.value(questId)?.objectives.length || 0,
        notes: []
      }
    })
  }

  const createParty = async (name: string, description: string, leaderId: string): Promise<AdventureParty> => {
    const newParty: AdventureParty = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      leaderId,
      memberIds: [leaderId],
      maxSize: 4,
      status: 'forming',
      createdAt: new Date(),
      sessionNotes: []
    }

    parties.value.push(newParty)
    return newParty
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    quests: readonly(quests),
    activeQuests: readonly(activeQuests),
    parties: readonly(parties),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    getQuestById,
    getQuestsByType,
    getQuestsByDifficulty,
    getAvailableQuests,
    getActiveQuestsForCharacter,
    getPartyById,
    totalQuests,
    completedQuests,
    questCompletionRate,

    // Actions
    fetchQuests,
    createQuest,
    updateQuest,
    acceptQuest,
    completeQuest,
    createParty,
    clearError
  }
})
