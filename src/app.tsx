import { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { AuthProvider } from './contexts/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import Home from './routes';
import SignIn from './routes/auth/signin';
import SignUp from './routes/auth/signup';
import ForgotPassword from './routes/auth/forgot-password';
import ResetPassword from './routes/auth/reset-password';
import Chat from './routes/chat';
import AuthCallback from './routes/auth/callback';
import "./app.css";


const App: Component = () => {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/chat" component={Chat} />
          <Route path="/chat/:id" component={Chat} />
          <Route path="/auth/callback" component={AuthCallback} />
        </Router>
      </ConfirmProvider>
    </AuthProvider>
  );
};

export default App;
