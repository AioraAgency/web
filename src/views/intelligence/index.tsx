import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { ChatTerminal } from '../../components/ChatTerminal';

export const IntelligenceView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // AIORA token mint address
  const AIORA_TOKEN_MINT = new PublicKey("3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump");
  const MIN_TOKEN_AMOUNT = 1000000; // 1M tokens

  useEffect(() => {
    const checkTokenBalance = async () => {
      if (!wallet.publicKey) {
        setHasAccess(false);
        setIsLoading(false);
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
          const tokenBalance = rawBalance / Math.pow(10, 6); // Convert from raw amount to actual token amount
          console.log('Token balance:', tokenBalance); // For debugging
          setHasAccess(tokenBalance >= MIN_TOKEN_AMOUNT);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking token balance:", error);
        setHasAccess(false);
      }
      
      setIsLoading(false);
    };

    checkTokenBalance();
  }, [wallet.publicKey, connection]);

  return (
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
              <h1 className="text-2xl md:text-3xl font-bold cursor-pointer hover:text-purple-400 transition-colors">AIORA Intel</h1>
            </Link>
            <div className="flex items-center space-x-4 text-sm">
              <WalletMultiButton className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors" />
            </div>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-xl text-purple-400 animate-pulse">Loading Intelligence Data...</div>
            </div>
          ) : !wallet.publicKey ? (
            <div className="text-center max-w-2xl mx-auto mt-20 p-6 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-4">Please connect your Solana wallet to access AIORA Intelligence.</p>
            </div>
          ) : !hasAccess ? (
            <div className="text-center max-w-2xl mx-auto mt-20 p-6 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">Access Restricted</h2>
              <p className="text-gray-300 mb-4">You need at least 1,000,000 $AIORA tokens to access intelligence data.</p>
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
            // Original grid content
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Original panels here */}
              {/* Crypto Intelligence Panel */}
              <div className="bg-navy-900/50 border border-blue-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-400">Crypto Intelligence</h2>
                <div className="space-y-4">
                  {/* Price Chart */}
                  <div className="bg-black/40 rounded-lg p-4 h-48">
                    <div className="text-sm text-gray-400 mb-2">Price Action</div>
                    {/* Add chart component here */}
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-400">24h Volume</div>
                      <div className="text-xl font-bold">$2.05M</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Holders</div>
                      <div className="text-xl font-bold">2,218</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Intelligence Panel */}
              <div className="bg-purple-900/50 border border-purple-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Social Intelligence</h2>
                <div className="space-y-4">
                  {/* Sentiment Graph */}
                  <div className="bg-black/40 rounded-lg p-4 h-48">
                    <div className="text-sm text-gray-400 mb-2">Sentiment Analysis</div>
                    {/* Add sentiment chart here */}
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Mentions</div>
                      <div className="text-xl font-bold">95.4k</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Sentiment</div>
                      <div className="text-xl font-bold text-green-400">+45%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Threat Intelligence Panel */}
              <div className="bg-red-900/50 border border-red-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-red-400">Threat Intelligence</h2>
                <div className="space-y-4">
                  {/* Threat Map */}
                  <div className="bg-black/40 rounded-lg p-4 h-48">
                    <div className="text-sm text-gray-400 mb-2">Activity Monitor</div>
                    {/* Add threat visualization here */}
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Alerts</div>
                      <div className="text-xl font-bold text-red-400">24</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Risk Level</div>
                      <div className="text-xl font-bold">Medium</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Table */}
              <div className="lg:col-span-3 bg-gray-900/50 border border-gray-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Details</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {/* Add table rows here */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Chat Terminal - only show if has access */}
        {hasAccess && (
          <div className="fixed bottom-4 right-4 w-80 z-50">
            <ChatTerminal />
          </div>
        )}
      </div>
    </div>
  );
};