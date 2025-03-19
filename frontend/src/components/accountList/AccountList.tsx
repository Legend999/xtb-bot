import { useAccountListQuery } from '@graphql/accountList.generated.ts';
import { CircularProgress, Typography } from '@mui/material';
import { isNonEmptyArray } from '@utils/array.ts';
import AccountListSelect from 'src/components/accountList/AccountListSelect';

function AccountList() {
  const {data, loading, error} = useAccountListQuery();

  if (loading) {
    return <CircularProgress/>;
  }

  if (error) {
    return <Typography color="error">Failed to load accounts: {error.message}</Typography>;
  }

  if (!(data && isNonEmptyArray(data.accountList))) {
    return <Typography>No accounts found</Typography>;
  }

  return <AccountListSelect accountList={data.accountList}/>;
}

export default AccountList;
