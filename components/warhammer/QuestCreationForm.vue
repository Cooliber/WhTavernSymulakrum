<template>
  <div class="quest-creation-form">
    <!-- Form Header -->
    <div class="form-header mb-6">
      <h3 class="text-xl font-wh-heading text-wh-dark-wood mb-2">
        Create New Quest
      </h3>
      <p class="text-wh-wood-brown">
        Design an adventure for brave souls to undertake
      </p>
    </div>

    <!-- Quest Basic Information -->
    <div class="basic-info mb-6">
      <WarhammerCard title="Basic Information" variant="parchment">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WarhammerInput
            v-model="formData.title"
            label="Quest Title"
            placeholder="Enter quest title..."
            required
            :error-message="errors.title"
          />
          
          <WarhammerInput
            v-model="formData.questGiver"
            label="Quest Giver"
            placeholder="Who gives this quest?"
            required
            :error-message="errors.questGiver"
          />
          
          <div class="form-group">
            <label class="block text-sm font-medium text-wh-dark-wood mb-1">
              Quest Type
            </label>
            <select
              v-model="formData.type"
              class="w-full bg-wh-parchment border border-wh-aged-paper rounded-md px-3 py-2 text-wh-dark-wood focus:ring-2 focus:ring-wh-empire-gold"
              required
            >
              <option value="">Select type...</option>
              <option value="main">Main Quest</option>
              <option value="side">Side Quest</option>
              <option value="daily">Daily Quest</option>
              <option value="guild">Guild Quest</option>
              <option value="personal">Personal Quest</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium text-wh-dark-wood mb-1">
              Difficulty
            </label>
            <select
              v-model="formData.difficulty"
              class="w-full bg-wh-parchment border border-wh-aged-paper rounded-md px-3 py-2 text-wh-dark-wood focus:ring-2 focus:ring-wh-empire-gold"
              required
            >
              <option value="">Select difficulty...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          
          <WarhammerInput
            v-model="formData.location"
            label="Location"
            placeholder="Where does this quest take place?"
            required
            :error-message="errors.location"
          />
          
          <div class="grid grid-cols-2 gap-2">
            <WarhammerInput
              v-model.number="formData.minLevel"
              type="number"
              label="Min Level"
              placeholder="1"
              min="1"
              max="20"
              required
            />
            <WarhammerInput
              v-model.number="formData.maxLevel"
              type="number"
              label="Max Level"
              placeholder="20"
              min="1"
              max="20"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <WarhammerInput
              v-model.number="formData.maxPartySize"
              type="number"
              label="Max Party Size"
              placeholder="4"
              min="1"
              max="8"
              required
            />
            <WarhammerInput
              v-model.number="formData.timeLimit"
              type="number"
              label="Time Limit (hours)"
              placeholder="Optional"
              min="1"
              max="168"
            />
          </div>
        </div>
        
        <div class="mt-4">
          <WarhammerInput
            v-model="formData.briefDescription"
            label="Brief Description"
            placeholder="A short summary of the quest..."
            required
            :error-message="errors.briefDescription"
          />
        </div>
        
        <div class="mt-4">
          <WarhammerInput
            v-model="formData.description"
            type="textarea"
            label="Full Description"
            placeholder="Detailed description of the quest..."
            :rows="4"
            required
            :error-message="errors.description"
          />
        </div>
        
        <div class="mt-4">
          <WarhammerInput
            v-model="formData.lore"
            type="textarea"
            label="Background Lore"
            placeholder="Optional background information..."
            :rows="3"
          />
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Objectives -->
    <div class="objectives-section mb-6">
      <WarhammerCard title="Quest Objectives" variant="parchment">
        <div class="space-y-4">
          <div
            v-for="(objective, index) in formData.objectives"
            :key="index"
            class="objective-item p-4 bg-wh-aged-paper rounded border border-wh-wood-brown"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="font-medium text-wh-dark-wood">
                Objective {{ index + 1 }}
              </h4>
              <WarhammerButton
                variant="ghost"
                size="sm"
                icon-left="trash"
                @click="removeObjective(index)"
              >
                Remove
              </WarhammerButton>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <WarhammerInput
                v-model="objective.description"
                label="Description"
                placeholder="What needs to be done?"
                required
              />
              
              <div class="form-group">
                <label class="block text-sm font-medium text-wh-dark-wood mb-1">
                  Type
                </label>
                <select
                  v-model="objective.type"
                  class="w-full bg-wh-parchment border border-wh-aged-paper rounded-md px-3 py-2 text-wh-dark-wood focus:ring-2 focus:ring-wh-empire-gold"
                  required
                >
                  <option value="kill">Kill</option>
                  <option value="collect">Collect</option>
                  <option value="deliver">Deliver</option>
                  <option value="explore">Explore</option>
                  <option value="interact">Interact</option>
                  <option value="survive">Survive</option>
                </select>
              </div>
              
              <WarhammerInput
                v-model="objective.target"
                label="Target (Optional)"
                placeholder="Specific target if applicable"
              />
              
              <WarhammerInput
                v-model.number="objective.requiredCount"
                type="number"
                label="Required Count"
                placeholder="1"
                min="1"
                required
              />
            </div>
            
            <div class="mt-3">
              <label class="flex items-center space-x-2">
                <input
                  v-model="objective.optional"
                  type="checkbox"
                  class="w-4 h-4 text-wh-empire-gold bg-wh-parchment border-wh-wood-brown rounded focus:ring-wh-empire-gold"
                />
                <span class="text-sm text-wh-dark-wood">Optional objective</span>
              </label>
            </div>
          </div>
          
          <WarhammerButton
            variant="outline"
            icon-left="plus"
            @click="addObjective"
          >
            Add Objective
          </WarhammerButton>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Rewards -->
    <div class="rewards-section mb-6">
      <WarhammerCard title="Quest Rewards" variant="parchment">
        <div class="space-y-4">
          <div
            v-for="(reward, index) in formData.rewards"
            :key="index"
            class="reward-item p-4 bg-wh-aged-paper rounded border border-wh-wood-brown"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="font-medium text-wh-dark-wood">
                Reward {{ index + 1 }}
              </h4>
              <WarhammerButton
                variant="ghost"
                size="sm"
                icon-left="trash"
                @click="removeReward(index)"
              >
                Remove
              </WarhammerButton>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="form-group">
                <label class="block text-sm font-medium text-wh-dark-wood mb-1">
                  Type
                </label>
                <select
                  v-model="reward.type"
                  class="w-full bg-wh-parchment border border-wh-aged-paper rounded-md px-3 py-2 text-wh-dark-wood focus:ring-2 focus:ring-wh-empire-gold"
                  required
                >
                  <option value="experience">Experience</option>
                  <option value="gold">Gold</option>
                  <option value="item">Item</option>
                  <option value="reputation">Reputation</option>
                  <option value="skill">Skill</option>
                </select>
              </div>
              
              <WarhammerInput
                v-model.number="reward.amount"
                type="number"
                label="Amount"
                placeholder="Amount/quantity"
                min="1"
                required
              />
              
              <WarhammerInput
                v-model="reward.description"
                label="Description"
                placeholder="Reward description"
                required
              />
            </div>
            
            <div v-if="reward.type === 'item'" class="mt-3">
              <WarhammerInput
                v-model="reward.itemName"
                label="Item Name"
                placeholder="Name of the item"
              />
            </div>
          </div>
          
          <WarhammerButton
            variant="outline"
            icon-left="plus"
            @click="addReward"
          >
            Add Reward
          </WarhammerButton>
        </div>
      </WarhammerCard>
    </div>

    <!-- Quest Tags -->
    <div class="tags-section mb-6">
      <WarhammerCard title="Quest Tags" variant="parchment" size="sm">
        <WarhammerInput
          v-model="tagsInput"
          label="Tags (comma-separated)"
          placeholder="combat, investigation, rescue..."
          help-text="Add tags to help categorize this quest"
          @input="updateTags"
        />
        
        <div v-if="formData.tags.length > 0" class="mt-3">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in formData.tags"
              :key="tag"
              class="inline-flex items-center px-3 py-1 text-sm bg-wh-empire-gold text-wh-dark-wood rounded-full"
            >
              {{ tag }}
              <button
                type="button"
                class="ml-2 text-wh-dark-wood hover:text-red-600"
                @click="removeTag(tag)"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      </WarhammerCard>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <div class="flex justify-between">
        <WarhammerButton
          variant="outline"
          @click="$emit('cancel')"
        >
          Cancel
        </WarhammerButton>
        
        <WarhammerButton
          variant="primary"
          :loading="isCreating"
          :disabled="!canCreate"
          @click="createQuest"
        >
          Create Quest
        </WarhammerButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Quest, CreateQuestRequest } from '~/stores/quest'

