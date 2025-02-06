import { Alert } from '@mui/material';
import { closeSnackbar, CustomContentProps } from 'notistack';
import { RefAttributes } from 'react';

interface ErrorNotificationProps extends CustomContentProps, RefAttributes<HTMLDivElement> {
}

function ErrorNotification({id, message, ref}: ErrorNotificationProps) {
  return (
    <Alert
      ref={ref}
      severity="error"
      variant="filled"
      onClose={() => { closeSnackbar(id); }}
      sx={{
        '& .MuiAlert-action': {
          padding: '2px 0 0 16px',
          '& .MuiIconButton-root:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      }}
    >
      {message}
    </Alert>
  );
}

export default ErrorNotification;
