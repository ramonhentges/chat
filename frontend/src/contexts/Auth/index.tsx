import { plainToInstance } from 'class-transformer';
import { useInjection } from 'inversify-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { LoginDto } from '../../dto/login';
import { HttpStatus } from '../../enum/http-status.enum';
import { User } from '../../models/user';
import { AuthService } from '../../ports/services/AuthService';
import { HttpService } from '../../ports/services/HttpService';
import { SocketService } from '../../ports/services/SocketService';
import { UserService } from '../../ports/services/UserService';
import { SERVICE_TYPES } from '../../types/Service';

interface AuthContextProps {
  signed: boolean;
  loading: boolean;
  user: User | null;
  signIn: (loginUser: LoginDto) => Promise<boolean>;
  signOut: () => void;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextProps>(
  {} as AuthContextProps
);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const _authService = useInjection<AuthService>(SERVICE_TYPES.AuthService);
  const _userService = useInjection<UserService>(SERVICE_TYPES.UserService);
  const _httpService = useInjection<HttpService>(SERVICE_TYPES.HttpService);
  const _socketService = useInjection<SocketService>(
    SERVICE_TYPES.SocketService
  );

  async function signIn(loginUser: LoginDto) {
    const response = await _authService.login(loginUser);
    if (response.status === HttpStatus.OK) {
      await getUserInfo();
      _socketService.setAuthorizationToken(response.data.accessToken);
      _socketService.addListner('disconnect', function () {
        console.log('Disconnected');
        setTimeout(_socketService.connect, 5000);
      });
      _socketService.connect();
      return true;
    }
    return false;
  }

  const signOut = useCallback(() => {
    localStorage.removeItem('accessToken');
    _httpService.setAuthenticationToken('');
    _socketService.setAuthorizationToken('');
    setUser(null);
    _socketService.removeListner('disconnect');
    _socketService.disconnect();
  }, [_httpService, _socketService]);

  const getUserInfo = useCallback(async () => {
    const response = await _userService.myUserInfo().catch((e) => e.response);
    if (response.status === HttpStatus.OK) {
      _socketService.connect();
      setUser(plainToInstance(User, response.data));
    } else if (response.status === HttpStatus.UNAUTHORIZED) {
      console.log('aquii');
      signOut();
    }
    setLoading(false);
  }, [_userService, signOut, _socketService]);

  useEffect(() => {
    async function getInfo() {
      await getUserInfo();
    }
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      const token = JSON.parse(storedToken).accessToken;
      _httpService.setAuthenticationToken(token);
      _socketService.setAuthorizationToken(token);
      getInfo();
    } else {
      setLoading(false);
    }
  }, [getUserInfo, _httpService, _socketService]);

  useEffect(() => {
    const responseInterceptor = _httpService.addResponseInterceptor(
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
      _httpService.removeResponseInterceptor(responseInterceptor);
    };
  }, [user, _httpService, signOut]);

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signOut,
        refreshUserInfo: getUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
