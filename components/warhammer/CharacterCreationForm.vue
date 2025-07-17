<template>
  <div class="character-creation-form">
    <!-- Progress Indicator -->
    <div class="progress-indicator mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-wh-heading text-wh-wood-brown">
          Step {{ currentStep }} of {{ totalSteps }}
        </span>
        <span class="text-sm font-wh-heading text-wh-wood-brown">
          {{ Math.round((currentStep / totalSteps) * 100) }}% Complete
        </span>
      </div>
      <div class="w-full bg-wh-aged-paper rounded-full h-2">
        <div
          class="bg-wh-empire-gold h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content min-h-[400px]">
      <!-- Step 1: Race Selection -->
      <div v-if="currentStep === 1" class="race-selection">
        <h3 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">Choose Your Race</h3>
        <p class="text-wh-wood-brown mb-6">
          Select the race that will define your character's heritage and natural abilities.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WarhammerCard
            v-for="race in availableRaces"
            :key="race.name"
            :title="race.name"
            :subtitle="race.description"
            :interactive="true"
            :pressed="formData.race === race.name"
            variant="parchment"
            size="sm"
            class="race-option cursor-pointer"
            @click="selectRace(race)"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-center">
                <WarhammerIcon
                  :name="race.icon"
                  size="xl"
                  :faction="race.faction"
                  class="text-4xl"
                />
              </div>
              
              <div class="text-xs text-wh-wood-brown">
                <h4 class="font-semibold mb-1">Attribute Modifiers:</h4>
                <div class="grid grid-cols-2 gap-1">
                  <div v-for="(modifier, attr) in race.attributeModifiers" :key="attr">
                    <span class="capitalize">{{ getAttributeAbbreviation(attr) }}:</span>
                    <span :class="modifier >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ modifier >= 0 ? '+' : '' }}{{ modifier }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="text-xs text-wh-wood-brown">
                <h4 class="font-semibold mb-1">Racial Traits:</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="trait in race.traits" :key="trait">{{ trait }}</li>
                </ul>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>

      <!-- Step 2: Career Selection -->
      <div v-if="currentStep === 2" class="career-selection">
        <h3 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">Choose Your Career</h3>
        <p class="text-wh-wood-brown mb-6">
          Select your character's profession, which determines starting skills and advancement options.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WarhammerCard
            v-for="career in availableCareers"
            :key="career.name"
            :title="career.name"
            :subtitle="career.description"
            :interactive="true"
            :pressed="formData.career === career.name"
            variant="parchment"
            size="sm"
            class="career-option cursor-pointer"
            @click="selectCareer(career)"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-center">
                <WarhammerIcon
                  :name="career.icon"
                  size="xl"
                  class="text-4xl text-wh-empire-gold"
                />
              </div>
              
              <div class="text-xs text-wh-wood-brown">
                <h4 class="font-semibold mb-1">Starting Skills:</h4>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="skill in career.startingSkills.slice(0, 4)"
                    :key="skill"
                    class="px-2 py-1 bg-wh-empire-gold text-wh-dark-wood rounded text-xs"
                  >
                    {{ skill }}
                  </span>
                  <span
                    v-if="career.startingSkills.length > 4"
                    class="px-2 py-1 bg-wh-wood-brown text-wh-bone rounded text-xs"
                  >
                    +{{ career.startingSkills.length - 4 }} more
                  </span>
                </div>
              </div>
              
              <div class="text-xs text-wh-wood-brown">
                <h4 class="font-semibold mb-1">Starting Talents:</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="talent in career.startingTalents.slice(0, 2)" :key="talent">
                    {{ talent }}
                  </li>
                </ul>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>

      <!-- Step 3: Attribute Allocation -->
      <div v-if="currentStep === 3" class="attribute-allocation">
        <h3 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">Allocate Attributes</h3>
        <p class="text-wh-wood-brown mb-6">
          Distribute {{ remainingPoints }} points among your character's attributes.
          Each attribute starts at 20 and can be increased up to 40.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(value, attribute) in formData.attributes"
            :key="attribute"
            class="attribute-row"
          >
            <WarhammerCard variant="filled" size="sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <WarhammerIcon
                    :name="getAttributeIcon(attribute)"
                    size="md"
                    class="text-wh-empire-gold"
                  />
                  <div>
                    <h4 class="font-wh-heading text-wh-bone">
                      {{ getAttributeName(attribute) }}
                    </h4>
                    <p class="text-xs text-wh-light-grey">
                      {{ getAttributeDescription(attribute) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <WarhammerButton
                    variant="ghost"
                    size="sm"
                    :disabled="value <= 20"
                    @click="adjustAttribute(attribute, -1)"
                  >
                    -
                  </WarhammerButton>
                  
                  <span class="text-xl font-bold text-wh-empire-gold min-w-[3rem] text-center">
                    {{ value + getRaceModifier(attribute) }}
                  </span>
                  
                  <WarhammerButton
                    variant="ghost"
                    size="sm"
                    :disabled="value >= 40 || remainingPoints <= 0"
                    @click="adjustAttribute(attribute, 1)"
                  >
                    +
                  </WarhammerButton>
                </div>
              </div>
            </WarhammerCard>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-lg font-wh-heading text-wh-dark-wood">
            Remaining Points: 
            <span :class="remainingPoints === 0 ? 'text-green-600' : 'text-wh-empire-gold'">
              {{ remainingPoints }}
            </span>
          </p>
        </div>
      </div>

      <!-- Step 4: Skills & Talents -->
      <div v-if="currentStep === 4" class="skills-talents">
        <h3 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">Skills & Talents</h3>
        <p class="text-wh-wood-brown mb-6">
          Select your starting skills and talents based on your race and career.
        </p>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Skills Section -->
          <WarhammerCard title="Starting Skills" variant="parchment">
            <div class="space-y-2">
              <div
                v-for="skill in availableSkills"
                :key="skill.name"
                class="flex items-center justify-between p-2 bg-wh-aged-paper rounded"
              >
                <div>
                  <span class="font-medium text-wh-dark-wood">{{ skill.name }}</span>
                  <span class="text-xs text-wh-wood-brown ml-2">({{ skill.characteristic }})</span>
                </div>
                <input
                  type="checkbox"
                  :checked="isSkillSelected(skill.name)"
                  :disabled="skill.required"
                  class="w-4 h-4 text-wh-empire-gold bg-wh-parchment border-wh-wood-brown rounded focus:ring-wh-empire-gold"
                  @change="toggleSkill(skill)"
                />
              </div>
            </div>
          </WarhammerCard>
          
          <!-- Talents Section -->
          <WarhammerCard title="Starting Talents" variant="parchment">
            <div class="space-y-2">
              <div
                v-for="talent in availableTalents"
                :key="talent.name"
                class="p-2 bg-wh-aged-paper rounded"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <span class="font-medium text-wh-dark-wood">{{ talent.name }}</span>
                    <p class="text-xs text-wh-wood-brown mt-1">{{ talent.description }}</p>
                  </div>
                  <input
                    type="checkbox"
                    :checked="isTalentSelected(talent.name)"
                    :disabled="talent.required"
                    class="w-4 h-4 text-wh-empire-gold bg-wh-parchment border-wh-wood-brown rounded focus:ring-wh-empire-gold mt-1"
                    @change="toggleTalent(talent)"
                  />
                </div>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>

      <!-- Step 5: Character Details -->
      <div v-if="currentStep === 5" class="character-details">
        <h3 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">Character Details</h3>
        <p class="text-wh-wood-brown mb-6">
          Add the finishing touches to bring your character to life.
        </p>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-4">
            <WarhammerInput
              v-model="formData.name"
              label="Character Name"
              placeholder="Enter your character's name"
              required
              :error-message="errors.name"
            />
            
            <WarhammerInput
              v-model="formData.motivation"
              label="Motivation"
              placeholder="What drives your character?"
              help-text="A short phrase describing your character's primary goal or desire"
            />
            
            <WarhammerInput
              v-model="formData.background"
              type="textarea"
              label="Background"
              placeholder="Describe your character's history and origins..."
              :rows="4"
              help-text="Optional: Provide details about your character's past"
            />
          </div>
          
          <div class="space-y-4">
            <WarhammerInput
              v-model="formData.description"
              type="textarea"
              label="Physical Description"
              placeholder="Describe your character's appearance..."
              :rows="4"
              help-text="Optional: How does your character look and dress?"
            />
            
            <!-- Portrait Selection -->
            <div class="portrait-selection">
              <label class="block text-sm font-medium text-wh-dark-wood mb-2">
                Character Portrait
              </label>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="portrait in availablePortraits"
                  :key="portrait.id"
                  class="aspect-square bg-wh-aged-paper rounded border-2 cursor-pointer transition-all"
                  :class="formData.portrait === portrait.src ? 'border-wh-empire-gold' : 'border-wh-wood-brown'"
                  @click="formData.portrait = portrait.src"
                >
                  <OptimizedImage
                    :src="portrait.src"
                    :alt="portrait.alt"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation-buttons flex justify-between mt-8 pt-6 border-t border-wh-wood-brown">
      <WarhammerButton
        v-if="currentStep > 1"
        variant="secondary"
        @click="previousStep"
      >
        Previous
      </WarhammerButton>
      <div v-else></div>
      
      <div class="flex space-x-3">
        <WarhammerButton
          variant="outline"
          @click="$emit('cancel')"
        >
          Cancel
        </WarhammerButton>
        
        <WarhammerButton
          v-if="currentStep < totalSteps"
          variant="primary"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Next
        </WarhammerButton>
        
        <WarhammerButton
          v-else
          variant="primary"
          :loading="isCreating"
          :disabled="!canCreate"
          @click="createCharacter"
        >
          Create Character
        </WarhammerButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character, Skill, Talent, CreateCharacterRequest } from '~/stores/character'

interface Race {
  name: string
  description: string
  icon: string
  faction: string
  attributeModifiers: Record<string, number>
  traits: string[]
}

interface Career {
  name: string
  description: string
  icon: string
  startingSkills: string[]
  startingTalents: string[]
  availableRaces: string[]
}

interface SkillOption {
  name: string
  characteristic: string
  required: boolean
}

interface TalentOption {
  name: string
  description: string
  required: boolean
}

interface PortraitOption {
  id: string
  src: string
  alt: string
}

const emit = defineEmits<{
  created: [character: Character]
  cancel: []
}>()

// Store
const characterStore = useCharacterStore()

// Reactive state
const currentStep = ref(1)
const totalSteps = 5
const isCreating = ref(false)

const formData = ref({
  race: '',
  career: '',
  attributes: {
    weaponSkill: 20,
    ballisticSkill: 20,
    strength: 20,
    toughness: 20,
    agility: 20,
    intelligence: 20,
    willpower: 20,
    fellowship: 20
  },
  skills: [] as string[],
  talents: [] as string[],
  name: '',
  motivation: '',
  background: '',
  description: '',
  portrait: ''
})

const errors = ref({
  name: ''
})

// Available races
const availableRaces: Race[] = [
  {
    name: 'Human',
    description: 'Versatile and ambitious, humans are the most common race in the Empire.',
    icon: 'crown',
    faction: 'empire',
    attributeModifiers: { fellowship: 5, intelligence: 5 },
    traits: ['Versatile', 'Extra Skill', 'Extra Talent']
  },
  {
    name: 'Dwarf',
    description: 'Hardy mountain folk known for their craftsmanship and stubbornness.',
    icon: 'hammer',
    faction: 'dwarfs',
    attributeModifiers: { toughness: 10, willpower: 10, agility: -5 },
    traits: ['Magic Resistance', 'Night Vision', 'Sturdy']
  },
  {
    name: 'Halfling',
    description: 'Small but brave folk who value comfort and good food.',
    icon: 'home',
    faction: 'empire',
    attributeModifiers: { agility: 10, fellowship: 5, strength: -10 },
    traits: ['Small', 'Specialist (Cooking)', 'Resistance (Chaos)']
  },
  {
    name: 'High Elf',
    description: 'Ancient and noble, masters of magic and martial prowess.',
    icon: 'sparkles',
    faction: 'elves',
    attributeModifiers: { intelligence: 10, agility: 5, toughness: -5 },
    traits: ['Acute Senses', 'Coolheaded', 'Savvy']
  },
  {
    name: 'Wood Elf',
    description: 'Forest dwellers with unmatched archery skills.',
    icon: 'bow',
    faction: 'elves',
    attributeModifiers: { ballisticSkill: 10, agility: 5, toughness: -5 },
    traits: ['Acute Senses', 'Hardy', 'Rover']
  },
  {
    name: 'Dark Elf',
    description: 'Cruel and ambitious, masters of dark magic and warfare.',
    icon: 'sword',
    faction: 'elves',
    attributeModifiers: { agility: 5, intelligence: 5, fellowship: -5 },
    traits: ['Acute Senses', 'Cruel', 'Savvy']
  }
]

// Available careers (filtered by race)
const baseCareers: Career[] = [
  {
    name: 'Knight',
    description: 'Noble warrior dedicated to honor and combat.',
    icon: 'shield',
    startingSkills: ['Melee (Basic)', 'Athletics', 'Cool', 'Intimidate'],
    startingTalents: ['Combat Aware', 'Strike Mighty Blow'],
    availableRaces: ['Human']
  },
  {
    name: 'Wizard',
    description: 'Scholar of the arcane arts and wielder of magic.',
    icon: 'sparkles',
    startingSkills: ['Channelling', 'Language (Magick)', 'Lore (Magic)', 'Perception'],
    startingTalents: ['Aethyric Attunement', 'Petty Magic'],
    availableRaces: ['Human', 'High Elf']
  },
  {
    name: 'Ranger',
    description: 'Skilled tracker and wilderness survivor.',
    icon: 'bow',
    startingSkills: ['Animal Care', 'Climb', 'Endurance', 'Outdoor Survival'],
    startingTalents: ['Hardy', 'Rover'],
    availableRaces: ['Human', 'Dwarf', 'Wood Elf']
  },
  {
    name: 'Priest',
    description: 'Divine servant dedicated to the gods.',
    icon: 'cross',
    startingSkills: ['Cool', 'Heal', 'Lore (Theology)', 'Pray'],
    startingTalents: ['Bless', 'Invoke'],
    availableRaces: ['Human', 'Dwarf']
  },
  {
    name: 'Merchant',
    description: 'Trader and negotiator skilled in commerce.',
    icon: 'coins',
    startingSkills: ['Charm', 'Consume Alcohol', 'Evaluate', 'Gossip'],
    startingTalents: ['Dealmaker', 'Suave'],
    availableRaces: ['Human', 'Halfling', 'Dwarf']
  },
  {
    name: 'Scholar',
    description: 'Learned individual devoted to knowledge and research.',
    icon: 'book',
    startingSkills: ['Language (Classical)', 'Lore (Any)', 'Perception', 'Research'],
    startingTalents: ['Linguistics', 'Read/Write'],
    availableRaces: ['Human', 'High Elf', 'Dark Elf']
  }
]

// Computed properties
const availableCareers = computed(() => {
  return baseCareers.filter(career =>
    career.availableRaces.includes(formData.value.race)
  )
})

const selectedRace = computed(() => {
  return availableRaces.find(race => race.name === formData.value.race)
})

const selectedCareer = computed(() => {
  return availableCareers.value.find(career => career.name === formData.value.career)
})

const remainingPoints = computed(() => {
  const baseTotal = 160 // 8 attributes × 20 base
  const currentTotal = Object.values(formData.value.attributes).reduce((sum, val) => sum + val, 0)
  const maxTotal = 187 // 27 points to distribute
  return maxTotal - currentTotal
})

const availableSkills = computed((): SkillOption[] => {
  if (!selectedCareer.value) return []

  return selectedCareer.value.startingSkills.map(skill => ({
    name: skill,
    characteristic: getSkillCharacteristic(skill),
    required: true
  }))
})

const availableTalents = computed((): TalentOption[] => {
  if (!selectedCareer.value) return []

  return selectedCareer.value.startingTalents.map(talent => ({
    name: talent,
    description: getTalentDescription(talent),
    required: true
  }))
})

const availablePortraits = computed((): PortraitOption[] => {
  return [
    { id: '1', src: '/images/portraits/human-male-1.jpg', alt: 'Human Male Portrait 1' },
    { id: '2', src: '/images/portraits/human-female-1.jpg', alt: 'Human Female Portrait 1' },
    { id: '3', src: '/images/portraits/dwarf-male-1.jpg', alt: 'Dwarf Male Portrait 1' },
    { id: '4', src: '/images/portraits/elf-female-1.jpg', alt: 'Elf Female Portrait 1' },
    { id: '5', src: '/images/portraits/halfling-male-1.jpg', alt: 'Halfling Male Portrait 1' },
    { id: '6', src: '/images/portraits/generic-1.jpg', alt: 'Generic Portrait 1' }
  ]
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return !!formData.value.race
    case 2: return !!formData.value.career
    case 3: return remainingPoints.value === 0
    case 4: return true // Skills and talents are auto-selected
    case 5: return !!formData.value.name.trim()
    default: return false
  }
})

