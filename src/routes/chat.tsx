import { useNavigate, useParams } from "@solidjs/router";
import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { Component, createEffect, onMount, Show } from "solid-js";
import { Toaster, toast } from "solid-sonner";
import Spinner from "~/components/Spinner";
import Sidebar from "~/components/Sidebar";
import PersonaSidebar from "~/components/PersonaSidebar";
import ChatTour from "~/components/ChatTour";
import { supabase } from "~/lib/supabase";
import { chatStore } from "~/stores/chatStore";
import { useConfirm } from "~/contexts/ConfirmContext";

const Chat: Component = () => {
  const navigate = useNavigate();
  const params = useParams();
  let messagesContainerRef: HTMLDivElement | undefined;
  let messageInputRef: HTMLInputElement | undefined;
  const confirm = useConfirm();

  // Check if we're on mobile
  const isMobile = () => window.innerWidth < 640; // 640px is the sm breakpoint in Tailwind

  // Set initial sidebar state based on screen size and initialize data
  onMount(async () => {
    // Set sidebar states
    chatStore.setIsSidebarOpen(!isMobile());
    chatStore.setIsPersonaSidebarOpen(!isMobile());
    
    // Add resize listener to update sidebar state
    window.addEventListener('resize', () => {
      if (isMobile()) {
        chatStore.setIsSidebarOpen(false);
        chatStore.setIsPersonaSidebarOpen(false);
      } else {
        chatStore.setIsSidebarOpen(true);
        chatStore.setIsPersonaSidebarOpen(true);
      }
    });

    // Load initial data
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate("/signin");
      return;
    }
    chatStore.setUser(data.user);
    await chatStore.loadConversations();
    await chatStore.loadSources();

    // Handle conversation selection
    if (params.id) {
      chatStore.setCurrentConversation(params.id);
      await chatStore.loadMessages(params.id);
    } else if (chatStore.getConversations().length > 0) {
      const latestConversation = chatStore.getConversations()[0];
      chatStore.setCurrentConversation(latestConversation.id);
      await chatStore.loadMessages(latestConversation.id);
      navigate(`/chat/${latestConversation.id}`, { replace: true });
    } else {
      await chatStore.createNewConversation();
      focusMessageInput();
    }

    // Initial scroll
    scrollToBottom();
  });

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
    if (chatStore.getIsThinking()) {
      scrollToBottom();
    }
  });

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    const message = chatStore.getMessage();
    if (!message.trim() || !chatStore.getCurrentConversation()) return;

    try {
      await chatStore.sendMessage(message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddUrl = async (e: Event) => {
    e.preventDefault();
    const url = chatStore.getNewUrl();
    if (!url.trim()) return;

    try {
      await chatStore.addUrl(url);
      toast.success("URL source added successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    try {
      await chatStore.uploadFile(file);
      input.value = ""; // Reset input
      toast.success("PDF source added successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      await chatStore.removeSource(sourceId);
      toast.success("Source removed successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmed = await confirm.showConfirm({
      message: "Are you sure you want to delete this conversation?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) return;

    const success = await chatStore.deleteConversation(conversationId);
    if (success) {
      if (chatStore.getConversations().length > 0) {
        const latestConversation = chatStore.getConversations()[0];
        chatStore.setCurrentConversation(latestConversation.id);
        await chatStore.loadMessages(latestConversation.id);
        navigate(`/chat/${latestConversation.id}`);
      } else {
        await chatStore.createNewConversation();
      }
    }
  };

  return (
    <>
      <Show when={!chatStore.getUser()}>
        <Spinner />
      </Show>
      <Show when={chatStore.getUser()}>
        <div class="min-h-screen max-w-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <Toaster position="bottom-right" expand />
          <ChatTour user={chatStore.getUser()} />
          <div class="flex h-screen relative">
            <Sidebar
              user={chatStore.getUser()}
              isOpen={chatStore.getIsSidebarOpen()}
              conversations={chatStore.getConversations()}
              currentConversation={chatStore.getCurrentConversation()}
              onToggleSidebar={() => chatStore.setIsSidebarOpen(!chatStore.getIsSidebarOpen())}
              onConversationSelect={async (id) => {
                chatStore.setCurrentConversation(id);
                await chatStore.loadMessages(id);
                navigate(`/chat/${id}`);
              }}
              onCreateNewConversation={chatStore.createNewConversation}
              onDeleteConversation={handleDeleteConversation}
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
                chatStore.getIsSidebarOpen() ? "ml-80" : "ml-0",
                chatStore.getIsPersonaSidebarOpen() ? "mr-80" : "mr-0"
              )}
            >
              {/* Chat Header */}
              <div class="p-4 border-b border-gray-700 flex items-center justify-between">
                <div class="flex items-center w-[calc(100%-20px)] sm:w-full h-8">
                  <Show when={!chatStore.getIsSidebarOpen()} fallback={null}>
                    <button
                      onClick={() => chatStore.setIsSidebarOpen(true)}
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
                  <h1 class="text-xl font-bold w-full truncate ">
                    {chatStore.getCurrentConversation()
                      ? chatStore.getConversations().find(
                        (c) => c.id === chatStore.getCurrentConversation(),
                      )?.title
                      : "New Conversation"}
                  </h1>
                </div>
                <div class="flex items-center space-x-4">
                  <Show when={chatStore.getIsUploadingSource()}>
                    <div class="flex items-center space-x-2 text-sm text-gray-400">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Processing source...</span>
                    </div>
                  </Show>
                  <Show when={!chatStore.getIsPersonaSidebarOpen()} fallback={null}>
                    <button
                      onClick={() => chatStore.setIsPersonaSidebarOpen(true)}
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
                {chatStore.getMessages().map((msg) => (
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
                <Show when={chatStore.getIsThinking()}>
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
                    value={chatStore.getMessage()}
                    onInput={(e) => chatStore.setMessage(e.currentTarget.value)}
                    placeholder="Type your message..."
                    class="message-input flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={chatStore.getIsLoading()}
                  />
                  <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={chatStore.getIsLoading()}
                  >
                    {chatStore.getIsLoading() ? "Answering..." : "Send"}
                  </button>
                </div>
              </form>
            </div>

            <PersonaSidebar
              isOpen={chatStore.getIsPersonaSidebarOpen()}
              sources={chatStore.getSources()}
              showAddMenu={chatStore.getShowAddMenu()}
              selectedSourceType={chatStore.getSelectedSourceType()}
              newUrl={chatStore.getNewUrl()}
              onToggleSidebar={() =>
                chatStore.setIsPersonaSidebarOpen(!chatStore.getIsPersonaSidebarOpen())
              }
              onRemoveSource={handleRemoveSource}
              onToggleAddMenu={() => chatStore.setShowAddMenu(!chatStore.getShowAddMenu())}
              onSourceTypeSelect={chatStore.setSelectedSourceType}
              onUrlChange={chatStore.setNewUrl}
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
