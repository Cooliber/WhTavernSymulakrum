<template>
  <div class="quest-details">
    <!-- Quest Header -->
    <div class="quest-header mb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
        <!-- Quest Giver Portrait -->
        <div v-if="quest.questGiverPortrait" class="quest-giver-portrait">
          <OptimizedImage
            :src="quest.questGiverPortrait"
            :alt="`Portrait of ${quest.questGiver}`"
            class="w-20 h-20 rounded-lg object-cover border-2 border-wh-empire-gold"
          />
        </div>
        
        <!-- Quest Info -->
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <WarhammerIcon
              :name="getQuestTypeIcon(quest.type)"
              size="lg"
              class="text-wh-empire-gold"
            />
            <div>
              <h2 class="text-2xl font-wh-display text-wh-dark-wood">
                {{ quest.title }}
              </h2>
              <p class="text-wh-wood-brown">
                {{ quest.type }} quest • {{ quest.difficulty }} difficulty
              </p>
            </div>
          </div>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-wh-wood-brown">
            <div class="flex items-center space-x-1">
              <WarhammerIcon name="user" size="xs" />
              <span>{{ quest.questGiver }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <WarhammerIcon name="map-pin" size="xs" />
              <span>{{ quest.location }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <WarhammerIcon name="trending-up" size="xs" />
              <span>Level {{ quest.minLevel }}{{ quest.maxLevel ? `-${quest.maxLevel}` : '+' }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <WarhammerIcon name="users" size="xs" />
              <span>Max {{ quest.maxPartySize }} players</span>
            </div>
            <div v-if="quest.timeLimit" class="flex items-center space-x-1">
              <WarhammerIcon name="clock" size="xs" />
              <span>{{ quest.timeLimit }} hours</span>
            </div>
          </div>
        </div>
        
        <!-- Quest Status -->
        <div class="quest-status">
          <span
            class="px-3 py-2 text-sm font-semibold rounded-lg"
            :class="statusClasses"
          >
            {{ quest.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quest Description -->
    <div class="quest-description mb-6">
      <WarhammerCard title="Quest Description" variant="parchment">
        <p class="text-wh-wood-brown leading-relaxed mb-4">
          {{ quest.description }}
        </p>
        
        <div v-if="quest.lore" class="lore-section">
          <h4 class="font-wh-heading text-wh-dark-wood mb-2">Background Lore</h4>
          <p class="text-sm text-wh-wood-brown italic leading-relaxed">
            {{ quest.lore }}
          </p>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Objectives -->
    <div class="quest-objectives mb-6">
      <WarhammerCard title="Objectives" variant="parchment">
        <div class="space-y-3">
          <div
            v-for="(objective, index) in quest.objectives"
            :key="objective.id"
            class="objective-item"
          >
            <div class="flex items-start space-x-3 p-3 bg-wh-aged-paper rounded border border-wh-wood-brown">
              <div class="flex-shrink-0 mt-1">
                <div
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  :class="objective.completed ? 'bg-green-500 border-green-500' : 'border-wh-wood-brown'"
                >
                  <WarhammerIcon
                    v-if="objective.completed"
                    name="check"
                    size="xs"
                    class="text-white"
                  />
                  <span
                    v-else
                    class="text-xs font-bold text-wh-wood-brown"
                  >
                    {{ index + 1 }}
                  </span>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h5 class="font-medium text-wh-dark-wood">
                    {{ objective.description }}
                  </h5>
                  <div class="flex items-center space-x-2">
                    <span
                      v-if="objective.optional"
                      class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      Optional
                    </span>
                    <WarhammerIcon
                      :name="getObjectiveTypeIcon(objective.type)"
                      size="xs"
                      class="text-wh-wood-brown"
                    />
                  </div>
                </div>
                
                <div v-if="objective.type === 'kill' || objective.type === 'collect'" class="progress-info">
                  <div class="flex items-center justify-between text-xs text-wh-wood-brown mb-1">
                    <span>Progress</span>
                    <span>{{ objective.currentCount }}/{{ objective.requiredCount }}</span>
                  </div>
                  <div class="w-full bg-wh-wood-brown rounded-full h-2">
                    <div
                      class="bg-wh-empire-gold h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${(objective.currentCount / objective.requiredCount) * 100}%` }"
                    ></div>
                  </div>
                </div>
                
                <p v-if="objective.target" class="text-xs text-wh-wood-brown mt-1">
                  Target: {{ objective.target }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Rewards -->
    <div class="quest-rewards mb-6">
      <WarhammerCard title="Rewards" variant="parchment">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="reward in quest.rewards"
            :key="reward.type + reward.amount"
            class="reward-item"
          >
            <div class="flex items-center space-x-3 p-3 bg-wh-aged-paper rounded border border-wh-wood-brown">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-wh-empire-gold rounded-full flex items-center justify-center">
                  <WarhammerIcon
                    :name="getRewardIcon(reward.type)"
                    size="sm"
                    class="text-wh-dark-wood"
                  />
                </div>
              </div>
              
              <div class="flex-1">
                <h5 class="font-medium text-wh-dark-wood">
                  {{ formatRewardTitle(reward) }}
                </h5>
                <p class="text-xs text-wh-wood-brown">
                  {{ reward.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Requirements -->
    <div v-if="quest.requirements.length > 0" class="quest-requirements mb-6">
      <WarhammerCard title="Requirements" variant="parchment">
        <div class="space-y-2">
          <div
            v-for="requirement in quest.requirements"
            :key="requirement.type + requirement.value"
            class="requirement-item"
          >
            <div class="flex items-center space-x-3 p-2 bg-wh-aged-paper rounded border border-wh-wood-brown">
              <div class="flex-shrink-0">
                <WarhammerIcon
                  :name="requirement.met ? 'check-circle' : 'x-circle'"
                  size="sm"
                  :class="requirement.met ? 'text-green-500' : 'text-red-500'"
                />
              </div>
              
              <div class="flex-1">
                <span
                  class="text-sm"
                  :class="requirement.met ? 'text-wh-dark-wood' : 'text-red-600'"
                >
                  {{ requirement.description }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Tags -->
    <div v-if="quest.tags.length > 0" class="quest-tags mb-6">
      <WarhammerCard title="Tags" variant="parchment" size="sm">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in quest.tags"
            :key="tag"
            class="px-3 py-1 text-sm bg-wh-empire-gold text-wh-dark-wood rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Actions -->
    <div class="quest-actions">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-wh-aged-paper rounded-lg border border-wh-wood-brown">
        <div class="text-sm text-wh-wood-brown">
          <p>Ready to embark on this adventure?</p>
          <p v-if="quest.assignedTo.length > 0" class="mt-1">
            Currently assigned to {{ quest.assignedTo.length }} character(s)
          </p>
        </div>
        
        <div class="flex space-x-3">
          <WarhammerButton
            variant="outline"
            @click="$emit('close')"
          >
            Close
          </WarhammerButton>
          
          <WarhammerButton
            variant="primary"
            :disabled="!canAcceptQuest"
            @click="$emit('accept', quest)"
          >
            Accept Quest
          </WarhammerButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Quest, QuestReward } from '~/stores/quest'

interface Props {
  quest: Quest
}

const props = defineProps<Props>()

const emit = defineEmits<{
  accept: [quest: Quest]
  close: []
}>()

// Computed properties
const statusClasses = computed(() => {
  const classes = {
    available: 'bg-green-100 text-green-800 border border-green-200',
    active: 'bg-blue-100 text-blue-800 border border-blue-200',
    completed: 'bg-gray-100 text-gray-800 border border-gray-200',
    failed: 'bg-red-100 text-red-800 border border-red-200',
    expired: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  }
  return classes[props.quest.status]
})

const canAcceptQuest = computed(() => {
  return props.quest.status === 'available' && 
         props.quest.requirements.every(req => req.met)
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

const getObjectiveTypeIcon = (type: string): string => {
  const icons = {
    kill: 'sword',
    collect: 'package',
    deliver: 'truck',
    explore: 'map',
    interact: 'message-circle',
    survive: 'shield'
  }
  return icons[type] || 'target'
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

const formatRewardTitle = (reward: QuestReward): string => {
  switch (reward.type) {
    case 'experience':
      return `${reward.amount} Experience`
    case 'gold':
      return `${reward.amount} Gold Crowns`
    case 'item':
      return reward.itemName || 'Item Reward'
    case 'reputation':
      return 'Reputation Increase'
    case 'skill':
      return 'Skill Advancement'
    default:
      return reward.description
  }
}
</script>

<style scoped>
.quest-details {
  font-family: var(--wh-font-body);
}

.quest-giver-portrait img {
  transition: all 0.2s ease;
}

.quest-giver-portrait:hover img {
  transform: scale(1.05);
}

.objective-item,
.reward-item,
.requirement-item {
  transition: all 0.2s ease;
}

.objective-item:hover,
.reward-item:hover,
.requirement-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lore-section {
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 69, 19, 0.2);
  margin-top: 1rem;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .objective-item,
  .reward-item,
  .requirement-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .quest-giver-portrait img,
  .objective-item,
  .reward-item,
  .requirement-item {
    transition: none !important;
  }
  
  .quest-giver-portrait:hover img,
  .objective-item:hover,
  .reward-item:hover,
  .requirement-item:hover {
    transform: none !important;
  }
}
</style>
