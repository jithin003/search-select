# 🔍 search-select-vue

A versatile, feature-rich search-select component for **Vue 3** and **Nuxt 3**.

## ✨ Features

- 🔎 **Local & Remote Search** - Filter options locally or fetch from an API
- ✅ **Multi-select** - Select multiple items with checkbox support
- 🎨 **Custom Templates** - Use slots to render options as cards, lists, or any custom layout
- 🚫 **Opt-out Options** - Exclude specific items from the list
- 👁️ **Hide Selected** - Remove selected items from the dropdown
- 🧹 **Clearable** - Clear button to reset selection
- ⌨️ **Keyboard Navigation** - Arrow keys, Enter, and Escape support
- 📱 **Responsive** - Works on all screen sizes
- 🎯 **TypeScript** - Full TypeScript support

## 📦 Installation

```bash
npm install search-select-vue
```

## 🚀 Basic Usage

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { SearchSelect } from 'search-select-vue';

const selected = ref('');
const options = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
];
</script>

<template>
  <SearchSelect v-model="selected" :options="options" />
</template>
```

### Nuxt 3

Create a plugin file:

```typescript
// plugins/search-select.ts
import SearchSelect from 'search-select-vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('SearchSelect', SearchSelect);
});
```

Then use it in your components:

```vue
<template>
  <SearchSelect v-model="selected" :options="options" />
</template>
```

## 📖 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<any>` | `[]` | Array of options to display |
| `modelValue` | `any \| Array<any>` | - | v-model binding (selected value) |
| `multiple` | `Boolean` | `false` | Enable multi-select mode |
| `searchable` | `Boolean` | `true` | Enable search functionality |
| `itemLabel` | `String \| Function` | `'label'` | Key or function to get option label |
| `itemValue` | `String \| Function` | `'value'` | Key or function to get option value |
| `placeholder` | `String` | `'Select option...'` | Placeholder text |
| `disabled` | `Boolean` | `false` | Disable the component |
| `remote` | `Boolean` | `false` | Enable remote search mode |
| `loading` | `Boolean` | `false` | Show loading state |
| `hideSelected` | `Boolean` | `false` | Hide selected items from list |
| `checkbox` | `Boolean` | `false` | Show checkboxes for items |
| `checkboxPosition` | `'left' \| 'right'` | `'left'` | Position of checkboxes |
| `optOut` | `Array<any>` | `[]` | Values to exclude from options |
| `clearable` | `Boolean` | `false` | Show clear button |
| `closeOnSelect` | `Boolean` | `true` | Close dropdown after selection |
| `reduce` | `Function` | - | Transform selected value |

## 🎯 Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any \| Array<any>` | Emitted when selection changes |
| `search` | `string` | Emitted when search query changes |
| `open` | - | Emitted when dropdown opens |
| `close` | - | Emitted when dropdown closes |

## 🎨 Slots

### `option`
Customize how each option is rendered.

**Scope:**
- `option` - The option object
- `selected` - Boolean indicating if option is selected

```vue
<SearchSelect v-model="selected" :options="options">
  <template #option="{ option, selected }">
    <div class="custom-option">
      <strong>{{ option.label }}</strong>
      <span v-if="selected">✓</span>
    </div>
  </template>
</SearchSelect>
```

### `no-results`
Customize the "no results" message.

```vue
<SearchSelect v-model="selected" :options="options">
  <template #no-results>
    <div>😢 Nothing found!</div>
  </template>
</SearchSelect>
```

### `loading`
Customize the loading state.

```vue
<SearchSelect v-model="selected" :options="options" :loading="isLoading">
  <template #loading>
    <div>⏳ Loading...</div>
  </template>
</SearchSelect>
```

## 💡 Examples

### Multi-select with Checkboxes

```vue
<SearchSelect 
  v-model="selected" 
  :options="options"
  multiple
  checkbox
  checkbox-position="left"
  clearable
/>
```

### Remote Search

```vue
<script setup>
import { ref } from 'vue';

const selected = ref('');
const options = ref([]);
const loading = ref(false);

const handleSearch = async (query) => {
  if (!query) return;
  loading.value = true;
  const response = await fetch(`/api/search?q=${query}`);
  options.value = await response.json();
  loading.value = false;
};
</script>

<template>
  <SearchSelect 
    v-model="selected" 
    :options="options"
    :loading="loading"
    remote
    @search="handleSearch"
  />
</template>
```

### Hide Selected Items

```vue
<SearchSelect 
  v-model="selected" 
  :options="options"
  multiple
  hide-selected
/>
```

### Opt-out Specific Options

```vue
<SearchSelect 
  v-model="selected" 
  :options="options"
  :opt-out="['disabled-value-1', 'disabled-value-2']"
/>
```

### Custom Card Template

```vue
<SearchSelect v-model="selected" :options="users">
  <template #option="{ option }">
    <div style="display: flex; gap: 12px; padding: 8px;">
      <img :src="option.avatar" style="width: 40px; height: 40px; border-radius: 50%;" />
      <div>
        <div><strong>{{ option.name }}</strong></div>
        <div style="font-size: 12px; color: #999;">{{ option.email }}</div>
      </div>
    </div>
  </template>
</SearchSelect>
```

## 🎨 Styling

The component comes with default styles. You can override them using CSS variables or by targeting the component classes:

```css
.search-select-control {
  /* Customize the input control */
}

.search-select-dropdown {
  /* Customize the dropdown */
}

.search-select-option {
  /* Customize option items */
}

.search-select-option.is-selected {
  /* Customize selected items */
}
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
