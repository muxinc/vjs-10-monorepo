import * as React from 'react';
// @ts-ignore - Icon module resolution
import PauseIcon from '../icons/PauseIcon';
// @ts-ignore - Icon module resolution
import PlayIcon from '../icons/PlayIcon';
import PlayButton from '../components/connected-with-defaults/PlayButton';
import MuteButton from '../components/connected-with-defaults/MuteButton';
// @ts-ignore - Icon module resolution
import VolumeHighIcon from '../icons/VolumeHighIcon';
// @ts-ignore - Icon module resolution
import VolumeLowIcon from '../icons/VolumeLowIcon';
// @ts-ignore - Icon module resolution
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
