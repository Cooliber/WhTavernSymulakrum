<template>
  <div class="tavern-page min-h-screen bg-wh-parchment">
    <!-- Background Effects -->
    <div class="fixed inset-0 tavern-wood-texture opacity-10 pointer-events-none"></div>

    <!-- Atmospheric Header -->
    <section class="relative py-8 bg-gradient-to-b from-wh-aged-paper to-wh-parchment border-b-2 border-wh-wood-brown">
      <div class="container mx-auto px-4">
        <div class="text-center space-y-4">
          <h1 class="text-4xl md:text-6xl font-wh-display text-wh-dark-wood animate-glow-pulse">
            The Prancing Pony
          </h1>

          <p class="text-lg md:text-xl font-wh-heading text-wh-wood-brown">
            A warm hearth awaits weary travelers
          </p>

          <!-- Tavern Status Bar -->
          <div class="tavern-status-bar">
            <div class="flex flex-wrap justify-center gap-6 text-sm">
              <div class="flex items-center space-x-2">
                <Icon name="users" class="w-4 h-4 text-wh-empire-gold" />
                <span class="text-wh-wood-brown">
                  {{ totalOccupancy }}/{{ totalCapacity }} Guests
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon :name="weatherIcon" class="w-4 h-4 text-wh-empire-gold" />
                <span class="text-wh-wood-brown capitalize">
                  {{ tavernStore.tavernState.weather }} Weather
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="clock" class="w-4 h-4 text-wh-empire-gold" />
                <span class="text-wh-wood-brown">{{ currentTimeFormatted }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heart" class="w-4 h-4 text-wh-empire-gold" />
                <span class="text-wh-wood-brown capitalize">
                  {{ tavernStore.tavernState.atmosphere.mood }} Atmosphere
                </span>
              </div>
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
            <UButton
              v-for="tab in tabs"
              :key="tab.id"
              :variant="activeTab === tab.id ? 'solid' : 'ghost'"
              size="md"
              @click="activeTab = tab.id"
            >
              <Icon :name="tab.icon" class="w-4 h-4 mr-2" />
              {{ tab.label }}
            </UButton>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Multi-Agent Chat Tab -->
          <div v-if="activeTab === 'chat'">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                Tavern Conversations
              </h2>
              <p class="text-wh-wood-brown">
                Engage with AI-powered NPCs in dynamic conversations
              </p>
            </div>
            
            <MultiAgentChat />
          </div>

          <!-- NPCs Tab -->
          <div v-if="activeTab === 'npcs'" class="npcs-tab">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                Tavern Inhabitants
              </h2>
              <p class="text-wh-wood-brown">
                Meet the colorful characters who call the tavern home
              </p>
            </div>

            <!-- NPCs Grid -->
            <div v-if="tavernStore.npcs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="npc in tavernStore.npcs"
                :key="npc.id"
                class="npc-card"
              >
                <UCard
                  class="hover:shadow-lg transition-all duration-200"
                  @click="handleNPCInteraction(npc)"
                >
                  <template #header>
                    <div class="flex items-center space-x-3">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-wh-empire-gold to-wh-wood-brown flex items-center justify-center">
                        <Icon name="user" class="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 class="font-wh-heading text-wh-dark-wood">{{ npc.name }}</h3>
                        <p class="text-sm text-wh-wood-brown">{{ npc.race }} {{ npc.profession }}</p>
                      </div>
                    </div>
                  </template>

                  <div class="space-y-3">
                    <p class="text-sm text-wh-wood-brown">{{ npc.description }}</p>
                    
                    <!-- Disposition and Location -->
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center space-x-1">
                        <div
                          class="w-2 h-2 rounded-full"
                          :class="getDispositionColor(npc.disposition)"
                        ></div>
                        <span class="text-wh-wood-brown capitalize">{{ npc.disposition }}</span>
                      </div>
                      <div class="flex items-center space-x-1">
                        <Icon name="map-pin" class="w-3 h-3 text-wh-wood-brown" />
                        <span class="text-wh-wood-brown">{{ getLocationName(npc.location) }}</span>
                      </div>
                    </div>

                    <!-- Services and Quests Indicators -->
                    <div class="flex justify-center space-x-4 text-xs">
                      <div v-if="npc.services.length > 0" class="flex items-center space-x-1">
                        <Icon name="shopping-cart" class="w-3 h-3 text-green-600" />
                        <span class="text-green-600">{{ npc.services.length }} Services</span>
                      </div>
                      <div v-if="npc.quests.length > 0" class="flex items-center space-x-1">
                        <Icon name="scroll" class="w-3 h-3 text-blue-600" />
                        <span class="text-blue-600">{{ npc.quests.length }} Quests</span>
                      </div>
                    </div>
                  </div>

                  <template #footer>
                    <div class="text-center">
                      <UButton
                        variant="outline"
                        size="sm"
                        @click.stop="handleNPCInteraction(npc)"
                      >
                        Interact
                      </UButton>
                    </div>
                  </template>
                </UCard>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <Icon name="users" class="w-16 h-16 text-wh-wood-brown mx-auto mb-4" />
              <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No NPCs Available</h3>
              <p class="text-wh-wood-brown">
                The tavern seems unusually quiet today.
              </p>
            </div>
          </div>

          <!-- Events Tab -->
          <div v-if="activeTab === 'events'" class="events-tab">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                Tavern Events
              </h2>
              <p class="text-wh-wood-brown">
                Join in the festivities and special activities
              </p>
            </div>

            <!-- Active Events -->
            <div v-if="activeEvents.length > 0" class="active-events mb-8">
              <h3 class="text-lg font-wh-heading text-wh-dark-wood mb-4">Active Events</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="event in activeEvents"
                  :key="event.id"
                  class="event-card"
                >
                  <UCard class="border-2 border-green-400">
                    <template #header>
                      <h4 class="font-wh-heading text-wh-dark-wood">{{ event.title }}</h4>
                      <p class="text-sm text-wh-wood-brown">{{ event.description }}</p>
                    </template>

                    <div class="space-y-3">
                      <div class="event-details text-sm">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-wh-wood-brown">Location:</span>
                          <span class="text-wh-dark-wood">{{ getLocationName(event.location) }}</span>
                        </div>
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-wh-wood-brown">Participants:</span>
                          <span class="text-wh-dark-wood">
                            {{ event.participants.length }}{{ event.maxParticipants ? `/${event.maxParticipants}` : '' }}
                          </span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-wh-wood-brown">Status:</span>
                          <UBadge color="green" variant="soft">
                            {{ event.status }}
                          </UBadge>
                        </div>
                      </div>

                      <!-- Event Rewards -->
                      <div v-if="event.rewards && event.rewards.length > 0" class="event-rewards">
                        <h4 class="text-xs font-semibold text-wh-wood-brown mb-1">Rewards:</h4>
                        <div class="flex flex-wrap gap-1">
                          <UBadge
                            v-for="reward in event.rewards"
                            :key="reward.type"
                            color="yellow"
                            variant="soft"
                          >
                            {{ reward.description }}
                          </UBadge>
                        </div>
                      </div>
                    </div>

                    <template #footer>
                      <div class="text-center">
                        <UButton
                          color="primary"
                          size="sm"
                          :disabled="isEventFull(event)"
                          @click="joinEvent(event)"
                        >
                          {{ isEventFull(event) ? 'Event Full' : 'Join Event' }}
                        </UButton>
                      </div>
                    </template>
                  </UCard>
                </div>
              </div>
            </div>

            <!-- No Events -->
            <div v-if="activeEvents.length === 0 && upcomingEvents.length === 0" class="text-center py-12">
              <Icon name="calendar" class="w-16 h-16 text-wh-wood-brown mx-auto mb-4" />
              <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No Events Scheduled</h3>
              <p class="text-wh-wood-brown">
                Check back later for exciting tavern activities!
              </p>
            </div>
          </div>

          <!-- AI Performance Tab -->
          <div v-if="activeTab === 'ai'" class="ai-tab">
            <div class="mb-6">
              <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-4">
                AI Performance Dashboard
              </h2>
              <p class="text-wh-wood-brown">
                Monitor AI service health and performance metrics
              </p>
            </div>

            <AIPerformanceDashboard />
          </div>
        </div>
      </div>
    </section>

    <!-- NPC Interaction Modal -->
    <UModal v-model="showNPCInteraction">
      <UCard>
        <template #header>
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-wh-empire-gold to-wh-wood-brown flex items-center justify-center">
              <Icon name="user" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="font-wh-heading text-wh-dark-wood">{{ selectedNPC?.name }}</h3>
              <p class="text-sm text-wh-wood-brown">{{ selectedNPC ? `${selectedNPC.race} ${selectedNPC.profession}` : '' }}</p>
            </div>
          </div>
        </template>

        <div v-if="selectedNPC" class="space-y-4">
          <p class="text-wh-wood-brown">{{ selectedNPC.description }}</p>
          
          <div class="flex space-x-2">
            <UButton
              variant="outline"
              @click="startConversation(selectedNPC)"
            >
              Start Conversation
            </UButton>
            <UButton
              v-if="selectedNPC.services.length > 0"
              variant="outline"
              @click="handleTrade(selectedNPC)"
            >
              Trade
            </UButton>
            <UButton
              v-if="selectedNPC.quests.length > 0"
              variant="outline"
              @click="viewQuests(selectedNPC)"
            >
              View Quests
            </UButton>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              variant="ghost"
              @click="showNPCInteraction = false"
            >
              Close
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { NPC, TavernEvent, TavernNotification } from '~/stores/tavern'
import type { Quest } from '~/stores/quest'

// Page metadata
useHead({
  title: 'The Prancing Pony - Warhammer Fantasy Tavern',
  meta: [
    { name: 'description', content: 'Experience the authentic atmosphere of a Warhammer Fantasy tavern with AI-powered NPCs.' }
  ]
})

// Stores
const tavernStore = useTavernStore()
const questStore = useQuestStore()

// Reactive state
const activeTab = ref('chat')
const showNPCInteraction = ref(false)
const selectedNPC = ref<NPC | null>(null)

// Tab configuration
const tabs = [
  { id: 'chat', label: 'AI Conversations', icon: 'message-circle' },
  { id: 'npcs', label: 'NPCs', icon: 'users' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'ai', label: 'AI Performance', icon: 'activity' }
]

// Computed properties
const totalOccupancy = computed(() => {
  return tavernStore.locations.reduce((sum, loc) => sum + loc.currentOccupancy, 0)
})

const totalCapacity = computed(() => {
  return tavernStore.locations.reduce((sum, loc) => sum + loc.capacity, 0)
})

const currentTimeFormatted = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(tavernStore.tavernState.currentTime)
})

