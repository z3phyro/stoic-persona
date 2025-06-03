import { Component, Show } from 'solid-js';
import clsx from 'clsx';

interface SourceTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'url' | 'upload') => void;
}

const SourceTypeModal: Component<SourceTypeModalProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={props.onClose}
        />
        
        {/* Modal */}
        <div 
          class="relative bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4 transform transition-all duration-300"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Add Source</h3>
              <button
                onClick={props.onClose}
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-3">
              <button
                onClick={() => props.onSelectType('url')}
                class="w-full flex items-start space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300"
              >
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div class="text-left">
                  <p class="font-medium">Add URL</p>
                  <p class="text-sm text-gray-400">Add a website as a knowledge source</p>
                </div>
              </button>

              <button
                onClick={() => props.onSelectType('upload')}
                class="w-full flex items-start space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300"
              >
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div class="text-left">
                  <p class="font-medium">Upload PDF</p>
                  <p class="text-sm text-gray-400">Upload a PDF document as a knowledge source</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default SourceTypeModal; 