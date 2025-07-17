<template>
  <div class="characters-page min-h-screen bg-wh-parchment">
    <!-- Background Effects -->
    <div class="fixed inset-0 tavern-wood-texture opacity-10 pointer-events-none"></div>

    <!-- Page Header -->
    <section class="relative py-12 bg-gradient-to-b from-wh-aged-paper to-wh-parchment border-b-2 border-wh-wood-brown">
      <div class="container mx-auto px-4">
        <div class="text-center space-y-6">
          <h1 class="text-5xl md:text-7xl font-wh-display text-wh-dark-wood animate-glow-pulse">
            Character Roster
          </h1>

          <p class="text-xl md:text-2xl font-wh-heading text-wh-wood-brown">
            Manage your heroes and companions in the Old World
          </p>

          <!-- Action Bar -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WarhammerButton
              variant="primary"
              size="lg"
              icon-left="plus"
              @click="showCreateModal = true"
            >
              Create New Character
            </WarhammerButton>

            <WarhammerButton
              variant="outline"
              size="lg"
              icon-left="upload"
              @click="importCharacter"
            >
              Import Character
            </WarhammerButton>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap items-center justify-center gap-2">
            <WarhammerButton
              v-for="race in availableRaces"
              :key="race"
              :variant="selectedRace === race ? 'primary' : 'ghost'"
              size="sm"
              @click="selectedRace = selectedRace === race ? '' : race"
            >
              {{ race }}
            </WarhammerButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Characters Grid -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <!-- Loading State -->
        <div v-if="characterStore.loading" class="text-center py-12">
          <div class="animate-spin w-12 h-12 border-4 border-wh-empire-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-wh-wood-brown font-wh-heading">Loading characters...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="characterStore.error" class="text-center py-12">
          <WarhammerIcon name="alert-circle" size="xl" class="text-red-500 mx-auto mb-4" />
          <p class="text-red-600 font-wh-heading mb-4">{{ characterStore.error }}</p>
          <WarhammerButton variant="outline" @click="characterStore.fetchCharacters()">
            Try Again
          </WarhammerButton>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCharacters.length === 0" class="text-center py-12">
          <WarhammerIcon name="users" size="xl" class="text-wh-wood-brown mx-auto mb-4" />
          <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">No Characters Found</h3>
          <p class="text-wh-wood-brown mb-6">
            {{ selectedRace ? `No ${selectedRace} characters found.` : 'Create your first character to get started!' }}
          </p>
          <WarhammerButton variant="primary" @click="showCreateModal = true">
            Create Character
          </WarhammerButton>
        </div>

        <!-- Characters Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="character in filteredCharacters"
            :key="character.id"
            class="animate-medieval-entrance"
          >
            <CharacterCard
              :character="character"
              :selected="selectedCharacter?.id === character.id"
              @click="selectCharacter"
              @edit="editCharacter"
              @duplicate="duplicateCharacter"
              @delete="deleteCharacter"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Character Creation Modal -->
    <WarhammerModal
      v-model="showCreateModal"
      title="Create New Character"
      subtitle="Forge a new hero for your adventures"
      icon="plus"
      size="lg"
      variant="parchment"
    >
      <CharacterCreationForm
        @created="handleCharacterCreated"
        @cancel="showCreateModal = false"
      />
    </WarhammerModal>

    <!-- Character Details Modal -->
    <WarhammerModal
      v-model="showDetailsModal"
      :title="selectedCharacter?.name"
      :subtitle="selectedCharacter ? `${selectedCharacter.race} ${selectedCharacter.career}` : ''"
      icon="user"
      size="xl"
      variant="parchment"
    >
      <CharacterDetails
        v-if="selectedCharacter"
        :character="selectedCharacter"
        @edit="editCharacter"
        @close="showDetailsModal = false"
      />
    </WarhammerModal>

  </div>
</template>

<script setup lang="ts">
import type { Character } from '~/stores/character'

// Page metadata
useHead({
  title: 'Character Roster - Warhammer Fantasy Tavern',
  meta: [
    { name: 'description', content: 'Manage your Warhammer Fantasy characters in the ultimate tavern experience.' }
  ]
})

// Store
const characterStore = useCharacterStore()

// Reactive state
const selectedCharacter = ref<Character | null>(null)
const selectedRace = ref('')
const showCreateModal = ref(false)
const showDetailsModal = ref(false)

// Computed properties
const availableRaces = computed(() => {
  const races = new Set(characterStore.characters.map(char => char.race))
  return Array.from(races).sort()
})

const filteredCharacters = computed(() => {
  let filtered = characterStore.characters

  if (selectedRace.value) {
    filtered = filtered.filter(char => char.race === selectedRace.value)
  }

  return filtered
})
// Methods
const selectCharacter = (character: Character) => {
  selectedCharacter.value = character
  showDetailsModal.value = true
}

const editCharacter = (character: Character) => {
  // Navigate to character edit page or open edit modal
  navigateTo(`/characters/${character.id}/edit`)
}

const duplicateCharacter = async (character: Character) => {
  try {
    await characterStore.duplicateCharacter(character.id)
    // Show success notification
  } catch (error) {
    console.error('Failed to duplicate character:', error)
    // Show error notification
  }
}

const deleteCharacter = async (character: Character) => {
  if (confirm(`Are you sure you want to delete ${character.name}?`)) {
    try {
      await characterStore.deleteCharacter(character.id)
      // Show success notification
    } catch (error) {
      console.error('Failed to delete character:', error)
      // Show error notification
    }
  }
}
const handleCharacterCreated = (character: Character) => {
  showCreateModal.value = false
  selectedCharacter.value = character
  showDetailsModal.value = true
}

const importCharacter = () => {
  // Implement character import functionality
  console.log('Import character functionality to be implemented')
}

// Lifecycle
onMounted(async () => {
  await characterStore.fetchCharacters()
})

</script>

<style scoped>
.characters-page {
  font-family: var(--wh-font-body);
}

/* Animation delays for staggered entrance */
.animate-medieval-entrance:nth-child(1) { animation-delay: 0.1s; }
.animate-medieval-entrance:nth-child(2) { animation-delay: 0.2s; }
.animate-medieval-entrance:nth-child(3) { animation-delay: 0.3s; }
.animate-medieval-entrance:nth-child(4) { animation-delay: 0.4s; }
.animate-medieval-entrance:nth-child(5) { animation-delay: 0.5s; }
.animate-medieval-entrance:nth-child(6) { animation-delay: 0.6s; }
.animate-medieval-entrance:nth-child(7) { animation-delay: 0.7s; }
.animate-medieval-entrance:nth-child(8) { animation-delay: 0.8s; }

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
  .characters-page {
    background: var(--wh-black);
    color: var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-medieval-entrance,
  .animate-spin {
    animation: none !important;
  }
}

/* Print styles */
@media print {
  .characters-page {
    background: white !important;
    color: black !important;
  }
}
</style>