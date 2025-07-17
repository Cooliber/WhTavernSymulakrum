<template>
  <div class="test-page min-h-screen bg-wh-parchment p-8">
    <div class="container mx-auto">
      <h1 class="text-4xl font-wh-display text-wh-dark-wood mb-8 text-center">
        Character Component Testing
      </h1>
      
      <!-- Component Tests -->
      <div class="space-y-12">
        <!-- Warhammer UI Components Test -->
        <section>
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Warhammer UI Components</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- Button Tests -->
            <WarhammerButton variant="primary" icon-left="sword">Primary Button</WarhammerButton>
            <WarhammerButton variant="secondary" icon-left="shield">Secondary</WarhammerButton>
            <WarhammerButton variant="outline" icon-left="bow">Outline</WarhammerButton>
            <WarhammerButton variant="ghost" icon-left="sparkles">Ghost</WarhammerButton>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Input Test -->
            <WarhammerInput
              v-model="testInput"
              label="Test Input"
              placeholder="Enter some text..."
              icon-left="user"
              help-text="This is a test input field"
            />
            
            <!-- Card Test -->
            <WarhammerCard
              title="Test Card"
              subtitle="This is a test card"
              variant="parchment"
              icon="crown"
            >
              <p class="text-wh-wood-brown">
                This is the content of the test card. It should display properly with Warhammer styling.
              </p>
            </WarhammerCard>
          </div>
        </section>

        <!-- Character Store Test -->
        <section>
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Character Store Integration</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <WarhammerCard title="Store Status" variant="filled">
              <div class="space-y-2 text-wh-bone">
                <p><strong>Loading:</strong> {{ characterStore.loading }}</p>
                <p><strong>Error:</strong> {{ characterStore.error || 'None' }}</p>
                <p><strong>Characters:</strong> {{ characterStore.totalCharacters }}</p>
                <p><strong>Average Level:</strong> {{ characterStore.averageLevel }}</p>
              </div>
            </WarhammerCard>
            
            <WarhammerCard title="Actions" variant="outlined">
              <div class="space-y-3">
                <WarhammerButton
                  variant="primary"
                  size="sm"
                  :loading="characterStore.loading"
                  @click="characterStore.fetchCharacters()"
                >
                  Fetch Characters
                </WarhammerButton>
                
                <WarhammerButton
                  variant="secondary"
                  size="sm"
                  @click="showCreateForm = true"
                >
                  Test Create Form
                </WarhammerButton>
                
                <WarhammerButton
                  variant="outline"
                  size="sm"
                  @click="showDetailsModal = true"
                  :disabled="!testCharacter"
                >
                  Test Details View
                </WarhammerButton>
              </div>
            </WarhammerCard>
            
            <WarhammerCard title="Test Character" variant="parchment">
              <div v-if="testCharacter" class="space-y-2">
                <p><strong>Name:</strong> {{ testCharacter.name }}</p>
                <p><strong>Race:</strong> {{ testCharacter.race }}</p>
                <p><strong>Career:</strong> {{ testCharacter.career }}</p>
                <p><strong>Level:</strong> {{ testCharacter.level }}</p>
                <p><strong>Wounds:</strong> {{ testCharacter.wounds.current }}/{{ testCharacter.wounds.maximum }}</p>
              </div>
              <p v-else class="text-wh-wood-brown">No test character available</p>
            </WarhammerCard>
          </div>
        </section>

        <!-- Character Cards Test -->
        <section v-if="characterStore.characters.length > 0">
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Character Cards</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CharacterCard
              v-for="character in characterStore.characters.slice(0, 3)"
              :key="character.id"
              :character="character"
              @click="selectTestCharacter"
              @edit="editTestCharacter"
              @duplicate="duplicateTestCharacter"
              @delete="deleteTestCharacter"
            />
          </div>
        </section>

        <!-- Responsive Test -->
        <section>
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Responsive Design Test</h2>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              <WarhammerButton
                v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']"
                :key="size"
                :size="size"
                variant="primary"
              >
                {{ size.toUpperCase() }}
              </WarhammerButton>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WarhammerInput
                v-model="testTextarea"
                type="textarea"
                label="Responsive Textarea"
                placeholder="This should resize properly on mobile..."
                :rows="3"
              />
              
              <div class="space-y-2">
                <label class="block text-sm font-wh-heading text-wh-dark-wood">Faction Buttons</label>
                <div class="flex flex-wrap gap-2">
                  <WarhammerButton
                    v-for="faction in ['empire', 'chaos', 'dwarfs', 'elves']"
                    :key="faction"
                    :faction="faction"
                    size="sm"
                    variant="outline"
                  >
                    {{ faction }}
                  </WarhammerButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Accessibility Test -->
        <section>
          <h2 class="text-2xl font-wh-heading text-wh-dark-wood mb-6">Accessibility Features</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WarhammerCard title="Keyboard Navigation" variant="parchment">
              <div class="space-y-3">
                <p class="text-sm text-wh-wood-brown">
                  Test keyboard navigation with Tab, Enter, and Space keys:
                </p>
                <WarhammerButton variant="primary" @click="showAlert('Button 1 clicked!')">
                  Focusable Button 1
                </WarhammerButton>
                <WarhammerInput
                  v-model="accessibilityTest"
                  label="Accessible Input"
                  placeholder="Tab to this input..."
                  aria-describedby="accessibility-help"
                />
                <p id="accessibility-help" class="text-xs text-wh-wood-brown">
                  This input has proper ARIA attributes
                </p>
                <WarhammerButton variant="secondary" @click="showAlert('Button 2 clicked!')">
                  Focusable Button 2
                </WarhammerButton>
              </div>
            </WarhammerCard>
            
            <WarhammerCard title="Screen Reader Support" variant="parchment">
              <div class="space-y-3">
                <p class="text-sm text-wh-wood-brown">
                  Elements with proper ARIA labels and descriptions:
                </p>
                <WarhammerButton
                  variant="outline"
                  icon-left="heart"
                  aria-label="Add to favorites"
                  @click="showAlert('Added to favorites!')"
                >
                  <span class="wh-sr-only">Add to favorites</span>
                  ❤️
                </WarhammerButton>
                <div role="status" aria-live="polite" class="text-sm text-wh-wood-brown">
                  Status updates will be announced to screen readers
                </div>
              </div>
            </WarhammerCard>
          </div>
        </section>
      </div>
    </div>

    <!-- Character Creation Modal -->
    <WarhammerModal
      v-model="showCreateForm"
      title="Create New Character"
      subtitle="Test the character creation form"
      size="xl"
      variant="parchment"
    >
      <CharacterCreationForm
        @created="handleCharacterCreated"
        @cancel="showCreateForm = false"
      />
    </WarhammerModal>

    <!-- Character Details Modal -->
    <WarhammerModal
      v-model="showDetailsModal"
      :title="testCharacter?.name || 'Character Details'"
      subtitle="Test the character details view"
      size="xl"
      variant="parchment"
    >
      <CharacterDetails
        v-if="testCharacter"
        :character="testCharacter"
        @edit="editTestCharacter"
        @close="showDetailsModal = false"
      />
    </WarhammerModal>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '~/stores/character'

