import { useNavigate } from '@solidjs/router';
import { User } from '@supabase/supabase-js';
import clsx from 'clsx';
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

interface Source {
  id: string;
  type: 'pdf' | 'url';
  name: string;
  url?: string;
  file?: File;
  addedAt: Date;
}

type TabType = 'context' | 'conversations';

const Chat: Component = () => {
  const [user, setUser] = createSignal<User | null>(null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal<TabType>('context');
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
  const [sources, setSources] = createSignal<Source[]>([]);
  const [newUrl, setNewUrl] = createSignal('');
  const [isAddingUrl, setIsAddingUrl] = createSignal(false);
  const [isUploading, setIsUploading] = createSignal(false);
  const [showAddMenu, setShowAddMenu] = createSignal(false);
  const [selectedSourceType, setSelectedSourceType] = createSignal<'url' | 'upload' | null>(null);

  createEffect(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) navigate('/signin');
    setUser(data.user);
  });

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

  const handleAddUrl = (e: Event) => {
    e.preventDefault();
    if (!newUrl().trim()) return;

    const newSource: Source = {
      id: Date.now().toString(),
      type: 'url',
      name: newUrl(),
      url: newUrl(),
      addedAt: new Date(),
    };

    setSources([...sources(), newSource]);
    setNewUrl('');
    setIsAddingUrl(false);
  };

  const handleFileUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    const newSource: Source = {
      id: Date.now().toString(),
      type: 'pdf',
      name: file.name,
      file: file,
      addedAt: new Date(),
    };

    setSources([...sources(), newSource]);
    input.value = ''; // Reset input
  };

  const handleRemoveSource = (sourceId: string) => {
    setSources(sources().filter(s => s.id !== sourceId));
  };

  return (
    <>
      <Show when={!user()}>
        <Spinner />
      </Show>
      <Show when={user()}>
        <div class="min-h-screen max-w-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div class="flex h-screen">
            {/* Sidebar */}
            <div
              class={clsx(
                "w-80 h-screen bg-gray-800 border-r border-gray-700 transition-all duration-300",
                isSidebarOpen() ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold">Settings</h2>
                  <Show when={isSidebarOpen()}>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      class="text-gray-400 hover:text-white"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Show>
                </div>

                {/* Tabs */}
                <div class="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTab('context')}
                    class={clsx(
                      "flex-1 py-2 px-4 rounded-lg transition duration-300",
                      activeTab() === 'context'
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    Context
                  </button>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    class={clsx(
                      "flex-1 py-2 px-4 rounded-lg transition duration-300",
                      activeTab() === 'conversations'
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    History
                  </button>
                </div>

                {/* Tab Content */}
                <Show when={activeTab() === 'context'}>
                  <div class="space-y-4">
                    <div class="bg-gray-700 rounded-lg p-4">
                      <h3 class="font-medium mb-2">User Profile</h3>
                      <div class="space-y-2 text-sm">
                        <p><span class="text-gray-400">Name:</span> {user()?.user_metadata?.full_name || 'Not set'}</p>
                        <p><span class="text-gray-400">Email:</span> {user()?.email}</p>
                      </div>
                    </div>

                    <div class="bg-gray-700 rounded-lg p-4">
                      <h3 class="font-medium mb-4">Knowledge Sources</h3>

                      <div class="space-y-2 mb-4">
                        {sources().map((source) => (
                          <div class="flex items-center justify-between bg-gray-600 rounded-lg p-2">
                            <div class="flex items-center space-x-2">
                              <span class="text-blue-400">
                                {source.type === 'pdf' ? (
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                )}
                              </span>
                              <span class="text-sm truncate">{source.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveSource(source.id)}
                              class="text-gray-400 hover:text-red-400 transition duration-300"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <Show when={!sources().length}>
                          <p class="text-sm text-gray-400 text-center py-2">No sources added yet</p>
                        </Show>
                      </div>

                      {/* Add Source Button and Menu */}
                      <div class="relative">
                        <button
                          onClick={() => setShowAddMenu(!showAddMenu())}
                          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add Source</span>
                        </button>

                        <Show when={showAddMenu()}>
                          <div class="absolute bottom-full left-0 right-0 mb-2 bg-gray-600 rounded-lg shadow-lg overflow-hidden">
                            <div class="p-2 space-y-1">
                              <Show when={!selectedSourceType()}>
                                <button
                                  onClick={() => setSelectedSourceType('url')}
                                  class="w-full flex items-center space-x-2 p-2 hover:bg-gray-500 rounded-lg transition duration-300"
                                >
                                  <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <span class="text-sm">Add URL</span>
                                </button>

                                <button
                                  onClick={() => setSelectedSourceType('upload')}
                                  class="w-full flex items-center space-x-2 p-2 hover:bg-gray-500 rounded-lg transition duration-300"
                                >
                                  <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span class="text-sm">Upload PDF</span>
                                </button>
                              </Show>

                              <Show when={selectedSourceType() === 'url'}>
                                <div class="p-2">
                                  <div class="flex items-center justify-between mb-2">
                                    <h4 class="text-sm font-medium">Add URL</h4>
                                    <button
                                      onClick={() => setSelectedSourceType(null)}
                                      class="text-gray-400 hover:text-white"
                                    >
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="flex space-x-2">
                                    <input
                                      type="text"
                                      value={newUrl()}
                                      onInput={(e) => setNewUrl(e.currentTarget.value)}
                                      placeholder="Enter URL..."
                                      class="flex-1 bg-gray-700 border border-gray-500 rounded-lg px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                    <button
                                      onClick={handleAddUrl}
                                      class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition duration-300 text-sm"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </Show>

                              <Show when={selectedSourceType() === 'upload'}>
                                <div class="p-2">
                                  <div class="flex items-center justify-between mb-2">
                                    <h4 class="text-sm font-medium">Upload PDF</h4>
                                    <button
                                      onClick={() => setSelectedSourceType(null)}
                                      class="text-gray-400 hover:text-white"
                                    >
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="flex space-x-2">
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      class="hidden"
                                      onChange={handleFileUpload}
                                    />
                                    <button
                                      onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                      class="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition duration-300 text-sm"
                                    >
                                      Choose File
                                    </button>
                                  </div>
                                </div>
                              </Show>
                            </div>
                          </div>
                        </Show>
                      </div>
                    </div>
                  </div>
                </Show>

                <Show when={activeTab() === 'conversations'}>
                  <div class="space-y-4">
                    <button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                      New Conversation
                    </button>
                    
                    <div class="space-y-2">
                      {conversations().map((conv) => (
                        <button
                          onClick={() => setCurrentConversation(conv.id)}
                          class={clsx(
                            "w-full text-left p-3 rounded-lg transition duration-300",
                            currentConversation() === conv.id
                              ? "bg-blue-500/20 border border-blue-500/50"
                              : "hover:bg-gray-700"
                          )}
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
                </Show>
              </div>
            </div>

            {/* Main Chat Area */}
            <div class={clsx(
              "flex-1 flex flex-col transition-all duration-300",
              !isSidebarOpen() && "-ml-80"
            )}>
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
                    class={clsx(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      class={clsx(
                        "max-w-[70%] rounded-lg p-4",
                        msg.role === 'user'
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-200"
                      )}
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