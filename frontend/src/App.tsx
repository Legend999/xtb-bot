import LoginForm from '@components/LoginForm.tsx';
import MainView from '@components/MainView.tsx';
import useIsLoggedIn from '@hooks/useIsLoggedIn.ts';

function App() {
  const isLoggedIn = useIsLoggedIn();

  return isLoggedIn ? <MainView/> : <LoginForm/>;
}

export default App;
