import { useNavigate } from '@solidjs/router';
import { User } from '@supabase/supabase-js';
import { Component, createEffect, createMemo, createSignal, Show } from 'solid-js';
import Spinner from '~/components/Spinner';
import { supabase } from '~/lib/supabase';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const Chat: Component = () => {
  const [user, setUser] = createSignal<User | null>(null);
  const navigate = useNavigate();

  createEffect(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) navigate('/signin');
    setUser(data.user);
  });
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
  const [message, setMessage] = createSignal('');
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [conversations, setConversations] = createSignal<Conversation[]>([
    {
      id: '1',
      title: 'Web Accessibility Experience',
      lastMessage: 'Can you explain your experience with web accessibility?',
      timestamp: new Date(),
    },
    {
      id: '2',
      title: 'Project Management',
      lastMessage: 'Tell me about your project management approach',
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);
  const [currentConversation, setCurrentConversation] = createSignal<string | null>(null);

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    if (!message().trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages(), newMessage]);
    setMessage('');

    // TODO: Implement AI response
    // Simulating AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm your AI persona, trained on your experiences and expertise. I can help answer questions about your professional background and knowledge.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      <Show when={!user()}>
        <Spinner />
      </Show>
      <Show when={user()}>
      <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div class="flex h-screen">
        {/* Sidebar */}
        <div
          class={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
            isSidebarOpen() ? 'w-80' : 'w-0'
          }`}
        >
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold">Conversations</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mb-4">
              New Conversation
            </button>
            
            <div class="space-y-2">
              {conversations().map((conv) => (
                <button
                  onClick={() => setCurrentConversation(conv.id)}
                  class={`w-full text-left p-3 rounded-lg transition duration-300 ${
                    currentConversation() === conv.id
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <h3 class="font-medium truncate">{conv.title}</h3>
                  <p class="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {conv.timestamp.toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div class="flex-1 flex flex-col">
          {/* Chat Header */}
          <div class="p-4 border-b border-gray-700 flex items-center">
            <Show
              when={!isSidebarOpen()}
              fallback={null}
            >
              <button
                onClick={() => setIsSidebarOpen(true)}
                class="mr-4 text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </Show>
            <h1 class="text-xl font-bold">
              {currentConversation()
                ? conversations().find(c => c.id === currentConversation())?.title
                : 'New Conversation'}
            </h1>
          </div>

          {/* Messages */}
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            {messages().map((msg) => (
              <div
                class={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  class={`max-w-[70%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p class="text-xs mt-2 opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} class="p-4 border-t border-gray-700">
            <div class="flex space-x-4">
              <input
                type="text"
                value={message()}
                onInput={(e) => setMessage(e.currentTarget.value)}
                placeholder="Type your message..."
                class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Show>
    </>
  );
};

export default Chat; 