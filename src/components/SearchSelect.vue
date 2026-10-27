<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onUnmounted, useId } from 'vue';

const props = withDefaults(defineProps<{
  options?: any[];
  modelValue?: any;
  multiple?: boolean;
  searchable?: boolean;
  itemLabel?: string | ((item: any) => string);
  itemValue?: string | ((item: any) => any);
  placeholder?: string;
  disabled?: boolean;
  remote?: boolean;
  loading?: boolean;
  hideSelected?: boolean;
  checkbox?: boolean;
  checkboxPosition?: 'left' | 'right';
  optOut?: any[];
  clearable?: boolean;
  closeOnSelect?: boolean;
  reduce?: (item: any) => any;
}>(), {
  options: () => [],
  multiple: false,
  searchable: true,
  itemLabel: 'label',
  itemValue: 'value',
  placeholder: 'Select option...',
  disabled: false,
  remote: false,
  loading: false,
  hideSelected: false,
  checkbox: false,
  checkboxPosition: 'left',
  optOut: () => [],
  clearable: false,
  closeOnSelect: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'search', query: string): void;
  (e: 'open'): void;
  (e: 'close'): void;
}>();

// State
const isOpen = ref(false);
const searchQuery = ref('');
const activeIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const controlRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const uid = useId();
const listboxId = `${uid}-listbox`;
const optionId = (index: number) => `${uid}-option-${index}`;

// Helpers
const isObject = (item: any) => item !== null && typeof item === 'object';

const getLabel = (item: any): string => {
  if (typeof props.itemLabel === 'function') {
    return props.itemLabel(item);
  }
  return isObject(item) ? item[props.itemLabel] : item;
};

const getValue = (item: any): any => {
  if (typeof props.itemValue === 'function') {
    return props.itemValue(item);
  }
  return isObject(item) ? item[props.itemValue] : item;
};

// The value that ends up in v-model for an option (honours `reduce`)
const getModelValue = (item: any): any => (props.reduce ? props.reduce(item) : getValue(item));

// Selection Check Helpers
const selectedValues = computed(() => {
  if (props.multiple) {
    return new Set(Array.isArray(props.modelValue) ? props.modelValue : []);
  }
  return new Set(props.modelValue === undefined || props.modelValue === null ? [] : [props.modelValue]);
});

const isSelected = (item: any) => selectedValues.value.has(getModelValue(item));

// Remember the options that were selected so the label survives
// option lists changing underneath us (e.g. remote search results).
const knownItems = new Map<any, any>();
watch(() => props.options, (opts) => {
  for (const opt of opts) knownItems.set(getModelValue(opt), opt);
}, { immediate: true });

// Filtering
const filteredOptions = computed(() => {
  let opts = props.options;

  // Filter out opted-out items
  if (props.optOut.length > 0) {
    const optOut = new Set(props.optOut);
    opts = opts.filter(item => !optOut.has(getValue(item)));
  }

  if (props.hideSelected) {
    opts = opts.filter(item => !isSelected(item));
  }

  if (props.remote) {
    // In remote mode, we rely on the parent to update options based on search event.
    // We do NOT filter locally by query, but we might still respect hideSelected.
    return opts;
  }

  if (!props.searchable || !searchQuery.value) {
    return opts;
  }

  const query = searchQuery.value.toLowerCase();
  return opts.filter(item => String(getLabel(item)).toLowerCase().includes(query));
});

const selectOption = (item: any) => {
  const value = getModelValue(item);
  knownItems.set(value, item);

  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    emit('update:modelValue', current);
  } else {
    emit('update:modelValue', value);
    if (props.closeOnSelect) {
      close();
      controlRef.value?.focus();
    }
  }
  searchQuery.value = '';
};

// Display Logic
const hasValue = computed(() => selectedValues.value.size > 0);

const displayValue = computed(() => {
  if (props.multiple) {
    return hasValue.value ? `${selectedValues.value.size} selected` : '';
  }
  if (!hasValue.value) return '';
  const selectedItem = props.options.find(opt => getModelValue(opt) === props.modelValue)
    ?? knownItems.get(props.modelValue);
  return selectedItem !== undefined ? String(getLabel(selectedItem)) : '';
});

const activeDescendant = computed(() =>
  isOpen.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
);

