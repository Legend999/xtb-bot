import { LoggedInDocument } from '@graphql/loggedIn.generated.ts';
import { useLogInMutation } from '@graphql/logIn.generated';
import useSafeAsync from '@hooks/useSafeAsync.ts';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

function LogInForm() {
  const safeAsync = useSafeAsync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logIn, {
    loading,
    error,
  }] = useLogInMutation({refetchQueries: [LoggedInDocument]});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await logIn({variables: {email, password}});
  };

  return (
    <Paper
      elevation={4} style={{
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto',
    }}
    >
      <Typography variant="h5" gutterBottom>
        Log In
      </Typography>
      <form
        onSubmit={safeAsync(handleSubmit)} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
      >
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
        <Box display="flex" justifyContent="center" alignItems="center">
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24}/> : 'Log In'}
          </Button>
        </Box>
      </form>
      {error && (
        <Typography color="error" style={{marginTop: '1rem'}}>
          Error: {error.message}
        </Typography>
      )}
    </Paper>
  );
}

export default LogInForm;
