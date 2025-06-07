import { Component, createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Motion } from "solid-motionone";

const ResetPassword: Component = () => {
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
      await auth.updatePassword(password());
      navigate("/signin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while resetting password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navigation />

      <div class="container mx-auto px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Motion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, easing: "ease-out" }}
          class="w-full max-w-md"
        >
          <div class="bg-gray-800 rounded-xl p-8 shadow-xl">
            <h2 class="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Set New Password
            </h2>

            {error() && (
              <div class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                {error()}
              </div>
            )}

            <form class="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-300 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label
                  for="confirmPassword"
                  class="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword()}
                  onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading()}
                class="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-gray-400">
                Remember your password?{" "}
                <A href="/signin" class="text-blue-400 cursor-pointer hover:text-blue-300">
                  Sign in
                </A>
              </p>
            </div>
          </div>
        </Motion>
      </div>
    </div>
  );
};

export default ResetPassword; 