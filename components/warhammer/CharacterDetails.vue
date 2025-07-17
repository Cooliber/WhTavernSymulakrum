<template>
  <div class="character-details">
    <!-- Character Header -->
    <div class="character-header mb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
        <!-- Portrait -->
        <div class="character-portrait">
          <OptimizedImage
            :src="character.portrait || '/images/portraits/default.jpg'"
            :alt="`Portrait of ${character.name}`"
            class="w-24 h-24 rounded-lg object-cover border-2 border-wh-empire-gold"
          />
        </div>
        
        <!-- Basic Info -->
        <div class="flex-1">
          <h2 class="text-3xl font-wh-display text-wh-dark-wood mb-2">
            {{ character.name }}
          </h2>
          <p class="text-lg text-wh-wood-brown mb-2">
            {{ character.race }} {{ character.career }}
          </p>
          <div class="flex items-center space-x-4 text-sm text-wh-wood-brown">
            <span>Level {{ character.level }}</span>
            <span>•</span>
            <span>{{ character.experience }} XP</span>
            <span>•</span>
            <span>Created {{ formatDate(character.createdAt) }}</span>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <WarhammerButton
            variant="outline"
            size="sm"
            icon-left="edit"
            @click="toggleEditMode"
          >
            {{ editMode ? 'Save' : 'Edit' }}
          </WarhammerButton>
          
          <WarhammerButton
            variant="ghost"
            size="sm"
            icon-left="download"
            @click="exportCharacter"
          >
            Export
          </WarhammerButton>
          
          <WarhammerButton
            variant="ghost"
            size="sm"
            icon-left="x"
            @click="$emit('close')"
          >
            Close
          </WarhammerButton>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation mb-6">
      <div class="flex flex-wrap gap-2">
        <WarhammerButton
          v-for="tab in tabs"
          :key="tab.id"
          :variant="activeTab === tab.id ? 'primary' : 'ghost'"
          size="sm"
          :icon-left="tab.icon"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </WarhammerButton>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="overview-tab">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Status Panel -->
          <WarhammerCard title="Character Status" variant="parchment">
            <div class="space-y-4">
              <!-- Health -->
              <div class="status-item">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-wh-heading text-wh-dark-wood">Wounds</span>
                  <div class="flex items-center space-x-2">
                    <WarhammerButton
                      v-if="editMode"
                      variant="ghost"
                      size="xs"
                      :disabled="character.wounds.current <= 0"
                      @click="adjustWounds(-1)"
                    >
                      -
                    </WarhammerButton>
                    <span class="text-lg font-bold">
                      {{ character.wounds.current }}/{{ character.wounds.maximum }}
                    </span>
                    <WarhammerButton
                      v-if="editMode"
                      variant="ghost"
                      size="xs"
                      :disabled="character.wounds.current >= character.wounds.maximum"
                      @click="adjustWounds(1)"
                    >
                      +
                    </WarhammerButton>
                  </div>
                </div>
                <div class="w-full bg-wh-aged-paper rounded-full h-3">
                  <div
                    class="bg-red-500 h-3 rounded-full transition-all duration-300"
                    :style="{ width: `${(character.wounds.current / character.wounds.maximum) * 100}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Fate Points -->
              <div class="status-item">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-wh-heading text-wh-dark-wood">Fate Points</span>
                  <div class="flex items-center space-x-2">
                    <WarhammerButton
                      v-if="editMode"
                      variant="ghost"
                      size="xs"
                      :disabled="character.fate.current <= 0"
                      @click="adjustFate(-1)"
                    >
                      -
                    </WarhammerButton>
                    <span class="text-lg font-bold">
                      {{ character.fate.current }}/{{ character.fate.maximum }}
                    </span>
                    <WarhammerButton
                      v-if="editMode"
                      variant="ghost"
                      size="xs"
                      :disabled="character.fate.current >= character.fate.maximum"
                      @click="adjustFate(1)"
                    >
                      +
                    </WarhammerButton>
                  </div>
                </div>
                <div class="flex space-x-1">
                  <div
                    v-for="i in character.fate.maximum"
                    :key="i"
                    class="w-6 h-6 rounded-full border-2 border-yellow-400 flex items-center justify-center"
                    :class="i <= character.fate.current ? 'bg-yellow-400' : 'bg-transparent'"
                  >
                    <WarhammerIcon
                      v-if="i <= character.fate.current"
                      name="star"
                      size="xs"
                      class="text-yellow-800"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Experience Progress -->
              <div class="status-item">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-wh-heading text-wh-dark-wood">Experience</span>
                  <span class="text-sm text-wh-wood-brown">
                    {{ character.experience }} / {{ nextLevelXP }} XP
                  </span>
                </div>
                <div class="w-full bg-wh-aged-paper rounded-full h-3">
                  <div
                    class="bg-wh-empire-gold h-3 rounded-full transition-all duration-300"
                    :style="{ width: `${experiencePercentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </WarhammerCard>
          
          <!-- Quick Stats -->
          <WarhammerCard title="Quick Stats" variant="parchment">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(value, key) in primaryAttributes"
                :key="key"
                class="stat-item text-center p-3 bg-wh-aged-paper rounded border border-wh-wood-brown"
              >
                <WarhammerIcon
                  :name="getAttributeIcon(key)"
                  size="md"
                  class="text-wh-empire-gold mx-auto mb-2"
                />
                <div class="text-xs font-medium text-wh-wood-brown uppercase">
                  {{ getAttributeAbbreviation(key) }}
                </div>
                <div class="text-xl font-bold text-wh-dark-wood">{{ value }}</div>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>

      <!-- Attributes Tab -->
      <div v-if="activeTab === 'attributes'" class="attributes-tab">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WarhammerCard title="Primary Attributes" variant="parchment">
            <div class="space-y-3">
              <div
                v-for="(value, key) in character.attributes"
                :key="key"
                class="attribute-row flex items-center justify-between p-3 bg-wh-aged-paper rounded"
              >
                <div class="flex items-center space-x-3">
                  <WarhammerIcon
                    :name="getAttributeIcon(key)"
                    size="sm"
                    class="text-wh-empire-gold"
                  />
                  <span class="font-wh-heading text-wh-dark-wood">
                    {{ getAttributeName(key) }}
                  </span>
                </div>
                <div class="text-xl font-bold text-wh-dark-wood">
                  {{ value }}
                </div>
              </div>
            </div>
          </WarhammerCard>
          
          <WarhammerCard title="Derived Statistics" variant="parchment">
            <div class="space-y-3">
              <div class="stat-row flex items-center justify-between p-3 bg-wh-aged-paper rounded">
                <span class="font-wh-heading text-wh-dark-wood">Movement</span>
                <span class="text-lg font-bold text-wh-dark-wood">{{ movement }}</span>
              </div>
              <div class="stat-row flex items-center justify-between p-3 bg-wh-aged-paper rounded">
                <span class="font-wh-heading text-wh-dark-wood">Initiative Bonus</span>
                <span class="text-lg font-bold text-wh-dark-wood">{{ initiativeBonus }}</span>
              </div>
              <div class="stat-row flex items-center justify-between p-3 bg-wh-aged-paper rounded">
                <span class="font-wh-heading text-wh-dark-wood">Attacks</span>
                <span class="text-lg font-bold text-wh-dark-wood">{{ attacks }}</span>
              </div>
              <div class="stat-row flex items-center justify-between p-3 bg-wh-aged-paper rounded">
                <span class="font-wh-heading text-wh-dark-wood">Strength Bonus</span>
                <span class="text-lg font-bold text-wh-dark-wood">{{ strengthBonus }}</span>
              </div>
              <div class="stat-row flex items-center justify-between p-3 bg-wh-aged-paper rounded">
                <span class="font-wh-heading text-wh-dark-wood">Toughness Bonus</span>
                <span class="text-lg font-bold text-wh-dark-wood">{{ toughnessBonus }}</span>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>

      <!-- Skills Tab -->
      <div v-if="activeTab === 'skills'" class="skills-tab">
        <WarhammerCard title="Skills" variant="parchment">
          <div class="space-y-2">
            <div
              v-for="skill in character.skills"
              :key="skill.name"
              class="skill-row flex items-center justify-between p-3 bg-wh-aged-paper rounded hover:bg-wh-wood-brown hover:text-wh-bone transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span class="font-medium">{{ skill.name }}</span>
                <span class="text-xs text-wh-wood-brown">({{ skill.characteristic }})</span>
                <span v-if="skill.isSpecialized" class="text-xs bg-wh-empire-gold text-wh-dark-wood px-2 py-1 rounded">
                  {{ skill.specialization }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-wh-wood-brown">
                  {{ getSkillTotal(skill) }}
                </span>
                <span class="text-xs text-wh-wood-brown">
                  ({{ getBaseAttribute(skill.characteristic) }}+{{ skill.advances }})
                </span>
              </div>
            </div>
          </div>
        </WarhammerCard>
      </div>

      <!-- Equipment Tab -->
      <div v-if="activeTab === 'equipment'" class="equipment-tab">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WarhammerCard title="Equipped Items" variant="parchment">
            <div class="space-y-2">
              <div
                v-for="item in equippedItems"
                :key="item.id"
                class="equipment-item p-3 bg-wh-aged-paper rounded border border-wh-wood-brown"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <WarhammerIcon
                      :name="getEquipmentIcon(item)"
                      size="sm"
                      class="text-wh-empire-gold"
                    />
                    <div>
                      <span class="font-medium text-wh-dark-wood">{{ item.name }}</span>
                      <p class="text-xs text-wh-wood-brown">{{ item.description }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div v-if="item.damage" class="text-sm font-bold text-red-600">
                      {{ item.damage }}
                    </div>
                    <div v-if="item.armorPoints" class="text-sm font-bold text-blue-600">
                      AP: {{ Object.values(item.armorPoints).join('/') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </WarhammerCard>
          
          <WarhammerCard title="Inventory" variant="parchment">
            <div class="space-y-2">
              <div
                v-for="item in unequippedItems"
                :key="item.id"
                class="inventory-item p-2 bg-wh-aged-paper rounded border border-wh-wood-brown opacity-75"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <WarhammerIcon
                      :name="getEquipmentIcon(item)"
                      size="xs"
                      class="text-wh-wood-brown"
                    />
                    <span class="text-sm text-wh-dark-wood">{{ item.name }}</span>
                    <span v-if="item.quantity > 1" class="text-xs text-wh-wood-brown">
                      ({{ item.quantity }})
                    </span>
                  </div>
                  <span class="text-xs text-wh-wood-brown">
                    {{ item.encumbrance }} enc
                  </span>
                </div>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>

      <!-- Background Tab -->
      <div v-if="activeTab === 'background'" class="background-tab">
        <div class="space-y-6">
          <WarhammerCard title="Character Background" variant="parchment">
            <div class="space-y-4">
              <div v-if="character.motivation">
                <h4 class="font-wh-heading text-wh-dark-wood mb-2">Motivation</h4>
                <p class="text-wh-wood-brown italic">"{{ character.motivation }}"</p>
              </div>
              
              <div v-if="character.background">
                <h4 class="font-wh-heading text-wh-dark-wood mb-2">Background</h4>
                <p class="text-wh-wood-brown leading-relaxed">{{ character.background }}</p>
              </div>
              
              <div v-if="character.description">
                <h4 class="font-wh-heading text-wh-dark-wood mb-2">Physical Description</h4>
                <p class="text-wh-wood-brown leading-relaxed">{{ character.description }}</p>
              </div>
            </div>
          </WarhammerCard>
          
          <WarhammerCard title="Talents" variant="parchment">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="talent in character.talents"
                :key="talent.name"
                class="talent-item p-3 bg-wh-aged-paper rounded border border-wh-wood-brown"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <h5 class="font-medium text-wh-dark-wood">{{ talent.name }}</h5>
                    <p class="text-xs text-wh-wood-brown mt-1">{{ talent.description }}</p>
                    <p class="text-xs text-wh-wood-brown mt-1">Tests: {{ talent.tests }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-wh-wood-brown">
                      {{ talent.currentRank }}/{{ talent.maxRank }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </WarhammerCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character, Skill, Equipment } from '~/stores/character'

interface Props {
  character: Character
}

interface Tab {
  id: string
  label: string
  icon: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [character: Character]
  close: []
}>()

// Store
const characterStore = useCharacterStore()

// Reactive state
const activeTab = ref('overview')
const editMode = ref(false)

// Tab configuration
const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: 'user' },
  { id: 'attributes', label: 'Attributes', icon: 'dumbbell' },
  { id: 'skills', label: 'Skills', icon: 'target' },
  { id: 'equipment', label: 'Equipment', icon: 'sword' },
  { id: 'background', label: 'Background', icon: 'scroll' }
]

// Computed properties
const primaryAttributes = computed(() => ({
  weaponSkill: props.character.attributes.weaponSkill,
  ballisticSkill: props.character.attributes.ballisticSkill,
  strength: props.character.attributes.strength,
  toughness: props.character.attributes.toughness
}))

const nextLevelXP = computed(() => {
  return props.character.level * 100
})

const experiencePercentage = computed(() => {
  const baseXP = (props.character.level - 1) * 100
  const nextXP = props.character.level * 100
  const currentXP = props.character.experience || baseXP

  return Math.min(((currentXP - baseXP) / (nextXP - baseXP)) * 100, 100)
})

const movement = computed(() => {
  // Base movement is typically 4 for humans, modified by race
  return 4
})

const initiativeBonus = computed(() => {
  return Math.floor(props.character.attributes.agility / 10)
})

const attacks = computed(() => {
  // Base attacks is 1, can be modified by career/talents
  return 1
})

const strengthBonus = computed(() => {
  return Math.floor(props.character.attributes.strength / 10)
})

const toughnessBonus = computed(() => {
  return Math.floor(props.character.attributes.toughness / 10)
})

const equippedItems = computed(() => {
  return props.character.equipment.filter(item => item.equipped)
})

const unequippedItems = computed(() => {
  return props.character.equipment.filter(item => !item.equipped)
})

// Methods
const toggleEditMode = () => {
  if (editMode.value) {
    // Save changes
    saveChanges()
  }
  editMode.value = !editMode.value
}

const saveChanges = async () => {
  try {
    await characterStore.updateCharacter(props.character.id, {
      wounds: props.character.wounds,
      fate: props.character.fate
    })
  } catch (error) {
    console.error('Failed to save character changes:', error)
  }
}

const adjustWounds = async (change: number) => {
  const newCurrent = Math.max(0, Math.min(props.character.wounds.maximum, props.character.wounds.current + change))

  try {
    await characterStore.updateCharacter(props.character.id, {
      wounds: {
        current: newCurrent,
        maximum: props.character.wounds.maximum
      }
    })
  } catch (error) {
    console.error('Failed to update wounds:', error)
  }
}

const adjustFate = async (change: number) => {
  const newCurrent = Math.max(0, Math.min(props.character.fate.maximum, props.character.fate.current + change))

  try {
    await characterStore.updateCharacter(props.character.id, {
      fate: {
        current: newCurrent,
        maximum: props.character.fate.maximum
      }
    })
  } catch (error) {
    console.error('Failed to update fate points:', error)
  }
}

const exportCharacter = () => {
  // Create a downloadable JSON file of the character
  const dataStr = JSON.stringify(props.character, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = `${props.character.name.replace(/\s+/g, '_')}_character.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const getSkillTotal = (skill: Skill): number => {
  const baseAttribute = getBaseAttribute(skill.characteristic)
  return baseAttribute + skill.advances
}

const getBaseAttribute = (characteristic: string): number => {
  const charMap: Record<string, keyof typeof props.character.attributes> = {
    'WS': 'weaponSkill',
    'BS': 'ballisticSkill',
    'S': 'strength',
    'T': 'toughness',
    'Ag': 'agility',
    'Int': 'intelligence',
    'WP': 'willpower',
    'Fel': 'fellowship'
  }

  const attrKey = charMap[characteristic]
  return attrKey ? props.character.attributes[attrKey] : 0
}

const getEquipmentIcon = (item: Equipment): string => {
  const iconMap: Record<string, string> = {
    'melee_weapon': 'sword',
    'ranged_weapon': 'bow',
    'armor': 'shield',
    'trapping': 'package',
    'ammunition': 'target'
  }
  return iconMap[item.type] || 'package'
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

// Helper functions (shared with CharacterCreationForm)
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
</script>

<style scoped>
.character-details {
  font-family: var(--wh-font-body);
}

.character-portrait img {
  transition: all 0.2s ease;
}

.character-portrait:hover img {
  transform: scale(1.05);
}

.tab-navigation {
  border-bottom: 2px solid var(--wh-wood-brown);
  padding-bottom: 1rem;
}

.stat-item,
.attribute-row,
.skill-row,
.equipment-item,
.talent-item {
  transition: all 0.2s ease;
}

.stat-item:hover,
.attribute-row:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skill-row:hover {
  transform: translateX(4px);
}

.equipment-item {
  position: relative;
}

.equipment-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--wh-empire-gold);
  border-radius: 0 2px 2px 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .stat-item,
  .attribute-row,
  .skill-row,
  .equipment-item,
  .talent-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .character-portrait img,
  .stat-item,
  .attribute-row,
  .skill-row {
    transition: none !important;
  }

  .character-portrait:hover img,
  .stat-item:hover,
  .attribute-row:hover,
  .skill-row:hover {
    transform: none !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .character-header {
    text-align: center;
  }

  .tab-navigation .flex {
    justify-content: center;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
