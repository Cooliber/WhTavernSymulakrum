<template>
  <div class="warhammer-input-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="warhammer-input-label"
      :class="labelClasses"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
    </label>
    
    <!-- Input Container -->
    <div class="relative">
      <!-- Leading Icon -->
      <div v-if="iconLeft" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <WarhammerIcon
          :name="iconLeft"
          :size="iconSize"
          class="text-wh-wood-brown"
          aria-hidden="true"
        />
      </div>
      
      <!-- Input Element -->
      <component
        :is="inputComponent"
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :rows="rows"
        :cols="cols"
        :maxlength="maxlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError ? 'true' : 'false'"
        :aria-required="required ? 'true' : 'false'"
        class="warhammer-input wh-input"
        :class="[
          inputClasses,
          sizeClasses,
          stateClasses,
          {
            'pl-10': iconLeft,
            'pr-10': iconRight || clearable,
            'wh-focus-ring': !disabled
          }
        ]"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <!-- Trailing Icon / Clear Button -->
      <div v-if="iconRight || (clearable && inputValue)" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          v-if="clearable && inputValue && !disabled"
          type="button"
          class="text-wh-wood-brown hover:text-wh-dark-wood focus:outline-none focus:text-wh-dark-wood transition-colors duration-200"
          :aria-label="clearLabel"
          @click="clearInput"
        >
          <WarhammerIcon name="x" :size="iconSize" />
        </button>
        <WarhammerIcon
          v-else-if="iconRight"
          :name="iconRight"
          :size="iconSize"
          class="text-wh-wood-brown"
          aria-hidden="true"
        />
      </div>
    </div>
    
    <!-- Help Text -->
    <p
      v-if="helpText && !hasError"
      :id="`${inputId}-help`"
      class="warhammer-input-help"
    >
      {{ helpText }}
    </p>
    
    <!-- Error Message -->
    <p
      v-if="hasError"
      :id="`${inputId}-error`"
      class="warhammer-input-error wh-error-message"
      role="alert"
      aria-live="polite"
    >
      <WarhammerIcon name="alert-circle" size="xs" class="inline mr-1" />
      {{ errorMessage }}
    </p>
    
    <!-- Character Count -->
    <p
      v-if="showCharCount && maxlength"
      class="warhammer-input-count"
      :class="{ 'text-red-500': characterCount > maxlength * 0.9 }"
    >
      {{ characterCount }}/{{ maxlength }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Core input props
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea'
  placeholder?: string
  
  // Validation
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  pattern?: string
  min?: number | string
  max?: number | string
  step?: number | string
  maxlength?: number
  
  // Styling
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  
  // Content
  label?: string
  helpText?: string
  errorMessage?: string
  
  // Icons
  iconLeft?: string
  iconRight?: string
  clearable?: boolean
  clearLabel?: string
  
  // Textarea specific
  rows?: number
  cols?: number
  
  // Accessibility
  ariaDescribedBy?: string
  autocomplete?: string
  
  // Features
  showCharCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'default',
  clearLabel: 'Clear input',
  rows: 3
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [event: Event]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}>()

// Refs
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()

// Generate unique ID
const inputId = computed(() => `warhammer-input-${Math.random().toString(36).substr(2, 9)}`)

// Computed properties
const inputComponent = computed(() => {
  return props.type === 'textarea' ? 'textarea' : 'input'
})

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => !!props.errorMessage)

const characterCount = computed(() => {
  return String(props.modelValue || '').length
})

const iconSize = computed(() => {
  const sizeMap = {
    sm: 'xs',
    md: 'sm',
    lg: 'md'
  }
  return sizeMap[props.size] as 'xs' | 'sm' | 'md'
})

const ariaDescribedBy = computed(() => {
  const ids = []
  if (props.helpText && !hasError.value) ids.push(`${inputId.value}-help`)
  if (hasError.value) ids.push(`${inputId.value}-error`)
  if (props.ariaDescribedBy) ids.push(props.ariaDescribedBy)
  return ids.length > 0 ? ids.join(' ') : undefined
})

const wrapperClasses = computed(() => {
  return 'space-y-1'
})

const labelClasses = computed(() => {
  return [
    'block text-sm font-medium text-wh-dark-wood',
    {
      'text-wh-light-grey': props.disabled,
      'text-red-600': hasError.value
    }
  ]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-5 py-3 text-lg min-h-[52px]'
  }
  return sizes[props.size]
})

const inputClasses = computed(() => {
  const variants = {
    default: 'bg-wh-parchment border border-wh-aged-paper',
    filled: 'bg-wh-aged-paper border border-wh-wood-brown',
    outlined: 'bg-transparent border-2 border-wh-empire-gold'
  }
  return variants[props.variant]
})

const stateClasses = computed(() => {
  return [
    'w-full rounded-md font-wh-body text-wh-dark-wood placeholder-wh-wood-brown transition-colors duration-200',
    {
      'border-red-500 focus:border-red-500 focus:ring-red-500': hasError.value,
      'border-wh-empire-gold focus:border-wh-empire-gold focus:ring-wh-empire-gold': !hasError.value && !props.disabled,
      'bg-wh-light-grey text-wh-grey cursor-not-allowed': props.disabled,
      'bg-wh-aged-paper': props.readonly
    }
  ]
})

// Methods
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Escape key to clear input
  if (event.key === 'Escape' && props.clearable && inputValue.value) {
    clearInput()
  }
}

const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// Expose methods for parent components
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => (inputRef.value as HTMLInputElement)?.select()
})
</script>

<style scoped>
.warhammer-input {
  font-family: var(--wh-font-body);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.warhammer-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 179, 0, 0.1);
}

.warhammer-input-label {
  font-family: var(--wh-font-heading);
}

.warhammer-input-help {
  font-size: 0.875rem;
  color: var(--wh-wood-brown);
  margin-top: 0.25rem;
}

.warhammer-input-error {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.warhammer-input-count {
  font-size: 0.75rem;
  color: var(--wh-wood-brown);
  text-align: right;
  margin-top: 0.25rem;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .warhammer-input {
    border: 2px solid var(--wh-bone);
    background: var(--wh-black);
    color: var(--wh-bone);
  }
  
  .warhammer-input:focus {
    border-color: var(--wh-empire-gold);
    box-shadow: 0 0 0 2px var(--wh-empire-gold);
  }
  
  .warhammer-input-label {
    color: var(--wh-bone);
  }
}

/* Touch device optimizations */
@media (pointer: coarse) {
  .warhammer-input {
    min-height: 44px;
  }
}

/* Print styles */
@media print {
  .warhammer-input {
    background: white !important;
    color: black !important;
    border: 1px solid black !important;
  }
}
</style>
