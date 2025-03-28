import useSafeAsync from '@hooks/useSafeAsync.ts';
import {
  Box,
  Button,
  CircularProgress,
  keyframes,
  Paper,
  Typography,
} from '@mui/material';
import React, { ReactNode } from 'react';

interface LogInFormWrapperProps {
  children: ReactNode;
  loading: boolean;
  onSubmit: () => Promise<void>;
}

function LoginFormWrapper({
  children,
  loading,
  onSubmit,
}: LogInFormWrapperProps) {
  const safeAsync = useSafeAsync();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  const gradientAnimation = keyframes`
      0% {
          background-position: 0 50%;
      }
      50% {
          background-position: 100% 50%;
      }
      100% {
          background-position: 0 50%;
      }
  `;

  return (
    <Paper
      elevation={4} style={{
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto',
    }}
    >
      <Typography variant="h3" gutterBottom sx={{textAlign: 'center'}}>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            fontWeight: 'bold',
            letterSpacing: 2,
            textTransform: 'uppercase',
            background: 'linear-gradient(30deg, #322508, #946E15, #322508)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: `${gradientAnimation} 5s ease-in-out infinite`,
          }}
        >
          XTB BOT
        </Box>
      </Typography>
      <form
        onSubmit={safeAsync(handleSubmit)} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
      >
        {children}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          sx={{
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        >
          {loading ? <CircularProgress size={24}/> : 'Log In'}
        </Button>
      </form>
    </Paper>
  );
}

export default LoginFormWrapper;