const toggle = () => {
  if (props.disabled) return;
  isOpen.value ? close() : open();
};

const open = () => {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
  const selectedIndex = filteredOptions.value.findIndex(isSelected);
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : (filteredOptions.value.length ? 0 : -1);
  emit('open');
  nextTick(() => {
    inputRef.value?.focus();
    scrollActiveIntoView();
  });
};

const close = () => {
  if (!isOpen.value) return;
  isOpen.value = false;
  activeIndex.value = -1;
  searchQuery.value = '';
  emit('close');
};

const clear = () => {
  emit('update:modelValue', props.multiple ? [] : null);
  searchQuery.value = '';
};

// Keyboard
const scrollActiveIntoView = () => {
  if (activeIndex.value < 0) return;
  const el = listRef.value?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex.value];
  el?.scrollIntoView?.({ block: 'nearest' });
};

const moveActive = (delta: number) => {
  const count = filteredOptions.value.length;
  if (!count) return;
  activeIndex.value = (activeIndex.value + delta + count) % count;
  nextTick(scrollActiveIntoView);
};

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      isOpen.value ? moveActive(1) : open();
      break;
    case 'ArrowUp':
      event.preventDefault();
      isOpen.value ? moveActive(-1) : open();
      break;
    case 'Home':
    case 'End':
      if (!isOpen.value || !filteredOptions.value.length) return;
      // Leave Home/End to the text input for caret movement
      if (event.target === inputRef.value) return;
      event.preventDefault();
      activeIndex.value = event.key === 'Home' ? 0 : filteredOptions.value.length - 1;
      nextTick(scrollActiveIntoView);
      break;
    case 'Enter':
      event.preventDefault();
      if (!isOpen.value) {
        open();
      } else if (!props.loading && filteredOptions.value[activeIndex.value] !== undefined) {
        selectOption(filteredOptions.value[activeIndex.value]);
      }
      break;
    case ' ':
      // Space types into the search input; elsewhere it toggles like a native select
      if (event.target === inputRef.value) return;
      event.preventDefault();
      if (!isOpen.value) {
        open();
      } else if (filteredOptions.value[activeIndex.value] !== undefined) {
        selectOption(filteredOptions.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      if (!isOpen.value) return;
      event.preventDefault();
      close();
      controlRef.value?.focus();
      break;
    case 'Tab':
      close();
      break;
  }
};

watch(filteredOptions, (opts) => {
  if (!isOpen.value) return;
  if (activeIndex.value >= opts.length || activeIndex.value < 0) {
    activeIndex.value = opts.length ? 0 : -1;
  }
});

// Click Outside
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

watch(searchQuery, (val) => {
  emit('search', val);
});

watch(() => props.disabled, (disabled) => {
  if (disabled) close();
});
</script>

