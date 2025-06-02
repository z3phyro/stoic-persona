import { Component, createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const SignIn: Component = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.signIn(email(), password());
      navigate("/chat");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navigation />

      <div class="container mx-auto px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div class="w-full max-w-md">
          <div class="bg-gray-800 rounded-xl p-8 shadow-xl">
            <h2 class="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Welcome Back
            </h2>

            {error() && (
              <div class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                {error()}
              </div>
            )}

            <form class="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <label
                    for="remember"
                    class=" cursor-pointer ml-2 block text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>
                <a href="#" class="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading()}
                class="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <GoogleLoginButton />

            <div class="mt-6 text-center">
              <p class="text-gray-400">
                Don't have an account?{" "}
                <A href="/signup" class="text-blue-400 cursor-pointer hover:text-blue-300">
                  Sign up
                </A>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
