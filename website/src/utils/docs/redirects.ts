import {
	type SupportedFramework,
	type SupportedStyle,
} from '@/types/docs';
import { findFirstGuide } from '@/utils/docs/sidebar';

/**
 * Get the redirect URL for a given framework and style combination.
 * Finds the first available guide and returns the full docs URL.
 * Throws an error if no guide is available (fails at build time).
 *
 * @param framework - The framework to redirect to
 * @param style - The style to redirect to
 * @returns The full docs URL to redirect to
 * @throws Error if no guide is available for the given framework/style
 */
export function getDocsRedirectUrl<F extends SupportedFramework>(
	framework: F,
	style: SupportedStyle<F>,
): string {
	const firstGuide = findFirstGuide(framework, style);

	if (!firstGuide) {
		throw new Error(
			`No guide available for framework "${framework}" and style "${style}"`,
		);
	}

	return `/docs/framework/${framework}/style/${style}/${firstGuide}/`;
}
