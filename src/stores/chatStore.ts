import { createStore } from "solid-js/store";
import { User } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";
import { pdfService } from "~/services/pdfService";
import { urlService } from "~/services/urlService";
import { aiService } from "~/services/aiService";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface Source {
  id: string;
  type: "pdf" | "url";
  name: string;
  content: string;
  url?: string;
  file?: File;
  addedAt: Date;
}

export type TabType = "context" | "conversations";

interface ChatStore {
  user: User | null;
  isSidebarOpen: boolean;
  isPersonaSidebarOpen: boolean;
  activeTab: TabType;
  message: string;
  messages: Message[];
  sources: Source[];
  newUrl: string;
  showAddMenu: boolean;
  selectedSourceType: "url" | "upload" | null;
  conversations: Conversation[];
  currentConversation: string | null;
  isLoading: boolean;
  isUploadingSource: boolean;
  isThinking: boolean;
}

const initialState: ChatStore = {
  user: null,
  isSidebarOpen: false,
  isPersonaSidebarOpen: false,
  activeTab: "context",
  message: "",
  messages: [],
  sources: [],
  newUrl: "",
  showAddMenu: false,
  selectedSourceType: null,
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isUploadingSource: false,
  isThinking: false,
};

const [state, setState] = createStore<ChatStore>(initialState);

