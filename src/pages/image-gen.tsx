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
import { PublicKey, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";

export default function ImageGen() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'checking' | 'sending' | 'confirming' | 'generating'>('idle');
  const [aioraBalance, setAioraBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [lastTxSender, setLastTxSender] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  // AIORA token mint address
  const AIORA_TOKEN_MINT = new PublicKey("3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump");
  const GENERATION_COST = 1 * Math.pow(10, 6); // 1 AIORA tokens (with 6 decimals)
  const TREASURY_WALLET = new PublicKey("8oZ7CYsHAEZ8Hni2GcYbgzyfPdkKX8MgH1nYGRhTYTBR");
  const AIORA_PROMPT = "Generate an anime-style image of a goth cat girl with a dominant and provocative pose, incorporating the following details: she has long, flowing platinum hair and pale white skin. Her physique is voluptuous, with large breasts and a big ass. She is dressed in a maid outfit, complete with a black dress, white apron, and a mischievous expression. The cat girl should be depicted in a powerful stance, as if she is about to bend someone to her will, with a confident and seductive aura surrounding her. Incorporate goth elements such as dark eye makeup, nail polish, and chokers to enhance her mysterious and alluring persona. The background should be dark and moody, with hints of red or purple to accentuate her goth aesthetic. The overall mood of the image should be one of dark sensuality and dominance.";

  useEffect(() => {
    const checkTokenBalance = async () => {
      if (!wallet.publicKey) {
        setAioraBalance(0);
        return;
      }

      setIsLoadingBalance(true);
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
          const balance = rawBalance / Math.pow(10, 6);
          setAioraBalance(balance);
        } else {
          setAioraBalance(0);
        }
      } catch (error) {
        console.error("Error checking token balance:", error);
        setAioraBalance(0);
      }
      setIsLoadingBalance(false);
    };

    checkTokenBalance();
  }, [wallet.publicKey, connection]);

  const transferTokens = async (promptMessage: string): Promise<boolean> => {
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
      const transaction = new Transaction().add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(`Image Gen Prompt: ${promptMessage}`),
        })
      );

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

  const checkApiHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AIORA_API_URL}`);
      if (!response.ok) {
        setError('Image generation service is currently unavailable. Please try again later.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('API Health Check Error:', error);
      setError('Unable to connect to image generation service. Please try again later.');
      return false;
    }
  };

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLoadingStage('checking');

    try {
      // Check API health first
      const isApiHealthy = await checkApiHealth();
      if (!isApiHealthy) {
        setIsLoading(false);
        setLoadingStage('idle');
        return;
      }

      setLoadingStage('sending');
      const completePrompt = `${AIORA_PROMPT} ${prompt}`;
      
      // Only proceed with token transfer if API is healthy
      const transferSuccess = await transferTokens(prompt);
      if (!transferSuccess) {
        setIsLoading(false);
        setLoadingStage('idle');
        return;
      }

      // Then generate image with the complete prompt
      setLoadingStage('generating');
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
      setLastTxSender(wallet.publicKey.toString());
      setLastPrompt(prompt);
      setPrompt(''); // Clear the input after successful generation
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
      case 'checking':
        return 'Checking service availability...';
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
            {!wallet.publicKey ? (
              <div className="text-center max-w-2xl mx-auto p-6 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-4">Please connect your Solana wallet to access AIORA Image Generation.</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-[#0d0f1d]/90 backdrop-blur-md border border-[#2a2f42] rounded-lg p-8 shadow-2xl shadow-purple-900/20">
                {/* Balance and Cost Information */}
                <div className="text-center mb-8">
                  <div className="text-lg mb-2 font-medium">
                    {isLoadingBalance ? (
                      <span className="animate-pulse text-purple-400">Loading balance...</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-400">Balance:</span>
                        <span className="font-mono text-purple-400">{aioraBalance.toLocaleString()} $AIORA</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[#6b7280] text-sm">
                    Each image generation costs 1 $AIORA token
                  </div>
                  {aioraBalance < 1 && (
                    <div className="mt-1">
                      <a 
                        href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <span>Get $AIORA tokens</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-red-400">
                    {error}
                  </div>
                )}

                {/* Image Preview Area */}
                <div className="flex flex-col items-center min-h-[240px] border border-[#2a2f42] rounded-lg p-4 mb-8 bg-[#1a1f2e]/50">
                  {isLoading ? (
                    <div className="animate-pulse text-purple-400/70">{getLoadingMessage()}</div>
                  ) : generatedImage ? (
                    <div className="flex flex-col items-center gap-4 animate-fade-scale-in w-full">
                      {lastTxSender && (
                        <div className="w-full text-sm mb-2">
                          <div className="flex items-center gap-2 text-[#6b7280] mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Generated by:</span>
                            <a 
                              href={`https://solscan.io/account/${lastTxSender}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors font-mono"
                            >
                              {`${lastTxSender.slice(0, 4)}...${lastTxSender.slice(-4)}`}
                            </a>
                          </div>
                          {lastPrompt && (
                            <div className="flex items-start gap-2 text-[#6b7280]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm break-words">{lastPrompt}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="max-w-full h-auto rounded-lg shadow-lg shadow-purple-900/20"
                      />
                      <a
                        href={generatedImage}
                        download="aiora-generated-image.png"
                        className="flex items-center gap-2 bg-[#2a2f42]/50 hover:bg-[#2a2f42] text-purple-400 rounded-full px-4 py-2 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download Image
                      </a>
                    </div>
                  ) : (
                    <div className="text-[#6b7280]">Generated image will appear here</div>
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
                      className="flex-1 bg-[#1a1f2e]/50 border border-[#2a2f42] rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !prompt || aioraBalance < 1}
                      className={`px-8 py-3 rounded-full font-medium transition-all duration-200 
                        ${isLoading || !prompt || aioraBalance < 1
                          ? 'bg-[#2a2f42]/50 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105'}`}
                    >
                      {isLoading ? 'Generating...' : aioraBalance < 1 ? 'Insufficient Balance' : 'Generate'}
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