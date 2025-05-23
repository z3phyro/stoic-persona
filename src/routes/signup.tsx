import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import Navigation from '../components/Navigation';

const SignUp: Component = () => {
  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navigation />
      
      <div class="container mx-auto px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div class="w-full max-w-md">
          <div class="bg-gray-800 rounded-xl p-8 shadow-xl">
            <h2 class="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Create Your Account
            </h2>
            
            <form class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
              </div>
              
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <label for="terms" class="ml-2 block text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="#" class="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" class="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <button
                type="submit"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Create Account
              </button>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-gray-400">
                Already have an account?{' '}
                <A href="/signin" class="text-blue-400 hover:text-blue-300">
                  Sign in
                </A>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 