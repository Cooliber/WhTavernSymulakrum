<template>
  <div
    class="min-h-screen bg-background text-foreground tavern-atmosphere"
    :class="{ 'reduce-motion': prefersReducedMotion, 'high-contrast': highContrastMode }"
  >
    <!-- Skip to main content link for screen readers -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium"
      @click="skipToMain"
    >
      Skip to main content
    </a>

    <!-- Enhanced Warhammer Background -->
    <WarhammerBackground
      :faction="currentFaction"
      :time-of-day="currentTimeOfDay"
      :weather="currentWeather"
      :magical-effect="currentMagicalEffect"
      :intensity="backgroundIntensity"
      :show-meteors="showMeteors"
      @time-change="handleTimeChange"
    />

    <!-- Tavern Atmosphere Background -->
    <TavernAtmosphere
      :intensity="atmosphereIntensity"
      :show-candle-effects="!prefersReducedMotion"
      :show-ember-effects="!prefersReducedMotion"
      :show-shadow-effects="!prefersReducedMotion"
      :show-fog-effects="true"
      :show-fireplace-glow="showMagicParticles"
    />

    <!-- Aurora Background Effect (Reduced opacity for darker theme) -->
    <div
      class="fixed inset-0 z-0"
      :class="{ 'opacity-5': prefersReducedMotion, 'opacity-10': !prefersReducedMotion }"
      role="presentation"
      aria-hidden="true"
    >
      <AuroraBackground
        :colors="['#3c2415', '#5d3a1a', '#8b5a2b', '#a0522d']"
        :aurora-width="400"
        :aurora-height="300"
        class="w-full h-full opacity-20"
        :class="{ 'animate-none': prefersReducedMotion }"
      />
    </div>

    <!-- Particle Effects -->
    <div
      v-if="showMagicParticles && !prefersReducedMotion"
      class="fixed inset-0 z-10 pointer-events-none"
      role="presentation"
      aria-hidden="true"
    >
      <ParticlesBg
        :particle-count="30"
        :particle-color="'#ffd700'"
        :particle-size="2"
        :animation-speed="0.5"
        class="magic-particles"
      />
    </div>
    
    <!-- Main Content -->
    <div class="relative z-20 flex flex-col min-h-screen">
      <!-- Header -->
      <header
        class="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div class="container mx-auto px-4">
          <div class="flex h-16 items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center space-x-4">
              <NuxtLink
                to="/"
                class="flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md p-1"
                :aria-label="'Go to Warhammer Tavern homepage'"
              >
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 flex items-center justify-center"
                  role="img"
                  aria-label="Warhammer Tavern logo"
                >
                  <Icon name="crown" class="w-6 h-6 text-yellow-900" aria-hidden="true" />
                </div>
                <div>
                  <HyperText
                    text="Warhammer Tavern"
                    class="text-xl font-medieval text-foreground"
                    :animation-duration="prefersReducedMotion ? 0 : 2000"
                  />
                  <p class="text-xs text-muted-foreground">Simulator v3</p>
                </div>
              </NuxtLink>
            </div>

            <!-- Mobile Menu Button -->
            <button
              v-if="!isDesktop"
              class="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              :aria-label="mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
              :aria-expanded="mobileMenuOpen"
              @click="toggleMobileMenu"
            >
              <Icon :name="mobileMenuOpen ? 'x' : 'menu'" class="w-6 h-6" aria-hidden="true" />
            </button>

            <!-- Desktop Navigation -->
            <nav
              class="hidden md:flex items-center space-x-6"
              role="navigation"
              aria-label="Main navigation"
            >
              <NuxtLink
                v-for="item in navigationItems"
                :key="item.id"
                :to="item.path"
                class="text-sm font-medieval text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
                :class="{ 'text-foreground font-semibold': route.path === item.path }"
                :aria-current="route.path === item.path ? 'page' : undefined"
              >
                {{ item.label }}
              </NuxtLink>
            </nav>

            <!-- Accessibility Controls -->
            <div class="flex items-center space-x-2">
              <!-- AI Status Indicator -->
              <AIStatusIndicator compact />

              <!-- Language Switcher -->
              <LanguageSwitcher />

              <!-- High Contrast Toggle -->
              <button
                class="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                :aria-label="highContrastMode ? t('accessibility.disableHighContrast') : t('accessibility.enableHighContrast')"
                :aria-pressed="highContrastMode"
                @click="toggleHighContrast"
              >
                <Icon name="eye" class="w-4 h-4" aria-hidden="true" />
              </button>

              <!-- Reduced Motion Toggle -->
              <button
                class="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                :aria-label="prefersReducedMotion ? t('accessibility.enableAnimations') : t('accessibility.reduceAnimations')"
                :aria-pressed="prefersReducedMotion"
                @click="toggleReducedMotion"
              >
                <Icon name="zap" class="w-4 h-4" aria-hidden="true" />
              </button>

              <!-- Magic Particles Toggle -->
              <ShimmerButton
                class="faction-empire text-sm font-medieval focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                shimmer-color="rgb(255, 215, 0)"
                :aria-label="showMagicParticles ? t('accessibility.disableMagic') : t('accessibility.enableMagic')"
                :aria-pressed="showMagicParticles"
                @click="toggleMagicParticles"
              >
                {{ showMagicParticles ? t('accessibility.disableMagic') : t('accessibility.enableMagic') }}
              </ShimmerButton>
            </div>
          </div>

          <!-- Mobile Navigation Menu -->
          <div
            v-if="mobileMenuOpen && !isDesktop"
            class="md:hidden border-t border-border/40 py-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div class="flex flex-col space-y-2">
              <NuxtLink
                v-for="item in navigationItems"
                :key="item.id"
                :to="item.path"
                class="text-sm font-medieval text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md px-3 py-2"
                :class="{ 'text-foreground font-semibold bg-accent': route.path === item.path }"
                :aria-current="route.path === item.path ? 'page' : undefined"
                @click="closeMobileMenu"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content Area -->
      <main
        id="main-content"
        class="flex-1 container mx-auto px-4 py-8"
        role="main"
        tabindex="-1"
      >
        <div
          class="animate-medieval-entrance"
          :class="{ 'animate-none': prefersReducedMotion }"
        >
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer
        class="border-t border-border/40 bg-background/95 backdrop-blur"
        role="contentinfo"
      >
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div class="text-center md:text-left">
              <p class="text-sm text-muted-foreground">
                © 2025 Warhammer Tavern Simulator v3. Powered by
                <span class="text-foreground font-medieval">Inspira UI</span>
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div
                  class="w-2 h-2 rounded-full bg-green-500"
                  :class="{ 'animate-pulse': !prefersReducedMotion }"
                  role="status"
                  :aria-label="connectionStatus"
                ></div>
                <span class="text-xs text-muted-foreground">{{ connectionStatus }}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    
    <!-- Floating Navigation Dock -->
    <nav
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      role="navigation"
      aria-label="Quick navigation dock"
    >
      <Dock
        class="inspira-dock-tavern"
        :items="dockItems"
        :dock-size="60"
        :magnification="prefersReducedMotion ? 1 : 1.5"
        role="menubar"
      >
        <template #item="{ item }">
          <NuxtLink
            :to="item.path"
            class="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            :class="{
              'bg-primary/20': route.path === item.path,
              'transition-none': prefersReducedMotion
            }"
            role="menuitem"
            :aria-label="`Navigate to ${item.label}`"
            :aria-current="route.path === item.path ? 'page' : undefined"
          >
            <Icon
              :name="item.icon"
              class="w-6 h-6 text-foreground group-hover:text-primary transition-colors"
              :class="{ 'transition-none': prefersReducedMotion }"
              aria-hidden="true"
            />
            <span class="text-xs font-medieval text-muted-foreground">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </Dock>
    </nav>

    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from '#app';

