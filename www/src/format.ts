const pad = (value: number) => String(value).padStart(2, '0');

export function formatDuration(seconds: number): string {
	const total = Math.floor(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	return `${hours}:${pad(minutes)}:${pad(total % 60)}`;
}

export function parseDuration(text: string): number {
	return text
		.split(':')
		.map(Number)
		.reduce((total, part) => total * 60 + part, 0);
}

export const formatNumber = (value: number) => value.toLocaleString('en-US');
