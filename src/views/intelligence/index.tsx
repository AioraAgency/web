import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
// import { ChatTerminal } from '../../components/ChatTerminal';
import { AgentSelector, Agent } from '../../components/AgentSelector';
import { AgentIntelligence } from '../../components/AgentIntelligence';
import { TokenPrice } from '../../components/TokenPrice';
import { ImagePrompts } from '../../components/ImagePrompts';

export const IntelligenceView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // AIORA token mint address
  const AIORA_TOKEN_MINT = new PublicKey("3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump");
  const DEGEN_TOKEN_MINT = new PublicKey("Gu3LDkn7Vx3bmCzLafYNKcDxv2mH7YN44NJZFXnypump");
  const AI16Z_TOKEN_MINT = new PublicKey("HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC");
  
  const MIN_AIORA_AMOUNT = 1000000; // 1M tokens
  const MIN_DEGEN_AMOUNT = 1000000; // 1M tokens
  const MIN_AI16Z_AMOUNT = 100000; // 100K tokens

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AIORA_API_URL}agents`);
        const data = await response.json();
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgent(data.agents[0]);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

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

        // Check AIORA balance
        const aioraAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === AIORA_TOKEN_MINT.toString()
        );

        // Check DEGEN balance
        const degenAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === DEGEN_TOKEN_MINT.toString()
        );

        // Check AI16Z balance
        const ai16zAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === AI16Z_TOKEN_MINT.toString()
        );

        // Calculate balances
        const aioraBalance = aioraAccount 
          ? Number(aioraAccount.account.data.parsed.info.tokenAmount.amount) / Math.pow(10, 6)
          : 0;

        const degenBalance = degenAccount
          ? Number(degenAccount.account.data.parsed.info.tokenAmount.amount) / Math.pow(10, 6)
          : 0;

        const ai16zBalance = ai16zAccount
          ? Number(ai16zAccount.account.data.parsed.info.tokenAmount.amount) / Math.pow(10, 6)
          : 0;

        console.log('Token balances:', {
          AIORA: aioraBalance,
          DEGEN: degenBalance,
          AI16Z: ai16zBalance
        });

        // Check if any of the token conditions are met
        setHasAccess(
          aioraBalance >= MIN_AIORA_AMOUNT ||
          degenBalance >= MIN_DEGEN_AMOUNT ||
          ai16zBalance >= MIN_AI16Z_AMOUNT
        );
      } catch (error) {
        console.error("Error checking token balances:", error);
        setHasAccess(false);
      }
      
      setIsLoading(false);
    };

    checkTokenBalance();
  }, [wallet.publicKey, connection]);

  // Get the current agent's token address
  const getAgentTokenAddress = () => {
    if (selectedAgent?.tokenAddress) {
      return selectedAgent.tokenAddress;
    }
    return AIORA_TOKEN_MINT.toString();
  };

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
        <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/10 p-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <Link href="/" className="shrink-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold cursor-pointer hover:text-purple-400 transition-colors">AIORA Intel</h1>
            </Link>
            <div className="flex items-center gap-1.5 overflow-hidden max-w-[calc(100%-120px)]">
              {hasAccess && !isLoadingAgents && selectedAgent && agents.length > 0 && (
                <>
                  <div className="shrink-0">
                    <TokenPrice tokenAddress={getAgentTokenAddress()} />
                  </div>
                  <div className="shrink-0">
                    <AgentSelector
                      agents={agents}
                      selectedAgent={selectedAgent}
                      onAgentChange={setSelectedAgent}
                    />
                  </div>
                </>
              )}
              <div className="shrink-0">
                <WalletMultiButton className="!bg-purple-500/20 hover:!bg-purple-500/30 transition-colors !py-0.5 !px-2 !h-7 !text-xs !min-w-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        <div className="p-4">
          {isLoading || isLoadingAgents ? (
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
              <p className="text-gray-300 mb-4">
                You need one of the following to access intelligence data:
                <br/>• 1,000,000 $AIORA tokens
                <br/>• 1,000,000 $DEGEN tokens
                <br/>• 100,000 $AI16Z tokens
              </p>
              <div className="space-y-2">
                <a 
                  href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-purple-500/20 text-white rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  Get $AIORA Tokens
                </a>
              </div>
            </div>
          ) : selectedAgent ? (
            <div className="space-y-6">
              <AgentIntelligence agent={selectedAgent} />
              <ImagePrompts address="ACUw6da4YXw7N3BPXVV3XTAYpZ8ZF4zC2P69hyTZZU8u" />
              
            </div>
          ) : (
            <div className="text-center max-w-2xl mx-auto mt-20 p-6 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">No Agents Available</h2>
              <p className="text-gray-300 mb-4">Unable to load intelligence agents. Please try again later.</p>
            </div>
          )}
        </div>

        {/* Fixed Chat Terminal - only show if has access */}
        {/* {hasAccess && (
          <div className="fixed bottom-4 right-4 w-80 z-50">
            <ChatTerminal />
          </div>
        )} */}
      </div>
    </div>
  );
};