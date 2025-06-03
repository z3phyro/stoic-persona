import { Component, Show, createSignal } from 'solid-js';
import clsx from 'clsx';
import UploadModal from './UploadModal';
import UrlModal from './UrlModal';
import SourceTypeModal from './SourceTypeModal';

interface Source {
  id: string;
  type: 'pdf' | 'url';
  name: string;
  url?: string;
  file?: File;
  addedAt: Date;
}

interface PersonaSidebarProps {
  isOpen: boolean;
  sources: Source[];
  showAddMenu: boolean;
  selectedSourceType: 'url' | 'upload' | null;
  newUrl: string;
  onToggleSidebar: () => void;
  onRemoveSource: (sourceId: string) => Promise<void>;
  onToggleAddMenu: () => void;
  onSourceTypeSelect: (type: 'url' | 'upload' | null) => void;
  onUrlChange: (url: string) => void;
  onAddUrl: (e: Event) => Promise<void>;
  onFileUpload: (e: Event) => Promise<void>;
  class?: string;
}

const PersonaSidebar: Component<PersonaSidebarProps> = (props) => {
  const [showUploadModal, setShowUploadModal] = createSignal(false);
  const [showUrlModal, setShowUrlModal] = createSignal(false);
  const [showSourceTypeModal, setShowSourceTypeModal] = createSignal(false);

  const handleFileSelect = (file: File) => {
    // Handle file selection if needed
  };

  const handleFileUpload = (file: File) => {
    props.onFileUpload({ target: { files: [file] } } as any);
  };

  const handleUrlChange = (url: string) => {
    props.onUrlChange(url);
  };

  const handleAddUrl = (e: Event) => {
    try {
      props.onAddUrl(e);
    } catch (error) {
      console.error('Error adding URL:', error);
    }
  };

  const handleSourceTypeSelect = (type: 'url' | 'upload') => {
    setShowSourceTypeModal(false);
    if (type === 'url') {
      setShowUrlModal(true);
    } else {
      setShowUploadModal(true);
    }
  };

  return (
    <div
      class={clsx(
        "fixed top-0 right-0 h-screen bg-gray-800 border-l border-gray-700 transition-all duration-300 ease-in-out z-10 w-80",
        props.isOpen ? "translate-x-0" : "translate-x-full",
        props.class
      )}
    >
      <div class="w-full flex flex-col">
        <div class="p-4 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Persona Sources</h2>
            <Show when={props.isOpen}>
              <button
                onClick={props.onToggleSidebar}
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Show>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-700 rounded-lg p-4">
              <h3 class="font-medium mb-4">Knowledge Sources</h3>

              <div class="space-y-2 mb-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {props.sources.map((source) => (
                  <div class="flex items-center justify-between bg-gray-600 rounded-lg p-2">
                    <div class="flex items-center space-x-2 min-w-0">
                      <span class="text-blue-400 flex-shrink-0">
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
                      onClick={() => props.onRemoveSource(source.id)}
                      class="text-gray-400 hover:text-red-400 transition duration-300 flex-shrink-0 ml-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <Show when={!props.sources.length}>
                  <p class="text-sm text-gray-400 text-center py-2">No sources added yet</p>
                </Show>
              </div>

              {/* Add Source Button */}
              <button
                onClick={() => setShowSourceTypeModal(true)}
                class="add-source-button w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Source</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <SourceTypeModal
        isOpen={showSourceTypeModal()}
        onClose={() => setShowSourceTypeModal(false)}
        onSelectType={handleSourceTypeSelect}
      />

      <UploadModal
        isOpen={showUploadModal()}
        onClose={() => {
          setShowUploadModal(false);
          props.onSourceTypeSelect(null);
        }}
        onFileSelect={handleFileSelect}
        onUpload={handleFileUpload}
      />

      <UrlModal
        isOpen={showUrlModal()}
        onClose={() => {
          setShowUrlModal(false);
          props.onSourceTypeSelect(null);
        }}
        onUrlChange={handleUrlChange}
        onAddUrl={handleAddUrl}
      />
    </div>
  );
};

export default PersonaSidebar; 