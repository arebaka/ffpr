import { createSignal, type JSX } from 'solid-js';
import { render } from 'solid-js/web';
import { afterEach, assert, describe, expect, test, vi } from 'vitest';

import { EditForm, Select } from '@/ui';

let dispose: (() => void) | undefined;

function mount(component: () => JSX.Element): HTMLElement {
	const root = document.createElement('div');
	document.body.append(root);
	dispose = render(component, root);
	return root;
}

afterEach(() => {
	dispose?.();
	document.body.replaceChildren();
});

describe('ui', () => {
	test('Select reports the chosen option', () => {
		const onChange = vi.fn<(value: 'switch' | 'pc') => void>();
		const options = [
			['switch', 'Nintendo Switch'],
			['pc', 'PC'],
		] as const;
		const root = mount(() => (
			<Select
				value='pc'
				options={options}
				label='Platform'
				onChange={onChange}
			/>
		));
		const select = root.querySelector('select');
		assert(select !== null);
		expect(select.value).toBe('pc');

		select.value = 'switch';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		expect(onChange).toHaveBeenCalledWith('switch');
	});

	test('EditForm buttons follow the state of the form', () => {
		const [state, setState] = createSignal({
			canSubmit: true,
			changed: false,
		});
		const root = mount(() => (
			<EditForm
				state={state}
				onSubmit={() => Promise.resolve()}
				onReset={() => {}}
			>
				<input aria-label='Gil' />
			</EditForm>
		));
		const [apply, reset] = root.querySelectorAll('button');
		expect(apply?.disabled).toBe(true);
		expect(reset?.disabled).toBe(true);

		setState({ canSubmit: true, changed: true });
		expect(apply?.disabled).toBe(false);
		expect(reset?.disabled).toBe(false);

		setState({ canSubmit: false, changed: true });
		expect(apply?.disabled).toBe(true);
	});
});
