import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

export default function ImageGen() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'sending' | 'confirming' | 'generating'>('idle');

  // AIORA token mint address
  const AIORA_TOKEN_MINT = new PublicKey("3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump");
  const MIN_TOKEN_AMOUNT = 1000000; // 1M tokens
  const GENERATION_COST = 10 * Math.pow(10, 6); // 10 AIORA tokens (with 6 decimals)
  const TREASURY_WALLET = new PublicKey("8oZ7CYsHAEZ8Hni2GcYbgzyfPdkKX8MgH1nYGRhTYTBR");

  useEffect(() => {
    const checkTokenBalance = async () => {
      if (!wallet.publicKey) {
        setHasAccess(false);
        setIsLoadingAccess(false);
        return;
      }

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          wallet.publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const aioraAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === AIORA_TOKEN_MINT.toString()
        );

        if (aioraAccount) {
          const rawBalance = Number(aioraAccount.account.data.parsed.info.tokenAmount.amount);
          const tokenBalance = rawBalance / Math.pow(10, 6);
          console.log('Token balance:', tokenBalance);
          setHasAccess(tokenBalance >= MIN_TOKEN_AMOUNT);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking token balance:", error);
        setHasAccess(false);
      }
      
      setIsLoadingAccess(false);
    };

    checkTokenBalance();
  }, [wallet.publicKey, connection]);

  const transferTokens = async (): Promise<boolean> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Wallet not connected");
      return false;
    }

    try {
      setLoadingStage('sending');
      // Get the user's ATA (Associated Token Account)
      const userATA = await getAssociatedTokenAddress(
        AIORA_TOKEN_MINT,
        wallet.publicKey
      );

      // Get the treasury's ATA
      const treasuryATA = await getAssociatedTokenAddress(
        AIORA_TOKEN_MINT,
        TREASURY_WALLET
      );

      // Create a new transaction
      const transaction = new Transaction();

      // Check if treasury ATA exists
      const treasuryAccount = await connection.getAccountInfo(treasuryATA);
      
      // If treasury ATA doesn't exist, add instruction to create it
      if (!treasuryAccount) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey, // payer
            treasuryATA, // ata
            TREASURY_WALLET, // owner
            AIORA_TOKEN_MINT // mint
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          userATA,
          treasuryATA,
          wallet.publicKey,
          GENERATION_COST
        )
      );

      // Set fee payer and recent blockhash
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      // Sign and send transaction
      const signedTx = await wallet.signTransaction(transaction);
      const tx = await connection.sendRawTransaction(signedTx.serialize());
      
      setLoadingStage('confirming');
      await connection.confirmTransaction(tx);

      return true;
    } catch (err: any) {
      console.error("Error transferring tokens:", err);
      setError(err.message || "Failed to transfer tokens. Please try again.");
      setLoadingStage('idle');
      return false;
    }
  };

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLoadingStage('generating');
    
    try {
      // First try to validate the API is working and get the image
      const validateResponse = await fetch(`/api/aiora-proxy?path=agents/dad53aba-bd70-05f9-8319-7bc6b4160812/chat-to-image`, {
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

      if (!validateResponse.ok) {
        throw new Error('Image generation service is currently unavailable. Please try again later.');
      }

      // Store the image blob
      const imageBlob = await validateResponse.blob();

      // If API check passes, proceed with token transfer
      setLoadingStage('sending');
      const transferSuccess = await transferTokens();
      if (!transferSuccess) {
        setIsLoading(false);
        setLoadingStage('idle');
        return;
      }

      // Use the already generated image
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage(imageUrl);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStage('idle');
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 'sending':
        return 'Sending transaction...';
      case 'confirming':
        return 'Waiting for transaction confirmation...';
      case 'generating':
        return 'Generating image...';
      default:
        return 'Loading...';
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
            {isLoadingAccess ? (
              <div className="flex items-center justify-center">
                <div className="text-xl text-purple-400 animate-pulse">Loading Access Data...</div>
              </div>
            ) : !wallet.publicKey ? (
              <div className="text-center max-w-2xl mx-auto p-6 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-4">Please connect your Solana wallet to access AIORA Image Generation.</p>
              </div>
            ) : !hasAccess ? (
              <div className="text-center max-w-2xl mx-auto p-6 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">Access Restricted</h2>
                <p className="text-gray-300 mb-4">You need at least 1,000,000 $AIORA tokens to access image generation.</p>
                <a 
                  href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-purple-500/20 text-white rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  Get $AIORA Tokens
                </a>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-8">
                {/* Cost Information */}
                <div className="text-center mb-6 text-gray-400">
                  Each image generation costs 10 $AIORA tokens
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center text-white">
                    {error}
                  </div>
                )}

                {/* Image Preview Area */}
                <div className="flex flex-col items-center min-h-[240px] border border-white/20 rounded-lg p-4 mb-8">
                  {isLoading ? (
                    <div className="animate-pulse text-white/50">{getLoadingMessage()}</div>
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
            )}
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