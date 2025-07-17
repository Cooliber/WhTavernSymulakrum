<template>
  <div class="quests-page min-h-screen bg-wh-parchment">
    <!-- Background Effects -->
    <div class="fixed inset-0 tavern-wood-texture opacity-10 pointer-events-none"></div>
    
    <!-- Page Header -->
    <section class="relative py-12 bg-gradient-to-b from-wh-aged-paper to-wh-parchment border-b-2 border-wh-wood-brown">
      <div class="container mx-auto px-4">
        <div class="text-center space-y-6">
          <h1 class="text-5xl md:text-7xl font-wh-display text-wh-dark-wood animate-glow-pulse">
            Quest Board
          </h1>
          
          <p class="text-xl md:text-2xl font-wh-heading text-wh-wood-brown">
            Seek adventure and glory in the Old World
          </p>
          
          <!-- Quick Stats -->
          <div class="flex flex-wrap justify-center gap-6 text-center">
            <div class="stat-item">
              <div class="text-3xl font-bold text-wh-empire-gold">{{ questStore.totalQuests }}</div>
              <div class="text-sm text-wh-wood-brown">Total Quests</div>
            </div>
            <div class="stat-item">
              <div class="text-3xl font-bold text-green-600">{{ questStore.getAvailableQuests.length }}</div>
              <div class="text-sm text-wh-wood-brown">Available</div>
            </div>
            <div class="stat-item">
              <div class="text-3xl font-bold text-blue-600">{{ questStore.activeQuests.length }}</div>
              <div class="text-sm text-wh-wood-brown">Active</div>
            </div>
            <div class="stat-item">
              <div class="text-3xl font-bold text-wh-empire-gold">{{ Math.round(questStore.questCompletionRate) }}%</div>
              <div class="text-sm text-wh-wood-brown">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <!-- Tab Navigation -->
        <div class="tab-navigation mb-8">
          <div class="flex flex-wrap justify-center gap-2">
            <WarhammerButton
              v-for="tab in tabs"
              :key="tab.id"
              :variant="activeTab === tab.id ? 'primary' : 'ghost'"
              size="md"
              :icon-left="tab.icon"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </WarhammerButton>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Quest Board Tab -->
          <div v-if="activeTab === 'board'">
            <QuestBoard />
          </div>

          <!-- Active Quests Tab -->
          <div v-if="activeTab === 'active'" class="active-quests">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                Active Quests
              </h2>
              <p class="text-wh-wood-brown">
                Track your ongoing adventures and progress
              </p>
            </div>

            <!-- Active Quests List -->
            <div v-if="questStore.activeQuests.length > 0" class="space-y-6">
              <div
                v-for="quest in questStore.activeQuests"
                :key="quest.id"
                class="active-quest-item"
              >
                <WarhammerCard variant="parchment" :interactive="true" @click="viewQuestDetails(quest)">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <WarhammerIcon
                          :name="getQuestTypeIcon(quest.type)"
                          size="md"
                          class="text-wh-empire-gold"
                        />
                        <div>
                          <h3 class="text-lg font-wh-heading text-wh-dark-wood">{{ quest.title }}</h3>
                          <p class="text-sm text-wh-wood-brown">{{ quest.location }}</p>
                        </div>
                      </div>
                      
                      <!-- Progress Bar -->
                      <div class="progress-section mb-3">
                        <div class="flex items-center justify-between text-sm text-wh-wood-brown mb-1">
                          <span>Progress</span>
                          <span>{{ quest.progress.objectivesCompleted }}/{{ quest.progress.totalObjectives }} objectives</span>
                        </div>
                        <div class="w-full bg-wh-aged-paper rounded-full h-3">
                          <div
                            class="bg-wh-empire-gold h-3 rounded-full transition-all duration-300"
                            :style="{ width: `${quest.progress.completionPercentage}%` }"
                          ></div>
                        </div>
                      </div>
                      
                      <!-- Current Objectives -->
                      <div class="current-objectives">
                        <h4 class="text-sm font-semibold text-wh-wood-brown mb-2">Current Objectives:</h4>
                        <div class="space-y-1">
                          <div
                            v-for="objective in quest.objectives.filter(obj => !obj.completed).slice(0, 2)"
                            :key="objective.id"
                            class="flex items-center space-x-2 text-sm"
                          >
                            <div class="w-2 h-2 rounded-full bg-wh-empire-gold"></div>
                            <span class="text-wh-dark-wood">{{ objective.description }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex flex-col items-end space-y-2">
                      <span
                        class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                      >
                        {{ quest.status }}
                      </span>
                      
                      <div class="flex space-x-2">
                        <WarhammerButton
                          variant="outline"
                          size="sm"
                          @click.stop="viewQuestDetails(quest)"
                        >
                          View Details
                        </WarhammerButton>
                        
                        <WarhammerButton
                          variant="primary"
                          size="sm"
                          @click.stop="completeQuest(quest)"
                        >
                          Complete
                        </WarhammerButton>
                      </div>
                    </div>
                  </div>
                </WarhammerCard>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <WarhammerIcon name="compass" size="xl" class="text-wh-wood-brown mx-auto mb-4" />
              <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No Active Quests</h3>
              <p class="text-wh-wood-brown mb-6">
                You haven't accepted any quests yet. Visit the Quest Board to find adventures!
              </p>
              <WarhammerButton
                variant="primary"
                @click="activeTab = 'board'"
              >
                Browse Quest Board
              </WarhammerButton>
            </div>
          </div>

          <!-- Completed Quests Tab -->
          <div v-if="activeTab === 'completed'" class="completed-quests">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                Completed Quests
              </h2>
              <p class="text-wh-wood-brown">
                Your legendary achievements and completed adventures
              </p>
            </div>

            <!-- Completed Quests List -->
            <div v-if="completedQuests.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="quest in completedQuests"
                :key="quest.id"
                class="completed-quest-item"
              >
                <WarhammerCard
                  :title="quest.title"
                  :subtitle="quest.location"
                  variant="parchment"
                  :interactive="true"
                  class="opacity-75 hover:opacity-100 transition-opacity"
                  @click="viewQuestDetails(quest)"
                >
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                      <span class="text-xs text-wh-wood-brown">
                        {{ formatDate(quest.completedAt!) }}
                      </span>
                    </div>
                    
                    <p class="text-sm text-wh-wood-brown">
                      {{ quest.briefDescription }}
                    </p>
                    
                    <!-- Rewards Earned -->
                    <div class="rewards-earned">
                      <h4 class="text-xs font-semibold text-wh-wood-brown mb-1">Rewards Earned:</h4>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="reward in quest.rewards.slice(0, 2)"
                          :key="reward.type + reward.amount"
                          class="inline-flex items-center px-2 py-1 text-xs bg-wh-empire-gold text-wh-dark-wood rounded-full"
                        >
                          {{ formatReward(reward) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </WarhammerCard>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <WarhammerIcon name="trophy" size="xl" class="text-wh-wood-brown mx-auto mb-4" />
              <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No Completed Quests</h3>
              <p class="text-wh-wood-brown mb-6">
                Complete your first quest to see your achievements here!
              </p>
              <WarhammerButton
                variant="primary"
                @click="activeTab = 'board'"
              >
                Find Your First Quest
              </WarhammerButton>
            </div>
          </div>

          <!-- Adventure Parties Tab -->
          <div v-if="activeTab === 'parties'" class="adventure-parties">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                Adventure Parties
              </h2>
              <p class="text-wh-wood-brown">
                Form groups and coordinate adventures with other players
              </p>
            </div>

            <!-- Parties List -->
            <div v-if="questStore.parties.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="party in questStore.parties"
                :key="party.id"
                class="party-item"
              >
                <WarhammerCard
                  :title="party.name"
                  :subtitle="`${party.memberIds.length}/${party.maxSize} members`"
                  variant="parchment"
                  :interactive="true"
                >
                  <div class="space-y-3">
                    <p class="text-sm text-wh-wood-brown">
                      {{ party.description }}
                    </p>
                    
                    <div class="party-status">
                      <span
                        class="px-3 py-1 text-xs font-semibold rounded-full"
                        :class="getPartyStatusClasses(party.status)"
                      >
                        {{ party.status }}
                      </span>
                    </div>
                    
                    <div v-if="party.sessionNotes.length > 0" class="session-notes">
                      <h4 class="text-xs font-semibold text-wh-wood-brown mb-1">Recent Notes:</h4>
                      <p class="text-xs text-wh-wood-brown">
                        {{ party.sessionNotes[party.sessionNotes.length - 1] }}
                      </p>
                    </div>
                  </div>
                  
                  <template #footer>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-wh-wood-brown">
                        Created {{ formatDate(party.createdAt) }}
                      </span>
                      <WarhammerButton
                        variant="outline"
                        size="sm"
                      >
                        View Party
                      </WarhammerButton>
                    </div>
                  </template>
                </WarhammerCard>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <WarhammerIcon name="users" size="xl" class="text-wh-wood-brown mx-auto mb-4" />
              <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No Adventure Parties</h3>
              <p class="text-wh-wood-brown mb-6">
                Create or join an adventure party to tackle quests together!
              </p>
              <WarhammerButton
                variant="primary"
                @click="createParty"
              >
                Create Party
              </WarhammerButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quest Details Modal -->
    <WarhammerModal
      v-model="showQuestDetails"
      :title="selectedQuest?.title"
      :subtitle="selectedQuest ? `${selectedQuest.type} • ${selectedQuest.difficulty}` : ''"
      icon="scroll"
      size="xl"
      variant="parchment"
    >
      <QuestDetails
        v-if="selectedQuest"
        :quest="selectedQuest"
        @accept="acceptQuest"
        @close="showQuestDetails = false"
      />
    </WarhammerModal>
  </div>
</template>

<script setup lang="ts">
import type { Quest, QuestReward, AdventureParty } from '~/stores/quest'

// Page metadata
useHead({
  title: 'Quest Board - Warhammer Fantasy Tavern',
  meta: [
    { name: 'description', content: 'Discover adventures and manage your quests in the Warhammer Fantasy world.' }
  ]
})

// Store
const questStore = useQuestStore()

// Reactive state
const activeTab = ref('board')
const showQuestDetails = ref(false)
const selectedQuest = ref<Quest | null>(null)

// Tab configuration
const tabs = [
  { id: 'board', label: 'Quest Board', icon: 'scroll' },
  { id: 'active', label: 'Active Quests', icon: 'compass' },
  { id: 'completed', label: 'Completed', icon: 'trophy' },
  { id: 'parties', label: 'Adventure Parties', icon: 'users' }
]

// Computed properties
const completedQuests = computed(() => {
  return questStore.quests.filter(quest => quest.status === 'completed')
})

// Methods
const viewQuestDetails = (quest: Quest) => {
  selectedQuest.value = quest
  showQuestDetails.value = true
}

const acceptQuest = async (quest: Quest) => {
  // Implementation would go here
  console.log('Accept quest:', quest.title)
}

const completeQuest = async (quest: Quest) => {
  try {
    await questStore.completeQuest(quest.id)
    alert(`Quest "${quest.title}" completed!`)
  } catch (error) {
    console.error('Failed to complete quest:', error)
    alert('Failed to complete quest. Please try again.')
  }
}

const createParty = () => {
  // Implementation would go here
  console.log('Create party functionality')
}

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

const getPartyStatusClasses = (status: AdventureParty['status']): string => {
  const classes = {
    forming: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    disbanded: 'bg-gray-100 text-gray-800'
  }
  return classes[status]
}

const formatReward = (reward: QuestReward): string => {
  switch (reward.type) {
    case 'experience':
      return `${reward.amount} XP`
    case 'gold':
      return `${reward.amount} GC`
    case 'item':
      return reward.itemName || 'Item'
    default:
      return reward.description
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

// Lifecycle
onMounted(async () => {
  await questStore.fetchQuests()
})
</script>

<style scoped>
.quests-page {
  font-family: var(--wh-font-body);
}

.stat-item {
  min-width: 100px;
}

.tab-navigation {
  border-bottom: 2px solid var(--wh-wood-brown);
  padding-bottom: 1rem;
}

.active-quest-item,
.completed-quest-item,
.party-item {
  transition: all 0.2s ease;
}

.active-quest-item:hover,
.completed-quest-item:hover,
.party-item:hover {
  transform: translateY(-2px);
}

.progress-section .bg-wh-empire-gold {
  transition: width 0.3s ease;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .active-quest-item,
  .completed-quest-item,
  .party-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .active-quest-item,
  .completed-quest-item,
  .party-item,
  .progress-section .bg-wh-empire-gold {
    transition: none !important;
  }
  
  .active-quest-item:hover,
  .completed-quest-item:hover,
  .party-item:hover {
    transform: none !important;
  }
}
</style>
