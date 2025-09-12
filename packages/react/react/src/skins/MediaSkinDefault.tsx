import * as React from 'react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
import PlayButton from '../components/PlayButton';
import MuteButton from '../components/MuteButton';
import { VolumeRange } from '../components/VolumeRange';
import { TimeRange } from '../components/TimeRange';
import { FullscreenButton } from '../components/FullscreenButton';
import { DurationDisplay } from '../components/DurationDisplay';
import { MediaContainer } from '../components/MediaContainer';
import {
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from '@vjs-10/react-icons';
import styles from './styles.module.css';

export const MediaSkinDefault: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MediaContainer className={styles.Container}>
      {children}
      <div className={styles.Overlay}>
        <div className={styles.Spacer}></div>
        <div className={styles.ControlBar}>
          {/* @ts-ignore */}
          <PlayButton className={styles.MediaPlayButton}>
            <PlayIcon className={styles.PlayIcon}></PlayIcon>
            <PauseIcon className={styles.PauseIcon}></PauseIcon>
          </PlayButton>
          <TimeRange className={styles.TimeRange} />
          <DurationDisplay />
          {/* @ts-ignore */}
          <MuteButton className={`${styles.Button} ${styles.MediaMuteButton}`}>
            <VolumeHighIcon
              className={`${styles.Icon} ${styles.VolumeHighIcon}`}
            ></VolumeHighIcon>
            <VolumeLowIcon
              className={`${styles.Icon} ${styles.VolumeLowIcon}`}
            ></VolumeLowIcon>
            <VolumeOffIcon
              className={`${styles.Icon} ${styles.VolumeOffIcon}`}
            ></VolumeOffIcon>
          </MuteButton>
          <VolumeRange className={styles.VolumeRange} />
          {/* @ts-ignore */}
          <FullscreenButton className={`${styles.Button} ${styles.MediaFullscreenButton}`}>
            <FullscreenEnterIcon
              className={`${styles.Icon} ${styles.FullscreenEnterIcon}`}
            ></FullscreenEnterIcon>
            <FullscreenExitIcon
              className={`${styles.Icon} ${styles.FullscreenExitIcon}`}
            ></FullscreenExitIcon>
          </FullscreenButton>
        </div>
      </div>
    </MediaContainer>
  );
};
