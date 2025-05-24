import { Component, Show } from 'solid-js';
import clsx from 'clsx';

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
  onRemoveSource: (id: string) => void;
  onToggleAddMenu: () => void;
  onSourceTypeSelect: (type: 'url' | 'upload' | null) => void;
  onUrlChange: (url: string) => void;
  onAddUrl: (e: Event) => void;
  onFileUpload: (e: Event) => void;
}

const PersonaSidebar: Component<PersonaSidebarProps> = (props) => {
  return (
    <div
      class={clsx(
        "lg:static h-screen bg-gray-800 border-l border-gray-700 transition-all duration-300  z-10",
        props.isOpen ? "w-120" : "w-0"
      )}
    >
      <div class="w-80 flex flex-col">
      <div class="p-4 flex-1 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Persona Sources</h2>
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

            {/* Add Source Button and Menu */}
            <div class="relative">
              <button
                onClick={props.onToggleAddMenu}
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Source</span>
              </button>

              <Show when={props.showAddMenu}>
                <div class="absolute bottom-full left-0 right-0 mb-2 bg-gray-600 rounded-lg shadow-lg overflow-hidden">
                  <div class="p-2 space-y-1">
                    <Show when={!props.selectedSourceType}>
                      <button
                        onClick={() => props.onSourceTypeSelect('url')}
                        class="w-full flex items-center space-x-2 p-2 hover:bg-gray-500 rounded-lg transition duration-300"
                      >
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span class="text-sm">Add URL</span>
                      </button>

                      <button
                        onClick={() => props.onSourceTypeSelect('upload')}
                        class="w-full flex items-center space-x-2 p-2 hover:bg-gray-500 rounded-lg transition duration-300"
                      >
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span class="text-sm">Upload PDF</span>
                      </button>
                    </Show>

                    <Show when={props.selectedSourceType === 'url'}>
                      <div class="p-2">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="text-sm font-medium">Add URL</h4>
                          <button
                            onClick={() => props.onSourceTypeSelect(null)}
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
                            value={props.newUrl}
                            onInput={(e) => props.onUrlChange(e.currentTarget.value)}
                            placeholder="Enter URL..."
                            class="flex-1 bg-gray-700 border border-gray-500 rounded-lg px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                          />
                          <button
                            onClick={props.onAddUrl}
                            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition duration-300 text-sm whitespace-nowrap"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </Show>

                    <Show when={props.selectedSourceType === 'upload'}>
                      <div class="p-2">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="text-sm font-medium">Upload PDF</h4>
                          <button
                            onClick={() => props.onSourceTypeSelect(null)}
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
                            onChange={props.onFileUpload}
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
      </div>
      </div>
    </div>
  );
};

export default PersonaSidebar; 