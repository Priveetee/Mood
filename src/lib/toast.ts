import { browser } from '$app/environment';

const baseConfig = {
	position: 'top-right',
	orderReversed: true,
	entryAnimation: 'windLeftIn',
	exitAnimation: 'windRightOut',
	theme: 'dotted'
};

const errorConfig = {
	...baseConfig,
	showIcon: true,
	iconAnimation: 'jelly',
	iconTimingFunction: 'ease-in-out',
	iconBorderRadius: '50%',
	iconType: 'error'
};

export async function showToast(type: 'success' | 'error', message: string) {
	if (!browser) return;

	const { default: toast } = await import('not-a-toast');
	
	const config = type === 'error' ? errorConfig : baseConfig;
	toast({
		...config,
		message
	});
}
