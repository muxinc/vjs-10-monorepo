import * as React from 'react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
import PlayButton from '../components/PlayButton';
import MuteButton from '../components/MuteButton';
import {
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@vjs-10/react-icons';
import styles from './styles.module.css';

export const MediaSkinDefault: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className={styles.Container}>
      {children}
      <div className={styles.Overlay}>
        <div className={styles.Spacer}></div>
        <div className={styles.ControlBar}>
          {/* @ts-ignore */}
          <PlayButton className={styles.MediaPlayButton}>
            <PlayIcon className={styles.PlayIcon}></PlayIcon>
            <PauseIcon className={styles.PauseIcon}></PauseIcon>
          </PlayButton>
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
        </div>
      </div>
    </div>
  );
};
