/**
 * Utility functions for avatar management
 */

// List of available avatar files (based on what's in public/avatar folder)
const AVATAR_FILES = [
  'avatar2.png', 'avatar4.png', 'avatar5.png', 'avatar6.png', 'avatar7.png', 'avatar8.png', 'avatar9.png', 'avatar10.png',
  'avatar11.png', 'avatar12.png', 'avatar13.png', 'avatar14.png', 'avatar15.png', 'avatar17.png', 'avatar19.png', 'avatar20.png',
  'avatar21.png', 'avatar22.png', 'avatar23.png', 'avatar24.png', 'avatar25.png', 'avatar26.png', 'avatar27.png', 'avatar28.png',
  'avatar30.png', 'avatar32.png', 'avatar33.png', 'avatar34.png', 'avatar35.png', 'avatar36.png', 'avatar37.png', 'avatar38.png',
  'avatar39.png', 'avatar40.png', 'avatar41.png', 'avatar43.png', 'avatar44.png', 'avatar45.png', 'avatar46.png', 'avatar47.png',
  'avatar48.png', 'avatar49.png', 'avatar50.png', 'avatar52.png', 'avatar53.png', 'avatar54.png', 'avatar55.png', 'avatar56.png',
  'avatar57.png', 'avatar60.png', 'avatar61.png', 'avatar62.png', 'avatar63.png', 'avatar64.png', 'avatar67.png', 'avatar68.png',
  'avatar69.png', 'avatar70.png', 'avatar71.png', 'avatar74.png', 'avatar75.png', 'avatar76.png', 'avatar77.png', 'avatar80.png',
  'avatar81.png', 'avatar82.png', 'avatar85.png', 'avatar88.png', 'avatar94.png', 'avatar95.png', 'avatar96.png', 'avatar97.png',
  'avatar98.png', 'avatar99.png'
];

// Admin-only avatars (restricted to NEXT_PUBLIC_ADMIN_USER_ID)
const ADMIN_ONLY_AVATARS = [
  'PIXELATED KISSES JOJI.jpeg',
  'Cowboy Bebop.jpeg',
  'anime.jpeg',
  'anime2.jpeg',
  'Itadori Yuji Icons.jpeg',
  'Suguru Geto.jpeg',
  'weeknd.jpeg',
  'weeknd2.jpeg'
];

/**
 * Get a random avatar path
 * @returns A random avatar file path
 */
export function getRandomAvatar(): string {
  const randomIndex = Math.floor(Math.random() * AVATAR_FILES.length);
  return `/avatar/${AVATAR_FILES[randomIndex]}`;
}

/**
 * Get all available avatars
 * @returns Array of all available avatar file paths
 */
export function getAllAvatars(): string[] {
  return AVATAR_FILES.map(file => `/avatar/${file}`);
}

/**
 * Get avatars available for a specific user (filters out admin-only avatars for non-admin users)
 * @param userId - The user ID to check permissions for
 * @param adminUserId - The admin user ID from environment
 * @returns Array of avatar file paths available to the user
 */
export function getAvatarsForUser(userId: string, adminUserId?: string): string[] {
  const isAdmin = adminUserId && userId === adminUserId;
  
  if (isAdmin) {
    // Admin users get admin-only avatars first, then regular avatars
    const adminAvatars = ADMIN_ONLY_AVATARS.map(file => `/avatar/admin/${file}`);
    const regularAvatars = AVATAR_FILES.map(file => `/avatar/${file}`);
    return [...adminAvatars, ...regularAvatars];
  } else {
    // Non-admin users get all avatars except admin-only ones
    const availableAvatars = AVATAR_FILES.filter(file => !ADMIN_ONLY_AVATARS.includes(file));
    return availableAvatars.map(file => `/avatar/${file}`);
  }
}

/**
 * Check if an avatar is restricted to admin users only
 * @param avatarPath - The avatar path to check
 * @returns True if the avatar is admin-only
 */
export function isAdminOnlyAvatar(avatarPath: string): boolean {
  const fileName = avatarPath.split('/').pop();
  return fileName ? ADMIN_ONLY_AVATARS.includes(fileName) : false;
}

/**
 * Get avatar by index
 * @param index The index of the avatar (0-based)
 * @returns The avatar file path at the given index
 */
export function getAvatarByIndex(index: number): string {
  if (index < 0 || index >= AVATAR_FILES.length) {
    throw new Error(`Avatar index ${index} is out of range. Available avatars: 0-${AVATAR_FILES.length - 1}`);
  }
  return `/avatar/${AVATAR_FILES[index]}`;
}
