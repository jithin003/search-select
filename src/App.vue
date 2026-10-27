<script setup lang="ts">
import { ref } from 'vue';
import SearchSelect from './components/SearchSelect.vue';

// Basic Options
const selectedValue = ref('');
const selectedClearable = ref('');
const selectedFruit = ref('');
const selectedNoResults = ref('');
const selectedMulti = ref<string[]>([]);

const frameworks = [
  { label: 'Vue.js', value: 'vue', category: 'Frontend' },
  { label: 'React', value: 'react', category: 'Frontend' },
  { label: 'Angular', value: 'angular', category: 'Frontend' },
  { label: 'Svelte', value: 'svelte', category: 'Frontend' },
  { label: 'Node.js', value: 'node', category: 'Backend' },
  { label: 'Express', value: 'express', category: 'Backend' },
  { label: 'Django', value: 'django', category: 'Backend' },
];

const simpleOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

// Remote Search
const remoteOptions = ref<any[]>([]);
const isLoading = ref(false);
const remoteValue = ref('');

const handleSearch = async (query: string) => {
  if (!query) {
    remoteOptions.value = [];
    return;
  }
  
  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    remoteOptions.value = frameworks.filter(f => 
      f.label.toLowerCase().includes(query.toLowerCase())
    );
    isLoading.value = false;
  }, 500);
};

// Multi-select with checkboxes
const selectedWithCheckbox = ref<string[]>([]);

// Hide Selected
const selectedHidden = ref<string[]>([]);

// Opt-out example
const selectedOptOut = ref('');
const optedOutValues = ['react', 'angular']; // These won't appear in the list

// Custom template
const selectedCustom = ref('');
</script>

<template>
  <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <h1 style="margin-bottom: 10px;">🔍 SearchSelect Component Demo</h1>
    <p style="color: #666; margin-bottom: 40px;">A comprehensive Vue 3 / Nuxt 3 search-select component</p>
    
    <div style="display: grid; gap: 30px;">
      <!-- Basic Single Select -->
      <section>
        <h3 style="margin-bottom: 10px;">📌 Basic Single Select</h3>
        <SearchSelect 
          v-model="selectedValue" 
          :options="frameworks"
          placeholder="Choose a framework..."
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedValue || 'None' }}</strong></p>
      </section>

      <!-- With Clear Button -->
      <section>
        <h3 style="margin-bottom: 10px;">✕ Clearable Select</h3>
        <SearchSelect 
          v-model="selectedClearable" 
          :options="frameworks"
          placeholder="Choose a framework..."
          clearable
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedClearable || 'None' }}</strong></p>
      </section>

      <!-- Multi-select with Checkboxes (Left) -->
      <section>
        <h3 style="margin-bottom: 10px;">☑️ Multi-select with Checkboxes (Left)</h3>
        <SearchSelect 
          v-model="selectedWithCheckbox" 
          :options="frameworks"
          placeholder="Select multiple frameworks..."
          multiple
          checkbox
          checkbox-position="left"
          clearable
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedWithCheckbox.join(', ') || 'None' }}</strong></p>
      </section>

      <!-- Multi-select with Checkboxes (Right) -->
      <section>
        <h3 style="margin-bottom: 10px;">☑️ Multi-select with Checkboxes (Right)</h3>
        <SearchSelect 
          v-model="selectedMulti" 
          :options="frameworks"
          placeholder="Select multiple frameworks..."
          multiple
          checkbox
          checkbox-position="right"
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedMulti.join(', ') || 'None' }}</strong></p>
      </section>

      <!-- Remote Search -->
      <section>
        <h3 style="margin-bottom: 10px;">🌐 Remote Search (Simulated API)</h3>
        <SearchSelect 
          v-model="remoteValue" 
          :options="remoteOptions"
          placeholder="Type to search..."
          remote
          :loading="isLoading"
          @search="handleSearch"
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ remoteValue || 'None' }}</strong></p>
      </section>

      <!-- Hide Selected -->
      <section>
        <h3 style="margin-bottom: 10px;">👁️ Hide Selected Items</h3>
        <SearchSelect 
          v-model="selectedHidden" 
          :options="frameworks"
          placeholder="Select items (they'll disappear)..."
          multiple
          hide-selected
          checkbox
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedHidden.join(', ') || 'None' }}</strong></p>
      </section>

      <!-- Opt-out -->
      <section>
        <h3 style="margin-bottom: 10px;">🚫 Opt-out (React & Angular excluded)</h3>
        <SearchSelect 
          v-model="selectedOptOut" 
          :options="frameworks"
          :opt-out="optedOutValues"
          placeholder="React and Angular are excluded..."
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedOptOut || 'None' }}</strong></p>
      </section>

      <!-- Custom Template (Card Style) -->
      <section>
        <h3 style="margin-bottom: 10px;">🎨 Custom Template (Card Style)</h3>
        <SearchSelect 
          v-model="selectedCustom" 
          :options="frameworks"
          placeholder="Choose with custom template..."
        >
          <template #option="{ option, selected }">
            <div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                {{ option.label.charAt(0) }}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500;">{{ option.label }}</div>
                <div style="font-size: 12px; color: #999;">{{ option.category }}</div>
              </div>
              <span v-if="selected" style="color: #007bff; font-size: 20px;">✓</span>
            </div>
          </template>
        </SearchSelect>
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedCustom || 'None' }}</strong></p>
      </section>

      <!-- Simple Array -->
      <section>
        <h3 style="margin-bottom: 10px;">🍎 Simple Array (Strings)</h3>
        <SearchSelect 
          v-model="selectedFruit" 
          :options="simpleOptions"
          placeholder="Choose a fruit..."
          clearable
        />
        <p style="margin-top: 8px; color: #666; font-size: 14px;">Selected: <strong>{{ selectedFruit || 'None' }}</strong></p>
      </section>

      <!-- Custom No Results -->
      <section>
        <h3 style="margin-bottom: 10px;">🔍 Custom "No Results" Message</h3>
        <SearchSelect 
          v-model="selectedNoResults" 
          :options="frameworks"
          placeholder="Try searching for 'xyz'..."
        >
          <template #no-results>
            <div style="padding: 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">🤷</div>
              <div style="color: #999;">Oops! Nothing found</div>
            </div>
          </template>
        </SearchSelect>
      </section>
    </div>
  </div>
</template>

<style scoped>
section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

h3 {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}
</style>