const canCreate = computed(() => {
  return canProceed.value && !isCreating.value
})

// Methods
const selectRace = (race: Race) => {
  formData.value.race = race.name
  // Reset career if it's not available for the new race
  if (formData.value.career && !availableCareers.value.some(c => c.name === formData.value.career)) {
    formData.value.career = ''
  }
}

const selectCareer = (career: Career) => {
  formData.value.career = career.name
  // Auto-select required skills and talents
  formData.value.skills = [...career.startingSkills]
  formData.value.talents = [...career.startingTalents]
}

const adjustAttribute = (attribute: string, change: number) => {
  const current = formData.value.attributes[attribute as keyof typeof formData.value.attributes]
  const newValue = current + change

  if (newValue >= 20 && newValue <= 40) {
    if (change > 0 && remainingPoints.value > 0) {
      formData.value.attributes[attribute as keyof typeof formData.value.attributes] = newValue
    } else if (change < 0) {
      formData.value.attributes[attribute as keyof typeof formData.value.attributes] = newValue
    }
  }
}

const getRaceModifier = (attribute: string): number => {
  return selectedRace.value?.attributeModifiers[attribute] || 0
}

const isSkillSelected = (skillName: string): boolean => {
  return formData.value.skills.includes(skillName)
}

const isTalentSelected = (talentName: string): boolean => {
  return formData.value.talents.includes(talentName)
}

