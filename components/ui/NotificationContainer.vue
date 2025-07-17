<template>
  <Teleport to="body">
    <div class="notification-container">
      <!-- Top Right Notifications -->
      <div class="notification-stack top-right">
        <TransitionGroup
          name="notification-stack"
          tag="div"
          class="space-y-3"
        >
          <WarhammerNotification
            v-for="notification in topRightNotifications"
            :key="notification.id"
            :type="notification.type"
            :title="notification.title"
            :message="notification.message"
            :duration="notification.duration"
            :auto-close="notification.autoClose"
            :closable="notification.closable"
            :action="notification.action"
            :persistent="notification.persistent"
            position="top-right"
            @close="removeNotification(notification.id)"
            @action="handleNotificationAction(notification)"
          />
        </TransitionGroup>
      </div>

      <!-- Center Notifications (for important alerts) -->
      <div class="notification-stack center">
        <TransitionGroup
          name="notification-center"
          tag="div"
          class="space-y-4"
        >
          <WarhammerNotification
            v-for="notification in centerNotifications"
            :key="notification.id"
            :type="notification.type"
            :title="notification.title"
            :message="notification.message"
            :duration="notification.duration"
            :auto-close="notification.autoClose"
            :closable="notification.closable"
            :action="notification.action"
            :persistent="notification.persistent"
            position="center"
            size="lg"
            @close="removeNotification(notification.id)"
            @action="handleNotificationAction(notification)"
          />
        </TransitionGroup>
      </div>

      <!-- Bottom Right Notifications (for less important info) -->
      <div class="notification-stack bottom-right">
        <TransitionGroup
          name="notification-stack"
          tag="div"
          class="space-y-2"
        >
          <WarhammerNotification
            v-for="notification in bottomRightNotifications"
            :key="notification.id"
            :type="notification.type"
            :title="notification.title"
            :message="notification.message"
            :duration="notification.duration"
            :auto-close="notification.autoClose"
            :closable="notification.closable"
            :action="notification.action"
            :persistent="notification.persistent"
            position="bottom-right"
            size="sm"
            @close="removeNotification(notification.id)"
            @action="handleNotificationAction(notification)"
          />
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Notification } from '~/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

// Computed properties to organize notifications by position
const topRightNotifications = computed(() => {
  return notifications.value.filter(n => 
    ['success', 'quest', 'battle'].includes(n.type) && !n.persistent
  ).slice(0, 3)
})

const centerNotifications = computed(() => {
  return notifications.value.filter(n => 
    ['error', 'warning'].includes(n.type) && n.persistent
  ).slice(0, 2)
})

const bottomRightNotifications = computed(() => {
  return notifications.value.filter(n => 
    ['info', 'lore'].includes(n.type) && !n.persistent
  ).slice(0, 4)
})

// Methods
const handleNotificationAction = (notification: Notification) => {
  if (notification.action) {
    notification.action.handler()
  }
}

// Auto-cleanup old notifications
const cleanupOldNotifications = () => {
  const now = Date.now()
  const maxAge = 5 * 60 * 1000 // 5 minutes
  
  notifications.value.forEach(notification => {
    if (!notification.persistent && 
        now - notification.timestamp.getTime() > maxAge) {
      removeNotification(notification.id)
    }
  })
}

// Cleanup interval
onMounted(() => {
  const cleanupInterval = setInterval(cleanupOldNotifications, 60000) // Every minute
  
  onUnmounted(() => {
    clearInterval(cleanupInterval)
  })
})
</script>

<style scoped>
.notification-container {
  @apply fixed inset-0 pointer-events-none z-50;
}

.notification-stack {
  @apply absolute pointer-events-none;
}

.notification-stack > * {
  @apply pointer-events-auto;
}

.top-right {
  @apply top-4 right-4;
}

.center {
  @apply top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
}

.bottom-right {
  @apply bottom-4 right-4;
}

/* Stack animations */
.notification-stack-enter-active,
.notification-stack-leave-active {
  transition: all 0.3s ease;
}

.notification-stack-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-stack-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-stack-move {
  transition: transform 0.3s ease;
}

/* Center animations */
.notification-center-enter-active,
.notification-center-leave-active {
  transition: all 0.4s ease;
}

.notification-center-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.notification-center-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.notification-center-move {
  transition: transform 0.4s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .top-right {
    @apply top-2 right-2 left-2;
  }
  
  .bottom-right {
    @apply bottom-2 right-2 left-2;
  }
  
  .center {
    @apply top-1/2 left-2 right-2 transform -translate-y-1/2 translate-x-0;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .notification-stack-enter-active,
  .notification-stack-leave-active,
  .notification-center-enter-active,
  .notification-center-leave-active,
  .notification-stack-move,
  .notification-center-move {
    transition: none !important;
  }
}
</style>