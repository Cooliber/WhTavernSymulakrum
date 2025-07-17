import { defineStore } from 'pinia'

export interface Character {
  id: string
  name: string
  race: string
  career: string
  level: number
  experience: number
  attributes: {
    weaponSkill: number
    ballisticSkill: number
    strength: number
    toughness: number
    agility: number
    intelligence: number
    willpower: number
    fellowship: number
  }
  skills: Skill[]
  talents: Talent[]
  equipment: Equipment[]
  wounds: {
    current: number
    maximum: number
  }
  fate: {
    current: number
    maximum: number
  }
  fortune: number
  resilience: number
  resolve: number
  motivation: string
  background: string
  description: string
  portrait?: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

export interface Skill {
  name: string
  characteristic: string
  advances: number
  isSpecialized: boolean
  specialization?: string
}

export interface Talent {
  name: string
  description: string
  tests: string
  maxRank: number
  currentRank: number
}

export interface Equipment {
  id: string
  name: string
  type: 'melee_weapon' | 'ranged_weapon' | 'armor' | 'trapping' | 'ammunition'
  description: string
  encumbrance: number
  availability: string
  price: {
    amount: number
    currency: 'gc' | 'ss' | 'bp'
  }
  qualities?: string[]
  flaws?: string[]
  equipped: boolean
  quantity: number
  group?: string
  damage?: string
  reach?: string
  range?: string
  armorPoints?: Record<string, number>
  locations?: string[]
  category?: string
}

export interface CreateCharacterRequest {
  name: string
  race: string
  career: string
  attributes: Record<string, number>
  background?: string
  description?: string
}

export interface UpdateCharacterRequest {
  name?: string
  attributes?: Record<string, number>
  skills?: Skill[]
  talents?: Talent[]
  equipment?: Equipment[]
  wounds?: { current: number; maximum: number }
  background?: string
  description?: string
}

export const useCharacterStore = defineStore('character', () => {
  // State
  const characters = ref<Character[]>([])
  const activeCharacter = ref<Character | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const getCharacterById = computed(() => {
    return (id: string) => characters.value.find(char => char.id === id)
  })
  
  const getCharactersByRace = computed(() => {
    return (race: string) => characters.value.filter(char => char.race === race)
  })
  
  const getCharactersByCareer = computed(() => {
    return (career: string) => characters.value.filter(char => char.career === career)
  })
  
  const totalCharacters = computed(() => characters.value.length)
  
  const averageLevel = computed(() => {
    if (characters.value.length === 0) return 0
    const totalLevels = characters.value.reduce((sum, char) => sum + char.level, 0)
    return Math.round(totalLevels / characters.value.length)
  })
  
  // Actions
  const fetchCharacters = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for development
      characters.value = [
        {
          id: '1',
          name: 'Sir Marcus Brightblade',
          race: 'Human',
          career: 'Knight',
          level: 3,
          experience: 250,
          attributes: {
            weaponSkill: 45,
            ballisticSkill: 35,
            strength: 40,
            toughness: 42,
            agility: 38,
            intelligence: 32,
            willpower: 40,
            fellowship: 45
          },
          skills: [
            { name: 'Melee (Basic)', characteristic: 'weaponSkill', advances: 10, isSpecialized: false },
            { name: 'Athletics', characteristic: 'strength', advances: 5, isSpecialized: false },
            { name: 'Intimidate', characteristic: 'strength', advances: 8, isSpecialized: false }
          ],
          talents: [
            { name: 'Strike Mighty Blow', description: 'Add SB to damage', tests: 'Melee', maxRank: 1, currentRank: 1 }
          ],
          equipment: [
            {
              id: 'sword1',
              name: 'Longsword',
              type: 'melee_weapon',
              description: 'A well-crafted blade',
              encumbrance: 1,
              availability: 'Common',
              price: { amount: 15, currency: 'gc' },
              equipped: true,
              quantity: 1,
              group: 'basic',
              damage: 'SB+4',
              reach: 'Average'
            }
          ],
          wounds: { current: 15, maximum: 15 },
          fate: { current: 3, maximum: 3 },
          fortune: 0,
          resilience: 2,
          resolve: 2,
          motivation: 'To serve the Empire with honor',
          background: 'Noble born, trained in combat',
          description: 'A stalwart knight of the Empire',
          portrait: '/images/characters/marcus-brightblade.jpg',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          ownerId: 'user1'
        }
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch characters'
    } finally {
      loading.value = false
    }
  }
  
  const createCharacter = async (data: CreateCharacterRequest): Promise<Character> => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newCharacter: Character = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        race: data.race,
        career: data.career,
        level: 1,
        experience: 0,
        attributes: data.attributes as Character['attributes'],
        skills: [],
        talents: [],
        equipment: [],
        wounds: { current: 10, maximum: 10 },
        fate: { current: 2, maximum: 2 },
        fortune: 0,
        resilience: 1,
        resolve: 1,
        motivation: '',
        background: data.background || '',
        description: data.description || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 'current-user'
      }
      
      characters.value.push(newCharacter)
      return newCharacter
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create character'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateCharacter = async (id: string, data: UpdateCharacterRequest): Promise<Character> => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const characterIndex = characters.value.findIndex(char => char.id === id)
      if (characterIndex === -1) {
        throw new Error('Character not found')
      }
      
      const updatedCharacter = {
        ...characters.value[characterIndex],
        ...data,
        updatedAt: new Date()
      }
      
      characters.value[characterIndex] = updatedCharacter
      
      if (activeCharacter.value?.id === id) {
        activeCharacter.value = updatedCharacter
      }
      
      return updatedCharacter
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update character'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteCharacter = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const characterIndex = characters.value.findIndex(char => char.id === id)
      if (characterIndex === -1) {
        throw new Error('Character not found')
      }
      
      characters.value.splice(characterIndex, 1)
      
      if (activeCharacter.value?.id === id) {
        activeCharacter.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete character'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const setActiveCharacter = (character: Character | null): void => {
    activeCharacter.value = character
  }
  
  const duplicateCharacter = async (id: string): Promise<Character> => {
    const originalCharacter = getCharacterById.value(id)
    if (!originalCharacter) {
      throw new Error('Character not found')
    }
    
    const duplicateData: CreateCharacterRequest = {
      name: `${originalCharacter.name} (Copy)`,
      race: originalCharacter.race,
      career: originalCharacter.career,
      attributes: { ...originalCharacter.attributes },
      background: originalCharacter.background,
      description: originalCharacter.description
    }
    
    return await createCharacter(duplicateData)
  }
  
  const clearError = (): void => {
    error.value = null
  }
  
  return {
    // State
    characters: readonly(characters),
    activeCharacter: readonly(activeCharacter),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    getCharacterById,
    getCharactersByRace,
    getCharactersByCareer,
    totalCharacters,
    averageLevel,
    
    // Actions
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    setActiveCharacter,
    duplicateCharacter,
    clearError
  }
})
