import { defineStore } from 'pinia'

export interface TavernLocation {
  id: string
  name: string
  description: string
  type: 'room' | 'area' | 'service'
  coordinates: { x: number; y: number }
  size: { width: number; height: number }
  capacity: number
  currentOccupancy: number
  npcs: string[] // NPC IDs
  features: string[]
  ambience: {
    lighting: 'dim' | 'moderate' | 'bright'
    noise: 'quiet' | 'moderate' | 'loud'
    temperature: 'cold' | 'comfortable' | 'warm'
  }
  services: TavernService[]
  isAccessible: boolean
  requiresPayment: boolean
  cost?: number
}

export interface TavernService {
  id: string
  name: string
  description: string
  type: 'food' | 'drink' | 'lodging' | 'entertainment' | 'information' | 'trade'
  cost: number
  currency: 'gc' | 'ss' | 'bp'
  availability: 'always' | 'day' | 'night' | 'special'
  quality: 'poor' | 'common' | 'good' | 'excellent'
  effects?: ServiceEffect[]
}

export interface ServiceEffect {
  type: 'heal' | 'buff' | 'information' | 'reputation' | 'mood'
  value: number
  duration?: number // in hours
  description: string
}

export interface NPC {
  id: string
  name: string
  title?: string
  race: string
  profession: string
  description: string
  personality: string[]
  portrait?: string
  location: string
  disposition: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'helpful'
  reputation: number
  dialogue: DialogueNode[]
  services: string[] // Service IDs
  quests: string[] // Quest IDs
  schedule: NPCSchedule
  relationships: Record<string, number> // Character ID -> relationship value
}

export interface DialogueNode {
  id: string
  text: string
  conditions?: DialogueCondition[]
  responses: DialogueResponse[]
  effects?: DialogueEffect[]
}

export interface DialogueResponse {
  id: string
  text: string
  conditions?: DialogueCondition[]
  nextNodeId?: string
  effects?: DialogueEffect[]
}

export interface DialogueCondition {
  type: 'level' | 'skill' | 'item' | 'reputation' | 'quest' | 'relationship'
  value: string | number
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'has'
}

export interface DialogueEffect {
  type: 'reputation' | 'relationship' | 'item' | 'gold' | 'quest' | 'service'
  value: string | number
  description: string
}

export interface NPCSchedule {
  [hour: number]: {
    location: string
    activity: string
    availability: boolean
  }
}

