<template>
  <div class="tavern-map">
    <!-- Map Header -->
    <div class="map-header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-2">
            The Prancing Pony
          </h2>
          <p class="text-wh-wood-brown">
            Click on locations to explore and interact
          </p>
        </div>
        
        <div class="tavern-status">
          <div class="flex items-center space-x-4 text-sm">
            <div class="flex items-center space-x-1">
              <WarhammerIcon name="users" size="xs" class="text-wh-wood-brown" />
              <span class="text-wh-wood-brown">{{ totalOccupancy }}/{{ totalCapacity }} guests</span>
            </div>
            <div class="flex items-center space-x-1">
              <WarhammerIcon name="clock" size="xs" class="text-wh-wood-brown" />
              <span class="text-wh-wood-brown">{{ currentTimeFormatted }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <WarhammerIcon :name="weatherIcon" size="xs" class="text-wh-wood-brown" />
              <span class="text-wh-wood-brown capitalize">{{ tavernStore.tavernState.weather }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Map -->
    <div class="map-container">
      <WarhammerCard variant="parchment" class="map-wrapper">
        <div class="relative">
          <!-- Map Background -->
          <div 
            class="tavern-floor-plan relative bg-wh-aged-paper border-2 border-wh-wood-brown rounded-lg overflow-hidden"
            :style="{ width: '800px', height: '600px' }"
          >
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-20 tavern-wood-texture"></div>
            
            <!-- Location Areas -->
            <div
              v-for="location in tavernStore.locations"
              :key="location.id"
              class="location-area absolute cursor-pointer transition-all duration-200"
              :class="[
                locationClasses(location),
                { 'location-selected': selectedLocation?.id === location.id }
              ]"
              :style="getLocationStyle(location)"
              @click="selectLocation(location)"
              @mouseenter="hoveredLocation = location"
              @mouseleave="hoveredLocation = null"
            >
              <!-- Location Content -->
              <div class="location-content h-full flex flex-col items-center justify-center p-2">
                <WarhammerIcon
                  :name="getLocationIcon(location.type)"
                  :size="getIconSize(location)"
                  class="text-wh-dark-wood mb-1"
                />
                <span class="text-xs font-wh-heading text-wh-dark-wood text-center leading-tight">
                  {{ location.name }}
                </span>
                
                <!-- Occupancy Indicator -->
                <div class="occupancy-indicator mt-1">
                  <div class="flex items-center space-x-1">
                    <div
                      v-for="i in Math.min(location.capacity, 10)"
                      :key="i"
                      class="w-1 h-1 rounded-full"
                      :class="i <= location.currentOccupancy ? 'bg-wh-empire-gold' : 'bg-wh-wood-brown opacity-30'"
                    ></div>
                  </div>
                </div>
                
                <!-- NPCs Indicator -->
                <div v-if="getNPCsInLocation(location.id).length > 0" class="npcs-indicator mt-1">
                  <div class="flex -space-x-1">
                    <div
                      v-for="npc in getNPCsInLocation(location.id).slice(0, 3)"
                      :key="npc.id"
                      class="w-3 h-3 rounded-full border border-wh-wood-brown flex items-center justify-center"
                      :class="getNPCIndicatorClass(npc.disposition)"
                      :title="npc.name"
                    >
                      <div class="w-1 h-1 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Location Tooltip -->
              <div
                v-if="hoveredLocation?.id === location.id"
                class="location-tooltip absolute z-10 bg-wh-dark-wood text-wh-bone p-3 rounded-lg shadow-lg pointer-events-none"
                :style="getTooltipPosition(location)"
              >
                <h4 class="font-wh-heading text-sm mb-1">{{ location.name }}</h4>
                <p class="text-xs mb-2">{{ location.description }}</p>
                <div class="space-y-1 text-xs">
                  <div class="flex items-center justify-between">
                    <span>Occupancy:</span>
                    <span>{{ location.currentOccupancy }}/{{ location.capacity }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Atmosphere:</span>
                    <span class="capitalize">{{ location.ambience.lighting }}, {{ location.ambience.noise }}</span>
                  </div>
                  <div v-if="getNPCsInLocation(location.id).length > 0">
                    <span>NPCs:</span>
                    <div class="mt-1">
                      <span
                        v-for="npc in getNPCsInLocation(location.id)"
                        :key="npc.id"
                        class="inline-block bg-wh-empire-gold text-wh-dark-wood px-1 py-0.5 rounded text-xs mr-1 mb-1"
                      >
                        {{ npc.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Active Events Overlay -->
            <div
              v-for="event in activeEventsInMap"
              :key="event.id"
              class="event-overlay absolute pointer-events-none"
              :style="getEventOverlayStyle(event)"
            >
              <div class="event-indicator animate-pulse">
                <WarhammerIcon name="star" size="sm" class="text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Location Details Panel -->
    <div v-if="selectedLocation" class="location-details mt-6">
      <WarhammerCard
        :title="selectedLocation.name"
        :subtitle="selectedLocation.description"
        variant="parchment"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Location Info -->
          <div class="location-info">
            <h4 class="font-wh-heading text-wh-dark-wood mb-3">Location Details</h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-wh-wood-brown">Type:</span>
                <span class="text-wh-dark-wood capitalize">{{ selectedLocation.type }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-wh-wood-brown">Capacity:</span>
                <span class="text-wh-dark-wood">{{ selectedLocation.currentOccupancy }}/{{ selectedLocation.capacity }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-wh-wood-brown">Lighting:</span>
                <span class="text-wh-dark-wood capitalize">{{ selectedLocation.ambience.lighting }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-wh-wood-brown">Noise Level:</span>
                <span class="text-wh-dark-wood capitalize">{{ selectedLocation.ambience.noise }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-wh-wood-brown">Temperature:</span>
                <span class="text-wh-dark-wood capitalize">{{ selectedLocation.ambience.temperature }}</span>
              </div>
            </div>
            
            <!-- Features -->
            <div v-if="selectedLocation.features.length > 0" class="features mt-4">
              <h5 class="font-wh-heading text-wh-dark-wood mb-2">Features</h5>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="feature in selectedLocation.features"
                  :key="feature"
                  class="px-2 py-1 text-xs bg-wh-empire-gold text-wh-dark-wood rounded-full"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- NPCs and Services -->
          <div class="npcs-services">
            <!-- NPCs -->
            <div v-if="getNPCsInLocation(selectedLocation.id).length > 0" class="npcs mb-4">
              <h4 class="font-wh-heading text-wh-dark-wood mb-3">NPCs Present</h4>
              <div class="space-y-2">
                <div
                  v-for="npc in getNPCsInLocation(selectedLocation.id)"
                  :key="npc.id"
                  class="npc-item flex items-center justify-between p-2 bg-wh-aged-paper rounded border border-wh-wood-brown cursor-pointer hover:bg-wh-wood-brown hover:text-wh-bone transition-colors"
                  @click="$emit('interact-npc', npc)"
                >
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      :class="getNPCIndicatorClass(npc.disposition)"
                    ></div>
                    <div>
                      <span class="text-sm font-medium">{{ npc.name }}</span>
                      <p class="text-xs opacity-75">{{ npc.title || npc.profession }}</p>
                    </div>
                  </div>
                  <WarhammerIcon name="message-circle" size="xs" />
                </div>
              </div>
            </div>
            
            <!-- Services -->
            <div v-if="selectedLocation.services.length > 0" class="services">
              <h4 class="font-wh-heading text-wh-dark-wood mb-3">Available Services</h4>
              <div class="space-y-2">
                <div
                  v-for="service in selectedLocation.services"
                  :key="service.id"
                  class="service-item p-2 bg-wh-aged-paper rounded border border-wh-wood-brown"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-wh-dark-wood">{{ service.name }}</span>
                      <p class="text-xs text-wh-wood-brown">{{ service.description }}</p>
                    </div>
                    <div class="text-right">
                      <span class="text-sm font-bold text-wh-empire-gold">
                        {{ service.cost }} {{ service.currency.toUpperCase() }}
                      </span>
                      <p class="text-xs text-wh-wood-brown capitalize">{{ service.quality }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <template #footer>
          <div class="flex justify-between items-center">
            <span class="text-xs text-wh-wood-brown">
              Click NPCs to interact or services to purchase
            </span>
            <div class="flex space-x-2">
              <WarhammerButton
                v-if="selectedLocation.requiresPayment"
                variant="primary"
                size="sm"
                :disabled="!selectedLocation.isAccessible"
              >
                Enter ({{ selectedLocation.cost }} GC)
              </WarhammerButton>
              <WarhammerButton
                v-else
                variant="outline"
                size="sm"
                @click="selectedLocation = null"
              >
                Close
              </WarhammerButton>
            </div>
          </div>
        </template>
      </WarhammerCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TavernLocation, NPC, TavernEvent } from '~/stores/tavern'

const emit = defineEmits<{
  'interact-npc': [npc: NPC]
  'enter-location': [location: TavernLocation]
}>()

// Store
const tavernStore = useTavernStore()

// Reactive state
const selectedLocation = ref<TavernLocation | null>(null)
const hoveredLocation = ref<TavernLocation | null>(null)

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

const activeEventsInMap = computed(() => {
  return tavernStore.getActiveEvents.filter(event => 
    tavernStore.locations.some(loc => loc.id === event.location)
  )
})

// Methods
const selectLocation = (location: TavernLocation) => {
  selectedLocation.value = location
}

const getNPCsInLocation = (locationId: string): NPC[] => {
  return tavernStore.getNPCsByLocation(locationId)
}

const getLocationStyle = (location: TavernLocation) => {
  return {
    left: `${location.coordinates.x}px`,
    top: `${location.coordinates.y}px`,
    width: `${location.size.width}px`,
    height: `${location.size.height}px`
  }
}

const getTooltipPosition = (location: TavernLocation) => {
  const x = location.coordinates.x + location.size.width + 10
  const y = location.coordinates.y
  return {
    left: `${x}px`,
    top: `${y}px`
  }
}

const getEventOverlayStyle = (event: TavernEvent) => {
  const location = tavernStore.getLocationById(event.location)
  if (!location) return {}
  
  return {
    left: `${location.coordinates.x + location.size.width - 20}px`,
    top: `${location.coordinates.y}px`
  }
}

const locationClasses = (location: TavernLocation) => {
  const classes = ['border-2', 'rounded-lg', 'hover:shadow-lg']
  
  if (location.type === 'room') {
    classes.push('bg-blue-100', 'border-blue-300', 'hover:bg-blue-200')
  } else if (location.type === 'area') {
    classes.push('bg-green-100', 'border-green-300', 'hover:bg-green-200')
  } else {
    classes.push('bg-yellow-100', 'border-yellow-300', 'hover:bg-yellow-200')
  }
  
  if (!location.isAccessible) {
    classes.push('opacity-50', 'cursor-not-allowed')
  }
  
  return classes
}

const getLocationIcon = (type: TavernLocation['type']): string => {
  const icons = {
    room: 'home',
    area: 'users',
    service: 'shopping-cart'
  }
  return icons[type] || 'map-pin'
}

const getIconSize = (location: TavernLocation): 'sm' | 'md' | 'lg' => {
  if (location.size.width >= 150) return 'lg'
  if (location.size.width >= 100) return 'md'
  return 'sm'
}

const getNPCIndicatorClass = (disposition: NPC['disposition']): string => {
  const classes = {
    hostile: 'bg-red-500',
    unfriendly: 'bg-orange-500',
    neutral: 'bg-gray-500',
    friendly: 'bg-green-500',
    helpful: 'bg-blue-500'
  }
  return classes[disposition]
}

// Lifecycle
onMounted(async () => {
  await tavernStore.fetchTavernData()
})
</script>

<style scoped>
.tavern-map {
  font-family: var(--wh-font-body);
}

.map-container {
  max-width: 100%;
  overflow-x: auto;
}

.location-area {
  min-width: 80px;
  min-height: 60px;
}

.location-selected {
  ring: 2px;
  ring-color: var(--wh-empire-gold);
  ring-offset: 2px;
}

.location-tooltip {
  min-width: 200px;
  max-width: 300px;
  z-index: 50;
}

.event-indicator {
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
}

.npc-item:hover {
  transform: translateX(4px);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .location-area {
    border-width: 3px;
  }
  
  .location-tooltip {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .location-area,
  .npc-item,
  .event-indicator {
    transition: none !important;
    animation: none !important;
  }
  
  .npc-item:hover {
    transform: none !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .tavern-floor-plan {
    width: 100% !important;
    height: 400px !important;
  }
  
  .location-area {
    min-width: 60px;
    min-height: 40px;
  }
  
  .location-tooltip {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    top: auto;
  }
}
</style>
