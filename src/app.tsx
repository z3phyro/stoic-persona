import { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { AuthProvider } from './contexts/AuthContext';
import Home from './routes';
import SignIn from './routes/auth/signin';
import SignUp from './routes/auth/signup';
import Chat from './routes/chat';
import "./app.css";


const App: Component = () => {
  return (
    <AuthProvider>
      <Router>
          <Route path="/" component={Home} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route 
            path="/chat" 
            component={Chat} 
          />
      </Router>
    </AuthProvider>
  );
};

export default App;
