import { Component, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { supabase } from "../../lib/supabase";

const AuthCallback: Component = () => {
  const navigate = useNavigate();

  onMount(async () => {
    try {
      // Get the hash from the URL
      const hash = window.location.hash;
      
      if (hash) {
        // Handle the OAuth callback
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
      }

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session) {
        // Successfully authenticated, redirect to chat
        navigate("/chat", { replace: true });
      } else {
        // No session found, redirect to sign in
        navigate("/signin", { replace: true });
      }
    } catch (error) {
      console.error("Error in auth callback:", error);
      navigate("/signin", { replace: true });
    }
  });

  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-4">Completing sign in...</h2>
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 