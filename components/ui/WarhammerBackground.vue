<template>
  <div class="warhammer-background fixed inset-0 -z-10 overflow-hidden">
    <!-- Base Aurora Background -->
    <AuroraBackground 
      :colors="auroraColors"
      class="opacity-70"
    />

    <!-- Particles Layer -->
    <ParticlesBg 
      :particle-count="particleCount"
      :particle-color="particleColor"
      :particle-size="particleSize"
      :animation-speed="animationSpeed"
      class="opacity-50"
    />

    <!-- Meteors for dramatic effect -->
    <Meteors 
      v-if="showMeteors"
      :number="meteorCount"
      class="opacity-60"
    />

    <!-- Faction-specific overlay -->
    <div 
      class="faction-overlay absolute inset-0 transition-all duration-1000"
      :class="factionOverlayClass"
    ></div>

    <!-- Time of day overlay -->
    <div 
      class="time-overlay absolute inset-0 transition-all duration-2000"
      :class="timeOverlayClass"
    ></div>

    <!-- Weather effects -->
    <div v-if="weather !== 'clear'" class="weather-effects absolute inset-0">
      <!-- Rain effect -->
      <div v-if="weather === 'rain'" class="rain-container">
        <div 
          v-for="i in rainDrops" 
          :key="`rain-${i}`"
          class="rain-drop"
          :style="getRainDropStyle(i)"
        ></div>
      </div>

      <!-- Snow effect -->
      <div v-if="weather === 'snow'" class="snow-container">
        <div 
          v-for="i in snowFlakes" 
          :key="`snow-${i}`"
          class="snow-flake"
          :style="getSnowFlakeStyle(i)"
        >❄</div>
      </div>

      <!-- Fog effect -->
      <div v-if="weather === 'fog'" class="fog-container">
        <div 
          v-for="i in 3" 
          :key="`fog-${i}`"
          class="fog-layer"
          :style="getFogLayerStyle(i)"
        ></div>
      </div>
    </div>

    <!-- Magical effects for special events -->
    <div v-if="magicalEffect" class="magical-effects absolute inset-0">
      <!-- Chaos corruption -->
      <div v-if="magicalEffect === 'chaos'" class="chaos-effect">
        <div class="chaos-tendrils">
          <div 
            v-for="i in 8" 
            :key="`chaos-${i}`"
            class="chaos-tendril"
            :style="getChaosTendrilStyle(i)"
          ></div>
        </div>
      </div>

      <!-- Divine blessing -->
      <div v-if="magicalEffect === 'divine'" class="divine-effect">
        <div class="divine-rays">
          <div 
            v-for="i in 6" 
            :key="`divine-${i}`"
            class="divine-ray"
            :style="getDivineRayStyle(i)"
          ></div>
        </div>
      </div>

      <!-- Waaagh energy -->
      <div v-if="magicalEffect === 'waaagh'" class="waaagh-effect">
        <div class="waaagh-energy animate-pulse">
          <div class="energy-burst"></div>
        </div>
      </div>
    </div>

    <!-- Ambient light sources -->
    <div class="ambient-lights absolute inset-0">
      <!-- Tavern windows -->
      <div 
        v-for="light in ambientLights" 
        :key="light.id"
        class="light-source absolute"
        :style="getLightSourceStyle(light)"
      >
        <div class="light-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AmbientLight {
  id: string
  x: number // percentage
  y: number // percentage
  color: string
  intensity: number
  flicker: boolean
}

interface Props {
  faction?: 'empire' | 'chaos' | 'dwarfs' | 'elves' | 'orcs' | 'undead' | 'neutral'
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night'
  weather?: 'clear' | 'rain' | 'snow' | 'fog' | 'storm'
  magicalEffect?: 'chaos' | 'divine' | 'waaagh' | 'necromancy' | null
  intensity?: 'low' | 'medium' | 'high'
  showMeteors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  faction: 'neutral',
  timeOfDay: 'day',
  weather: 'clear',
  magicalEffect: null,
  intensity: 'medium',
  showMeteors: false
})