const weatherIcon = computed(() => {
  const icons = {
    clear: 'sun',
    cloudy: 'cloud',
    rainy: 'cloud-rain',
    stormy: 'zap',
    foggy: 'cloud'
  }
  return icons[tavernStore.tavernState.weather] || 'sun'
})

const activeEvents = computed(() => tavernStore.getActiveEvents)
const upcomingEvents = computed(() => tavernStore.getUpcomingEvents)

// Methods
const handleNPCInteraction = (npc: NPC) => {
  selectedNPC.value = npc
  showNPCInteraction.value = true
}

const startConversation = (npc: NPC) => {
  // Switch to chat tab and start conversation with this NPC
  activeTab.value = 'chat'
  showNPCInteraction.value = false
  // TODO: Add NPC to conversation
}

const handleTrade = (npc: NPC) => {
  console.log('Trade with:', npc.name)
  showNPCInteraction.value = false
}

const viewQuests = (npc: NPC) => {
  navigateTo(`/quests?npc=${npc.id}`)
}

const joinEvent = async (event: TavernEvent) => {
  try {
    await tavernStore.joinEvent(event.id, 'current-character')
    // Show success notification
  } catch (error) {
    console.error('Failed to join event:', error)
  }
}

const isEventFull = (event: TavernEvent): boolean => {
  return !!(event.maxParticipants && event.participants.length >= event.maxParticipants)
}

const getDispositionColor = (disposition: NPC['disposition']): string => {
  const colors = {
    hostile: 'bg-red-500',
    unfriendly: 'bg-orange-500',
    neutral: 'bg-gray-500',
    friendly: 'bg-green-500',
    helpful: 'bg-blue-500'
  }
  return colors[disposition]
}

const getLocationName = (locationId: string): string => {
  const location = tavernStore.getLocationById(locationId)
  return location?.name || 'Unknown'
}

// Lifecycle
onMounted(async () => {
  await tavernStore.fetchTavernData()
})
</script>

<style scoped>
.tavern-page {
  font-family: var(--wh-font-body);
}

.tab-navigation {
  border-bottom: 2px solid var(--wh-wood-brown);
  padding-bottom: 1rem;
}

.npc-card,
.event-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.npc-card:hover,
.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tavern-status-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .npc-card,
  .event-card {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .npc-card,
  .event-card {
    transition: none !important;
  }

  .npc-card:hover,
  .event-card:hover {
    transform: none !important;
  }
}
</style>