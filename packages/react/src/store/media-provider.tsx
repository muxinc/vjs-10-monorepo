/** @TODO !!! Revisit for SSR (CJP) */
import type { ReactNode } from 'react';

import { createMediaStore } from '@videojs/core/store';

import { useMemo } from 'react';
import { MediaContext } from './context';

export function MediaProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useMemo(() => createMediaStore(), []);

  // useEffect(() => {
  //   value?.dispatch({
  //     type: 'documentelementchangerequest',
  //     detail: globalThis.document,
  //   });
  //   return () => {
  //     value?.dispatch({
  //       type: 'documentelementchangerequest',
  //       detail: undefined,
  //     });
  //   };
  // }, []);

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}