<template>
  <div
    ref="containerRef"
    class="search-select"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
    @keydown="onKeydown"
  >
    <!-- Trigger -->
    <div
      ref="controlRef"
      class="search-select-control"
      :role="searchable && isOpen ? undefined : 'combobox'"
      :tabindex="disabled || (searchable && isOpen) ? -1 : 0"
      :aria-expanded="searchable && isOpen ? undefined : isOpen"
      :aria-controls="searchable && isOpen ? undefined : listboxId"
      aria-haspopup="listbox"
      :aria-disabled="disabled || undefined"
      :aria-activedescendant="searchable && isOpen ? undefined : activeDescendant"
      @click="toggle"
    >
      <div v-if="!searchable || !isOpen" class="search-select-value" :class="{ 'placeholder': !displayValue }">
        {{ displayValue || placeholder }}
      </div>
      <input
        v-if="searchable && isOpen"
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="search-select-input"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="true"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendant"
        autocomplete="off"
        :placeholder="displayValue || placeholder"
        @click.stop
      />
      <div class="search-select-actions">
        <button
          v-if="clearable && hasValue && !disabled"
          class="search-select-clear"
          type="button"
          aria-label="Clear selection"
          tabindex="-1"
          @click.stop="clear"
        >
          ✕
        </button>
        <span class="search-select-arrow" aria-hidden="true">▼</span>
      </div>
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="search-select-dropdown">
      <ul
        :id="listboxId"
        ref="listRef"
        class="search-select-options"
        role="listbox"
        :aria-multiselectable="multiple || undefined"
        :aria-busy="loading || undefined"
      >
        <li v-if="loading" class="search-select-loading" role="presentation">
            <slot name="loading">Loading...</slot>
        </li>
        <template v-else>
            <li
            v-for="(item, index) in filteredOptions"
            :id="optionId(index)"
            :key="index"
            class="search-select-option"
            :class="{ 'is-selected': isSelected(item), 'is-active': index === activeIndex }"
            role="option"
            :aria-selected="isSelected(item)"
            @mousedown.prevent
            @mousemove="activeIndex = index"
            @click.stop="selectOption(item)"
            >
            <slot name="option" :option="item" :selected="isSelected(item)" :active="index === activeIndex">
                <div class="search-select-option-content" :class="{ 'has-checkbox': checkbox }">
                  <input
                    v-if="checkbox && checkboxPosition === 'left'"
                    type="checkbox"
                    :checked="isSelected(item)"
                    class="search-select-checkbox"
                    tabindex="-1"
                    aria-hidden="true"
                    @click.prevent
                  />
                  <span class="search-select-option-label">{{ getLabel(item) }}</span>
                  <input
                    v-if="checkbox && checkboxPosition === 'right'"
                    type="checkbox"
                    :checked="isSelected(item)"
                    class="search-select-checkbox"
                    tabindex="-1"
                    aria-hidden="true"
                    @click.prevent
                  />
                </div>
            </slot>
            </li>
            <li v-if="filteredOptions.length === 0" class="search-select-no-results" role="presentation">
            <slot name="no-results">No results found</slot>
            </li>
        </template>
      </ul>
    </div>
  </div>
</template>
<style scoped>
.search-select {
  position: relative;
  width: 100%;
  font-family: var(--ss-font-family, sans-serif);
}

.search-select-control {
  border: 1px solid var(--ss-border-color, #ccc);
  border-radius: var(--ss-border-radius, 4px);
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: var(--ss-background, white);
  min-height: 40px;
  box-sizing: border-box;
}

.search-select-control:focus-visible,
.is-open .search-select-control {
  outline: none;
  border-color: var(--ss-focus-color, #007bff);
  box-shadow: 0 0 0 2px var(--ss-focus-ring, rgba(0, 123, 255, 0.25));
}

.search-select-input {
  border: none;
  outline: none;
  width: 100%;
  min-width: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: transparent;
}

.search-select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  color: var(--ss-placeholder-color, #757575);
}

.search-select-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.search-select-clear {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.2s;
}

.search-select-clear:hover {
  background-color: #f0f0f0;
  color: var(--ss-muted-color, #666);
}

.search-select-arrow {
  font-size: 0.8em;
  color: var(--ss-muted-color, #666);
  transition: transform 0.2s;
}

.is-open .search-select-arrow {
  transform: rotate(180deg);
}

.search-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid var(--ss-border-color, #ccc);
  border-radius: var(--ss-border-radius, 4px);
  background: var(--ss-background, white);
  z-index: var(--ss-dropdown-z-index, 1000);
  margin-top: 4px;
  max-height: var(--ss-dropdown-max-height, 200px);
  box-sizing: border-box;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.search-select-options {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-select-option {
  cursor: pointer;
  transition: background-color 0.15s;
}

.search-select-option.is-active {
  background-color: var(--ss-option-active-background, #f0f0f0);
}

.search-select-option.is-selected {
  background-color: var(--ss-option-selected-background, #e6f7ff);
  color: var(--ss-option-selected-color, #0062cc);
}

.search-select-option.is-selected.is-active {
  background-color: var(--ss-option-selected-active-background, #cceeff);
}

.search-select-option-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
}

.search-select-option-content.has-checkbox {
  padding: 6px 12px;
}

.search-select-checkbox {
  cursor: pointer;
  width: 16px;
  height: 16px;
  margin: 0;
}

.search-select-option-label {
  flex: 1;
}

.search-select-no-results {
  padding: 8px 12px;
  color: var(--ss-muted-color, #757575);
  text-align: center;
}

.search-select-loading {
    padding: 8px 12px;
    color: var(--ss-muted-color, #666);
    text-align: center;
}

.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
