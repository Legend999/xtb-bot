import { useAccountListQuery } from '@graphql/accountList.generated.ts'; // Adjust the path as needed
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

function AccountList() {
  const {data, loading, error} = useAccountListQuery();

  if (loading) {
    return <CircularProgress/>;
  }

  if (error) {
    return <Typography color="error">Failed to load accounts: {error.message}</Typography>;
  }

  if (!data?.accountList.length) {
    return <Typography>No accounts found</Typography>;
  }

  return (
    <List>
      {data.accountList.map((account) => (
        <ListItem key={account.number} divider>
          <ListItemText
            primary={`${account.type} ${account.number}`}
            secondary={`Currency: ${account.currency}`}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default AccountList;
