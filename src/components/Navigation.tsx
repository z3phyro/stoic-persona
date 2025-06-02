import { Component } from "solid-js";
import { A } from "@solidjs/router";

const Navigation: Component = () => {
  return (
    <header class="fixed w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <A
              href="/"
              class="text-2xl items-center gap-2 flex font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-400 w-8 h-8"
              >
                <path d="M12 6V2H8" />
                <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
                <path d="M2 12h2" />
                <path d="M9 11v2" />
                <path d="M15 11v2" />
                <path d="M20 12h2" />
              </svg>
              Stoic Persona{" "}
            </A>
          </div>
          <nav class="hidden md:flex space-x-8"></nav>
          <div class="flex items-center space-x-4">
            <A
              href="/signin"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition duration-300"
            >
              Get Started
            </A>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
