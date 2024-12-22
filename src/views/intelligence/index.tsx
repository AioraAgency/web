import { FC } from "react";
import Link from "next/link";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { ChatTerminal } from '../../components/ChatTerminal';

export const IntelligenceView: FC = ({ }) => {
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

        {/* Main Grid */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Crypto Intelligence */}
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

          {/* Social Intelligence */}
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

          {/* Anti-Terrorism Dashboard */}
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

        {/* Fixed Chat Terminal */}
        <div className="fixed bottom-4 right-4 w-80 z-50">
          <ChatTerminal />
        </div>
      </div>
    </div>
  );
};