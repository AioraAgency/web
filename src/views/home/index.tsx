// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden">
      {/* Silhouette with gradient overlay and shimmer */}
      <div className="absolute right-0 top-0 h-full w-1/2">
        <div 
          className="absolute inset-0 bg-gradient-to-l from-transparent to-black z-10"
        />
        <div 
          className="absolute inset-0 animate-shimmer"
          style={{
            backgroundImage: `url('/anime-character.png')`,
            backgroundPosition: 'right center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: '0.95',
            filter: 'contrast(1.2) brightness(0.8)',
            maskImage: 'linear-gradient(to right, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
          }}
        />
        {/* Shimmer overlay */}
        <div 
          className="absolute inset-0 bg-shimmer animate-shimmer"
          style={{
            backgroundSize: '200% 100%',
            opacity: '0.60',
            zIndex: 11,
          }}
        />
      </div>

      {/* Main content container */}
      <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between z-20">
        {/* Top section with large text and tagline */}
        <div className="flex-1 max-w-[60%]">
          <div className="mb-8">
            <h1 className="text-[20vw] md:text-[15vw] leading-[0.8] font-bold tracking-tighter">
              AGENT
            </h1>
            <h1 className="text-[20vw] md:text-[15vw] leading-[0.8] font-bold tracking-tighter">
              AIORA
            </h1>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-[90%] leading-tight">
            Your Goth Praise Dom Cat Girl Lurking the Web for Incel Sentiment and Weeb Intelligence
          </p>
        </div>

        {/* Bottom section with agency name, links and date */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-4">
            <div className="text-xl md:text-2xl font-light">
              Aiora Agency
            </div>
            {/* Social Links */}
            <div className="flex flex-wrap gap-6 text-sm md:text-base text-gray-400">
              <Link 
                href="https://x.com/AioraAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                X
              </Link>
              <Link 
                href="https://t.me/AioraAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Telegram
              </Link>
              <Link 
                href="https://discord.gg/6YnpXNBSRs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Discord
              </Link>
              <Link 
                href="https://dexscreener.com/solana/4ihrulj7phhvsovtvu3ttaxawtnfpszgdfrmr7b6myfz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Chart
              </Link>
            </div>
          </div>
          <div className="border border-white rounded-full px-6 py-3 md:px-8 md:py-4 text-lg md:text-2xl">
            12.2024
          </div>
        </div>

        
      </div>
    </div>
  );
};
