<template>
  <div 
    v-if="visible"
    class="warhammer-multi-step-loader fixed inset-0 z-50 flex items-center justify-center"
    role="status"
    :aria-label="currentStep.description"
  >
    <!-- Animated Background -->
    <div class="absolute inset-0">
      <AuroraBackground 
        :colors="['#8B4513', '#DAA520', '#CD853F', '#A0522D']"
        class="opacity-80"
      />
      <ParticlesBg 
        :particle-count="50"
        :particle-color="'#DAA520'"
        :particle-size="2"
        class="opacity-60"
      />
    </div>

    <!-- Main Loader Content -->
    <div class="relative z-10 max-w-md w-full mx-4">
      <!-- Tavern Sign -->
      <div class="text-center mb-8">
        <div class="tavern-sign relative">
          <BorderBeam class="absolute inset-0" />
          <div class="relative bg-wh-wood-brown/90 backdrop-blur-sm rounded-lg p-6 border-2 border-wh-empire-gold">
            <HyperText
              text="The Prancing Pony"
              class="text-2xl font-wh-display text-wh-empire-gold mb-2"
              :animation-duration="2000"
            />
            <SparklesText
              text="Warhammer Fantasy Tavern"
              class="text-sm text-wh-aged-paper"
              :sparkles-count="8"
            />
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="steps-container bg-wh-parchment/95 backdrop-blur-sm rounded-lg p-6 border border-wh-wood-brown shadow-2xl">
        <!-- Progress Bar -->
        <div class="progress-section mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-wh-heading text-wh-dark-wood">
              {{ $t('loading.progress') }}
            </span>
            <span class="text-sm font-bold text-wh-empire-gold">
              {{ Math.round(progress) }}%
            </span>
          </div>
          
          <div class="progress-bar relative h-3 bg-wh-aged-paper rounded-full overflow-hidden border border-wh-wood-brown/30">
            <div 
              class="progress-fill h-full bg-gradient-to-r from-wh-empire-gold via-yellow-400 to-wh-empire-gold transition-all duration-500 ease-out relative"
              :style="{ width: `${progress}%` }"
            >
              <!-- Animated shine effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
            </div>
          </div>
        </div>

        <!-- Current Step Display -->
        <div class="current-step mb-6">
          <div class="flex items-center space-x-3 mb-3">
            <div class="step-icon relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-wh-empire-gold to-yellow-600 flex items-center justify-center">
                <Icon :name="currentStep.icon" class="w-5 h-5 text-wh-dark-wood" />
              </div>
              <!-- Pulsing ring -->
              <div class="absolute inset-0 rounded-full border-2 border-wh-empire-gold animate-ping opacity-75"></div>
            </div>
            
            <div class="step-content flex-1">
              <h3 class="font-wh-heading font-semibold text-wh-dark-wood">
                {{ currentStep.title }}
              </h3>
              <p class="text-sm text-wh-wood-brown">
                {{ currentStep.description }}
              </p>
            </div>
          </div>

          <!-- Step-specific animations -->
          <div class="step-animation h-16 flex items-center justify-center">
            <!-- Fire animation for tavern preparation -->
            <div v-if="currentStep.id === 'tavern'" class="fire-animation flex space-x-1">
              <div 
                v-for="i in 5" 
                :key="i"
                class="w-2 h-8 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full animate-fire-flicker"
                :style="{ animationDelay: `${i * 0.1}s` }"
              ></div>
            </div>

            <!-- Magic sparkles for AI initialization -->
            <div v-else-if="currentStep.id === 'ai'" class="magic-animation relative w-16 h-16">
              <div 
                v-for="i in 8" 
                :key="i"
                class="absolute w-1 h-1 bg-blue-400 rounded-full animate-sparkle"
                :style="{ 
                  left: `${Math.cos(i * Math.PI / 4) * 20 + 50}%`,
                  top: `${Math.sin(i * Math.PI / 4) * 20 + 50}%`,
                  animationDelay: `${i * 0.2}s`
                }"
              ></div>
              <Icon name="sparkles" class="w-8 h-8 text-purple-500 absolute inset-0 m-auto animate-pulse" />
            </div>

            <!-- Scroll animation for content loading -->
            <div v-else-if="currentStep.id === 'content'" class="scroll-animation">
              <Icon name="scroll" class="w-8 h-8 text-wh-wood-brown animate-bounce" />
            </div>

            <!-- Default loading animation -->
            <div v-else class="default-animation">
              <WarhammerLoader 
                type="default" 
                size="sm" 
                position="inline" 
                :overlay="false" 
                :show-text="false"
              />
            </div>
          </div>
        </div>

        <!-- Steps List -->
        <div class="steps-list space-y-2">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="step-item flex items-center space-x-3 p-2 rounded transition-all duration-300"
            :class="{
              'bg-green-50 border border-green-200': step.completed,
              'bg-blue-50 border border-blue-200': step.id === currentStep.id,
              'opacity-50': !step.completed && step.id !== currentStep.id
            }"
          >
            <!-- Step Status Icon -->
            <div class="step-status">
              <Icon 
                v-if="step.completed"
                name="check-circle"
                class="w-5 h-5 text-green-600"
              />
              <div 
                v-else-if="step.id === currentStep.id"
                class="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
              ></div>
              <div 
                v-else
                class="w-5 h-5 rounded-full border-2 border-gray-300"
              ></div>
            </div>

            <!-- Step Info -->
            <div class="step-info flex-1">
              <div class="text-sm font-medium text-wh-dark-wood">
                {{ step.title }}
              </div>
              <div class="text-xs text-wh-wood-brown">
                {{ step.description }}
              </div>
            </div>

            <!-- Step Duration -->
            <div class="step-duration text-xs text-wh-wood-brown">
              {{ step.duration }}ms
            </div>
          </div>
        </div>

        <!-- Fun Facts -->
        <div v-if="showFunFacts" class="fun-facts mt-6 p-4 bg-wh-aged-paper/50 rounded border border-wh-wood-brown/20">
          <h4 class="text-sm font-wh-heading font-semibold text-wh-dark-wood mb-2">
            {{ $t('loading.didYouKnow') }}
          </h4>
          <p class="text-xs text-wh-wood-brown">
            {{ currentFunFact }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LoadingStep {
  id: string
  title: string
  description: string
  icon: string
  duration: number
  completed: boolean
}

interface Props {
  visible?: boolean
  showFunFacts?: boolean
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  showFunFacts: true,
  autoStart: true
})

