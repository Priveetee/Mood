import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultValue = 'dark';
const initialValue = browser ? window.localStorage.getItem('theme') ?? defaultValue : defaultValue;

export const theme = writable<string>(initialValue);

theme.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('theme', value);
	}
});

export const toggleTheme = () => {
	theme.update((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
};
