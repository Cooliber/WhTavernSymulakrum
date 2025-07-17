<template>
  <div class="npc-interaction">
    <!-- NPC Header -->
    <div class="npc-header mb-6">
      <div class="flex items-start space-x-4">
        <!-- NPC Portrait -->
        <div class="npc-portrait">
          <OptimizedImage
            :src="npc.portrait || '/images/npcs/default.jpg'"
            :alt="`Portrait of ${npc.name}`"
            class="w-20 h-20 rounded-lg object-cover border-2 border-wh-empire-gold"
          />
          
          <!-- Disposition Indicator -->
          <div class="disposition-indicator mt-2 text-center">
            <div
              class="w-3 h-3 rounded-full mx-auto mb-1"
              :class="dispositionClasses"
              :title="npc.disposition"
            ></div>
            <span class="text-xs text-wh-wood-brown capitalize">{{ npc.disposition }}</span>
          </div>
        </div>
        
        <!-- NPC Info -->
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <h3 class="text-xl font-wh-heading text-wh-dark-wood">{{ npc.name }}</h3>
            <span
              v-if="npc.title"
              class="px-2 py-1 text-xs bg-wh-empire-gold text-wh-dark-wood rounded-full"
            >
              {{ npc.title }}
            </span>
          </div>
          
          <p class="text-wh-wood-brown mb-2">{{ npc.race }} {{ npc.profession }}</p>
          <p class="text-sm text-wh-wood-brown leading-relaxed">{{ npc.description }}</p>
          
          <!-- Personality Traits -->
          <div v-if="npc.personality.length > 0" class="personality-traits mt-3">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="trait in npc.personality"
                :key="trait"
                class="px-2 py-1 text-xs bg-wh-aged-paper text-wh-wood-brown rounded border border-wh-wood-brown"
              >
                {{ trait }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Reputation -->
        <div class="reputation-display">
          <div class="text-center">
            <div class="text-lg font-bold text-wh-empire-gold">{{ npc.reputation }}</div>
            <div class="text-xs text-wh-wood-brown">Reputation</div>
            <div class="w-16 bg-wh-aged-paper rounded-full h-2 mt-1">
              <div
                class="bg-wh-empire-gold h-2 rounded-full transition-all duration-300"
                :style="{ width: `${npc.reputation}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogue Section -->
    <div class="dialogue-section mb-6">
      <WarhammerCard variant="parchment">
        <!-- Current Dialogue -->
        <div v-if="currentDialogue" class="current-dialogue">
          <div class="dialogue-text mb-4 p-4 bg-wh-aged-paper rounded border border-wh-wood-brown">
            <div class="flex items-start space-x-3">
              <WarhammerIcon name="message-circle" size="md" class="text-wh-empire-gold mt-1" />
              <div class="flex-1">
                <p class="text-wh-dark-wood leading-relaxed">{{ currentDialogue.text }}</p>
              </div>
            </div>
          </div>
          
          <!-- Dialogue Responses -->
          <div v-if="currentDialogue.responses.length > 0" class="dialogue-responses">
            <h4 class="font-wh-heading text-wh-dark-wood mb-3">Your Response:</h4>
            <div class="space-y-2">
              <button
                v-for="response in availableResponses"
                :key="response.id"
                class="response-option w-full text-left p-3 bg-wh-parchment border border-wh-wood-brown rounded hover:bg-wh-aged-paper hover:border-wh-empire-gold transition-colors"
                @click="selectResponse(response)"
              >
                <div class="flex items-start space-x-2">
                  <WarhammerIcon name="arrow-right" size="xs" class="text-wh-wood-brown mt-1" />
                  <span class="text-wh-dark-wood">{{ response.text }}</span>
                </div>
              </button>
            </div>
          </div>
          
          <!-- End Conversation -->
          <div v-else class="conversation-end">
            <div class="text-center py-4">
              <p class="text-wh-wood-brown mb-4">The conversation has ended.</p>
              <WarhammerButton
                variant="outline"
                @click="restartConversation"
              >
                Start New Conversation
              </WarhammerButton>
            </div>
          </div>
        </div>
        
        <!-- No Dialogue Available -->
        <div v-else class="no-dialogue text-center py-8">
          <WarhammerIcon name="message-x" size="xl" class="text-wh-wood-brown mx-auto mb-4" />
          <h4 class="font-wh-heading text-wh-dark-wood mb-2">No Dialogue Available</h4>
          <p class="text-wh-wood-brown mb-4">
            This NPC doesn't have anything to say right now.
          </p>
          <WarhammerButton
            variant="primary"
            @click="startConversation"
          >
            Attempt Conversation
          </WarhammerButton>
        </div>
      </WarhammerCard>
    </div>

    <!-- Services Section -->
    <div v-if="npcServices.length > 0" class="services-section mb-6">
      <WarhammerCard title="Services" variant="parchment">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="service in npcServices"
            :key="service.id"
            class="service-item p-4 bg-wh-aged-paper rounded border border-wh-wood-brown hover:border-wh-empire-gold transition-colors cursor-pointer"
            @click="purchaseService(service)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="font-medium text-wh-dark-wood mb-1">{{ service.name }}</h5>
                <p class="text-xs text-wh-wood-brown mb-2">{{ service.description }}</p>
                
                <!-- Service Effects -->
                <div v-if="service.effects && service.effects.length > 0" class="effects">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="effect in service.effects"
                      :key="effect.type"
                      class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                    >
                      {{ effect.description }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="text-right ml-3">
                <div class="text-lg font-bold text-wh-empire-gold">
                  {{ service.cost }} {{ service.currency.toUpperCase() }}
                </div>
                <div class="text-xs text-wh-wood-brown capitalize">{{ service.quality }}</div>
                <div class="text-xs text-wh-wood-brown capitalize">{{ service.availability }}</div>
              </div>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quests Section -->
    <div v-if="npcQuests.length > 0" class="quests-section mb-6">
      <WarhammerCard title="Available Quests" variant="parchment">
        <div class="space-y-3">
          <div
            v-for="quest in npcQuests"
            :key="quest.id"
            class="quest-item p-3 bg-wh-aged-paper rounded border border-wh-wood-brown hover:border-wh-empire-gold transition-colors cursor-pointer"
            @click="$emit('view-quest', quest)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <WarhammerIcon
                  :name="getQuestTypeIcon(quest.type)"
                  size="md"
                  class="text-wh-empire-gold"
                />
                <div>
                  <h5 class="font-medium text-wh-dark-wood">{{ quest.title }}</h5>
                  <p class="text-xs text-wh-wood-brown">{{ quest.briefDescription }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getDifficultyClasses(quest.difficulty)"
                >
                  {{ quest.difficulty }}
                </span>
                <WarhammerIcon name="arrow-right" size="xs" class="text-wh-wood-brown" />
              </div>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Relationship Status -->
    <div class="relationship-section">
      <WarhammerCard title="Relationship" variant="parchment" size="sm">
        <div class="flex items-center justify-between">
          <span class="text-sm text-wh-wood-brown">Your standing with {{ npc.name }}:</span>
          <div class="flex items-center space-x-2">
            <div class="w-24 bg-wh-aged-paper rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getRelationshipColor(currentRelationship)"
                :style="{ width: `${Math.abs(currentRelationship)}%` }"
              ></div>
            </div>
            <span class="text-sm font-medium text-wh-dark-wood">
              {{ getRelationshipLabel(currentRelationship) }}
            </span>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons mt-6">
      <div class="flex justify-between">
        <WarhammerButton
          variant="outline"
          @click="$emit('close')"
        >
          End Interaction
        </WarhammerButton>
        
        <div class="flex space-x-2">
          <WarhammerButton
            v-if="currentDialogue"
            variant="secondary"
            @click="restartConversation"
          >
            Restart Conversation
          </WarhammerButton>
          
          <WarhammerButton
            variant="primary"
            @click="$emit('trade', npc)"
          >
            Trade
          </WarhammerButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NPC, DialogueNode, DialogueResponse, TavernService } from '~/stores/tavern'
import type { Quest } from '~/stores/quest'

interface Props {
  npc: NPC
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'view-quest': [quest: Quest]
  trade: [npc: NPC]
}>()

// Stores
const tavernStore = useTavernStore()
const questStore = useQuestStore()

// Reactive state
const currentDialogue = ref<DialogueNode | null>(null)
const conversationHistory = ref<string[]>([])

// Computed properties
const dispositionClasses = computed(() => {
  const classes = {
    hostile: 'bg-red-500',
    unfriendly: 'bg-orange-500',
    neutral: 'bg-gray-500',
    friendly: 'bg-green-500',
    helpful: 'bg-blue-500'
  }
  return classes[props.npc.disposition]
})

const availableResponses = computed(() => {
  if (!currentDialogue.value) return []
  
  return currentDialogue.value.responses.filter(response => {
    // Check conditions for response availability
    return checkConditions(response.conditions || [])
  })
})

const npcServices = computed(() => {
  // Get services offered by this NPC
  return tavernStore.locations
    .flatMap(loc => loc.services)
    .filter(service => props.npc.services.includes(service.id))
})

const npcQuests = computed(() => {
  // Get quests offered by this NPC
  return questStore.quests.filter(quest => 
    props.npc.quests.includes(quest.id) && quest.status === 'available'
  )
})

const currentRelationship = computed(() => {
  // Get relationship value with current character
  // For now, return a default value
  return props.npc.relationships['current-character'] || 0
})

// Methods
const startConversation = async () => {
  const dialogue = await tavernStore.interactWithNPC(props.npc.id)
  currentDialogue.value = dialogue
}

const selectResponse = async (response: DialogueResponse) => {
  // Apply response effects
  if (response.effects) {
    applyDialogueEffects(response.effects)
  }
  
  // Move to next dialogue node
  if (response.nextNodeId) {
    const nextDialogue = await tavernStore.interactWithNPC(props.npc.id, response.nextNodeId)
    currentDialogue.value = nextDialogue
  } else {
    currentDialogue.value = null
  }
  
  // Add to conversation history
  conversationHistory.value.push(response.text)
}

const restartConversation = () => {
  conversationHistory.value = []
  startConversation()
}

const purchaseService = (service: TavernService) => {
  // Implement service purchase logic
  console.log('Purchase service:', service.name)
  
  // Show confirmation or payment modal
  alert(`Purchase ${service.name} for ${service.cost} ${service.currency.toUpperCase()}?`)
}

const checkConditions = (conditions: any[]): boolean => {
  // Implement condition checking logic
  return true // For now, all conditions pass
}

const applyDialogueEffects = (effects: any[]) => {
  // Implement dialogue effect application
  console.log('Apply effects:', effects)
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

const getDifficultyClasses = (difficulty: Quest['difficulty']): string => {
  const classes = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    legendary: 'bg-red-100 text-red-800'
  }
  return classes[difficulty]
}

const getRelationshipColor = (value: number): string => {
  if (value >= 75) return 'bg-blue-500'
  if (value >= 50) return 'bg-green-500'
  if (value >= 25) return 'bg-yellow-500'
  if (value >= 0) return 'bg-gray-500'
  if (value >= -25) return 'bg-orange-500'
  return 'bg-red-500'
}

const getRelationshipLabel = (value: number): string => {
  if (value >= 75) return 'Trusted'
  if (value >= 50) return 'Friendly'
  if (value >= 25) return 'Liked'
  if (value >= 0) return 'Neutral'
  if (value >= -25) return 'Disliked'
  if (value >= -50) return 'Unfriendly'
  return 'Hostile'
}

// Lifecycle
onMounted(() => {
  startConversation()
})
</script>

<style scoped>
.npc-interaction {
  font-family: var(--wh-font-body);
}

.npc-portrait img {
  transition: all 0.2s ease;
}

.npc-portrait:hover img {
  transform: scale(1.05);
}

.response-option {
  transition: all 0.2s ease;
}

.response-option:hover {
  transform: translateX(4px);
}

.service-item,
.quest-item {
  transition: all 0.2s ease;
}

.service-item:hover,
.quest-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.disposition-indicator {
  transition: all 0.2s ease;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .response-option,
  .service-item,
  .quest-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .npc-portrait img,
  .response-option,
  .service-item,
  .quest-item,
  .disposition-indicator {
    transition: none !important;
  }
  
  .npc-portrait:hover img,
  .response-option:hover,
  .service-item:hover,
  .quest-item:hover {
    transform: none !important;
  }
}
</style>
