import ErrorNotification from '@components/ErrorNotification.tsx';
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/montserrat/300.css'; // Light
import '@fontsource/montserrat/400.css'; // Regular
import '@fontsource/montserrat/500.css'; // Medium
import '@fontsource/montserrat/700.css'; // Bold
import App from 'src/App.tsx';
import 'src/App.scss';
import ApiProvider from 'src/providers/ApiProvider.tsx';

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#171b1c',
        paper: '#101415',
      },
      primary: {
        main: '#946E15',
      },
    },
    typography: {
      fontFamily: 'Montserrat, Arial, sans-serif',
    },
  }),
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        Components={{
          error: ErrorNotification,
        }}
        classes={{
          root: 'overwrite-root-notistack',
        }}
      >
        <ApiProvider>
          <App/>
        </ApiProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
