import type { Sidebar } from '@/types/docs';

export const sidebar: Sidebar = [
	{
		sidebarLabel: 'Concepts',
		contents: [
			{ slug: 'concepts/everyone' },
			{ slug: 'concepts/react-only', frameworks: ['react'] },
			{ slug: 'concepts/tailwind-only', styles: ['tailwind'] },
		],
	},
	{
		sidebarLabel: 'How-To Guides',
		contents: [{ slug: 'how-to/everyone' }],
	},
];
