<template>
  <WarhammerCard
    :title="quest.title"
    :subtitle="questSubtitle"
    variant="parchment"
    :interactive="true"
    :animated="true"
    class="quest-card"
    @click="$emit('view', quest)"
  >
    <!-- Quest Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <WarhammerIcon
            :name="getQuestTypeIcon(quest.type)"
            :size="'md'"
            class="text-wh-empire-gold"
          />
          <div>
            <h3 class="font-wh-heading text-wh-dark-wood">{{ quest.title }}</h3>
            <p class="text-xs text-wh-wood-brown">{{ questSubtitle }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Difficulty Badge -->
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="difficultyClasses"
          >
            {{ quest.difficulty }}
          </span>
          
          <!-- Time Limit Indicator -->
          <div
            v-if="quest.timeLimit"
            class="flex items-center text-xs text-wh-wood-brown"
            :title="`Time limit: ${quest.timeLimit} hours`"
          >
            <WarhammerIcon name="clock" size="xs" class="mr-1" />
            {{ quest.timeLimit }}h
          </div>
        </div>
      </div>
    </template>

    <!-- Quest Content -->
    <div class="quest-content space-y-4">
      <!-- Brief Description -->
      <p class="text-sm text-wh-wood-brown leading-relaxed">
        {{ quest.briefDescription }}
      </p>
      
      <!-- Quest Details Grid -->
      <div class="grid grid-cols-2 gap-3 text-xs">
        <!-- Quest Giver -->
        <div class="quest-detail">
          <div class="flex items-center space-x-1 mb-1">
            <WarhammerIcon name="user" size="xs" class="text-wh-wood-brown" />
            <span class="font-semibold text-wh-wood-brown">Quest Giver</span>
          </div>
          <p class="text-wh-dark-wood">{{ quest.questGiver }}</p>
        </div>
        
        <!-- Location -->
        <div class="quest-detail">
          <div class="flex items-center space-x-1 mb-1">
            <WarhammerIcon name="map-pin" size="xs" class="text-wh-wood-brown" />
            <span class="font-semibold text-wh-wood-brown">Location</span>
          </div>
          <p class="text-wh-dark-wood">{{ quest.location }}</p>
        </div>
        
        <!-- Level Range -->
        <div class="quest-detail">
          <div class="flex items-center space-x-1 mb-1">
            <WarhammerIcon name="trending-up" size="xs" class="text-wh-wood-brown" />
            <span class="font-semibold text-wh-wood-brown">Level</span>
          </div>
          <p class="text-wh-dark-wood">
            {{ quest.minLevel }}{{ quest.maxLevel ? `-${quest.maxLevel}` : '+' }}
          </p>
        </div>
        
        <!-- Party Size -->
        <div class="quest-detail">
          <div class="flex items-center space-x-1 mb-1">
            <WarhammerIcon name="users" size="xs" class="text-wh-wood-brown" />
            <span class="font-semibold text-wh-wood-brown">Party Size</span>
          </div>
          <p class="text-wh-dark-wood">Max {{ quest.maxPartySize }}</p>
        </div>
      </div>
      
      <!-- Objectives Preview -->
      <div class="objectives-preview">
        <div class="flex items-center space-x-1 mb-2">
          <WarhammerIcon name="target" size="xs" class="text-wh-wood-brown" />
          <span class="text-xs font-semibold text-wh-wood-brown">Objectives</span>
        </div>
        <div class="space-y-1">
          <div
            v-for="objective in quest.objectives.slice(0, 2)"
            :key="objective.id"
            class="flex items-center space-x-2 text-xs"
          >
            <div class="w-2 h-2 rounded-full bg-wh-wood-brown"></div>
            <span class="text-wh-dark-wood">{{ objective.description }}</span>
          </div>
          <div
            v-if="quest.objectives.length > 2"
            class="flex items-center space-x-2 text-xs text-wh-wood-brown"
          >
            <div class="w-2 h-2 rounded-full bg-wh-wood-brown opacity-50"></div>
            <span>+{{ quest.objectives.length - 2 }} more objectives</span>
          </div>
        </div>
      </div>
      
      <!-- Rewards Preview -->
      <div class="rewards-preview">
        <div class="flex items-center space-x-1 mb-2">
          <WarhammerIcon name="gift" size="xs" class="text-wh-wood-brown" />
          <span class="text-xs font-semibold text-wh-wood-brown">Rewards</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="reward in quest.rewards.slice(0, 3)"
            :key="reward.type + reward.amount"
            class="inline-flex items-center px-2 py-1 text-xs bg-wh-empire-gold text-wh-dark-wood rounded-full"
          >
            <WarhammerIcon
              :name="getRewardIcon(reward.type)"
              size="xs"
              class="mr-1"
            />
            {{ formatReward(reward) }}
          </span>
          <span
            v-if="quest.rewards.length > 3"
            class="inline-flex items-center px-2 py-1 text-xs bg-wh-wood-brown text-wh-bone rounded-full"
          >
            +{{ quest.rewards.length - 3 }}
          </span>
        </div>
      </div>
      
      <!-- Tags -->
      <div v-if="quest.tags.length > 0" class="tags">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in quest.tags.slice(0, 4)"
            :key="tag"
            class="px-2 py-1 text-xs bg-wh-aged-paper text-wh-wood-brown rounded border border-wh-wood-brown"
          >
            {{ tag }}
          </span>
          <span
            v-if="quest.tags.length > 4"
            class="px-2 py-1 text-xs bg-wh-aged-paper text-wh-wood-brown rounded border border-wh-wood-brown opacity-75"
          >
            +{{ quest.tags.length - 4 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quest Actions -->
    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 text-xs text-wh-wood-brown">
          <WarhammerIcon name="calendar" size="xs" />
          <span>Posted {{ formatDate(quest.createdAt) }}</span>
        </div>
        
        <div class="flex space-x-2">
          <WarhammerButton
            variant="outline"
            size="sm"
            @click.stop="$emit('view', quest)"
          >
            View Details
          </WarhammerButton>
          
          <WarhammerButton
            variant="primary"
            size="sm"
            :disabled="!canAcceptQuest"
            @click.stop="$emit('accept', quest)"
          >
            Accept Quest
          </WarhammerButton>
        </div>
      </div>
    </template>
  </WarhammerCard>
</template>

<script setup lang="ts">
import type { Quest, QuestReward } from '~/stores/quest'

interface Props {
  quest: Quest
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [quest: Quest]
  accept: [quest: Quest]
}>()

// Computed properties
const questSubtitle = computed(() => {
  return `${props.quest.type} • ${props.quest.location}`
})

const difficultyClasses = computed(() => {
  const classes = {
    easy: 'bg-green-100 text-green-800 border border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    hard: 'bg-orange-100 text-orange-800 border border-orange-200',
    legendary: 'bg-red-100 text-red-800 border border-red-200'
  }
  return classes[props.quest.difficulty]
})

const canAcceptQuest = computed(() => {
  // Add logic to check if character meets requirements
  return props.quest.status === 'available'
})

// Methods
const getQuestTypeIcon = (type: Quest['type']): string => {
  const icons = {
    main: 'crown',
    side: 'compass',
    daily: 'sun',
    guild: 'shield',
    personal: 'user'
  }
  return icons[type] || 'scroll'
}

const getRewardIcon = (type: QuestReward['type']): string => {
  const icons = {
    experience: 'trending-up',
    gold: 'coins',
    item: 'package',
    reputation: 'star',
    skill: 'target'
  }
  return icons[type] || 'gift'
}

const formatReward = (reward: QuestReward): string => {
  switch (reward.type) {
    case 'experience':
      return `${reward.amount} XP`
    case 'gold':
      return `${reward.amount} GC`
    case 'item':
      return reward.itemName || 'Item'
    case 'reputation':
      return 'Reputation'
    case 'skill':
      return 'Skill Point'
    default:
      return reward.description
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>

<style scoped>
.quest-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.quest-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.quest-detail {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.25rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.objectives-preview,
.rewards-preview,
.tags {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .quest-detail,
  .objectives-preview,
  .rewards-preview,
  .tags {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .quest-card {
    transition: none !important;
  }
  
  .quest-card:hover {
    transform: none !important;
  }
}
</style>
