import { Component } from 'solid-js';
import { A } from '@solidjs/router';

const Navigation: Component = () => {
  return (
    <header class="fixed w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <A href="/" class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Stoic Persona
            </A>
          </div>
          <nav class="hidden md:flex space-x-8">
            <A href="/#features" class="text-gray-300 hover:text-white transition-colors">Features</A>
            <A href="/#example" class="text-gray-300 hover:text-white transition-colors">Example</A>
            <A href="/#pricing" class="text-gray-300 hover:text-white transition-colors">Pricing</A>
          </nav>
          <div class="flex items-center space-x-4">
            <A href="/signin" class="text-gray-300 hover:text-white transition-colors">Sign In</A>
            <A href="/signup" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition duration-300">
              Get Started
            </A>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation; 