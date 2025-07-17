<template>
  <WarhammerCard
    :title="character.name"
    :subtitle="`${character.race} ${character.career}`"
    :faction="getFactionFromRace(character.race)"
    :interactive="interactive"
    :pressed="selected"
    :image="character.portrait"
    :image-alt="`Portrait of ${character.name}`"
    variant="parchment"
    :size="size"
    class="character-card"
    @click="handleClick"
  >
    <template #actions>
      <WarhammerButton
        v-if="showActions"
        variant="ghost"
        size="sm"
        icon-left="more-horizontal"
        aria-label="Character actions"
        @click.stop="showActionsMenu = !showActionsMenu"
      />
      
      <!-- Actions Menu -->
      <div
        v-if="showActionsMenu"
        class="absolute top-8 right-0 z-10 bg-wh-parchment border border-wh-aged-paper rounded-md shadow-lg p-2 space-y-1"
        @click.stop
      >
        <WarhammerButton
          variant="ghost"
          size="sm"
          icon-left="edit"
          class="w-full justify-start"
          @click="handleEdit"
        >
          Edit
        </WarhammerButton>
        <WarhammerButton
          variant="ghost"
          size="sm"
          icon-left="copy"
          class="w-full justify-start"
          @click="handleDuplicate"
        >
          Duplicate
        </WarhammerButton>
        <WarhammerButton
          variant="ghost"
          size="sm"
          icon-left="trash"
          class="w-full justify-start text-red-600"
          @click="handleDelete"
        >
          Delete
        </WarhammerButton>
      </div>
    </template>
    
    <!-- Character Stats Overview -->
    <div class="character-stats grid grid-cols-2 gap-3 mb-4">
      <div class="stat-group">
        <h4 class="text-xs font-semibold text-wh-wood-brown uppercase tracking-wide mb-1">
          Level & Experience
        </h4>
        <div class="flex items-center space-x-2">
          <span class="text-lg font-bold text-wh-dark-wood">{{ character.level }}</span>
          <div class="flex-1 bg-wh-aged-paper rounded-full h-2">
            <div
              class="bg-wh-empire-gold h-2 rounded-full transition-all duration-300"
              :style="{ width: `${experiencePercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="stat-group">
        <h4 class="text-xs font-semibold text-wh-wood-brown uppercase tracking-wide mb-1">
          Health
        </h4>
        <div class="flex items-center space-x-2">
          <WarhammerIcon name="heart" size="sm" class="text-red-500" />
          <span class="text-sm font-medium">
            {{ character.wounds.current }}/{{ character.wounds.maximum }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Primary Attributes -->
    <div class="attributes-grid grid grid-cols-4 gap-2 mb-4">
      <div
        v-for="(value, key) in primaryAttributes"
        :key="key"
        class="attribute-item text-center p-2 bg-wh-aged-paper rounded border border-wh-wood-brown"
      >
        <div class="text-xs font-medium text-wh-wood-brown uppercase">
          {{ getAttributeAbbreviation(key) }}
        </div>
        <div class="text-lg font-bold text-wh-dark-wood">{{ value }}</div>
      </div>
    </div>
    
    <!-- Skills Preview -->
    <div v-if="topSkills.length > 0" class="skills-preview mb-4">
      <h4 class="text-xs font-semibold text-wh-wood-brown uppercase tracking-wide mb-2">
        Top Skills
      </h4>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="skill in topSkills"
          :key="skill.name"
          class="inline-flex items-center px-2 py-1 text-xs bg-wh-empire-gold text-wh-dark-wood rounded-full"
        >
          {{ skill.name }}
          <span class="ml-1 font-semibold">{{ getSkillTotal(skill) }}</span>
        </span>
      </div>
    </div>
    
    <!-- Equipment Preview -->
    <div v-if="equippedWeapons.length > 0" class="equipment-preview">
      <h4 class="text-xs font-semibold text-wh-wood-brown uppercase tracking-wide mb-2">
        Equipped Weapons
      </h4>
      <div class="space-y-1">
        <div
          v-for="weapon in equippedWeapons"
          :key="weapon.id"
          class="flex items-center space-x-2 text-sm"
        >
          <WarhammerIcon :name="getWeaponIcon(weapon)" size="xs" />
          <span class="text-wh-dark-wood">{{ weapon.name }}</span>
          <span class="text-wh-wood-brown text-xs">{{ weapon.damage }}</span>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex items-center justify-between text-xs text-wh-wood-brown">
        <span>Created {{ formatDate(character.createdAt) }}</span>
        <div class="flex items-center space-x-2">
          <WarhammerIcon
            v-if="character.fate.current > 0"
            name="star"
            size="xs"
            class="text-yellow-500"
          />
          <span v-if="character.fate.current > 0">{{ character.fate.current }} Fate</span>
        </div>
      </div>
    </template>
  </WarhammerCard>
</template>

<script setup lang="ts">
interface Props {
  character: Character
  interactive?: boolean
  selected?: boolean
  showActions?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  interactive: true,
  showActions: true,
  size: 'md'
})