export interface TavernEvent {
  id: string
  title: string
  description: string
  type: 'entertainment' | 'special' | 'seasonal' | 'quest' | 'social'
  startTime: Date
  endTime: Date
  location: string
  participants: string[] // Character IDs
  maxParticipants?: number
  cost?: number
  rewards?: EventReward[]
  requirements?: EventRequirement[]
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

export interface EventReward {
  type: 'experience' | 'gold' | 'item' | 'reputation' | 'relationship'
  value: string | number
  description: string
}

export interface EventRequirement {
  type: 'level' | 'skill' | 'item' | 'reputation'
  value: string | number
  description: string
}

export interface TavernState {
  currentTime: Date
  weather: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  atmosphere: {
    crowdLevel: 'empty' | 'quiet' | 'moderate' | 'busy' | 'packed'
    mood: 'tense' | 'somber' | 'neutral' | 'cheerful' | 'festive'
    events: string[] // Active event IDs
  }
  notifications: TavernNotification[]
}

export interface TavernNotification {
  id: string
  type: 'info' | 'warning' | 'success' | 'event'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  id: string
  label: string
  action: string
  data?: any
}

export const useTavernStore = defineStore('tavern', () => {
  // State
  const locations = ref<TavernLocation[]>([])
  const npcs = ref<NPC[]>([])
  const events = ref<TavernEvent[]>([])
  const tavernState = ref<TavernState>({
    currentTime: new Date(),
    weather: 'clear',
    season: 'autumn',
    atmosphere: {
      crowdLevel: 'moderate',
      mood: 'cheerful',
      events: []
    },
    notifications: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getLocationById = computed(() => {
    return (id: string) => locations.value.find(loc => loc.id === id)
  })

  const getNPCById = computed(() => {
    return (id: string) => npcs.value.find(npc => npc.id === id)
  })

  const getNPCsByLocation = computed(() => {
    return (locationId: string) => npcs.value.filter(npc => npc.location === locationId)
  })

  const getEventById = computed(() => {
    return (id: string) => events.value.find(event => event.id === id)
  })

  const getActiveEvents = computed(() => {
    const now = new Date()
    return events.value.filter(event => 
      event.status === 'active' || 
      (event.status === 'scheduled' && event.startTime <= now && event.endTime >= now)
    )
  })

  const getUpcomingEvents = computed(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return events.value.filter(event => 
      event.status === 'scheduled' && 
      event.startTime > now && 
      event.startTime <= nextWeek
    )
  })

  const unreadNotifications = computed(() => {
    return tavernState.value.notifications.filter(notif => !notif.read)
  })

  // Actions
  const fetchTavernData = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock tavern locations
      locations.value = [
        {
          id: 'main-hall',
          name: 'Main Hall',
          description: 'The heart of the tavern, filled with long wooden tables and a roaring fireplace.',
          type: 'area',
          coordinates: { x: 50, y: 50 },
          size: { width: 200, height: 150 },
          capacity: 50,
          currentOccupancy: 23,
          npcs: ['innkeeper', 'bard', 'merchant'],
          features: ['fireplace', 'stage', 'bar'],
          ambience: {
            lighting: 'moderate',
            noise: 'moderate',
            temperature: 'warm'
          },
          services: [
            {
              id: 'ale',
              name: 'Ale',
              description: 'Hearty local ale',
              type: 'drink',
              cost: 2,
              currency: 'ss',
              availability: 'always',
              quality: 'good',
              effects: [{ type: 'mood', value: 1, duration: 2, description: 'Improves mood' }]
            }
          ],
          isAccessible: true,
          requiresPayment: false
        },
        {
          id: 'private-rooms',
          name: 'Private Rooms',
          description: 'Comfortable rooms for weary travelers.',
          type: 'room',
          coordinates: { x: 300, y: 100 },
          size: { width: 100, height: 200 },
          capacity: 8,
          currentOccupancy: 3,
          npcs: [],
          features: ['beds', 'privacy', 'storage'],
          ambience: {
            lighting: 'dim',
            noise: 'quiet',
            temperature: 'comfortable'
          },
          services: [
            {
              id: 'room-night',
              name: 'Room for the Night',
              description: 'A comfortable bed and safe storage',
              type: 'lodging',
              cost: 1,
              currency: 'gc',
              availability: 'always',
              quality: 'good',
              effects: [{ type: 'heal', value: 5, description: 'Restores health' }]
            }
          ],
          isAccessible: true,
          requiresPayment: true,
          cost: 1
        }
      ]

      // Mock NPCs
      npcs.value = [
        {
          id: 'innkeeper',
          name: 'Wilhelm Steinhart',
          title: 'Innkeeper',
          race: 'Human',
          profession: 'Innkeeper',
          description: 'A stout, friendly man with a graying beard and warm smile.',
          personality: ['friendly', 'helpful', 'talkative'],
          portrait: '/images/npcs/wilhelm-innkeeper.jpg',
          location: 'main-hall',
          disposition: 'friendly',
          reputation: 75,
          dialogue: [
            {
              id: 'greeting',
              text: 'Welcome to the Prancing Pony! What can I do for you?',
              responses: [
                {
                  id: 'room',
                  text: 'I need a room for the night.',
                  nextNodeId: 'room-offer'
                },
                {
                  id: 'drink',
                  text: 'I could use a drink.',
                  nextNodeId: 'drink-offer'
                }
              ]
            }
          ],
          services: ['ale', 'room-night'],
          quests: [],
          schedule: {
            6: { location: 'main-hall', activity: 'opening', availability: true },
            12: { location: 'main-hall', activity: 'serving', availability: true },
            18: { location: 'main-hall', activity: 'evening rush', availability: true },
            22: { location: 'private-rooms', activity: 'closing', availability: false }
          },
          relationships: {}
        }
      ]

      // Mock events
      events.value = [
        {
          id: 'bard-performance',
          title: 'Evening Performance',
          description: 'The tavern bard performs tales of heroic adventures.',
          type: 'entertainment',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          location: 'main-hall',
          participants: [],
          maxParticipants: 30,
          rewards: [
            { type: 'experience', value: 25, description: 'Cultural experience' }
          ],
          requirements: [],
          status: 'scheduled'
        }
      ]

      // Add initial notification
      tavernState.value.notifications.push({
        id: 'welcome',
        type: 'info',
        title: 'Welcome to the Tavern',
        message: 'Explore the tavern and interact with NPCs to discover quests and services.',
        timestamp: new Date(),
        read: false
      })

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tavern data'
    } finally {
      loading.value = false
    }
  }

  const interactWithNPC = async (npcId: string, dialogueNodeId?: string): Promise<DialogueNode | null> => {
    const npc = getNPCById.value(npcId)
    if (!npc) return null

    const nodeId = dialogueNodeId || 'greeting'
    const dialogueNode = npc.dialogue.find(node => node.id === nodeId)
    
    return dialogueNode || null
  }

  const joinEvent = async (eventId: string, characterId: string): Promise<void> => {
    const event = getEventById.value(eventId)
    if (!event) throw new Error('Event not found')

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      throw new Error('Event is full')
    }

    if (!event.participants.includes(characterId)) {
      event.participants.push(characterId)
    }
  }

  const addNotification = (notification: Omit<TavernNotification, 'id' | 'timestamp'>): void => {
    tavernState.value.notifications.unshift({
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    })
  }

  const markNotificationRead = (notificationId: string): void => {
    const notification = tavernState.value.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    locations: readonly(locations),
    npcs: readonly(npcs),
    events: readonly(events),
    tavernState: readonly(tavernState),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    getLocationById,
    getNPCById,
    getNPCsByLocation,
    getEventById,
    getActiveEvents,
    getUpcomingEvents,
    unreadNotifications,

    // Actions
    fetchTavernData,
    interactWithNPC,
    joinEvent,
    addNotification,
    markNotificationRead,
    clearError
  }
})
