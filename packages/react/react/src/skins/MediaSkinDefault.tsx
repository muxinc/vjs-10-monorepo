import * as React from 'react';
import PauseIcon from '../icons/PauseIcon';
import PlayIcon from '../icons/PlayIcon';
import PlayButton from '../components/connected-with-defaults/PlayButton';
import MuteButton from '../components/connected-with-defaults/MuteButton';
import VolumeHighIcon from '../icons/VolumeHighIcon';
import VolumeLowIcon from '../icons/VolumeLowIcon';
import VolumeOffIcon from '../icons/VolumeOffIcon';
/** @ts-ignore */
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
          <PlayButton className={styles.MediaPlayButton}>
            <PlayIcon className={styles.PlayIcon}></PlayIcon>
            <PauseIcon className={styles.PauseIcon}></PauseIcon>
          </PlayButton>
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
