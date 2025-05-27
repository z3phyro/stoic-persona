import { useNavigate } from '@solidjs/router';
import { User } from '@supabase/supabase-js';
import clsx from 'clsx';
import { Component, createEffect, createSignal, Show } from 'solid-js';
import Spinner from '~/components/Spinner';
import Sidebar from '~/components/Sidebar';
import PersonaSidebar from '~/components/PersonaSidebar';
import { supabase } from '~/lib/supabase';
import { pdfService } from '~/services/pdfService';
import { urlService } from '~/services/urlService';

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
  const [isPersonaSidebarOpen, setIsPersonaSidebarOpen] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal<TabType>('context');
  const [message, setMessage] = createSignal('');
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [sources, setSources] = createSignal<Source[]>([]);
  const [newUrl, setNewUrl] = createSignal('');
  const [showAddMenu, setShowAddMenu] = createSignal(false);
  const [selectedSourceType, setSelectedSourceType] = createSignal<'url' | 'upload' | null>(null);
  const [conversations, setConversations] = createSignal<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  // Load sources from database
  const loadSources = async () => {
    try {
      // Load PDF sources
      const pdfSources = await pdfService.getPDFs(user()?.id!);
      
      // Load URL sources
      const urlSources = await urlService.getURLs(user()?.id!);

      // Combine and sort all sources by creation date
      const allSources = [...pdfSources, ...urlSources].sort(
        (a, b) => b.addedAt.getTime() - a.addedAt.getTime()
      );

      setSources(allSources);
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  // Load user and conversations
  createEffect(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate('/signin');
      return;
    }
    setUser(data.user);
    await loadConversations();
    await loadSources();
  });

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    // First delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)
      .select();

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return;
    }

    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .select();

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      return;
    }

    console.log('Conversation deleted:', conversationId);
    // Remove from local state
    const updatedConversations = conversations().filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    
    // If the deleted conversation was the current one, clear it
    if (currentConversation() === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }

    // If this was the last conversation, create a new one
    if (updatedConversations.length === 0) {
      await createNewConversation();
    }
  };

  // Load conversations from Supabase
  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(
      data.map((conv) => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.last_message,
        timestamp: new Date(conv.updated_at),
      }))
    );
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(
      data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
      }))
    );
  };

  // Create a new conversation
  const createNewConversation = async () => {
    if (!user()) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user()?.id,
        title: 'New Conversation',
        last_message: '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return;
    }

    const newConversation: Conversation = {
      id: data.id,
      title: data.title,
      lastMessage: data.last_message,
      timestamp: new Date(data.created_at),
    };

    setConversations([newConversation, ...conversations()]);
    setCurrentConversation(data.id);
    setMessages([]);
  };

  // Handle conversation selection
  const handleConversationSelect = async (conversationId: string) => {
    setCurrentConversation(conversationId);
    await loadMessages(conversationId);
  };

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    if (!message().trim() || !currentConversation()) return;

    setIsLoading(true);
    const userMessage = message().trim();
    setMessage('');

    // Save user message to database
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversation(),
        content: userMessage,
        role: 'user',
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error saving message:', messageError);
      setIsLoading(false);
      return;
    }

    // Update conversation's last message and title if it's the first message
    const { data: conversationData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', currentConversation())
      .order('created_at', { ascending: true });

    const isFirstMessage = conversationData?.length === 1;
    
    const { data: updatedConversation } = await supabase
      .from('conversations')
      .update({
        last_message: userMessage,
        title: isFirstMessage ? userMessage : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentConversation())
      .select()
      .single();

    if (updatedConversation) {
      // Update the conversation in the local state
      setConversations(conversations().map(conv => 
        conv.id === currentConversation()
          ? {
              id: conv.id,
              title: isFirstMessage ? userMessage : conv.title,
              lastMessage: userMessage,
              timestamp: new Date(updatedConversation.updated_at),
            }
          : conv
      ));
    }

    // Add message to UI
    const newMessage: Message = {
      id: messageData.id,
      content: userMessage,
      role: 'user',
      timestamp: new Date(messageData.created_at),
    };
    setMessages([...messages(), newMessage]);

    // TODO: Implement AI response
    // Simulating AI response
    setTimeout(async () => {
      const aiResponse = "I'm your AI persona, trained on your experiences and expertise. I can help answer questions about your professional background and knowledge.";
      
      // Save AI response to database
      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation(),
          content: aiResponse,
          role: 'assistant',
        })
        .select()
        .single();

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
        setIsLoading(false);
        return;
      }

      // Add AI message to UI
      const aiMessage: Message = {
        id: aiMessageData.id,
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(aiMessageData.created_at),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleAddUrl = async (e: Event) => {
    e.preventDefault();
    if (!newUrl().trim()) return;

    try {
      setIsLoading(true);
      const urlSource = await urlService.visitURL(newUrl(), user()?.id!);
      
      // Refresh all sources instead of just adding the new one
      await loadSources();
      
      setNewUrl('');
      setSelectedSourceType(null);
      setShowAddMenu(false); // Close the add menu after successful upload
    } catch (error) {
      console.error('Error processing URL:', error);
      alert('Error processing URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    try {
      setIsLoading(true); // Show loading state
      const pdfSource = await pdfService.uploadPDF(file, user()?.id!);
      
      // Refresh all sources instead of just adding the new one
      await loadSources();
      
      input.value = ''; // Reset input
      setSelectedSourceType(null);
      setShowAddMenu(false); // Close the add menu after successful upload
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF file');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      const source = sources().find(s => s.id === sourceId);
      if (!source) return;

      if (source.type === 'pdf') {
        await pdfService.deletePDF(sourceId);
      } else if (source.type === 'url') {
        await urlService.deleteURL(sourceId);
      }

      setSources(sources().filter(s => s.id !== sourceId));
    } catch (error) {
      console.error('Error removing source:', error);
      alert('Error removing source');
    }
  };

  return (
    <>
      <Show when={!user()}>
        <Spinner />
      </Show>
      <Show when={user()}>
        <div class="min-h-screen max-w-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div class="flex h-screen relative">
            <Sidebar
              user={user()}
              isOpen={isSidebarOpen()}
              conversations={conversations()}
              currentConversation={currentConversation()}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen())}
              onConversationSelect={handleConversationSelect}
              onCreateNewConversation={createNewConversation}
              onDeleteConversation={deleteConversation}
            />

            {/* Main Chat Area */}
            <div class={clsx(
              "flex flex-col transition-all duration-300 w-screen",
            )}>
              {/* Chat Header */}
              <div class="p-4 border-b border-gray-700 flex items-center justify-between">
                <div class="flex items-center">
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
                <Show
                  when={!isPersonaSidebarOpen()}
                  fallback={null}
                >
                  <button
                    onClick={() => setIsPersonaSidebarOpen(true)}
                    class="text-gray-400 hover:text-white"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </Show>
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
                    disabled={isLoading()}
                  />
                  <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading()}
                  >
                    {isLoading() ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>

            <PersonaSidebar
              isOpen={isPersonaSidebarOpen()}
              sources={sources()}
              showAddMenu={showAddMenu()}
              selectedSourceType={selectedSourceType()}
              newUrl={newUrl()}
              onToggleSidebar={() => setIsPersonaSidebarOpen(!isPersonaSidebarOpen())}
              onRemoveSource={handleRemoveSource}
              onToggleAddMenu={() => setShowAddMenu(!showAddMenu())}
              onSourceTypeSelect={setSelectedSourceType}
              onUrlChange={setNewUrl}
              onAddUrl={handleAddUrl}
              onFileUpload={handleFileUpload}
            />
          </div>
        </div>
      </Show>
    </>
  );
};

export default Chat; 