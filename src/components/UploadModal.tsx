import { Component, Show, createSignal } from 'solid-js';
import clsx from 'clsx';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => void;
}

const UploadModal: Component<UploadModalProps> = (props) => {
  let fileInputRef: HTMLInputElement | undefined;
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [currentStep, setCurrentStep] = createSignal<'select' | 'confirm'>('select');

  const handleFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setSelectedFile(file);
      props.onFileSelect(file);
      setCurrentStep('confirm');
    }
  };

  const handleUpload = () => {
    const file = selectedFile();
    if (file) {
      props.onUpload(file);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCurrentStep('select');
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div 
          class="relative bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4 transform transition-all duration-300"
        >
          {/* Step 1: File Selection */}
          <Show when={currentStep() === 'select'}>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Upload PDF</h3>
                <button
                  onClick={handleClose}
                  class="text-gray-400 hover:text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  class="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef?.click()}
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Choose PDF File
                </button>
                <p class="mt-2 text-sm text-gray-400">
                  or drag and drop your PDF here
                </p>
              </div>
            </div>
          </Show>

          {/* Step 2: Confirmation */}
          <Show when={currentStep() === 'confirm'}>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Confirm Upload</h3>
                <button
                  onClick={handleClose}
                  class="text-gray-400 hover:text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{selectedFile()?.name}</p>
                    <p class="text-xs text-gray-400">
                      {(selectedFile()?.size || 0) / 1024 / 1024} MB
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  onClick={() => setCurrentStep('select')}
                  class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default UploadModal; 