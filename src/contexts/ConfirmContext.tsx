import { Component, createContext, createSignal, useContext, JSX, Show } from "solid-js";

interface ConfirmOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>();

export const ConfirmProvider: Component<{ children: JSX.Element }> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [options, setOptions] = createSignal<ConfirmOptions>({ message: "" });
  let resolvePromise: ((value: boolean) => void) | null = null;

  const showConfirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    setOptions(confirmOptions);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {props.children}
      <Show when={isOpen()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            classList={{ "opacity-0": !isOpen(), "opacity-100": isOpen() }}
          />
          
          {/* Modal */}
          <div 
            class="relative bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4 transform transition-all duration-300"
            classList={{ 
              "opacity-0 scale-95": !isOpen(), 
              "opacity-100 scale-100": isOpen() 
            }}
          >
            <p class="text-white text-lg mb-6">{options().message}</p>
            <div class="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                class="px-4 cursor-pointer py-2 text-gray-300 hover:text-white transition-colors"
              >
                {options().cancelText || "No"}
              </button>
              <button
                onClick={handleConfirm}
                class="px-4 cursor-pointer py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                {options().confirmText || "Yes"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}; 