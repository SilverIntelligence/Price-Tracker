import { MenuLink } from './types.js';

/**
 * Navigation menu links displayed on the price card
 * Icons use Devvit's built-in icon set
 */
export const LINKS: MenuLink[] = [
  {
    icon: 'home',
    label: 'Home',
    url: 'https://reddit.com/r/WallStreetSilver/',
  },
  {
    icon: 'star-fill',
    label: 'Call The Close',
    url: 'https://reddit.com/r/WallStreetSilver/search?q=call+the+close&restrict_sr=1',
  },
  {
    icon: 'link',
    label: 'Want More Silver?',
    url: 'https://wallstreetsilver.com',
  },
  {
    icon: 'chat',
    label: 'Discord',
    url: 'https://discord.gg/wallstreetsilver',
  },
  {
    icon: 'topic-activism',
    label: 'X',
    url: 'https://x.com/wallstreetsilv',
  },
  {
    icon: 'play',
    label: 'YouTube',
    url: 'https://youtube.com/@wallstreetsilver',
  },
  {
    icon: 'settings',
    label: 'Admin',
    url: 'https://mod.reddit.com/r/WallStreetSilver',
  },
];

/**
 * Get menu links with URLs from app settings
 */
export function getMenuLinks(settings?: {
  discord?: string;
  x?: string;
  youtube?: string;
}): MenuLink[] {
  if (!settings) return LINKS;

  return LINKS.map((link) => {
    if (link.label === 'Discord' && settings.discord) {
      return { ...link, url: settings.discord };
    }
    if (link.label === 'X' && settings.x) {
      return { ...link, url: settings.x };
    }
    if (link.label === 'YouTube' && settings.youtube) {
      return { ...link, url: settings.youtube };
    }
    return link;
  });
}
