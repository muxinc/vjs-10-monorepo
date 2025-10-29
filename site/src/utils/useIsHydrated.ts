import { useEffect, useState } from 'react';

export default function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsHydrated(true);
  }, []);
  return isHydrated;
}
