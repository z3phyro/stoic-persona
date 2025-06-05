import { Component, Show, createSignal } from 'solid-js';
import clsx from 'clsx';

interface WebsiteMetadata {
  title: string;
  description: string;
  favicon: string;
  error?: string;
}

interface UrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlChange: (url: string) => void;
  onAddUrl: (e: Event) => void;
}

const UrlModal: Component<UrlModalProps> = (props) => {
  const [url, setUrl] = createSignal('');
  const [currentStep, setCurrentStep] = createSignal<'input' | 'confirm'>('input');
  const [metadata, setMetadata] = createSignal<WebsiteMetadata | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const fetchMetadata = async (url: string) => {
    setIsLoading(true);
    setMetadata(null);
    
    try {
      // Create a proxy URL to avoid CORS issues
      const proxyUrl = `/api/metadata?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      
      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      setMetadata({
        title: url,
        description: 'Could not fetch website metadata',
        favicon: '',
        error: 'Failed to load preview'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: Event) => {
    let value = (e.target as HTMLInputElement).value;
    
    // Add https:// if no protocol is specified
    if (value && !value.match(/^https?:\/\//)) {
      value = `https://${value}`;
    }
    
    setUrl(value);
    props.onUrlChange(value);
  };

  const handleContinue = async () => {
    if (url()) {
      await fetchMetadata(url());
      setCurrentStep('confirm');
    }
  };

  const handleAddUrl = async () => {
    try {
      // Create a synthetic event that matches what the parent component expects
      const syntheticEvent = {
        preventDefault: () => {},
        target: { value: url() }
      } as unknown as Event;
      
      props.onAddUrl(syntheticEvent);
      handleClose();
    } catch (error) {
      setMetadata(prev => ({
        ...prev!,
        error: 'Failed to add URL. Please try again.'
      }));
    }
  };

  const handleClose = () => {
    setUrl('');
    setCurrentStep('input');
    setMetadata(null);
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
          {/* Step 1: URL Input */}
          <Show when={currentStep() === 'input'}>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Add URL</h3>
                <button
                  onClick={handleClose}
                  class="text-gray-400 hover:text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="space-y-2">
                <input
                  type="url"
                  value={url()}
                  onInput={handleUrlChange}
                  placeholder="Enter URL..."
                  class="w-full bg-gray-700 border border-gray-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleContinue}
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!url()}
                >
                  Continue
                </button>
              </div>
            </div>
          </Show>

          {/* Step 2: Confirmation */}
          <Show when={currentStep() === 'confirm'}>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Confirm URL</h3>
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
                <Show when={isLoading()}>
                  <div class="flex items-center justify-center py-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </Show>

                <Show when={!isLoading() && metadata()}>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                      <Show when={metadata()?.favicon}>
                        <img 
                          src={metadata()?.favicon} 
                          alt="Website favicon"
                          class="w-8 h-8 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </Show>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium truncate">{metadata()?.title || url()}</p>
                        <p class="text-xs text-gray-400 truncate">{url()}</p>
                      </div>
                    </div>
                    
                    <Show when={metadata()?.description}>
                      <p class="text-sm text-gray-300 line-clamp-2">
                        {metadata()?.description}
                      </p>
                    </Show>

                    <Show when={metadata()?.error}>
                      <p class="text-sm text-red-400">
                        {metadata()?.error}
                      </p>
                    </Show>
                  </div>
                </Show>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  onClick={() => setCurrentStep('input')}
                  class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAddUrl}
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default UrlModal; 