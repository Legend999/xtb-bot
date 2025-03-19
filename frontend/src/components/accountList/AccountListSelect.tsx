import { Account } from '@graphql/graphql-types.generated.ts';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface AccountListSelectProps {
  accountList: [Account, ...Account[]];
}

function AccountListSelect({accountList}: AccountListSelectProps) {
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>(accountList[0].number);

  return <FormControl fullWidth>
    <InputLabel id="account-select-label" shrink={!!selectedAccountNumber}>
      Select Account
    </InputLabel>
    <Select
      labelId="account-select-label"
      id="account-select"
      value={selectedAccountNumber}
      label="Select Account"
      onChange={(event) => { setSelectedAccountNumber(event.target.value); }}
      notched={!!selectedAccountNumber}
      disabled={true} // @todo: enable when the feature is implemented
      title="Changing accounts is not implemented yet"
    >
      {accountList.map((account: Account) => (
        <MenuItem key={account.number} value={account.number}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Typography>
              {account.type} {account.number}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Currency: {account.currency}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>;
}

export default AccountListSelect;