const emit = defineEmits<{
  complete: []
  stepComplete: [stepId: string]
}>()

// Loading steps configuration
const steps = ref<LoadingStep[]>([
  {
    id: 'hearth',
    title: 'Rozpalanie ogniska',
    description: 'Przygotowywanie ciepłej atmosfery karczmy...',
    icon: 'flame',
    duration: 1500,
    completed: false
  },
  {
    id: 'tavern',
    title: 'Przygotowywanie karczmy',
    description: 'Ustawianie stołów i krzeseł...',
    icon: 'home',
    duration: 2000,
    completed: false
  },
  {
    id: 'ai',
    title: 'Budzenie AI NPCs',
    description: 'Inicjalizacja 17 inteligentnych postaci...',
    icon: 'users',
    duration: 2500,
    completed: false
  },
  {
    id: 'magic',
    title: 'Inicjalizacja magii',
    description: 'Łączenie z siłami Warhammer Fantasy...',
    icon: 'sparkles',
    duration: 1800,
    completed: false
  },
  {
    id: 'content',
    title: 'Ładowanie treści',
    description: 'Przygotowywanie historii i zadań...',
    icon: 'scroll',
    duration: 1200,
    completed: false
  }
])

// State
const currentStepIndex = ref(0)
const progress = ref(0)
const isLoading = ref(false)

