import type { PropsWithChildren } from 'react';
import { MediaContainer } from '../../components/MediaContainer';
import { TimeSlider } from '../../components/TimeSlider';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXCompoundComponents({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Wrapper}>
        <TimeSlider.Root className={styles.SliderRoot}>
          <TimeSlider.Track className={styles.SliderTrack}>
            <TimeSlider.Progress className={styles.SliderProgress} />
            <TimeSlider.Pointer className={styles.SliderPointer} />
          </TimeSlider.Track>
          <TimeSlider.Thumb className={styles.SliderThumb} />
        </TimeSlider.Root>
      </div>
    </MediaContainer>
  );
}
