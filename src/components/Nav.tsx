import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  return (
    <header class="fixed w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
              <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Stoic Persona
              </span>
            </div>
            <nav class="hidden md:flex space-x-8">
              <a href="#features" class="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#example" class="text-gray-300 hover:text-white transition-colors">Example</a>
              <a href="#pricing" class="text-gray-300 hover:text-white transition-colors">Pricing</a>
            </nav>
            <div class="flex items-center space-x-4">
              <button class="text-gray-300 hover:text-white transition-colors">Sign In</button>
              <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>
  );
}