// Composables
const { t } = useI18n()

// Get current route
const route = useRoute()

// Warhammer Background state
const currentFaction = ref<'empire' | 'chaos' | 'dwarfs' | 'elves' | 'orcs' | 'undead' | 'neutral'>('neutral')
const currentTimeOfDay = ref<'dawn' | 'day' | 'dusk' | 'night'>('day')
const currentWeather = ref<'clear' | 'rain' | 'snow' | 'fog' | 'storm'>('clear')
const currentMagicalEffect = ref<'chaos' | 'divine' | 'waaagh' | 'necromancy' | null>(null)
const backgroundIntensity = ref<'low' | 'medium' | 'high'>('medium')
const showMeteors = ref(false)

// Navigation items
const navigationItems = computed(() => [
  { id: 'home', label: t('navigation.tavern'), path: '/' },
  { id: 'characters', label: t('navigation.characters'), path: '/characters' },
  { id: 'quests', label: t('navigation.quests'), path: '/quests' },
  { id: 'inventory', label: t('navigation.inventory'), path: '/inventory' },
  { id: 'settings', label: t('navigation.settings'), path: '/settings' }
])

// Dock items
const dockItems = computed(() => [
  { id: 'tavern', label: t('navigation.tavern'), icon: 'home', path: '/' },
  { id: 'characters', label: t('navigation.characters'), icon: 'users', path: '/characters' },
  { id: 'conversations', label: t('navigation.conversations'), icon: 'message-circle', path: '/conversations' },
  { id: 'quests', label: t('navigation.quests'), icon: 'scroll', path: '/quests' },
  { id: 'inventory', label: t('navigation.inventory'), icon: 'package', path: '/inventory' },
  { id: 'map', label: t('navigation.map'), icon: 'map', path: '/map' },
  { id: 'gm', label: t('navigation.gmDashboard'), icon: 'settings', path: '/gm-dashboard' }
])

// Reactive state
const showMagicParticles = ref(false)
const connectionStatus = ref('Connected to Tavern')
const mobileMenuOpen = ref(false)
const windowWidth = ref(0)

