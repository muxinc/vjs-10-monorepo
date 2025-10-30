export const SITE_TITLE = 'Video.js 10';
export const SITE_DESCRIPTION = `For over 15 years, Video.js has been the world's web video player. Now rebuilt in v10 for modern development and performance.`;
export const GITHUB_REPO_URL = 'https://github.com/videojs/v10/';
export const DISCORD_INVITE_URL = 'https://discord.gg/Zmk4DbtHUs';
export const THEME_KEY = 'vjs-site-theme';

/**
 * Video source for demos and examples throughout the site,
 * wherever JS is used. HTML examples use a separate hardcoded source.
 */
interface VideoSource {
  id: string;
  hls: string;
  mp4: string;
  poster: string;
}

export const VJS8_DEMO_VIDEO: VideoSource = {
  id: 'UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA',
  hls: 'https://stream.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA.m3u8',
  mp4: 'https://stream.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA/high.mp4',
  poster: 'https://image.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA/thumbnail.webp',
};
