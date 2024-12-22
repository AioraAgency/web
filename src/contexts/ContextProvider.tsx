import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Connection } from '@solana/web3.js';
import { FC, ReactNode, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Create a dynamic version of wallet components to prevent hydration errors
const WalletProviderDynamic = dynamic(
  () => import('@solana/wallet-adapter-react').then(mod => mod.WalletProvider),
  { ssr: false }
);

const WalletModalProviderDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletModalProvider),
  { ssr: false }
);

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const endpoint = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_RPC}`;
    
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProviderDynamic wallets={wallets} autoConnect>
                <WalletModalProviderDynamic>{children}</WalletModalProviderDynamic>
            </WalletProviderDynamic>
        </ConnectionProvider>
    );
};
