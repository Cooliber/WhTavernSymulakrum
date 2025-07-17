/**
 * Notifications Composable
 * Manages toast notifications with Warhammer Fantasy theming
 */

import { ref, readonly } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'quest' | 'battle' | 'lore'
  title?: string
  message: string
  duration?: number
  autoClose?: boolean
  closable?: boolean
  persistent?: boolean
  action?: {
    label: string
    handler: () => void
  }
  timestamp: Date
}

interface NotificationOptions {
  type?: Notification['type']
  title?: string
  duration?: number
  autoClose?: boolean
  closable?: boolean
  persistent?: boolean
  action?: Notification['action']
}

// Global state
const notifications = ref<Notification[]>([])
const maxNotifications = ref(5)

// Notification ID generator
let notificationId = 0
const generateId = (): string => `notification-${++notificationId}-${Date.now()}`

/**
 * Add a new notification
 */
const addNotification = (message: string, options: NotificationOptions = {}): string => {
  const id = generateId()
  
  const notification: Notification = {
    id,
    type: options.type || 'info',
    title: options.title,
    message,
    duration: options.duration ?? 5000,
    autoClose: options.autoClose ?? true,
    closable: options.closable ?? true,
    persistent: options.persistent ?? false,
    action: options.action,
    timestamp: new Date()
  }

  notifications.value.unshift(notification)

  // Limit the number of notifications
  if (notifications.value.length > maxNotifications.value) {
    notifications.value = notifications.value.slice(0, maxNotifications.value)
  }

  return id
}

/**
 * Remove a notification by ID
 */
const removeNotification = (id: string): void => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

/**
 * Clear all notifications
 */
const clearNotifications = (): void => {
  notifications.value = []
}

/**
 * Clear notifications by type
 */
const clearNotificationsByType = (type: Notification['type']): void => {
  notifications.value = notifications.value.filter(n => n.type !== type)
}

/**
 * Convenience methods for different notification types
 */
const success = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'success' })
}

const error = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'error' })
}

const warning = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'warning' })
}

const info = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'info' })
}

const quest = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'quest' })
}

const battle = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'battle' })
}

const lore = (message: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
  return addNotification(message, { ...options, type: 'lore' })
}

/**
 * Warhammer-specific notification helpers
 */
const questCompleted = (questName: string): string => {
  return quest(`Quest "${questName}" completed!`, {
    title: 'Quest Completed',
    duration: 8000,
    action: {
      label: 'View Rewards',
      handler: () => navigateTo('/quests')
    }
  })
}

const questFailed = (questName: string, reason?: string): string => {
  return error(`Quest "${questName}" failed${reason ? `: ${reason}` : ''}`, {
    title: 'Quest Failed',
    duration: 10000,
    persistent: true
  })
}

const newQuestAvailable = (questName: string, giver: string): string => {
  return quest(`New quest "${questName}" available from ${giver}`, {
    title: 'New Quest Available',
    action: {
      label: 'View Quest',
      handler: () => navigateTo('/quests')
    }
  })
}

const battleVictory = (enemyName: string, experience: number): string => {
  return battle(`Victory against ${enemyName}! Gained ${experience} XP`, {
    title: 'Battle Victory',
    duration: 6000
  })
}

const battleDefeat = (enemyName: string): string => {
  return battle(`Defeated by ${enemyName}`, {
    title: 'Battle Defeat',
    duration: 8000,
    persistent: true
  })
}

const levelUp = (newLevel: number, characterName: string): string => {
  return success(`${characterName} reached level ${newLevel}!`, {
    title: 'Level Up!',
    duration: 10000,
    action: {
      label: 'View Character',
      handler: () => navigateTo('/characters')
    }
  })
}

const itemFound = (itemName: string, rarity: string): string => {
  const rarityColors = {
    common: 'info',
    uncommon: 'success',
    rare: 'warning',
    epic: 'quest',
    legendary: 'lore'
  }
  
  return addNotification(`Found ${itemName}!`, {
    type: rarityColors[rarity as keyof typeof rarityColors] || 'info',
    title: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Item Found`,
    duration: 6000
  })
}

const aiServiceStatus = (provider: string, status: 'connected' | 'disconnected' | 'error'): string => {
  const statusConfig = {
    connected: {
      type: 'success' as const,
      message: `AI service ${provider} connected`,
      title: 'AI Service Online'
    },
    disconnected: {
      type: 'warning' as const,
      message: `AI service ${provider} disconnected`,
      title: 'AI Service Offline'
    },
    error: {
      type: 'error' as const,
      message: `AI service ${provider} encountered an error`,
      title: 'AI Service Error',
      persistent: true
    }
  }

  const config = statusConfig[status]
  return addNotification(config.message, {
    type: config.type,
    title: config.title,
    persistent: config.persistent
  })
}

const tavernEvent = (eventName: string, description: string): string => {
  return lore(`${eventName}: ${description}`, {
    title: 'Tavern Event',
    duration: 12000,
    action: {
      label: 'Join Event',
      handler: () => navigateTo('/tavern')
    }
  })
}

/**
 * Notification statistics
 */
const getNotificationStats = () => {
  const total = notifications.value.length
  const byType = notifications.value.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    byType,
    persistent: notifications.value.filter(n => n.persistent).length,
    recent: notifications.value.filter(n => 
      Date.now() - n.timestamp.getTime() < 60000
    ).length
  }
}

/**
 * Export the composable
 */
export const useNotifications = () => {
  return {
    // State
    notifications: readonly(notifications),
    maxNotifications: readonly(maxNotifications),

    // Core methods
    addNotification,
    removeNotification,
    clearNotifications,
    clearNotificationsByType,

    // Convenience methods
    success,
    error,
    warning,
    info,
    quest,
    battle,
    lore,

    // Warhammer-specific methods
    questCompleted,
    questFailed,
    newQuestAvailable,
    battleVictory,
    battleDefeat,
    levelUp,
    itemFound,
    aiServiceStatus,
    tavernEvent,

    // Utilities
    getNotificationStats
  }
}