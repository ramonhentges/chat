import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Login } from '../../interfaces/login';
import { User } from '../../models/user';
import { api } from '../../services/api';
import { login } from '../../services/auth.service';
import { myUserInfo } from '../../services/user.service';
import { socket, setAuthorizationToken } from '../../services/socket.service';
import { plainToInstance } from 'class-transformer';
import { HttpStatus } from '../../enum/http-status.enum';

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
    const response = await login(loginUser);
    if (response.status === 200) {
      api.defaults.headers.common[
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
    api.defaults.headers.common['Authorization'] = '';
    setAuthorizationToken('');
    setUser(null);
    socket.off('disconnect');
    socket.disconnect();
  }

  const getUserInfo = useCallback(async () => {
    const { status, data } = await myUserInfo();
    if (status === 200) {
      socket.connect();
      setUser(plainToInstance(User, data));
    } else if (status === 401) {
      signOut();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function getInfo() {
      await getUserInfo();
    }
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      const token = JSON.parse(storedToken).accessToken;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthorizationToken(token);
      getInfo();
    } else {
      setLoading(false);
    }
  }, [getUserInfo]);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      undefined,
      async (err) => {
        if (err.response === undefined) {
          return { status: HttpStatus.INTERNAL_SERVER_ERROR };
        }
        if (err.response.status === HttpStatus.UNAUTHORIZED && user) {
          //openAlert('Sua sessão expirou, realize o login novamente.', 'info');
          signOut();
          return err.response;
        }
        if (err.response.data instanceof Blob) {
          try {
            let resText = await new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.addEventListener('abort', reject);
              reader.addEventListener('error', reject);
              reader.addEventListener('loadend', () => {
                resolve(reader.result);
              });
              reader.readAsText(err.response.data);
            });
            const data = JSON.parse(`${resText}`);
            return { ...err.response, data };
          } catch (err) {}
        }
        return err.response;
      }
    );
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
