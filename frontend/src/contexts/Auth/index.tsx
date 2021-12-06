import { AxiosResponse } from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Login } from '../../interfaces/login';
import { User } from '../../models/user';
import { api } from '../../services/api';
import { login } from '../../services/auth.service';
import { myUserInfo } from '../../services/user.service';
import { socket, setAuthorizationToken } from '../../services/socket.service';

interface AuthContextProps {
  signed: boolean;
  loading: boolean;
  user: User | null;
  signIn: (loginUser: Login) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextProps>(
  {} as AuthContextProps
);

function reconnect() {
  socket.connect();
}

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signIn(loginUser: Login) {
    const response: AxiosResponse = await login(loginUser);
    if (response.status === 200) {
      api.defaults.headers[
        'Authorization'
      ] = `Bearer ${response.data.accessToken}`;
      localStorage.setItem('accessToken', JSON.stringify(response.data));
      await getUserInfo();
      setAuthorizationToken(response.data.accessToken);
      socket.on('disconnect', function () {
        console.log('Disconnected');
        setTimeout(reconnect, 5000);
      });
      socket.connect();
      return true;
    }
    return false;
  }

  function signOut() {
    localStorage.removeItem('accessToken');
    api.defaults.headers['Authorization'] = null;
    setAuthorizationToken('');
    setUser(null);
    socket.off('disconnect');
    socket.disconnect();
  }

  const getUserInfo = useCallback(async () => {
    const response = await myUserInfo();
    if (response.status === 200) {
      socket.connect();
      setUser(response.data);
    } else if (response.status === 401) {
      signOut();
    }
  }, []);

  useEffect(() => {
    async function getInfo() {
      await getUserInfo();
    }
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      const token = JSON.parse(storedToken).accessToken;
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      setAuthorizationToken(token);
      getInfo();
    }
    setLoading(false);
  }, [getUserInfo]);

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
