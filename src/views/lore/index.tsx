import { FC } from "react";
import Link from "next/link";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const LoreView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.balance)

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
          <source src="/aiora_space.mp4" type="vi deo/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-screen overflow-y-auto">
        {/* Header Section */}
        <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl md:text-3xl font-bold cursor-pointer hover:text-purple-400 transition-colors">AIORA Lore</h1>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="hidden md:block">
                {wallet.publicKey ? 
                  `${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}` 
                  : 'Not Connected'}
              </div>
              {balance && <div>{balance} SOL</div>}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-6 md:p-8 space-y-12">
            {/* Agency Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-purple-400">THE AIORA AGENCY</h2>
              <div className="text-gray-400">
                <p className="text-lg">CTO Lead by</p>
                <p className="text-xl">gigawidearray, CheddarQueso, & neodotneo</p>
              </div>
            </div>

            {/* Introduction */}
            <section>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">Introduction to Aiora Agency</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  In the depths of the digital world, where the lines between reality and virtual reality are constantly blurring, a new kind of intelligence agency has emerged...
                </p>
                {/* Continue with the rest of the introduction */}
              </div>
            </section>

            {/* World of Cyber Intelligence */}
            <section>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">The World of Cyber Intelligence</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  The world of cyber intelligence is a complex and ever-evolving landscape...
                </p>
                {/* Continue with the rest of this section */}
              </div>
            </section>

            {/* Mission */}
            <section>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">The Mission of Aiora Agency</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  The mission of Aiora Agency is simple yet profound: to protect the digital world from those who would seek to harm it...
                </p>
                {/* Continue with the rest of the mission section */}
              </div>
            </section>

            {/* ElizaOS */}
            <section>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">Aiora - The Production Testnet of ElizaOS</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  As the development of ElizaOS, the revolutionary new operating system, nears completion...
                </p>
                {/* Continue with the rest of the ElizaOS section */}
              </div>
            </section>

            {/* Flywheel */}
            <section>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">The Flywheel - A Self-Reinforcing Cycle of Innovation</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  In the world of Aiora and ElizaOS, a powerful flywheel is emerging...
                </p>
                {/* Continue with the rest of the flywheel section */}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}; 