// Computed properties for dynamic effects
const auroraColors = computed(() => {
  const factionColors = {
    empire: ['#DAA520', '#FFD700', '#B8860B', '#CD853F'],
    chaos: ['#8B0000', '#DC143C', '#FF4500', '#FF6347'],
    dwarfs: ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
    elves: ['#4169E1', '#6495ED', '#87CEEB', '#B0E0E6'],
    orcs: ['#228B22', '#32CD32', '#7CFC00', '#ADFF2F'],
    undead: ['#2F4F4F', '#696969', '#708090', '#778899'],
    neutral: ['#8B4513', '#DAA520', '#CD853F', '#A0522D']
  }
  return factionColors[props.faction]
})

const particleCount = computed(() => {
  const intensityMap = { low: 30, medium: 50, high: 80 }
  return intensityMap[props.intensity]
})

const particleColor = computed(() => {
  return auroraColors.value[0]
})

const particleSize = computed(() => {
  const intensityMap = { low: 1, medium: 2, high: 3 }
  return intensityMap[props.intensity]
})

const animationSpeed = computed(() => {
  const intensityMap = { low: 0.5, medium: 1, high: 1.5 }
  return intensityMap[props.intensity]
})

const meteorCount = computed(() => {
  const intensityMap = { low: 3, medium: 5, high: 8 }
  return intensityMap[props.intensity]
})

const factionOverlayClass = computed(() => {
  const overlays = {
    empire: 'bg-gradient-to-br from-yellow-900/10 via-transparent to-amber-900/10',
    chaos: 'bg-gradient-to-br from-red-900/20 via-transparent to-orange-900/15',
    dwarfs: 'bg-gradient-to-br from-amber-900/15 via-transparent to-yellow-900/10',
    elves: 'bg-gradient-to-br from-blue-900/10 via-transparent to-indigo-900/10',
    orcs: 'bg-gradient-to-br from-green-900/15 via-transparent to-lime-900/10',
    undead: 'bg-gradient-to-br from-gray-900/20 via-transparent to-slate-900/15',
    neutral: 'bg-gradient-to-br from-amber-900/5 via-transparent to-yellow-900/5'
  }
  return overlays[props.faction]
})

const timeOverlayClass = computed(() => {
  const overlays = {
    dawn: 'bg-gradient-to-t from-orange-900/20 via-pink-900/10 to-yellow-900/5',
    day: 'bg-gradient-to-t from-blue-900/5 via-transparent to-yellow-900/5',
    dusk: 'bg-gradient-to-t from-purple-900/15 via-orange-900/10 to-red-900/10',
    night: 'bg-gradient-to-t from-indigo-900/30 via-blue-900/20 to-purple-900/15'
  }
  return overlays[props.timeOfDay]
})

// Weather effects
const rainDrops = computed(() => props.weather === 'rain' ? 100 : 0)
const snowFlakes = computed(() => props.weather === 'snow' ? 50 : 0)

// Ambient lighting
const ambientLights = ref<AmbientLight[]>([
  { id: 'tavern-1', x: 20, y: 30, color: '#FFD700', intensity: 0.8, flicker: true },
  { id: 'tavern-2', x: 80, y: 25, color: '#FF6347', intensity: 0.6, flicker: true },
  { id: 'street-1', x: 10, y: 70, color: '#DAA520', intensity: 0.4, flicker: false },
  { id: 'street-2', x: 90, y: 75, color: '#DAA520', intensity: 0.4, flicker: false }
])