const emit = defineEmits<{
  click: [character: Character]
  edit: [character: Character]
  duplicate: [character: Character]
  delete: [character: Character]
}>()

// Reactive state
const showActionsMenu = ref(false)

// Computed properties
const primaryAttributes = computed(() => ({
  weaponSkill: props.character.attributes.weaponSkill,
  ballisticSkill: props.character.attributes.ballisticSkill,
  strength: props.character.attributes.strength,
  toughness: props.character.attributes.toughness
}))

const experiencePercentage = computed(() => {
  // Calculate experience percentage for current level
  const baseXP = (props.character.level - 1) * 100
  const nextLevelXP = props.character.level * 100
  const currentXP = props.character.experience || baseXP
  
  return Math.min(((currentXP - baseXP) / (nextLevelXP - baseXP)) * 100, 100)
})

const topSkills = computed(() => {
  return props.character.skills
    .filter(skill => skill.advances > 0)
    .sort((a, b) => getSkillTotal(b) - getSkillTotal(a))
    .slice(0, 3)
})

const equippedWeapons = computed(() => {
  return props.character.equipment
    .filter(item => item.equipped && (item.type === 'melee_weapon' || item.type === 'ranged_weapon'))
    .slice(0, 2)
})

// Methods
const getFactionFromRace = (race: string): string => {
  const raceToFaction: Record<string, string> = {
    'Human': 'empire',
    'Dwarf': 'dwarfs',
    'Halfling': 'empire',
    'High Elf': 'elves',
    'Wood Elf': 'elves',
    'Dark Elf': 'elves'
  }
  return raceToFaction[race] || 'empire'
}

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

const getSkillTotal = (skill: Skill): number => {
  const baseAttribute = props.character.attributes[skill.characteristic as keyof typeof props.character.attributes] || 0
  return baseAttribute + skill.advances
}

const getWeaponIcon = (weapon: Equipment): string => {
  if (weapon.type === 'ranged_weapon') return 'bow'
  if (weapon.group === 'two_handed') return 'sword'
  if (weapon.group === 'basic') return 'sword'
  return 'sword'
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

// Event handlers
const handleClick = () => {
  emit('click', props.character)
}

const handleEdit = () => {
  showActionsMenu.value = false
  emit('edit', props.character)
}

const handleDuplicate = () => {
  showActionsMenu.value = false
  emit('duplicate', props.character)
}

const handleDelete = () => {
  showActionsMenu.value = false
  emit('delete', props.character)
}

// Close actions menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.character-card')) {
      showActionsMenu.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
.character-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.character-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .character-card {
    transition: none !important;
  }

  .character-card:hover {
    transform: none !important;
  }
}

.stat-group {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.attribute-item {
  transition: all 0.2s ease;
}

.attribute-item:hover {
  background: var(--wh-empire-gold);
  color: var(--wh-dark-wood);
  transform: scale(1.05);
}

.skills-preview .inline-flex {
  transition: all 0.2s ease;
}

.skills-preview .inline-flex:hover {
  background: var(--wh-wood-brown);
  color: var(--wh-bone);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .stat-group,
  .attribute-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .character-card,
  .attribute-item,
  .skills-preview .inline-flex {
    transition: none !important;
  }
  
  .character-card:hover {
    transform: none !important;
  }
}
</style>
