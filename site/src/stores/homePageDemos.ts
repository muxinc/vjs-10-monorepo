import { atom } from 'nanostores';

export type Framework = 'html' | 'react';
export type Skin = 'frosted' | 'minimal';

export const framework = atom<Framework>('react');
export const skin = atom<Skin>('frosted');