// Page metadata
useHead({
  title: 'Character Components Test - Warhammer Fantasy Tavern',
  meta: [
    { name: 'description', content: 'Testing page for Warhammer character management components' }
  ]
})

// Store
const characterStore = useCharacterStore()

// Reactive state
const testInput = ref('')
const testTextarea = ref('')
const accessibilityTest = ref('')
const showCreateForm = ref(false)
const showDetailsModal = ref(false)
const testCharacter = ref<Character | null>(null)

// Computed
const hasCharacters = computed(() => characterStore.characters.length > 0)

// Methods
const selectTestCharacter = (character: Character) => {
  testCharacter.value = character
  showDetailsModal.value = true
}

const editTestCharacter = (character: Character) => {
  console.log('Edit character:', character.name)
  showAlert(`Edit functionality for ${character.name} would open here`)
}

const duplicateTestCharacter = (character: Character) => {
  console.log('Duplicate character:', character.name)
  showAlert(`Duplicating ${character.name}...`)
}

const deleteTestCharacter = (character: Character) => {
  console.log('Delete character:', character.name)
  showAlert(`Delete confirmation for ${character.name} would appear here`)
}

const handleCharacterCreated = (character: Character) => {
  showCreateForm.value = false
  testCharacter.value = character
  showDetailsModal.value = true
  showAlert(`Character ${character.name} created successfully!`)
}

const showAlert = (message: string) => {
  alert(message)
}

// Lifecycle
onMounted(async () => {
  // Load characters for testing
  await characterStore.fetchCharacters()
  
  // Set first character as test character
  if (characterStore.characters.length > 0) {
    testCharacter.value = characterStore.characters[0]
  }
})
</script>

<style scoped>
.test-page {
  font-family: var(--wh-font-body);
}

section {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  border: 1px solid var(--wh-wood-brown);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  section {
    border: 2px solid var(--wh-bone);
    background: var(--wh-black);
  }
}
</style>
