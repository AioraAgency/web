// Next, React
import { FC, useEffect } from 'react';
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
      <div className="absolute right-0 top-0 h-full w-1/2 md:w-1/2 lg:w-1/2">
        <div 
          className="absolute inset-0 bg-gradient-to-l from-transparent to-black z-10"
        />
        <div 
          className="absolute inset-0 animate-shimmer hidden md:block"
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
        {/* Mobile version of the character */}
        <div 
          className="absolute inset-0 animate-shimmer md:hidden"
          style={{
            backgroundImage: `url('/anime-character.png')`,
            backgroundPosition: 'center right',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: '0.75',
            filter: 'contrast(1.2) brightness(0.6)',
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
      <div className="absolute inset-0 p-4 md:p-8 lg:p-16 flex flex-col justify-between z-20">
        {/* Top section */}
        <div className="flex-1 flex flex-col">
          {/* Header and tagline */}
          <div className="max-w-full md:max-w-[60%]">
            <div className="mb-4 md:mb-6">
              <h1 className="text-[15vw] md:text-[15vw] leading-[0.8] font-bold tracking-tighter">
                AGENT
              </h1>
              <h1 className="text-[15vw] md:text-[15vw] leading-[0.8] font-bold tracking-tighter">
                AIORA
              </h1>
            </div>
            <p className="text-base md:text-xl lg:text-2xl text-gray-400 max-w-full md:max-w-[90%] leading-tight mb-6">
              Your Goth Praise Dom Cat Girl Lurking the Web for Sentiment and Intelligence
            </p>
          </div>
        </div>

        {/* Bottom section with agency name, links and intelligence button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
          <div className="flex flex-col gap-4">
            <div className="text-lg md:text-xl lg:text-2xl font-light">
              Aiora Agency
            </div>
            {/* Social Links */}
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base text-gray-400">
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
              <h1>3Vh9jur61nKnKzf6HXvVpEsYaLrrSEDpSgfMSS3Bpump</h1>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
            <Link href="/intel" className="w-full md:w-auto">
              <div className="border border-white rounded-full px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-base md:text-lg lg:text-2xl hover:bg-white/10 transition-colors cursor-pointer text-center">
                Intel
              </div>
            </Link>
            <Link href="/lore" className="w-full md:w-auto">
              <div className="border border-white rounded-full px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-base md:text-lg lg:text-2xl hover:bg-white/10 transition-colors cursor-pointer text-center">
                Lore
              </div>
            </Link>
            <Link href="/image-gen" className="w-full md:w-auto">
              <div className="border border-white rounded-full px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-base md:text-lg lg:text-2xl hover:bg-white/10 transition-colors cursor-pointer text-center">
                Image Gen
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