const emit = defineEmits<{
  created: [quest: Quest]
  cancel: []
}>()

// Store
const questStore = useQuestStore()

// Reactive state
const isCreating = ref(false)
const tagsInput = ref('')

const formData = ref<CreateQuestRequest>({
  title: '',
  description: '',
  briefDescription: '',
  type: 'side' as const,
  difficulty: 'medium' as const,
  objectives: [
    {
      description: '',
      type: 'explore' as const,
      requiredCount: 1,
      optional: false
    }
  ],
  rewards: [
    {
      type: 'experience' as const,
      amount: 100,
      description: 'Experience points'
    }
  ],
  requirements: [],
  location: '',
  questGiver: '',
  maxPartySize: 4,
  minLevel: 1,
  tags: [],
  lore: ''
})

const errors = ref({
  title: '',
  briefDescription: '',
  description: '',
  questGiver: '',
  location: ''
})

// Computed properties
const canCreate = computed(() => {
  return !!(
    formData.value.title.trim() &&
    formData.value.briefDescription.trim() &&
    formData.value.description.trim() &&
    formData.value.questGiver.trim() &&
    formData.value.location.trim() &&
    formData.value.objectives.length > 0 &&
    formData.value.rewards.length > 0
  )
})

// Methods
const addObjective = () => {
  formData.value.objectives.push({
    description: '',
    type: 'explore',
    requiredCount: 1,
    optional: false
  })
}

