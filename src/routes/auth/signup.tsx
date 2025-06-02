import { Component, createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";

const SignUp: Component = () => {
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (password() !== confirmPassword()) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await auth.signUp(email(), password(), name());
      navigate("/chat");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign up",
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
              Create Your Account
            </h2>

            {error() && (
              <div class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                {error()}
              </div>
            )}

            <form class="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

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
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label
                  for="confirmPassword"
                  class="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword()}
                  onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div class="flex items-start sm:items-center">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  class="h-4 mt-0.5 sm:mt-0 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <label
                  for="terms"
                  class="ml-2 block text-sm text-gray-300 cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="https://stoicdynamics.com/terms"
                    target="_blank"
                    class="text-blue-400 hover:text-blue-300"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://stoicdynamics.com/privacy"
                    target="_blank"
                    class="text-blue-400 hover:text-blue-300"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading()}
                class="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-gray-400">
                Already have an account?{" "}
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
