import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function ImageGen() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AIORA_API_URL}agents/dad53aba-bd70-05f9-8319-7bc6b4160812/chat-to-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
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
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Image Generation - Agent AIORA</title>
      </Head>
      
      <div className="fixed inset-0 bg-black text-white overflow-hidden">
        {/* Video Background with Vignette */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/aiora_space.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-screen overflow-y-auto">
          {/* Header Section */}
          <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex justify-between items-center">
              <Link href="/">
                <h1 className="text-2xl md:text-3xl font-bold cursor-pointer hover:text-purple-400 transition-colors">AIORA Image Gen</h1>
              </Link>
              <WalletMultiButton className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
            <div className="w-full max-w-4xl bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              {/* Image Preview Area */}
              <div className="flex flex-col items-center min-h-[240px] border border-white/20 rounded-lg p-4 mb-8">
                {isLoading ? (
                  <div className="animate-pulse text-white/50">Generating image...</div>
                ) : generatedImage ? (
                  <div className="flex flex-col items-center gap-4 animate-fade-scale-in">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="max-w-full h-auto rounded"
                    />
                    <a
                      href={generatedImage}
                      download="aiora-generated-image.png"
                      className="flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Image
                    </a>
                  </div>
                ) : (
                  <div className="text-white/50">Generated image will appear here</div>
                )}
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={generateImage}>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt..."
                    className="flex-1 bg-transparent border border-white/20 rounded-full px-6 py-3 focus:outline-none focus:border-white/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !prompt}
                    className={`border border-white rounded-full px-8 py-3 font-medium
                      ${isLoading || !prompt 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/10 transition-colors'}`}
                  >
                    {isLoading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-scale-in {
          animation: fadeScaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
} 