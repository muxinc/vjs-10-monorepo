import type { IconComponent, IconProps } from '@/components/Icon';

import { Icon } from '@/components/Icon';
import {
  fullscreenExitPaths,
  fullscreenPaths,
  mutePaths,
  pausePaths,
  playPaths,
  volumeHighPaths,
  volumeLowPaths,
} from '@vjs-10/icons';

export const defaultSkinIcons: DefaultSkinIcons = {
  PlayButton: {
    Play: createIcon(playPaths),
    Pause: createIcon(pausePaths),
  },
  MuteButton: {
    VolumeOff: createIcon(mutePaths),
    VolumeLow: createIcon(volumeLowPaths),
    VolumeHigh: createIcon(volumeHighPaths),
  },
  FullscreenButton: {
    Enter: createIcon(fullscreenPaths),
    Exit: createIcon(fullscreenExitPaths),
  },
};

export interface PlayButtonIcons {
  Play: IconComponent;
  Pause: IconComponent;
  // Replay: IconComponent;
}

export interface MuteButtonIcons {
  VolumeOff: IconComponent;
  VolumeLow: IconComponent;
  VolumeHigh: IconComponent;
}

export interface FullscreenButtonIcons {
  Enter: IconComponent;
  Exit: IconComponent;
}

export interface DefaultSkinIcons {
  PlayButton: PlayButtonIcons;
  MuteButton: MuteButtonIcons;
  FullscreenButton: FullscreenButtonIcons;
}

function createIcon(paths: string): IconComponent {
  function DefaultSkinIcon(props: IconProps) {
    return <Icon paths={paths} {...props} />;
  }

  DefaultSkinIcon.displayName = 'DefaultSkinIcon';

  return DefaultSkinIcon;
}
