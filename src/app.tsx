import { Component } from 'solid-js';
import { Router, Route, Routes } from '@solidjs/router';
import { AuthProvider } from './contexts/AuthContext';
import Home from './routes';
import SignIn from './routes/signin';
import SignUp from './routes/signup';
import "./app.css";
import Navigation from "./components/Navigation";

const App: Component = () => {
  return (
      <AuthProvider>
    <Router>
          <Route path="/" component={Home} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
    </Router>
      </AuthProvider>
  );
};

export default App;
