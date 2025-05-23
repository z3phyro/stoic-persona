export default function Spinner() {
  return (
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="mt-4">Loading...</p>
      </div>
    </div>
  );
}