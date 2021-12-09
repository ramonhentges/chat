import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import React from 'react';
import { Login } from '../pages/Aplicacao/Login';
import InitialPage from '../pages/Aplicacao/InitialPage';
import { useAuth } from '../contexts/Auth';
import { CreateAccount } from '../pages/Aplicacao/CreateAccount';
import { ConversationProvider } from '../contexts/Conversation';

const PrivateRoute = ({ children }: any) => {
  const { signed } = useAuth();
  return signed ? children : <Navigate to="/login" />;
};
const MyRoutes: React.FC = () => {
  const { loading } = useAuth();

  return loading ? (
    <h1> Loading... </h1>
  ) : (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <PrivateRoute>
              <ConversationProvider>
                <InitialPage />
              </ConversationProvider>
            </PrivateRoute>
          }
          path="/"
        />
        <Route path="/createAccount" element={<CreateAccount />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MyRoutes;