const removeObjective = (index: number) => {
  if (formData.value.objectives.length > 1) {
    formData.value.objectives.splice(index, 1)
  }
}

const addReward = () => {
  formData.value.rewards.push({
    type: 'experience',
    amount: 50,
    description: ''
  })
}

const removeReward = (index: number) => {
  if (formData.value.rewards.length > 1) {
    formData.value.rewards.splice(index, 1)
  }
}

const updateTags = () => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  formData.value.tags = [...new Set(tags)] // Remove duplicates
}

const removeTag = (tagToRemove: string) => {
  formData.value.tags = formData.value.tags.filter(tag => tag !== tagToRemove)
  tagsInput.value = formData.value.tags.join(', ')
}

const validateForm = (): boolean => {
  errors.value = {
    title: '',
    briefDescription: '',
    description: '',
    questGiver: '',
    location: ''
  }

  let isValid = true

  if (!formData.value.title.trim()) {
    errors.value.title = 'Quest title is required'
    isValid = false
  }

  if (!formData.value.briefDescription.trim()) {
    errors.value.briefDescription = 'Brief description is required'
    isValid = false
  }

  if (!formData.value.description.trim()) {
    errors.value.description = 'Full description is required'
    isValid = false
  }

  if (!formData.value.questGiver.trim()) {
    errors.value.questGiver = 'Quest giver is required'
    isValid = false
  }

  if (!formData.value.location.trim()) {
    errors.value.location = 'Location is required'
    isValid = false
  }

  return isValid
}

const createQuest = async () => {
  if (!validateForm()) return

  isCreating.value = true

  try {
    const newQuest = await questStore.createQuest(formData.value)
    emit('created', newQuest)
  } catch (error) {
    console.error('Failed to create quest:', error)
    alert('Failed to create quest. Please try again.')
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.quest-creation-form {
  font-family: var(--wh-font-body);
}

.form-group label {
  font-family: var(--wh-font-heading);
}

.objective-item,
.reward-item {
  transition: all 0.2s ease;
}

.objective-item:hover,
.reward-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .objective-item,
  .reward-item {
    border: 2px solid var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .objective-item,
  .reward-item {
    transition: none !important;
  }
  
  .objective-item:hover,
  .reward-item:hover {
    transform: none !important;
  }
}
</style>
