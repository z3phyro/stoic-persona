import { useNavigate, useParams } from "@solidjs/router";
import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { Component, createEffect, createSignal, Show, onMount } from "solid-js";
import { Toaster, toast } from "solid-sonner";
import Spinner from "~/components/Spinner";
import Sidebar from "~/components/Sidebar";
import PersonaSidebar from "~/components/PersonaSidebar";
import ChatTour from "~/components/ChatTour";
import { supabase } from "~/lib/supabase";
import { pdfService } from "~/services/pdfService";
import { urlService } from "~/services/urlService";
import { aiService } from "~/services/aiService";
import { useConfirm } from "~/contexts/ConfirmContext";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
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
  type: "pdf" | "url";
  name: string;
  content: string;
  url?: string;
  file?: File;
  addedAt: Date;
}

type TabType = "context" | "conversations";

const Chat: Component = () => {
  const [user, setUser] = createSignal<User | null>(null);
  const navigate = useNavigate();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
  const [isPersonaSidebarOpen, setIsPersonaSidebarOpen] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal<TabType>("context");
  const [message, setMessage] = createSignal("");
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [sources, setSources] = createSignal<Source[]>([]);
  const [newUrl, setNewUrl] = createSignal("");
  const [showAddMenu, setShowAddMenu] = createSignal(false);
  const [selectedSourceType, setSelectedSourceType] = createSignal<
    "url" | "upload" | null
  >(null);
  const [conversations, setConversations] = createSignal<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = createSignal<
    string | null
  >(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isUploadingSource, setIsUploadingSource] = createSignal(false);
  const [isThinking, setIsThinking] = createSignal(false);
  let messagesContainerRef: HTMLDivElement | undefined;
  let messageInputRef: HTMLInputElement | undefined;
  const confirm = useConfirm();

  // Helper function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        messagesContainerRef!.scrollTop = messagesContainerRef!.scrollHeight;
      });
    }
  };

  // Helper function to focus message input
  const focusMessageInput = () => {
    if (messageInputRef) {
      requestAnimationFrame(() => {
        messageInputRef!.focus();
      });
    }
  };

  // Auto-scroll to bottom when messages change
  createEffect(() => {
    // Add a small delay to ensure content is rendered
    setTimeout(scrollToBottom, 100);
  });

  // Also scroll when thinking state changes
  createEffect(() => {
    if (isThinking()) {
      scrollToBottom();
    }
  });

  // Scroll to bottom on initial load
  onMount(() => {
    scrollToBottom();
  });

  // Load sources from database
  const loadSources = async () => {
    try {
      // Load PDF sources
      const pdfSources = await pdfService.getPDFs(user()?.id!);

      // Load URL sources
      const urlSources = await urlService.getURLs(user()?.id!);

      // Combine and sort all sources by creation date
      const allSources = [...pdfSources, ...urlSources].sort(
        (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
      );

      setSources(allSources);
    } catch (error) {
      console.error("Error loading sources:", error);
    }
  };

  // Load user and conversations
  createEffect(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate("/signin");
      return;
    }
    setUser(data.user);
    await loadConversations();
    await loadSources();

    // If there's a conversation ID in the URL, select it
    if (params.id) {
      setCurrentConversation(params.id);
      await loadMessages(params.id);
    } else if (conversations().length > 0) {
      // If no conversation is selected, select the latest one
      const latestConversation = conversations()[0];
      setCurrentConversation(latestConversation.id);
      await loadMessages(latestConversation.id);
      navigate(`/chat/${latestConversation.id}`, { replace: true });
    } else {
      // If no conversations exist, create a new one
      await createNewConversation();
      // Focus the message input after creating a new conversation
      focusMessageInput();
    }
  });

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    // First verify that the conversation belongs to the user
    const { data: conversation, error: ownershipError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user()?.id)
      .single();

    if (ownershipError || !conversation) {
      console.error("Error: Conversation not found or unauthorized");
      return;
    }

    const confirmed = await confirm.showConfirm({
      message: "Are you sure you want to delete this conversation?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) return;

    // First delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId)
      .select();

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return;
    }

    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .select();

    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      return;
    }

    console.log("Conversation deleted:", conversationId);
    // Remove from local state
    const updatedConversations = conversations().filter(
      (c) => c.id !== conversationId,
    );
    setConversations(updatedConversations);

    // If the deleted conversation was the current one, select the latest one
    if (currentConversation() === conversationId) {
      if (updatedConversations.length > 0) {
        const latestConversation = updatedConversations[0];
        setCurrentConversation(latestConversation.id);
        await loadMessages(latestConversation.id);
        navigate(`/chat/${latestConversation.id}`);
      } else {
        // If no conversations left, create a new one
        await createNewConversation();
      }
    }
  };

  // Load conversations from Supabase
  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user()?.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(
      data.map((conv) => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.last_message,
        timestamp: new Date(conv.updated_at),
      })),
    );
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    // First verify that the conversation belongs to the user
    const { data: conversation, error: ownershipError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user()?.id)
      .single();

    if (ownershipError || !conversation) {
      console.error("Error: Conversation not found or unauthorized");
      navigate("/chat");
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(
      data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
      })),
    );
  };

  // Create a new conversation
  const createNewConversation = async () => {
    if (!user()) return;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user()?.id,
        title: "New Conversation",
        last_message: "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
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
    navigate(`/chat/${data.id}`);
    
    // Focus the message input after creating a new conversation
    focusMessageInput();
  };

  // Handle conversation selection
  const handleConversationSelect = async (conversationId: string) => {
    setCurrentConversation(conversationId);
    await loadMessages(conversationId);
    navigate(`/chat/${conversationId}`);
  };

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    if (!message().trim() || !currentConversation()) return;

    // First verify that the conversation belongs to the user
    const { data: conversation, error: ownershipError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", currentConversation())
      .eq("user_id", user()?.id)
      .single();

    if (ownershipError || !conversation) {
      console.error("Error: Conversation not found or unauthorized");
      navigate("/chat");
      return;
    }

    setIsLoading(true);
    const userMessage = message().trim();
    setMessage("");

    // Save user message to database
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: currentConversation(),
        content: userMessage,
        role: "user",
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error saving message:", messageError);
      setIsLoading(false);
      return;
    }

    // Update conversation's last message and title if it's the first message
    const { data: updatedConversation } = await supabase
      .from("conversations")
      .update({
        last_message: userMessage,
        title: userMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentConversation())
      .select()
      .single();

    if (updatedConversation) {
      // Update the conversation in the local state
      setConversations(
        conversations().map((conv) =>
          conv.id === currentConversation()
            ? {
              id: conv.id,
              title: userMessage,
              lastMessage: userMessage,
              timestamp: new Date(updatedConversation.updated_at),
            }
            : conv,
        ),
      );
    }

    // Add message to UI
    const newMessage: Message = {
      id: messageData.id,
      content: userMessage,
      role: "user",
      timestamp: new Date(messageData.created_at),
    };
    setMessages([...messages(), newMessage]);

    try {
      setIsThinking(true);
      // Get AI response
      const aiResponse = await aiService.getAIResponse(
        messages().map((msg) => ({ role: msg.role, content: msg.content })),
        sources(),
        currentConversation()!,
      );

      // Save AI response to database
      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversation(),
          content: aiResponse,
          role: "assistant",
        })
        .select()
        .single();

      if (aiMessageError) {
        console.error("Error saving AI message:", aiMessageError);
        setIsLoading(false);
        setIsThinking(false);
        return;
      }

      // Add AI message to UI
      const aiMessage: Message = {
        id: aiMessageData.id,
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(aiMessageData.created_at),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Ensure scroll after AI message is added
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error getting AI response:", error);
      alert("Error getting AI response. Please try again.");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleAddUrl = async (e: Event) => {
    e.preventDefault();
    if (!newUrl().trim()) return;

    try {
      setIsUploadingSource(true);
      const urlSource = await urlService.visitURL(newUrl(), user()?.id!);

      // Refresh all sources instead of just adding the new one
      await loadSources();

      setNewUrl("");
      setSelectedSourceType(null);
      setShowAddMenu(false); // Close the add menu after successful upload
      toast.success("URL source added successfully");
    } catch (error) {
      console.error("Error processing URL:", error);
      toast.error("Failed to process URL. Please try again.");
    } finally {
      setIsUploadingSource(false);
    }
  };

  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      setIsUploadingSource(true); // Show loading state
      const pdfSource = await pdfService.uploadPDF(file, user()?.id!);

      // Refresh all sources instead of just adding the new one
      await loadSources();

      input.value = ""; // Reset input
      setSelectedSourceType(null);
      setShowAddMenu(false); // Close the add menu after successful upload
      toast.success("PDF source added successfully");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF file. Please try again.");
    } finally {
      setIsUploadingSource(false); // Hide loading state
    }
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      const source = sources().find((s) => s.id === sourceId);
      if (!source) return;

      if (source.type === "pdf") {
        await pdfService.deletePDF(sourceId);
      } else if (source.type === "url") {
        await urlService.deleteURL(sourceId);
      }

      setSources(sources().filter((s) => s.id !== sourceId));
      toast.success("Source removed successfully");
    } catch (error) {
      console.error("Error removing source:", error);
      toast.error("Failed to remove source. Please try again.");
    }
  };

  return (
    <>
      <Show when={!user()}>
        <Spinner />
      </Show>
      <Show when={user()}>
        <div class="min-h-screen max-w-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <Toaster position="bottom-right" expand />
          <ChatTour user={user()} />
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
              class="conversations-list"
            />

            {/* Main Chat Area */}
            <div
              class={clsx(
                "flex flex-col transition-all duration-300 w-screen",
                "[&::-webkit-scrollbar]:w-2.5",
                "[&::-webkit-scrollbar-track]:bg-gray-800",
                "[&::-webkit-scrollbar-thumb]:bg-gray-600",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb:hover]:bg-gray-500",
                "[&::-webkit-scrollbar]:transition-colors",
                "[&::-webkit-scrollbar]:duration-200",
                "[-webkit-overflow-scrolling:touch]",
                isSidebarOpen() ? "ml-80" : "ml-0",
                isPersonaSidebarOpen() ? "mr-80" : "mr-0"
              )}
            >
              {/* Chat Header */}
              <div class="p-4 border-b border-gray-700 flex items-center justify-between">
                <div class="flex items-center">
                  <Show when={!isSidebarOpen()} fallback={null}>
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      class="mr-4 text-gray-400 hover:text-white"
                    >
                      <svg
                        class="w-6 h-6 cursor-pointer"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M11.303 19.955a9.818 9.818 0 0 1 -3.603 -.955l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.73 1.476 2.665 3.435 2.76 5.433" />
                        <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        <path d="M20.2 20.2l1.8 1.8" />
                      </svg>
                    </button>
                  </Show>
                  <h1 class="text-xl font-bold">
                    {currentConversation()
                      ? conversations().find(
                        (c) => c.id === currentConversation(),
                      )?.title
                      : "New Conversation"}
                  </h1>
                </div>
                <div class="flex items-center space-x-4">
                  <Show when={isUploadingSource()}>
                    <div class="flex items-center space-x-2 text-sm text-gray-400">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Processing source...</span>
                    </div>
                  </Show>
                  <Show when={!isPersonaSidebarOpen()} fallback={null}>
                    <button
                      onClick={() => setIsPersonaSidebarOpen(true)}
                      class="text-gray-400 hover:text-white"
                    >
                      <svg
                        class="w-6 h-6 cursor-pointer"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                        <path d="M6 21v-2a4 4 0 0 1 4 -4h3.5" />
                        <path d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97l-3.39 3.42h-3v-3l3.42 -3.39z" />
                      </svg>
                    </button>
                  </Show>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth
                  [&::-webkit-scrollbar]:w-2.5
                  [&::-webkit-scrollbar-track]:bg-gray-800
                  [&::-webkit-scrollbar-thumb]:bg-gray-600
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb:hover]:bg-gray-500
                  [&::-webkit-scrollbar]:transition-colors
                  [&::-webkit-scrollbar]:duration-200
                  [-webkit-overflow-scrolling:touch]"
              >
                {messages().map((msg) => (
                  <div
                    class={clsx(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      class={clsx(
                        "max-w-[70%] rounded-lg p-4",
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-200",
                      )}
                    >
                      <div innerHTML={msg.content} />
                      <p class="text-xs mt-2 opacity-70">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Show when={isThinking()}>
                  <div class="flex justify-start">
                    <div class="bg-gray-700 text-gray-200 rounded-lg p-4">
                      <div class="flex space-x-2">
                        <div
                          class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style="animation-delay: 0ms"
                        ></div>
                        <div
                          class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style="animation-delay: 150ms"
                        ></div>
                        <div
                          class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style="animation-delay: 300ms"
                        ></div>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                class="p-4 border-t border-gray-700"
              >
                <div class="flex space-x-4">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={message()}
                    onInput={(e) => setMessage(e.currentTarget.value)}
                    placeholder="Type your message..."
                    class="message-input flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={isLoading()}
                  />
                  <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading()}
                  >
                    {isLoading() ? "Answering..." : "Send"}
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
              onToggleSidebar={() =>
                setIsPersonaSidebarOpen(!isPersonaSidebarOpen())
              }
              onRemoveSource={handleRemoveSource}
              onToggleAddMenu={() => setShowAddMenu(!showAddMenu())}
              onSourceTypeSelect={setSelectedSourceType}
              onUrlChange={setNewUrl}
              onAddUrl={handleAddUrl}
              onFileUpload={handleFileUpload}
              class="persona-sources"
            />
          </div>
        </div>
      </Show>
    </>
  );
};

export default Chat;
