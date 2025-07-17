<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="warhammer-modal-overlay"
        :class="overlayClasses"
        @click="handleOverlayClick"
        @keydown.esc="handleEscape"
      >
        <div
          ref="modalRef"
          class="warhammer-modal"
          :class="[
            sizeClasses,
            variantClasses,
            {
              'animate-medieval-entrance': !prefersReducedMotion
            }
          ]"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
          @click.stop
        >
          <!-- Modal Header -->
          <header v-if="$slots.header || title" class="warhammer-modal-header">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <WarhammerIcon
                  v-if="icon"
                  :name="icon"
                  :faction="faction"
                  size="lg"
                  class="flex-shrink-0"
                />
                <div>
                  <h2
                    v-if="title"
                    :id="titleId"
                    class="warhammer-modal-title"
                  >
                    {{ title }}
                  </h2>
                  <p
                    v-if="subtitle"
                    class="warhammer-modal-subtitle"
                  >
                    {{ subtitle }}
                  </p>
                </div>
              </div>
              
              <!-- Close Button -->
              <WarhammerButton
                v-if="closable"
                variant="ghost"
                size="sm"
                icon-left="x"
                :aria-label="closeLabel"
                @click="handleClose"
              />
            </div>
            
            <!-- Custom Header Content -->
            <slot name="header" />
          </header>
          
          <!-- Modal Content -->
          <main class="warhammer-modal-content">
            <p
              v-if="description"
              :id="descriptionId"
              class="text-base text-wh-dark-wood leading-relaxed mb-4"
            >
              {{ description }}
            </p>
            <slot />
          </main>
          
          <!-- Modal Footer -->
          <footer v-if="$slots.footer || showDefaultActions" class="warhammer-modal-footer">
            <slot name="footer">
              <div v-if="showDefaultActions" class="flex justify-end space-x-3">
                <WarhammerButton
                  v-if="showCancel"
                  variant="secondary"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </WarhammerButton>
                <WarhammerButton
                  v-if="showConfirm"
                  :variant="confirmVariant"
                  :loading="loading"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </WarhammerButton>
              </div>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  // Core modal props
  modelValue: boolean
  title?: string
  subtitle?: string
  description?: string
  icon?: string
  
  // Styling
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'parchment' | 'dark' | 'faction'
  
  // Warhammer-specific
  faction?: 'empire' | 'chaos' | 'dwarfs' | 'elves' | 'orcs' | 'undead'
  
  // Behavior
  closable?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  persistent?: boolean
  
  // Actions
  showDefaultActions?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmVariant?: 'primary' | 'danger' | 'success'
  loading?: boolean
  
  // Accessibility
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  closable: true,
  closeOnOverlay: true,
  closeOnEscape: true,
  showDefaultActions: false,
  showCancel: true,
  showConfirm: true,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmVariant: 'primary',
  closeLabel: 'Close modal'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  cancel: []
  confirm: []
}>()

// Refs
const modalRef = ref<HTMLElement>()

// Generate unique IDs
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)
const descriptionId = computed(() => `modal-desc-${Math.random().toString(36).substr(2, 9)}`)

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  }
})

// Focus management
let previousActiveElement: HTMLElement | null = null

const trapFocus = (event: KeyboardEvent) => {
  if (!modalRef.value) return
  
  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Computed properties
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-wh-parchment border-2 border-wh-aged-paper',
    parchment: 'bg-wh-aged-paper border-2 border-wh-wood-brown tavern-wood-texture',
    dark: 'bg-wh-dark-wood text-wh-bone border-2 border-wh-copper',
    faction: getFactionClasses()
  }
  return variants[props.variant]
})

const overlayClasses = computed(() => {
  return 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'
})

// Methods
const getFactionClasses = () => {
  if (!props.faction) return 'bg-wh-parchment border-2 border-wh-aged-paper'
  
  const factions = {
    empire: 'bg-blue-50 border-2 border-blue-400 text-blue-900',
    chaos: 'bg-red-50 border-2 border-red-400 text-red-900',
    dwarfs: 'bg-orange-50 border-2 border-orange-400 text-orange-900',
    elves: 'bg-green-50 border-2 border-green-400 text-green-900',
    orcs: 'bg-green-100 border-2 border-green-600 text-green-900',
    undead: 'bg-purple-50 border-2 border-purple-400 text-purple-900'
  }
  return factions[props.faction]
}

const handleClose = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleCancel = () => {
  emit('cancel')
  if (!props.persistent) {
    handleClose()
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

const handleEscape = () => {
  if (props.closeOnEscape) {
    handleClose()
  }
}

// Lifecycle hooks
const onEnter = () => {
  previousActiveElement = document.activeElement as HTMLElement
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', trapFocus)
}

const onAfterEnter = () => {
  // Focus the first focusable element in the modal
  nextTick(() => {
    const firstFocusable = modalRef.value?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    firstFocusable?.focus()
  })
}

const onLeave = () => {
  document.removeEventListener('keydown', trapFocus)
}

const onAfterLeave = () => {
  document.body.style.overflow = ''
  previousActiveElement?.focus()
}
</script>

<style scoped>
.warhammer-modal {
  position: relative;
  width: 100%;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  font-family: var(--wh-font-body);
  max-height: 90vh;
  overflow-y: auto;
}

.warhammer-modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid rgba(139, 69, 19, 0.2);
}

.warhammer-modal-title {
  font-family: var(--wh-font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--wh-dark-wood);
  margin: 0;
}

.warhammer-modal-subtitle {
  font-size: 0.875rem;
  color: var(--wh-wood-brown);
  margin: 0.25rem 0 0 0;
}

.warhammer-modal-content {
  padding: 1.5rem;
  color: var(--wh-dark-wood);
}

.warhammer-modal-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(139, 69, 19, 0.2);
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .warhammer-modal,
.modal-leave-active .warhammer-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .warhammer-modal,
.modal-leave-to .warhammer-modal {
  transform: scale(0.9) translateY(-20px);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .warhammer-modal {
    border: 3px solid var(--wh-bone);
    background: var(--wh-black);
    color: var(--wh-bone);
  }
  
  .warhammer-modal-title {
    color: var(--wh-bone);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .warhammer-modal,
  .modal-leave-active .warhammer-modal {
    transition: none !important;
  }
  
  .animate-medieval-entrance {
    animation: none !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .warhammer-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .warhammer-modal-header,
  .warhammer-modal-content,
  .warhammer-modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
