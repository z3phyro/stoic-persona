import { Component } from 'solid-js';
import clsx from 'clsx';

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
}

const ConversationsTab: Component<ConversationsTabProps> = (props) => {
  return (
    <div class="space-y-4 pb-4">
      <button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
        New Conversation
      </button>
      
      <div class="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {props.conversations.map((conv) => (
          <button
            onClick={() => props.onConversationSelect(conv.id)}
            class={clsx(
              "w-full text-left p-3 rounded-lg transition duration-300",
              props.currentConversation === conv.id
                ? "bg-blue-500/20 border border-blue-500/50"
                : "hover:bg-gray-700"
            )}
          >
            <div class="min-w-0">
              <h3 class="font-medium truncate">{conv.title}</h3>
              <p class="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
              <p class="text-xs text-gray-500 mt-1">
                {conv.timestamp.toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationsTab; 