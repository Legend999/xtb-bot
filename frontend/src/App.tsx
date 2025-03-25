import Login2FAForm from '@components/login/Login2FAForm.tsx';
import LoginForm from '@components/login/LoginForm.tsx';
import MainView from '@components/MainView.tsx';
import { LogInStatus } from '@graphql/graphql-types.generated.ts';
import useLogInStatus from '@hooks/useLogInStatus.ts';

function App() {
  const logInStatus = useLogInStatus();

  switch (logInStatus) {
    case LogInStatus.LoggedOut:
      return <LoginForm/>;
    case LogInStatus.Require_2Fa:
      return <Login2FAForm/>;
    case LogInStatus.Success:
      return <MainView/>;
  }
}

export default App;
