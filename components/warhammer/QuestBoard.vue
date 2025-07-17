<template>
  <div class="quest-board">
    <!-- Header -->
    <div class="quest-board-header mb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-wh-display text-wh-dark-wood mb-2">
            Quest Board
          </h2>
          <p class="text-wh-wood-brown">
            Seek adventure and glory in the Old World
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <WarhammerButton
            variant="primary"
            icon-left="plus"
            @click="showCreateQuest = true"
          >
            Post Quest
          </WarhammerButton>
          
          <WarhammerButton
            variant="outline"
            icon-left="refresh-cw"
            :loading="questStore.loading"
            @click="questStore.fetchQuests()"
          >
            Refresh
          </WarhammerButton>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="quest-filters mb-6">
      <WarhammerCard variant="filled" size="sm">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Type Filter -->
          <div class="filter-group">
            <label class="block text-xs font-wh-heading text-wh-bone mb-1">Type</label>
            <select
              v-model="selectedType"
              class="bg-wh-dark-wood text-wh-bone border border-wh-copper rounded px-3 py-1 text-sm focus:ring-2 focus:ring-wh-empire-gold"
            >
              <option value="">All Types</option>
              <option value="main">Main Quest</option>
              <option value="side">Side Quest</option>
              <option value="daily">Daily Quest</option>
              <option value="guild">Guild Quest</option>
              <option value="personal">Personal Quest</option>
            </select>
          </div>
          
          <!-- Difficulty Filter -->
          <div class="filter-group">
            <label class="block text-xs font-wh-heading text-wh-bone mb-1">Difficulty</label>
            <select
              v-model="selectedDifficulty"
              class="bg-wh-dark-wood text-wh-bone border border-wh-copper rounded px-3 py-1 text-sm focus:ring-2 focus:ring-wh-empire-gold"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          
          <!-- Level Range -->
          <div class="filter-group">
            <label class="block text-xs font-wh-heading text-wh-bone mb-1">Level Range</label>
            <div class="flex items-center space-x-2">
              <input
                v-model.number="minLevelFilter"
                type="number"
                min="1"
                max="20"
                placeholder="Min"
                class="w-16 bg-wh-dark-wood text-wh-bone border border-wh-copper rounded px-2 py-1 text-sm focus:ring-2 focus:ring-wh-empire-gold"
              />
              <span class="text-wh-bone">-</span>
              <input
                v-model.number="maxLevelFilter"
                type="number"
                min="1"
                max="20"
                placeholder="Max"
                class="w-16 bg-wh-dark-wood text-wh-bone border border-wh-copper rounded px-2 py-1 text-sm focus:ring-2 focus:ring-wh-empire-gold"
              />
            </div>
          </div>
          
          <!-- Search -->
          <div class="filter-group flex-1">
            <label class="block text-xs font-wh-heading text-wh-bone mb-1">Search</label>
            <WarhammerInput
              v-model="searchQuery"
              placeholder="Search quests..."
              icon-left="search"
              size="sm"
              variant="filled"
              clearable
            />
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Statistics -->
    <div class="quest-stats mb-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WarhammerCard variant="parchment" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-wh-empire-gold">{{ questStore.totalQuests }}</div>
            <div class="text-xs text-wh-wood-brown">Total Quests</div>
          </div>
        </WarhammerCard>
        
        <WarhammerCard variant="parchment" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ filteredQuests.length }}</div>
            <div class="text-xs text-wh-wood-brown">Available</div>
          </div>
        </WarhammerCard>
        
        <WarhammerCard variant="parchment" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ questStore.activeQuests.length }}</div>
            <div class="text-xs text-wh-wood-brown">Active</div>
          </div>
        </WarhammerCard>
        
        <WarhammerCard variant="parchment" size="sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-wh-empire-gold">{{ Math.round(questStore.questCompletionRate) }}%</div>
            <div class="text-xs text-wh-wood-brown">Completion Rate</div>
          </div>
        </WarhammerCard>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="questStore.loading" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-wh-empire-gold border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-wh-wood-brown font-wh-heading">Loading quests...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="questStore.error" class="text-center py-12">
      <WarhammerIcon name="alert-circle" size="xl" class="text-red-500 mx-auto mb-4" />
      <p class="text-red-600 font-wh-heading mb-4">{{ questStore.error }}</p>
      <WarhammerButton variant="outline" @click="questStore.fetchQuests()">
        Try Again
      </WarhammerButton>
    </div>

    <!-- Quest List -->
    <div v-else-if="filteredQuests.length > 0" class="quest-list">
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <QuestCard
          v-for="quest in filteredQuests"
          :key="quest.id"
          :quest="quest"
          @view="viewQuest"
          @accept="acceptQuest"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <WarhammerIcon name="scroll" size="xl" class="text-wh-wood-brown mx-auto mb-4" />
      <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No Quests Found</h3>
      <p class="text-wh-wood-brown mb-6">
        {{ hasActiveFilters ? 'No quests match your current filters.' : 'No quests are currently available.' }}
      </p>
      <div class="flex justify-center space-x-3">
        <WarhammerButton
          v-if="hasActiveFilters"
          variant="outline"
          @click="clearFilters"
        >
          Clear Filters
        </WarhammerButton>
        <WarhammerButton
          variant="primary"
          @click="showCreateQuest = true"
        >
          Post New Quest
        </WarhammerButton>
      </div>
    </div>

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

    <!-- Create Quest Modal -->
    <WarhammerModal
      v-model="showCreateQuest"
      title="Post New Quest"
      subtitle="Create a new adventure for brave souls"
      icon="plus"
      size="xl"
      variant="parchment"
    >
      <QuestCreationForm
        @created="handleQuestCreated"
        @cancel="showCreateQuest = false"
      />
    </WarhammerModal>
  </div>
