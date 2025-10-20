import { atom } from 'nanostores';

export type Framework = 'html' | 'react';
export type Skin = 'frosted' | 'minimal';
export type Media = 'video' | 'hls-video';

export const framework = atom<Framework>('react');
export const skin = atom<Skin>('frosted');
export const media = atom<Media>('video');
