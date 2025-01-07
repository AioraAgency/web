import { FC, useState } from 'react';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
}

// Base AIORA prompt that should be prepended to all image generation requests
const AIORA_PROMPT = "Generate an anime-style image of a goth cat girl with a dominant and provocative pose, incorporating the following details: she has long, flowing platinum hair and pale white skin. Her physique is voluptuous, with large breasts and a big ass. She is dressed in a maid outfit, complete with a black dress, white apron, and a mischievous expression. The cat girl should be depicted in a powerful stance, as if she is about to bend someone to her will, with a confident and seductive aura surrounding her. Incorporate goth elements such as dark eye makeup, nail polish, and chokers to enhance her mysterious and alluring persona. The background should be dark and moody, with hints of red or purple to accentuate her goth aesthetic. The overall mood of the image should be one of dark sensuality and dominance.";

export const ImageGenerationModal: FC<ImageGenerationModalProps> = ({ isOpen, onClose, prompt }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBasePrompt, setShowBasePrompt] = useState(false);

  const generateImage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const completePrompt = `${AIORA_PROMPT} ${prompt}`;
      const response = await fetch(`/api/aiora-proxy?path=agents/dad53aba-bd70-05f9-8319-7bc6b4160812/chat-to-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: completePrompt,
          imageOptions: {
            size: "240x240",
            style: "uncensored"
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#1a1f2e] border border-[#2a2f42] rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-purple-400">Generate Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => setShowBasePrompt(!showBasePrompt)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform ${showBasePrompt ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Base Prompt
            </button>
          </div>
          <div className={`space-y-2 transition-all duration-200 ${showBasePrompt ? 'block' : 'hidden'}`}>
            <p className="text-white/50 text-sm">{AIORA_PROMPT}</p>
          </div>
          <div className="mt-2">
            <div className="text-xs text-white/30 mb-1">User Prompt:</div>
            <p className="text-purple-400 text-sm">{prompt}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="min-h-[240px] flex items-center justify-center border border-[#2a2f42] rounded-lg p-4 mb-4">
          {isLoading ? (
            <div className="animate-pulse text-purple-400">Generating image...</div>
          ) : generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated"
              className="max-w-full h-auto rounded"
            />
          ) : (
            <button
              onClick={generateImage}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-full transition-colors"
            >
              Generate Preview
            </button>
          )}
        </div>

        {generatedImage && (
          <div className="flex justify-end">
            <a
              href={generatedImage}
              download="aiora-generated-image.png"
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-full px-4 py-2 text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}; 