export const chatStore = {
  // State getters
  getUser: () => state.user,
  getIsSidebarOpen: () => state.isSidebarOpen,
  getIsPersonaSidebarOpen: () => state.isPersonaSidebarOpen,
  getActiveTab: () => state.activeTab,
  getMessage: () => state.message,
  getMessages: () => state.messages,
  getSources: () => state.sources,
  getNewUrl: () => state.newUrl,
  getShowAddMenu: () => state.showAddMenu,
  getSelectedSourceType: () => state.selectedSourceType,
  getConversations: () => state.conversations,
  getCurrentConversation: () => state.currentConversation,
  getIsLoading: () => state.isLoading,
  getIsUploadingSource: () => state.isUploadingSource,
  getIsThinking: () => state.isThinking,

  // State setters
  setUser: (user: User | null) => setState("user", user),
  setIsSidebarOpen: (isOpen: boolean) => setState("isSidebarOpen", isOpen),
  setIsPersonaSidebarOpen: (isOpen: boolean) => setState("isPersonaSidebarOpen", isOpen),
  setActiveTab: (tab: TabType) => setState("activeTab", tab),
  setMessage: (message: string) => setState("message", message),
  setMessages: (messages: Message[]) => setState("messages", messages),
  setSources: (sources: Source[]) => setState("sources", sources),
  setNewUrl: (url: string) => setState("newUrl", url),
  setShowAddMenu: (show: boolean) => setState("showAddMenu", show),
  setSelectedSourceType: (type: "url" | "upload" | null) => setState("selectedSourceType", type),
  setConversations: (conversations: Conversation[]) => setState("conversations", conversations),
  setCurrentConversation: (id: string | null) => setState("currentConversation", id),
  setIsLoading: (loading: boolean) => setState("isLoading", loading),
  setIsUploadingSource: (uploading: boolean) => setState("isUploadingSource", uploading),
  setIsThinking: (thinking: boolean) => setState("isThinking", thinking),

  // Actions
  async loadSources() {
    try {
      const pdfSources = await pdfService.getPDFs(state.user?.id!);
      const urlSources = await urlService.getURLs(state.user?.id!);
      const allSources = [...pdfSources, ...urlSources].sort(
        (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
      );
      setState("sources", allSources);
    } catch (error) {
      console.error("Error loading sources:", error);
    }
  },

  async loadConversations() {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", state.user?.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setState("conversations", data.map((conv) => ({
      id: conv.id,
      title: conv.title,
      lastMessage: conv.last_message,
      timestamp: new Date(conv.updated_at),
    })));
  },

  async loadMessages(conversationId: string) {
    const { data: conversation, error: ownershipError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", state.user?.id)
      .single();

    if (ownershipError || !conversation) {
      console.error("Error: Conversation not found or unauthorized");
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

    setState("messages", data.map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: new Date(msg.created_at),
    })));
  },

  async createNewConversation() {
    if (!state.user) return;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: state.user.id,
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

    setState("conversations", [newConversation, ...state.conversations]);
    setState("currentConversation", data.id);
    setState("messages", []);
    return data.id;
  },

  async deleteConversation(conversationId: string) {
    const { data: conversation, error: ownershipError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", state.user?.id)
      .single();

    if (ownershipError || !conversation) {
      console.error("Error: Conversation not found or unauthorized");
      return;
    }

    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId)
      .select();

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return;
    }

    const { error: conversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .select();

    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      return;
    }

    setState("conversations", state.conversations.filter((c) => c.id !== conversationId));
    return true;
  },

  async sendMessage(message: string) {
    if (!message.trim() || !state.currentConversation) return;

    const { data: conversation, error: ownershipError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", state.currentConversation)
      .eq("user_id", state.user?.id)
      .single();

    if (ownershipError || !conversation) {
      console.error("Error: Conversation not found or unauthorized");
      return;
    }

    setState("isLoading", true);
    const userMessage = message.trim();
    setState("message", "");

    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: state.currentConversation,
        content: userMessage,
        role: "user",
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error saving message:", messageError);
      setState("isLoading", false);
      return;
    }

    const { data: updatedConversation } = await supabase
      .from("conversations")
      .update({
        last_message: userMessage,
        title: userMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state.currentConversation)
      .select()
      .single();

    if (updatedConversation) {
      setState("conversations", state.conversations.map((conv) =>
        conv.id === state.currentConversation
          ? {
            id: conv.id,
            title: userMessage,
            lastMessage: userMessage,
            timestamp: new Date(updatedConversation.updated_at),
          }
          : conv,
      ));
    }

    const newMessage: Message = {
      id: messageData.id,
      content: userMessage,
      role: "user",
      timestamp: new Date(messageData.created_at),
    };
    setState("messages", [...state.messages, newMessage]);

    try {
      setState("isThinking", true);
      const aiResponse = await aiService.getAIResponse(
        state.messages.map((msg) => ({ role: msg.role, content: msg.content })),
        state.sources,
        state.currentConversation!,
      );

      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: state.currentConversation,
          content: aiResponse,
          role: "assistant",
        })
        .select()
        .single();

      if (aiMessageError) {
        console.error("Error saving AI message:", aiMessageError);
        setState("isLoading", false);
        setState("isThinking", false);
        return;
      }

      const aiMessage: Message = {
        id: aiMessageData.id,
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(aiMessageData.created_at),
      };
      setState("messages", [...state.messages, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      throw new Error("Error getting AI response. Please try again.");
    } finally {
      setState("isLoading", false);
      setState("isThinking", false);
    }
  },

  async addUrl(url: string) {
    try {
      setState("isUploadingSource", true);
      await urlService.visitURL(url, state.user?.id!);
      await this.loadSources();
      setState("newUrl", "");
      setState("selectedSourceType", null);
      setState("showAddMenu", false);
      return true;
    } catch (error) {
      console.error("Error processing URL:", error);
      throw new Error("Failed to process URL. Please try again.");
    } finally {
      setState("isUploadingSource", false);
    }
  },

  async uploadFile(file: File) {
    if (file.type !== "application/pdf") {
      throw new Error("Please upload a PDF file");
    }

    try {
      setState("isUploadingSource", true);
      await pdfService.uploadPDF(file, state.user?.id!);
      await this.loadSources();
      setState("selectedSourceType", null);
      setState("showAddMenu", false);
      return true;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error("Failed to process PDF file. Please try again.");
    } finally {
      setState("isUploadingSource", false);
    }
  },

  async removeSource(sourceId: string) {
    try {
      const source = state.sources.find((s) => s.id === sourceId);
      if (!source) return;

      if (source.type === "pdf") {
        await pdfService.deletePDF(sourceId);
      } else if (source.type === "url") {
        await urlService.deleteURL(sourceId);
      }

      setState("sources", state.sources.filter((s) => s.id !== sourceId));
      return true;
    } catch (error) {
      console.error("Error removing source:", error);
      throw new Error("Failed to remove source. Please try again.");
    }
  },
}; 