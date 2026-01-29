// Version formatting utilities

/**
 * Formats a version number with optional 'v' prefix
 * @param versionNumber - The version number from database
 * @param includePrefix - Whether to include 'v' prefix (default: true)
 * @returns Formatted version string
 * 
 * Examples:
 * - formatVersion('18.0') => 'v18.0'
 * - formatVersion('18.0', false) => '18.0'
 * - formatVersion('v18.0') => 'v18.0' (doesn't duplicate)
 */
export function formatVersion(versionNumber: string, includePrefix: boolean = true): string {
    if (!versionNumber) return '';

    // Remove existing 'v' prefix if present
    const cleanVersion = versionNumber.startsWith('v') || versionNumber.startsWith('V')
        ? versionNumber.slice(1)
        : versionNumber;

    return includePrefix ? `v${cleanVersion}` : cleanVersion;
}

/**
 * Checks if a version number already has a 'v' prefix
 */
export function hasVersionPrefix(versionNumber: string): boolean {
    return versionNumber?.startsWith('v') || versionNumber?.startsWith('V');
}
