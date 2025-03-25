import LoginFormWrapper from '@components/login/LoginFormWrapper.tsx';
import { useLogInMutation } from '@graphql/logIn.generated.ts';
import { LogInStatusDocument } from '@graphql/logInStatus.generated.ts';
import { TextField } from '@mui/material';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logIn, {loading}] = useLogInMutation({refetchQueries: [LogInStatusDocument]});

  const onSubmit = async () => {
    await logIn({variables: {email, password}});
  };

  return (
    <LoginFormWrapper loading={loading} onSubmit={onSubmit}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); }}
        required
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); }}
        required
        fullWidth
      />
    </LoginFormWrapper>
  );
}

export default LoginForm;
