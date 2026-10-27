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

`vue` (3.5 or newer) is a peer dependency. Import the stylesheet once, for example in your app entry:

```ts
import 'search-select-vue/style.css';
```

## 🚀 Basic Usage

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { SearchSelect } from 'search-select-vue';
import 'search-select-vue/style.css';

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
import 'search-select-vue/style.css';

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
| `reduce` | `Function` | - | Map an option to the value stored in `v-model` (used for selection checks too) |

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
- `active` - Boolean indicating if option is highlighted (keyboard or mouse)

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

## ⌨️ Keyboard

| Key | Action |
|-----|--------|
| `↓` / `↑` | Open the dropdown, then move the highlight |
| `Enter` | Open, or select the highlighted option |
| `Space` | Same as `Enter` when the search input isn't focused |
| `Home` / `End` | Jump to the first / last option (when the search input isn't focused) |
| `Escape` | Close the dropdown |
| `Tab` | Close the dropdown and move focus on |

The component uses the WAI-ARIA combobox / listbox pattern (`aria-expanded`, `aria-activedescendant`, `aria-selected`), so screen readers announce the highlighted option.

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

The component comes with default styles (`search-select-vue/style.css`). Tweak them with CSS variables:

```css
.search-select {
  --ss-font-family: inherit;
  --ss-border-color: #ccc;
  --ss-border-radius: 4px;
  --ss-background: white;
  --ss-focus-color: #007bff;
  --ss-focus-ring: rgba(0, 123, 255, 0.25);
  --ss-placeholder-color: #757575;
  --ss-muted-color: #666;
  --ss-dropdown-max-height: 200px;
  --ss-dropdown-z-index: 1000;
  --ss-option-active-background: #f0f0f0;
  --ss-option-selected-background: #e6f7ff;
  --ss-option-selected-color: #0062cc;
  --ss-option-selected-active-background: #cceeff;
}
```

Or target the component classes:

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

## 🛠️ Development

```bash
npm install
npm run dev     # demo app
npm test        # unit tests (Vitest)
npm run build   # library build + type declarations
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