</template>

<script setup lang="ts">
import type { Quest } from '~/stores/quest'

// Store
const questStore = useQuestStore()

// Reactive state
const selectedType = ref('')
const selectedDifficulty = ref('')
const minLevelFilter = ref<number | null>(null)
const maxLevelFilter = ref<number | null>(null)
const searchQuery = ref('')
const showQuestDetails = ref(false)
const showCreateQuest = ref(false)
const selectedQuest = ref<Quest | null>(null)

// Computed properties
const filteredQuests = computed(() => {
  let filtered = questStore.getAvailableQuests

  // Type filter
  if (selectedType.value) {
    filtered = filtered.filter(quest => quest.type === selectedType.value)
  }

  // Difficulty filter
  if (selectedDifficulty.value) {
    filtered = filtered.filter(quest => quest.difficulty === selectedDifficulty.value)
  }

  // Level range filter
  if (minLevelFilter.value !== null) {
    filtered = filtered.filter(quest => quest.minLevel >= minLevelFilter.value!)
  }
  if (maxLevelFilter.value !== null) {
    filtered = filtered.filter(quest => 
      !quest.maxLevel || quest.maxLevel <= maxLevelFilter.value!
    )
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(quest =>
      quest.title.toLowerCase().includes(query) ||
      quest.description.toLowerCase().includes(query) ||
      quest.location.toLowerCase().includes(query) ||
      quest.questGiver.toLowerCase().includes(query) ||
      quest.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return !!(
    selectedType.value ||
    selectedDifficulty.value ||
    minLevelFilter.value !== null ||
    maxLevelFilter.value !== null ||
    searchQuery.value.trim()
  )
})

// Methods
const viewQuest = (quest: Quest) => {
  selectedQuest.value = quest
  showQuestDetails.value = true
}

const acceptQuest = async (quest: Quest) => {
  // For now, we'll use the first character from the character store
  const characterStore = useCharacterStore()
  if (characterStore.characters.length === 0) {
    alert('You need to create a character first!')
    return
  }

  try {
    await questStore.acceptQuest(quest.id, characterStore.characters[0].id)
    showQuestDetails.value = false
    // Show success notification
    alert(`Quest "${quest.title}" accepted!`)
  } catch (error) {
    console.error('Failed to accept quest:', error)
    alert('Failed to accept quest. Please try again.')
  }
}

const handleQuestCreated = (quest: Quest) => {
  showCreateQuest.value = false
  // Show success notification
  alert(`Quest "${quest.title}" created successfully!`)
}

const clearFilters = () => {
  selectedType.value = ''
  selectedDifficulty.value = ''
  minLevelFilter.value = null
  maxLevelFilter.value = null
  searchQuery.value = ''
}

// Lifecycle
onMounted(async () => {
  await questStore.fetchQuests()
})
</script>

<style scoped>
.quest-board {
  font-family: var(--wh-font-body);
}

.filter-group {
  min-width: 120px;
}

.quest-stats .text-2xl {
  font-family: var(--wh-font-display);
}

/* Loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .filter-group select,
  .filter-group input {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none !important;
  }
}
</style>
