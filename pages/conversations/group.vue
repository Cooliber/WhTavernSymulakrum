<template>
  <div class="group-conversation-page space-y-8">
    <!-- Meteors background -->
    <Meteors :meteor-count="5" :meteor-speed="0.6" />
    
    <!-- Page header -->
    <section class="text-center space-y-6">
      <Spotlight 
        spotlight-color="rgba(255, 215, 0, 0.4)"
        :spotlight-size="400"
        class="inline-block"
      >
        <SparklesText
          text="Group Conversations"
          class="text-5xl md:text-7xl font-medieval text-foreground"
          :sparkles-count="20"
        />
      </Spotlight>
      
      <Text3D 
        text="Multi-Agent AI Conversations"
        class="text-xl md:text-2xl font-fantasy text-primary"
        :depth="4"
      />
      
      <p class="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        Experience dynamic conversations with multiple AI-powered NPCs simultaneously. 
        Watch as characters interact with each other and respond to your messages in real-time.
      </p>
    </section>

    <!-- Conversation Interface -->
    <section class="max-w-7xl mx-auto">
      <Card3D class="inspira-card-tavern p-6" :rotation-intensity="2">
        <div class="space-y-6">
          <!-- Conversation Header -->
          <div class="flex items-center justify-between border-b border-border/40 pb-4">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <Icon name="users" class="w-8 h-8 text-primary" />
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h2 class="text-2xl font-medieval text-foreground">Tavern Group Chat</h2>
                <p class="text-sm text-muted-foreground">
                  {{ activeParticipants }} participants • {{ totalMessages }} messages
                </p>
              </div>
            </div>
            
            <!-- Conversation Controls -->
            <div class="flex items-center space-x-3">
              <ShimmerButton 
                class="text-sm font-medieval"
                shimmer-color="rgb(255, 215, 0)"
                @click="startNewConversation"
              >
                <Icon name="plus" class="w-4 h-4 mr-2" />
                New Topic
              </ShimmerButton>
              
              <RippleButton 
                class="text-sm font-medieval faction-empire"
                ripple-color="rgb(255, 215, 0)"
                @click="saveConversation"
              >
                <Icon name="save" class="w-4 h-4 mr-2" />
                Save
              </RippleButton>
            </div>
          </div>
          
          <!-- Multi-Agent Chat Component -->
          <div class="min-h-[600px]">
            <MultiAgentChat 
              ref="chatComponent"
              @message-sent="handleMessageSent"
              @agent-added="handleAgentAdded"
              @agent-removed="handleAgentRemoved"
            />
          </div>
        </div>
      </Card3D>
    </section>

    <!-- Conversation Features -->
    <section class="space-y-6">
      <HyperText 
        text="Group Conversation Features"
        class="text-3xl font-medieval text-foreground text-center"
        :animation-duration="1500"
      />
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BorderBeam 
          v-for="feature in conversationFeatures" 
          :key="feature.id"
          class="feature-card bg-card/60 backdrop-blur-md rounded-xl p-6"
          :border-width="2"
          color-from="#ffd700"
          color-to="#b8860b"
        >
          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Icon :name="feature.icon" class="w-8 h-8 text-primary" />
            </div>
            <h3 class="text-lg font-medieval text-foreground">{{ feature.title }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ feature.description }}</p>
          </div>
        </BorderBeam>
      </div>
    </section>

    <!-- Conversation Statistics -->
    <section class="max-w-4xl mx-auto">
      <Card3D class="inspira-card-tavern p-6" :rotation-intensity="3">
        <div class="space-y-6">
          <h3 class="text-2xl font-medieval text-foreground text-center">Conversation Statistics</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center space-y-3">
              <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <Icon name="message-square" class="w-8 h-8 text-blue-500" />
              </div>
              <NumberTicker 
                :value="conversationStats.totalMessages"
                class="text-3xl font-medieval text-blue-500"
              />
              <p class="text-sm text-muted-foreground">Total Messages</p>
            </div>
            
            <div class="text-center space-y-3">
              <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center">
                <Icon name="users" class="w-8 h-8 text-green-500" />
              </div>
              <NumberTicker 
                :value="conversationStats.activeAgents"
                class="text-3xl font-medieval text-green-500"
              />
              <p class="text-sm text-muted-foreground">Active Agents</p>
            </div>
            
            <div class="text-center space-y-3">
              <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                <Icon name="clock" class="w-8 h-8 text-purple-500" />
              </div>
              <NumberTicker 
                :value="conversationStats.sessionDuration"
                class="text-3xl font-medieval text-purple-500"
              />
              <p class="text-sm text-muted-foreground">Minutes Active</p>
            </div>
          </div>
        </div>
      </Card3D>
    </section>
  </div>
</template>

<script setup lang="ts">
// Composables
const { t } = useI18n()
const { 
  startPlayerConversation, 
  currentPlayerConversation,
  getActiveConversations 
} = useEnhancedAINPCSystem()

// Page metadata
useHead({
  title: 'Group Conversations - Warhammer Tavern Simulator v3',
  meta: [
    { name: 'description', content: 'Experience dynamic multi-agent AI conversations in the Warhammer Fantasy tavern.' }
  ]
})

// Reactive state
const chatComponent = ref()
const sessionStartTime = ref(new Date())
const messageCount = ref(0)
const agentCount = ref(1) // Start with 1 default agent

// Computed properties
const activeParticipants = computed(() => agentCount.value + 1) // +1 for player
const totalMessages = computed(() => messageCount.value)

const conversationStats = computed(() => ({
  totalMessages: messageCount.value,
  activeAgents: agentCount.value,
  sessionDuration: Math.floor((Date.now() - sessionStartTime.value.getTime()) / 60000)
}))

// Conversation features
const conversationFeatures = ref([
  {
    id: 1,
    title: 'Multi-Agent AI',
    description: 'Multiple AI characters can participate in the same conversation, creating dynamic interactions.',
    icon: 'users'
  },
  {
    id: 2,
    title: 'Real-time Responses',
    description: 'Characters respond in real-time with typing indicators and natural conversation flow.',
    icon: 'zap'
  },
  {
    id: 3,
    title: 'Character Memory',
    description: 'NPCs remember previous interactions and build relationships over time.',
    icon: 'brain'
  },
  {
    id: 4,
    title: 'Faction Dynamics',
    description: 'Characters interact based on their faction relationships and personal histories.',
    icon: 'shield'
  }
])

// Methods
const handleMessageSent = (message: any) => {
  messageCount.value++
  console.log('Message sent:', message)
}

const handleAgentAdded = (agent: any) => {
  agentCount.value++
  console.log('Agent added:', agent)
}

const handleAgentRemoved = (agent: any) => {
  agentCount.value = Math.max(0, agentCount.value - 1)
  console.log('Agent removed:', agent)
}

const startNewConversation = () => {
  if (chatComponent.value) {
    // Reset conversation
    messageCount.value = 0
    sessionStartTime.value = new Date()
    console.log('Starting new conversation')
  }
}

const saveConversation = () => {
  // Implement conversation saving logic
  console.log('Saving conversation...')
  // Could integrate with conversation store
}

// Lifecycle
onMounted(() => {
  console.log('Group conversation page loaded')
  sessionStartTime.value = new Date()
})
</script>

<style scoped>
.group-conversation-page {
  min-height: 100vh;
}

.feature-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-4px);
}

/* Animation for statistics */
.text-center {
  animation: stat-fade-in 0.8s ease-out forwards;
}

@keyframes stat-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
