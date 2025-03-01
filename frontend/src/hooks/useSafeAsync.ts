import { ApolloError } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

function useSafeAsync() {
  const {enqueueSnackbar} = useSnackbar();

  return useCallback(
    (asyncFunction: (...args: any[]) => Promise<any>) =>
      (...args: any[]) => {
        asyncFunction(...args).catch((error) => {
          if (error instanceof ApolloError) {
            enqueueSnackbar(error.message, {variant: 'error'});
          } else {
            enqueueSnackbar('An unexpected error occurred. Please try again later.', {variant: 'error'});
          }
          
          // eslint-disable-next-line no-console
          console.error(error);
        });
      },
    [enqueueSnackbar],
  );
}

export default useSafeAsync;
