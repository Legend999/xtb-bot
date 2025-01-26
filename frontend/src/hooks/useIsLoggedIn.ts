import { useLoggedInQuery } from '@graphql/loggedIn.generated.ts';
import useSafeAsync from '@hooks/useSafeAsync.ts';
import { useEffect } from 'react';

const useIsLoggedIn = (): boolean => {
  const safeAsync = useSafeAsync();
  const {
    data,
    loading,
    error,
    refetch,
  } = useLoggedInQuery({fetchPolicy: 'no-cache'});

  useEffect(() => {
    const handlePageShow = () => {
      if (!document.hidden) {
        safeAsync(refetch)();
      }
    };

    window.addEventListener('visibilitychange', handlePageShow);

    return () => {
      window.removeEventListener('visibilitychange', handlePageShow);
    };
  }, [refetch, safeAsync]);

  if (loading) return false;
  if (error) return false;
  return data?.loggedIn ?? false;
};

export default useIsLoggedIn;
