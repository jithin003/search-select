import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import SearchSelect from '../SearchSelect.vue';

const frameworks = [
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
];

let wrapper: VueWrapper<any> | undefined;

const factory = (props: Record<string, any> = {}, slots: Record<string, any> = {}) => {
  wrapper = mount(SearchSelect, {
    props: {
      options: frameworks,
      'onUpdate:modelValue': (v: any) => wrapper!.setProps({ modelValue: v }),
      ...props,
    },
    slots,
    attachTo: document.body,
  });
  return wrapper;
};

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const openDropdown = async (w: VueWrapper<any>) => {
  await w.find('.search-select-control').trigger('click');
};

const optionLabels = (w: VueWrapper<any>) =>
  w.findAll('.search-select-option').map(o => o.text());

describe('SearchSelect', () => {
  it('shows the placeholder and the selected label', async () => {
    const w = factory({ placeholder: 'Pick one' });
    expect(w.find('.search-select-value').text()).toBe('Pick one');
    await w.setProps({ modelValue: 'react' });
    expect(w.find('.search-select-value').text()).toBe('React');
  });

  it('filters options locally by search query', async () => {
    const w = factory();
    await openDropdown(w);
    await w.find('input.search-select-input').setValue('an');
    expect(optionLabels(w)).toEqual(['Angular']);
  });

  it('focuses the search input when opened', async () => {
    const w = factory();
    await openDropdown(w);
    await w.vm.$nextTick();
    expect(document.activeElement).toBe(w.find('input.search-select-input').element);
  });

  it('selects an option on click and closes', async () => {
    const w = factory();
    await openDropdown(w);
    await w.findAll('.search-select-option')[1]!.trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual(['react']);
    expect(w.find('.search-select-dropdown').exists()).toBe(false);
  });

  it('toggles values in multiple mode', async () => {
    const w = factory({ multiple: true, modelValue: [] });
    await openDropdown(w);
    await w.findAll('.search-select-option')[0]!.trigger('click');
    await w.findAll('.search-select-option')[2]!.trigger('click');
    expect(w.props('modelValue')).toEqual(['vue', 'angular']);
    await w.findAll('.search-select-option')[0]!.trigger('click');
    expect(w.props('modelValue')).toEqual(['angular']);
    expect(w.find('.search-select-dropdown').exists()).toBe(true);
  });

  it('selects when the checkbox itself is clicked', async () => {
    const w = factory({ multiple: true, modelValue: [], checkbox: true });
    await openDropdown(w);
    await w.findAll('.search-select-checkbox')[1]!.trigger('click');
    expect(w.props('modelValue')).toEqual(['react']);
    expect((w.findAll('.search-select-checkbox')[1]!.element as HTMLInputElement).checked).toBe(true);
  });

  it('treats reduced values as selected and labels them', async () => {
    const w = factory({ reduce: (item: any) => item.label });
    await openDropdown(w);
    await w.findAll('.search-select-option')[0]!.trigger('click');
    expect(w.props('modelValue')).toBe('Vue.js');
    expect(w.find('.search-select-value').text()).toBe('Vue.js');
    await openDropdown(w);
    expect(w.findAll('.search-select-option')[0]!.classes()).toContain('is-selected');
  });

  it('keeps the selected label when remote options change', async () => {
    const w = factory({ remote: true });
    await openDropdown(w);
    await w.findAll('.search-select-option')[2]!.trigger('click');
    await w.setProps({ options: [] });
    expect(w.find('.search-select-value').text()).toBe('Angular');
  });

  it('does not filter locally in remote mode and emits search', async () => {
    const w = factory({ remote: true });
    await openDropdown(w);
    await w.find('input.search-select-input').setValue('zzz');
    expect(optionLabels(w)).toHaveLength(3);
    const searches = w.emitted('search')!;
    expect(searches[searches.length - 1]).toEqual(['zzz']);
  });

  it('hides selected and opted-out options', async () => {
    const w = factory({ multiple: true, modelValue: ['vue'], hideSelected: true, optOut: ['react'] });
    await openDropdown(w);
    expect(optionLabels(w)).toEqual(['Angular']);
  });

  it('clears the selection', async () => {
    const w = factory({ clearable: true, modelValue: 'vue' });
    await w.find('.search-select-clear').trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual([null]);
    expect(w.find('.search-select-clear').exists()).toBe(false);
  });

  it('supports keyboard navigation', async () => {
    const w = factory();
    const control = w.find('.search-select-control');
    await control.trigger('keydown', { key: 'ArrowDown' });
    expect(w.find('.search-select-dropdown').exists()).toBe(true);
    const input = w.find('input.search-select-input');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(w.findAll('.search-select-option')[2]!.classes()).toContain('is-active');
    expect(input.attributes('aria-activedescendant')).toBe(w.findAll('.search-select-option')[2]!.attributes('id'));
    await input.trigger('keydown', { key: 'Enter' });
    expect(w.props('modelValue')).toBe('angular');
    expect(w.find('.search-select-dropdown').exists()).toBe(false);
  });

  it('closes on Escape and on outside click, emitting close once', async () => {
    const w = factory();
    await openDropdown(w);
    await w.find('input.search-select-input').trigger('keydown', { key: 'Escape' });
    expect(w.find('.search-select-dropdown').exists()).toBe(false);
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(w.emitted('close')).toHaveLength(1);

    await openDropdown(w);
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.find('.search-select-dropdown').exists()).toBe(false);
    expect(w.emitted('close')).toHaveLength(2);
  });

  it('does not open when disabled', async () => {
    const w = factory({ disabled: true });
    await openDropdown(w);
    await w.find('.search-select-control').trigger('keydown', { key: 'ArrowDown' });
    expect(w.find('.search-select-dropdown').exists()).toBe(false);
  });

  it('exposes listbox semantics', async () => {
    const w = factory({ multiple: true, modelValue: ['react'] });
    expect(w.find('.search-select-control').attributes('role')).toBe('combobox');
    await openDropdown(w);
    const listbox = w.find('[role="listbox"]');
    expect(listbox.attributes('aria-multiselectable')).toBe('true');
    expect(w.find('input').attributes('aria-controls')).toBe(listbox.attributes('id'));
    expect(w.findAll('[role="option"]').map(o => o.attributes('aria-selected'))).toEqual(['false', 'true', 'false']);
  });

  it('handles primitive and null options without crashing', async () => {
    const w = factory({ options: ['Apple', null, 'Banana'] as any[] });
    await openDropdown(w);
    await w.find('input.search-select-input').setValue('ban');
    expect(optionLabels(w)).toEqual(['Banana']);
  });
});