// Methods for dynamic styling
const getRainDropStyle = (index: number) => {
  const left = Math.random() * 100
  const animationDelay = Math.random() * 2
  const animationDuration = 0.5 + Math.random() * 0.5
  
  return {
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`
  }
}

const getSnowFlakeStyle = (index: number) => {
  const left = Math.random() * 100
  const animationDelay = Math.random() * 5
  const animationDuration = 3 + Math.random() * 4
  const fontSize = 0.8 + Math.random() * 0.4
  
  return {
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
    fontSize: `${fontSize}rem`
  }
}

const getFogLayerStyle = (index: number) => {
  const opacity = 0.1 + (index * 0.05)
  const animationDelay = index * 2
  
  return {
    opacity,
    animationDelay: `${animationDelay}s`
  }
}

const getChaosTendrilStyle = (index: number) => {
  const rotation = (index * 45)
  const animationDelay = index * 0.3
  
  return {
    transform: `rotate(${rotation}deg)`,
    animationDelay: `${animationDelay}s`
  }
}

const getDivineRayStyle = (index: number) => {
  const rotation = (index * 60)
  const animationDelay = index * 0.5
  
  return {
    transform: `rotate(${rotation}deg)`,
    animationDelay: `${animationDelay}s`
  }
}

const getLightSourceStyle = (light: AmbientLight) => {
  return {
    left: `${light.x}%`,
    top: `${light.y}%`,
    '--light-color': light.color,
    '--light-intensity': light.intensity
  }
}

// Reactive updates based on time
const updateTimeEffects = () => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 8) {
    // Dawn
    emit('timeChange', 'dawn')
  } else if (hour >= 8 && hour < 18) {
    // Day
    emit('timeChange', 'day')
  } else if (hour >= 18 && hour < 21) {
    // Dusk
    emit('timeChange', 'dusk')
  } else {
    // Night
    emit('timeChange', 'night')
  }
}

const emit = defineEmits<{
  timeChange: [timeOfDay: string]
}>()

// Lifecycle
onMounted(() => {
  // Update time effects every minute
  const timeInterval = setInterval(updateTimeEffects, 60000)
  updateTimeEffects() // Initial call
  
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})
</script>

<style scoped>
.warhammer-background {
  will-change: transform;
}

/* Rain effects */
.rain-drop {
  @apply absolute w-0.5 h-8 bg-blue-400 opacity-60;
  top: -10%;
  animation: rain-fall linear infinite;
}

@keyframes rain-fall {
  to {
    transform: translateY(110vh);
  }
}

/* Snow effects */
.snow-flake {
  @apply absolute text-white opacity-80;
  top: -10%;
  animation: snow-fall linear infinite;
}

@keyframes snow-fall {
  to {
    transform: translateY(110vh) rotate(360deg);
  }
}

/* Fog effects */
.fog-layer {
  @apply absolute inset-0 bg-gray-300 rounded-full;
  filter: blur(40px);
  animation: fog-drift 20s ease-in-out infinite alternate;
}

@keyframes fog-drift {
  0% { transform: translateX(-10%) scale(1); }
  100% { transform: translateX(10%) scale(1.1); }
}

/* Chaos effects */
.chaos-tendril {
  @apply absolute w-1 h-full bg-gradient-to-t from-red-600 via-orange-500 to-transparent opacity-30;
  left: 50%;
  transform-origin: bottom;
  animation: chaos-writhe 4s ease-in-out infinite;
}

@keyframes chaos-writhe {
  0%, 100% { transform: rotate(0deg) scaleY(1); }
  25% { transform: rotate(5deg) scaleY(1.1); }
  50% { transform: rotate(-3deg) scaleY(0.9); }
  75% { transform: rotate(7deg) scaleY(1.05); }
}

/* Divine effects */
.divine-ray {
  @apply absolute w-0.5 h-full bg-gradient-to-t from-transparent via-yellow-300 to-transparent opacity-40;
  left: 50%;
  transform-origin: bottom;
  animation: divine-shine 6s ease-in-out infinite;
}

@keyframes divine-shine {
  0%, 100% { opacity: 0.2; transform: scaleY(0.8); }
  50% { opacity: 0.6; transform: scaleY(1.2); }
}

/* Waaagh effects */
.energy-burst {
  @apply absolute inset-0;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(163, 230, 53, 0.1) 50%, transparent 100%);
  animation: waaagh-pulse 3s ease-in-out infinite;
}

@keyframes waaagh-pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* Ambient lights */
.light-source {
  @apply w-8 h-8;
}

.light-glow {
  @apply absolute inset-0 rounded-full;
  background: radial-gradient(circle, var(--light-color) 0%, transparent 70%);
  opacity: var(--light-intensity);
  animation: light-flicker 3s ease-in-out infinite;
}

@keyframes light-flicker {
  0%, 100% { opacity: var(--light-intensity); }
  50% { opacity: calc(var(--light-intensity) * 0.7); }
}

/* Performance optimizations */
.rain-drop,
.snow-flake,
.fog-layer,
.chaos-tendril,
.divine-ray {
  will-change: transform;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .rain-drop,
  .snow-flake,
  .fog-layer,
  .chaos-tendril,
  .divine-ray,
  .energy-burst,
  .light-glow {
    animation: none !important;
  }
}

/* Performance mode for low-end devices */
@media (max-width: 768px) {
  .rain-drop:nth-child(n+51),
  .snow-flake:nth-child(n+26) {
    display: none;
  }
}
</style>