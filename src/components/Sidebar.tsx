import { User } from '@supabase/supabase-js';
import clsx from 'clsx';
import { Component, Show } from 'solid-js';
import ContextTab from './ContextTab';
import ConversationsTab from './ConversationsTab';
import { supabase } from '~/lib/supabase';
import { useNavigate } from '@solidjs/router';

interface Source {
  id: string;
  type: 'pdf' | 'url';
  name: string;
  url?: string;
  file?: File;
  addedAt: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

type TabType = 'context' | 'conversations';

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  activeTab: TabType;
  sources: Source[];
  conversations: Conversation[];
  currentConversation: string | null;
  showAddMenu: boolean;
  selectedSourceType: 'url' | 'upload' | null;
  newUrl: string;
  onToggleSidebar: () => void;
  onTabChange: (tab: TabType) => void;
  onConversationSelect: (id: string) => void;
  onRemoveSource: (id: string) => void;
  onToggleAddMenu: () => void;
  onSourceTypeSelect: (type: 'url' | 'upload' | null) => void;
  onUrlChange: (url: string) => void;
  onAddUrl: (e: Event) => void;
  onFileUpload: (e: Event) => void;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getUserInitials = (user: User | null) => {
    if (!user?.user_metadata?.full_name) return '?';
    return user.user_metadata.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      class={clsx(
        "absolute lg:static w-80 h-screen bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col",
        props.isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div class="p-4 flex-1 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Settings</h2>
          <Show when={props.isOpen}>
            <button
              onClick={props.onToggleSidebar}
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
            onClick={() => props.onTabChange('context')}
            class={clsx(
              "flex-1 py-2 px-4 rounded-lg transition duration-300",
              props.activeTab === 'context'
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            Persona
          </button>
          <button
            onClick={() => props.onTabChange('conversations')}
            class={clsx(
              "flex-1 py-2 px-4 rounded-lg transition duration-300",
              props.activeTab === 'conversations'
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <Show when={props.activeTab === 'context'}>
          <ContextTab
            sources={props.sources}
            showAddMenu={props.showAddMenu}
            selectedSourceType={props.selectedSourceType}
            newUrl={props.newUrl}
            onRemoveSource={props.onRemoveSource}
            onToggleAddMenu={props.onToggleAddMenu}
            onSourceTypeSelect={props.onSourceTypeSelect}
            onUrlChange={props.onUrlChange}
            onAddUrl={props.onAddUrl}
            onFileUpload={props.onFileUpload}
          />
        </Show>

        <Show when={props.activeTab === 'conversations'}>
          <ConversationsTab
            conversations={props.conversations}
            currentConversation={props.currentConversation}
            onConversationSelect={props.onConversationSelect}
          />
        </Show>
      </div>

      {/* User Profile and Logout */}
      <div class="p-4 border-t border-gray-700">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {getUserInitials(props.user)}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {props.user?.user_metadata?.full_name || 'User'}
            </p>
            <p class="text-xs text-gray-400 truncate">
              {props.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          class="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 