const toggleSkill = (skill: SkillOption) => {
  if (skill.required) return

  const index = formData.value.skills.indexOf(skill.name)
  if (index > -1) {
    formData.value.skills.splice(index, 1)
  } else {
    formData.value.skills.push(skill.name)
  }
}

const toggleTalent = (talent: TalentOption) => {
  if (talent.required) return

  const index = formData.value.talents.indexOf(talent.name)
  if (index > -1) {
    formData.value.talents.splice(index, 1)
  } else {
    formData.value.talents.push(talent.name)
  }
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const validateForm = (): boolean => {
  errors.value = { name: '' }

  if (!formData.value.name.trim()) {
    errors.value.name = 'Character name is required'
    return false
  }

  return true
}

const createCharacter = async () => {
  if (!validateForm()) return

  isCreating.value = true

  try {
    const characterData: CreateCharacterRequest = {
      name: formData.value.name.trim(),
      race: formData.value.race,
      career: formData.value.career,
      attributes: {
        weaponSkill: formData.value.attributes.weaponSkill + getRaceModifier('weaponSkill'),
        ballisticSkill: formData.value.attributes.ballisticSkill + getRaceModifier('ballisticSkill'),
        strength: formData.value.attributes.strength + getRaceModifier('strength'),
        toughness: formData.value.attributes.toughness + getRaceModifier('toughness'),
        agility: formData.value.attributes.agility + getRaceModifier('agility'),
        intelligence: formData.value.attributes.intelligence + getRaceModifier('intelligence'),
        willpower: formData.value.attributes.willpower + getRaceModifier('willpower'),
        fellowship: formData.value.attributes.fellowship + getRaceModifier('fellowship')
      },
      background: formData.value.background,
      description: formData.value.description
    }

    const newCharacter = await characterStore.createCharacter(characterData)
    emit('created', newCharacter)
  } catch (error) {
    console.error('Failed to create character:', error)
    // Handle error - could show a notification
  } finally {
    isCreating.value = false
  }
}

// Helper functions
const getAttributeAbbreviation = (attribute: string): string => {
  const abbreviations: Record<string, string> = {
    weaponSkill: 'WS',
    ballisticSkill: 'BS',
    strength: 'S',
    toughness: 'T',
    agility: 'Ag',
    intelligence: 'Int',
    willpower: 'WP',
    fellowship: 'Fel'
  }
  return abbreviations[attribute] || attribute.slice(0, 3).toUpperCase()
}

const getAttributeName = (attribute: string): string => {
  const names: Record<string, string> = {
    weaponSkill: 'Weapon Skill',
    ballisticSkill: 'Ballistic Skill',
    strength: 'Strength',
    toughness: 'Toughness',
    agility: 'Agility',
    intelligence: 'Intelligence',
    willpower: 'Willpower',
    fellowship: 'Fellowship'
  }
  return names[attribute] || attribute
}

const getAttributeDescription = (attribute: string): string => {
  const descriptions: Record<string, string> = {
    weaponSkill: 'Melee combat ability',
    ballisticSkill: 'Ranged combat ability',
    strength: 'Physical power and damage',
    toughness: 'Resistance to damage',
    agility: 'Speed and dexterity',
    intelligence: 'Reasoning and memory',
    willpower: 'Mental fortitude',
    fellowship: 'Social skills and leadership'
  }
  return descriptions[attribute] || ''
}

const getAttributeIcon = (attribute: string): string => {
  const icons: Record<string, string> = {
    weaponSkill: 'sword',
    ballisticSkill: 'bow',
    strength: 'dumbbell',
    toughness: 'shield',
    agility: 'wind',
    intelligence: 'brain',
    willpower: 'heart',
    fellowship: 'users'
  }
  return icons[attribute] || 'circle'
}

const getSkillCharacteristic = (skill: string): string => {
  // Simplified mapping - in a real app this would be more comprehensive
  const skillCharacteristics: Record<string, string> = {
    'Melee (Basic)': 'WS',
    'Athletics': 'S',
    'Cool': 'WP',
    'Intimidate': 'S',
    'Channelling': 'WP',
    'Language (Magick)': 'Int',
    'Lore (Magic)': 'Int',
    'Perception': 'Int',
    'Animal Care': 'Int',
    'Climb': 'S',
    'Endurance': 'T',
    'Outdoor Survival': 'Int',
    'Heal': 'Int',
    'Lore (Theology)': 'Int',
    'Pray': 'Fel',
    'Charm': 'Fel',
    'Consume Alcohol': 'T',
    'Evaluate': 'Int',
    'Gossip': 'Fel',
    'Language (Classical)': 'Int',
    'Lore (Any)': 'Int',
    'Research': 'Int'
  }
  return skillCharacteristics[skill] || 'Int'
}

const getTalentDescription = (talent: string): string => {
  const descriptions: Record<string, string> = {
    'Combat Aware': 'Cannot be surprised in combat',
    'Strike Mighty Blow': 'Add Strength Bonus to damage',
    'Aethyric Attunement': 'Sense magical auras',
    'Petty Magic': 'Cast minor magical effects',
    'Hardy': 'Reduce damage from environmental effects',
    'Rover': 'Never count as lost in wilderness',
    'Bless': 'Grant divine blessings',
    'Invoke': 'Call upon divine intervention',
    'Dealmaker': 'Bonus to trade negotiations',
    'Suave': 'Bonus to social interactions',
    'Linguistics': 'Learn languages quickly',
    'Read/Write': 'Literacy in known languages'
  }
  return descriptions[talent] || 'Special ability'
}
</script>

<style scoped>
.character-creation-form {
  font-family: var(--wh-font-body);
}

.race-option,
.career-option {
  transition: all 0.2s ease;
}

.race-option:hover,
.career-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.attribute-row {
  transition: all 0.2s ease;
}

.attribute-row:hover {
  transform: scale(1.02);
}

.progress-indicator {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--wh-parchment);
  padding: 1rem 0;
  margin: -1rem 0 1rem 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .race-option,
  .career-option {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .race-option,
  .career-option,
  .attribute-row {
    transition: none !important;
  }

  .race-option:hover,
  .career-option:hover,
  .attribute-row:hover {
    transform: none !important;
  }
}
</style>
