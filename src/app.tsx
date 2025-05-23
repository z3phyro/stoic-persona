import { Component, Show } from 'solid-js';
import { Router, Route, Navigate } from '@solidjs/router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './routes';
import SignIn from './routes/signin';
import SignUp from './routes/signup';
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