// Accessibility state
const prefersReducedMotion = ref(false)
const highContrastMode = ref(false)

// Atmosphere settings
const atmosphereIntensity = ref<'low' | 'medium' | 'high'>('medium')

// Computed properties
const isDesktop = computed(() => windowWidth.value >= 768)

// Methods
const toggleMagicParticles = () => {
  showMagicParticles.value = !showMagicParticles.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleReducedMotion = () => {
  prefersReducedMotion.value = !prefersReducedMotion.value
  // Store preference in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('prefers-reduced-motion', prefersReducedMotion.value.toString())
  }
}

const toggleHighContrast = () => {
  highContrastMode.value = !highContrastMode.value
  // Store preference in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('high-contrast-mode', highContrastMode.value.toString())
  }
}

const skipToMain = () => {
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.focus()
  }
}

// Handle time changes from WarhammerBackground
const handleTimeChange = (timeOfDay: string) => {
  currentTimeOfDay.value = timeOfDay as 'dawn' | 'day' | 'dusk' | 'night'

  // Adjust magical effects based on time
  if (timeOfDay === 'night') {
    currentMagicalEffect.value = Math.random() > 0.7 ? 'chaos' : null
    showMeteors.value = Math.random() > 0.8
  } else {
    currentMagicalEffect.value = null
    showMeteors.value = false
  }
}

// Window resize handler
const handleResize = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}

// Detect user preferences
const detectUserPreferences = () => {
  if (typeof window !== 'undefined') {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })

    // Load saved preferences
    const savedReducedMotion = localStorage.getItem('prefers-reduced-motion')
    if (savedReducedMotion !== null) {
      prefersReducedMotion.value = savedReducedMotion === 'true'
    }

    const savedHighContrast = localStorage.getItem('high-contrast-mode')
    if (savedHighContrast !== null) {
      highContrastMode.value = savedHighContrast === 'true'
    }

    // Set initial window width
    windowWidth.value = window.innerWidth
  }
}

// Lifecycle
onMounted(() => {
  // Initialize connection status
  connectionStatus.value = 'Connected to Tavern'

  // Detect user preferences
  detectUserPreferences()

  // Add resize listener
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }

  // Add some ambient magic particles on load (only if motion is not reduced)
  setTimeout(() => {
    if (!prefersReducedMotion.value) {
      showMagicParticles.value = true
    }
  }, 2000)
})

onUnmounted(() => {
  // Clean up resize listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
/* Component-specific styles */
.tavern-atmosphere {
  background-attachment: fixed;
}

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* High contrast mode */
.high-contrast {
  --background: #000000;
  --foreground: #ffffff;
  --muted: #666666;
  --muted-foreground: #cccccc;
  --border: #ffffff;
  --primary: #ffff00;
  --primary-foreground: #000000;
  --accent: #ffffff;
  --accent-foreground: #000000;
}

.high-contrast .bg-gradient-to-r {
  background: var(--primary) !important;
}

.high-contrast .text-muted-foreground {
  color: var(--muted-foreground) !important;
}

/* Reduced motion preferences */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

.reduce-motion .animate-pulse {
  animation: none !important;
}

.reduce-motion .animate-medieval-entrance {
  animation: none !important;
}

/* Focus improvements */
.focus\:ring-2:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--ring-offset-color, transparent), 0 0 0 calc(2px + var(--ring-offset-width, 0px)) var(--ring-color, #3b82f6);
}

.focus\:ring-offset-2:focus {
  --ring-offset-width: 2px;
}

.focus\:ring-primary:focus {
  --ring-color: var(--primary);
}

.focus\:ring-offset-background:focus {
  --ring-offset-color: var(--background);
}

/* Enhanced button states */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Improved touch targets for mobile */
@media (max-width: 768px) {
  .inspira-dock-tavern {
    transform: scale(0.9);
  }

  /* Ensure minimum touch target size */
  button,
  a,
  [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }

  /* Improve spacing for touch */
  .space-x-2 > * + * {
    margin-left: 0.75rem;
  }

  .space-y-2 > * + * {
    margin-top: 0.75rem;
  }
}

/* Print styles */
@media print {
  .fixed,
  .sticky,
  .aurora-background,
  .magic-particles,
  .inspira-dock-tavern {
    display: none !important;
  }

  .tavern-atmosphere {
    background: white !important;
    color: black !important;
  }
}

/* Animation classes */
@keyframes medieval-entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-medieval-entrance {
  animation: medieval-entrance 0.8s ease-out;
}

/* Ensure proper contrast ratios */
.text-muted-foreground {
  color: #6b7280;
}

@media (prefers-contrast: high) {
  .text-muted-foreground {
    color: #374151;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .text-muted-foreground {
    color: #9ca3af;
  }
}

@media (prefers-color-scheme: dark) and (prefers-contrast: high) {
  .text-muted-foreground {
    color: #d1d5db;
  }
}
</style>