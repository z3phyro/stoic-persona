import { Component } from "solid-js";
import Navigation from "../components/Navigation";
import { A } from "@solidjs/router";
import { Motion } from "solid-motionone";
import { useAuth } from "../contexts/AuthContext";

const Home: Component = () => {
  const auth = useAuth();

  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div class="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      {/* Hero Section */}
      <div class="container mx-auto px-4 pt-32 pb-20">
        <div class="max-w-4xl mx-auto text-center">
          <Motion.h1
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.8 }}
            class="text-5xl md:text-6xl h-30 sm:h-20 font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Your Digital Self
          </Motion.h1>
          <Motion.h2
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.8, delay: 0.2 }}
            class="text-xl md:text-2xl font-semibold mb-4"
          >
            Powered by AI
          </Motion.h2>
          <Motion.p
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.8, delay: 0.4 }}
            class="text-lg text-gray-400 mb-12"
          >
            Let your AI persona represent your expertise, experiences, and
            insights with remarkable accuracy.
          </Motion.p>
          <Motion.div
            animate={{ opacity: [0, 1], scale: [0.9, 1] }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <A
              href="/chat"
              class="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
            >
              {auth.user() ? "Interact with your AI Persona" : "Create Your AI Persona"}
            </A>
          </Motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div class="container mx-auto px-4 py-20">
        <Motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.8, delay: 0.8 }}
          class="max-w-6xl mx-auto"
        >
          <div class="grid md:grid-cols-3 gap-8">
            <Motion.div
              animate={{ opacity: [0, 1], y: [20, 0] }}
              transition={{ duration: 0.6, delay: 1 }}
              class="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition duration-300 transform hover:scale-105"
            >
              <div class="text-blue-400 text-5xl mb-6">🤖</div>
              <h3 class="text-2xl font-bold mb-4">AI-Powered Responses</h3>
              <p class="text-gray-400 leading-relaxed">
                Experience natural, context-aware conversations that mirror your communication style and expertise. Your AI persona learns and adapts to provide authentic responses.
              </p>
            </Motion.div>
            <Motion.div
              animate={{ opacity: [0, 1], y: [20, 0] }}
              transition={{ duration: 0.6, delay: 1.2 }}
              class="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition duration-300 transform hover:scale-105"
            >
              <div class="text-blue-400 text-5xl mb-6">📚</div>
              <h3 class="text-2xl font-bold mb-4">Knowledge Base</h3>
              <p class="text-gray-400 leading-relaxed">
                Build a comprehensive repository of your professional journey, including projects, achievements, and domain expertise. Your AI persona becomes an extension of your knowledge.
              </p>
            </Motion.div>
            <Motion.div
              animate={{ opacity: [0, 1], y: [20, 0] }}
              transition={{ duration: 0.6, delay: 1.4 }}
              class="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition duration-300 transform hover:scale-105"
            >
              <div class="text-blue-400 text-5xl mb-6">💡</div>
              <h3 class="text-2xl font-bold mb-4">Smart Insights</h3>
              <p class="text-gray-400 leading-relaxed">
                Leverage advanced AI to generate intelligent responses about your work, projects, and professional knowledge. Get meaningful insights and perspectives.
              </p>
            </Motion.div>
          </div>
        </Motion.div>
      </div>

      {/* Example Section */}
      <div class="container mx-auto px-4 py-20">
        <Motion.div
          animate={{ opacity: [0, 1], y: [30, 0] }}
          transition={{ duration: 0.8, delay: 1.6 }}
          class="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8"
        >
          <h2 class="text-3xl font-bold mb-6 text-center">
            Example Interaction
          </h2>
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="w-full">
              <img 
                src="/example.jpg" 
                alt="Example AI Persona Interaction" 
                class="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            
          </div>
        </Motion.div>
      </div>

      {/* Footer */}
      <Motion.footer
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.8, delay: 1.8 }}
        class="container mx-auto px-4 py-8 text-center text-gray-400"
      >
        <p>© 2025 Stoic Persona. All rights reserved.</p>
      </Motion.footer>
    </div>
  );
};

export default Home;
