import { Component } from "solid-js";
import clsx from "clsx";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ConversationsTabProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onConversationSelect: (id: string) => void;
  onCreateNewConversation: () => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
}

const ConversationsTab: Component<ConversationsTabProps> = (props) => {
  return (
    <div class="space-y-4 pb-4">
      <button
        onClick={props.onCreateNewConversation}
        class="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        New Conversation
      </button>

      <div class="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {props.conversations.map((conv) => (
          <div
            onClick={() => props.onConversationSelect(conv.id)}
            class={clsx(
              "w-full cursor-pointer text-left p-3 rounded-lg transition duration-300 group relative",
              props.currentConversation === conv.id
                ? "bg-blue-500/20 border border-blue-500/50"
                : "hover:bg-gray-700 border border-transparent",
            )}
          >
            <div class="w-full text-left">
              <div class="min-w-0 pr-8">
                <h3 class="font-medium truncate">{conv.title}</h3>
                <p class="text-xs text-gray-500 mt-1">
                  {conv.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onDeleteConversation(conv.id);
              }}
              class="absolute cursor-pointer right-3 top-6 -translate-y-1/2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsTab;
