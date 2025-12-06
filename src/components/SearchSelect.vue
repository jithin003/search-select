<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

const props = withDefaults(defineProps<{
  options: any[];
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
const containerRef = ref<HTMLElement | null>(null);

// Helpers
const getLabel = (item: any): string => {
  if (typeof props.itemLabel === 'function') {
    return props.itemLabel(item);
  }
  return typeof item === 'object' ? item[props.itemLabel] : item;
};

const getValue = (item: any): any => {
  if (typeof props.itemValue === 'function') {
    return props.itemValue(item);
  }
  return typeof item === 'object' ? item[props.itemValue] : item;
};

// Selection Check Helpers
const isSelected = (item: any) => {
  const value = getValue(item);
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  }
  return props.modelValue === value;
};

// Filtering
const filteredOptions = computed(() => {
  let opts = props.options;

  // Filter out opted-out items
  if (props.optOut && props.optOut.length > 0) {
    opts = opts.filter(item => {
      const value = getValue(item);
      return !props.optOut.includes(value);
    });
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
  return opts.filter(item => {
    const label = String(getLabel(item)).toLowerCase();
    return label.includes(query);
  });
});

const selectOption = (item: any) => {
  const value = props.reduce ? props.reduce(item) : getValue(item);
  
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
    }
  }
  searchQuery.value = '';
};

// Display Logic
const displayValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length 
      ? `${props.modelValue.length} selected` 
      : '';
  }
  const selectedItem = props.options.find(opt => getValue(opt) === props.modelValue);
  return selectedItem ? getLabel(selectedItem) : '';
});

const toggle = () => {
  if (props.disabled) return;
  isOpen.value ? close() : open();
};

const open = () => {
  isOpen.value = true;
  emit('open');
};

const close = () => {
  isOpen.value = false;
  emit('close');
};

const clear = () => {
  emit('update:modelValue', props.multiple ? [] : null);
  searchQuery.value = '';
};

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
</script>

<template>
  <div ref="containerRef" class="search-select" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <!-- Trigger -->
    <div class="search-select-control" @click="toggle">
      <div v-if="!searchable || !isOpen" class="search-select-value" :class="{ 'placeholder': !displayValue }">
        {{ displayValue || placeholder }}
      </div>
      <input
        v-if="searchable && isOpen"
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="search-select-input"
        :placeholder="placeholder"
        @click.stop
      />
      <div class="search-select-actions">
        <button 
          v-if="clearable && (displayValue || (Array.isArray(modelValue) && modelValue.length > 0))" 
          class="search-select-clear"
          @click.stop="clear"
          type="button"
        >
          ✕
        </button>
        <span class="search-select-arrow">▼</span>
      </div>
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="search-select-dropdown">
      <ul class="search-select-options">
        <li v-if="loading" class="search-select-loading">
            <slot name="loading">Loading...</slot>
        </li>
        <template v-else>
            <li 
            v-for="(item, index) in filteredOptions" 
            :key="index"
            class="search-select-option" 
            :class="{ 'is-selected': isSelected(item) }"
            @click.stop="selectOption(item)"
            >
            <slot name="option" :option="item" :selected="isSelected(item)">
                <div class="search-select-option-content" :class="{ 'has-checkbox': checkbox }">
                  <input 
                    v-if="checkbox && checkboxPosition === 'left'"
                    type="checkbox"
                    :checked="isSelected(item)"
                    class="search-select-checkbox"
                    @click.stop
                  />
                  <span class="search-select-option-label">{{ getLabel(item) }}</span>
                  <input 
                    v-if="checkbox && checkboxPosition === 'right'"
                    type="checkbox"
                    :checked="isSelected(item)"
                    class="search-select-checkbox"
                    @click.stop
                  />
                </div>
            </slot>
            </li>
            <li v-if="filteredOptions.length === 0" class="search-select-no-results">
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
  font-family: sans-serif;
}

.search-select-control {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: white;
  min-height: 40px;
}

.search-select-input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0;
  font-size: inherit;
}

.search-select-value {
  flex: 1;
}

.placeholder {
  color: #999;
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
  color: #999;
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
  color: #666;
}

.search-select-arrow {
  font-size: 0.8em;
  color: #666;
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
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  z-index: 1000;
  margin-top: 4px;
  max-height: 200px;
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

.search-select-option:hover {
  background-color: #f5f5f5;
}

.search-select-option.is-selected {
  background-color: #e6f7ff;
  color: #007bff;
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
  color: #999;
  text-align: center;
}

.search-select-loading {
    padding: 8px 12px;
    color: #666;
    text-align: center;
}

.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