// Fun facts for entertainment
const funFacts = [
  'W Warhammer Fantasy istnieje ponad 15 różnych ras i frakcji.',
  'Karczmy w Imperium często służą jako miejsca spotkań szpiegów.',
  'Krasnoludy potrafią wyczuć jakość piwa po samym zapachu.',
  'Wysokie Elfy żyją średnio 1000 lat.',
  'Skaveni budują swoje miasta pod ziemią.',
  'Chaos Warriors nigdy nie zdejmują swoich zbroi.',
  'Orki wierzą, że czerwone rzeczy jeżdżą szybciej.',
  'Wampiry mogą przybierać postać nietoperzy lub wilków.'
]

// Computed
const currentStep = computed(() => steps.value[currentStepIndex.value] || steps.value[0])
const currentFunFact = computed(() => {
  const index = Math.floor(Date.now() / 3000) % funFacts.length
  return funFacts[index]
})

// Methods
const startLoading = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  progress.value = 0

  for (let i = 0; i < steps.value.length; i++) {
    currentStepIndex.value = i
    
    // Animate progress for current step
    const step = steps.value[i]
    const startProgress = (i / steps.value.length) * 100
    const endProgress = ((i + 1) / steps.value.length) * 100
    
    // Smooth progress animation
    const duration = step.duration
    const startTime = Date.now()
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      
      progress.value = startProgress + (endProgress - startProgress) * progressRatio
      
      if (progressRatio < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        // Mark step as completed
        step.completed = true
        emit('stepComplete', step.id)
        
        // Continue to next step or complete
        if (i === steps.value.length - 1) {
          setTimeout(() => {
            emit('complete')
            isLoading.value = false
          }, 500)
        }
      }
    }
    
    animateProgress()
    
    // Wait for step duration
    await new Promise(resolve => setTimeout(resolve, duration))
  }
}

const resetLoader = () => {
  currentStepIndex.value = 0
  progress.value = 0
  isLoading.value = false
  steps.value.forEach(step => step.completed = false)
}

// Emergency timeout to prevent infinite loading
let emergencyTimeout: NodeJS.Timeout | null = null

// Lifecycle
onMounted(() => {
  if (props.autoStart) {
    startLoading()
  }

  // Emergency timeout - force complete after 15 seconds
  emergencyTimeout = setTimeout(() => {
    console.warn('🚨 Emergency timeout - forcing loader completion')
    emit('complete')
    isLoading.value = false
  }, 15000)
})

onUnmounted(() => {
  if (emergencyTimeout) {
    clearTimeout(emergencyTimeout)
  }
})

// Expose methods
defineExpose({
  startLoading,
  resetLoader
})
</script>

<style scoped>
.warhammer-multi-step-loader {
  font-family: var(--wh-font-body);
  backdrop-filter: blur(10px);
}

.tavern-sign {
  transform: perspective(1000px) rotateX(5deg);
}

/* Progress bar shine animation */
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shine {
  animation: shine 2s ease-in-out infinite;
}

/* Fire flicker animation */
@keyframes fire-flicker {
  0%, 100% { 
    transform: scaleY(1) scaleX(1);
    opacity: 0.8;
  }
  25% { 
    transform: scaleY(1.1) scaleX(0.9);
    opacity: 1;
  }
  50% { 
    transform: scaleY(0.9) scaleX(1.1);
    opacity: 0.9;
  }
  75% { 
    transform: scaleY(1.05) scaleX(0.95);
    opacity: 0.95;
  }
}

.animate-fire-flicker {
  animation: fire-flicker 1.5s ease-in-out infinite;
}

/* Sparkle animation */
@keyframes sparkle {
  0%, 100% { 
    opacity: 0;
    transform: scale(0);
  }
  50% { 
    opacity: 1;
    transform: scale(1);
  }
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-shine,
  .animate-fire-flicker,
  .animate-sparkle,
  .animate-ping,
  .animate-spin,
  .animate-bounce,
  .animate-pulse {
    animation: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .steps-container {
    border-width: 2px;
  }
  
  .progress-bar {
    border-width: 2px;
  }
  
  .step-item {
    border-width: 2px;
  }
}
</style>