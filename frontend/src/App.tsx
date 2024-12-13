import React, { useState } from 'react';
import { useLogInMutation } from './graphql/logIn.generated';
import useSafeAsync from './hooks/useSafeAsync.ts';

function App() {
  const safeAsync = useSafeAsync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logIn, {loading, error, data}] = useLogInMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await logIn({variables: {email, password}});
  };

  return (
    <div>
      <h1>Log In</h1>
      <form onSubmit={safeAsync(handleSubmit)}>
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); }}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
      {data && <p>Logged in!</p>}
    </div>
  );
}

export default App;
