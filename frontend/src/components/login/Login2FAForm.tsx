import LoginFormWrapper from '@components/login/LoginFormWrapper.tsx';
import { useEnter2FaMutation } from '@graphql/enter2fa.generated.ts';
import { LogInStatusDocument } from '@graphql/logInStatus.generated.ts';
import { TextField } from '@mui/material';
import { useState } from 'react';

function Login2FAForm() {
  const [code, setCode] = useState('');
  const [enter2fa, {loading, client}] = useEnter2FaMutation();

  const onSubmit = async () => {
    try {
      await enter2fa({variables: {code}});
    } finally {
      await client.refetchQueries({include: [LogInStatusDocument]});
    }
  };

  return (
    <LoginFormWrapper loading={loading} onSubmit={onSubmit}>
      <TextField
        label="2FA Code"
        type="tel"
        value={code}
        onChange={(e) => { setCode(e.target.value); }}
        required
        fullWidth
        inputMode="numeric"
        slotProps={{
          htmlInput: {
            maxLength: 6,
          },
        }}
      />
    </LoginFormWrapper>
  );
}

export default Login2FAForm;
