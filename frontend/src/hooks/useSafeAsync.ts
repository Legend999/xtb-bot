import { useCallback } from 'react';

function useSafeAsync() {
  return useCallback(
    (asyncFunction: (...args: any[]) => Promise<any>) =>
      (...args: any[]) => {
        asyncFunction(...args).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error); // @todo show notification
        });
      },
    [],
  );
}

export default useSafeAsync;
