import { Component } from "solid-js";
import Navigation from "../components/Navigation";
import { A } from "@solidjs/router";
import { Motion } from "solid-motionone";

const Home: Component = () => {
  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navigation />

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
              Create Your AI Persona
            </A>
          </Motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div class="container mx-auto px-4 py-20">
        <Motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.8, delay: 0.8 }}
          class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <Motion.div
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.6, delay: 1 }}
            class="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition duration-300"
          >
            <div class="text-blue-400 text-4xl mb-4">🤖</div>
            <h3 class="text-xl font-bold mb-3">AI-Powered Responses</h3>
            <p class="text-gray-400">
              Your AI persona can answer questions about your experiences, just
              like you would.
            </p>
          </Motion.div>
          <Motion.div
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.6, delay: 1.2 }}
            class="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition duration-300"
          >
            <div class="text-blue-400 text-4xl mb-4">📚</div>
            <h3 class="text-xl font-bold mb-3">Experience Repository</h3>
            <p class="text-gray-400">
              Store and organize your professional journey, achievements, and
              expertise.
            </p>
          </Motion.div>
          <Motion.div
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.6, delay: 1.4 }}
            class="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition duration-300"
          >
            <div class="text-blue-400 text-4xl mb-4">💡</div>
            <h3 class="text-xl font-bold mb-3">Smart Insights</h3>
            <p class="text-gray-400">
              Get intelligent responses about your work, projects, and
              professional knowledge.
            </p>
          </Motion.div>
        </Motion.div>
      </div>

      {/* Example Section */}
      <div class="container mx-auto px-4 py-20">
        <Motion.div
          animate={{ opacity: [0, 1], y: [30, 0] }}
          transition={{ duration: 0.8, delay: 1.6 }}
          class="max-w-4xl mx-auto bg-gray-800 rounded-xl p-8"
        >
          <h2 class="text-3xl font-bold mb-6 text-center">
            Example Interaction
          </h2>
          <div class="bg-gray-900 rounded-lg p-6">
            <p class="text-gray-300 mb-4">
              Q: "Can you explain your experience with web accessibility?"
            </p>
            <p class="text-gray-400 italic">
              A: "I've worked extensively with web accessibility standards,
              implementing WCAG guidelines and ensuring inclusive design
              practices..."
            </p>
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
