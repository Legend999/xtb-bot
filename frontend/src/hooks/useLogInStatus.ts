import { LogInStatus } from '@graphql/graphql-types.generated.ts';
import { useLogInStatusQuery } from '@graphql/logInStatus.generated.ts';
import useSafeAsync from '@hooks/useSafeAsync.ts';
import { useEffect } from 'react';

const useLogInStatus = (): LogInStatus => {
  const safeAsync = useSafeAsync();
  const {
    data,
    loading,
    error,
    refetch,
  } = useLogInStatusQuery({fetchPolicy: 'no-cache'});

  useEffect(() => {
    const handleFocus = () => {
      safeAsync(refetch)();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch, safeAsync]);

  if (loading || error || !data) return LogInStatus.LoggedOut;

  return data.logInStatus;
};

export default useLogInStatus;
