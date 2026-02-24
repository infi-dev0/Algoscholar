// ============================================================
//  ScholarAgent — Pera Wallet Connect Component
//  File: frontend/src/components/WalletConnect.jsx
// ============================================================

import React, { useEffect, useRef } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

function WalletConnect({ walletAddress, onConnect, onDisconnect }) {
    const isConnectedRef = useRef(false);

    useEffect(() => {
        // Reconnect on page reload
        peraWallet.reconnectSession()
            .then((accounts) => {
                if (accounts.length) {
                    onConnect(accounts[0]);
                    isConnectedRef.current = true;
                }
            })
            .catch(() => { });

        peraWallet.connector?.on('disconnect', () => {
            onDisconnect();
            isConnectedRef.current = false;
        });
    }, []);

    const handleConnect = async () => {
        try {
            const accounts = await peraWallet.connect();
            if (accounts.length) {
                onConnect(accounts[0]);
                isConnectedRef.current = true;
            }
        } catch (error) {
            console.error('Wallet connect error:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await peraWallet.disconnect();
            onDisconnect();
            isConnectedRef.current = false;
        } catch (error) {
            console.error('Wallet disconnect error:', error);
        }
    };

    if (walletAddress) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="wallet-addr">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
                <button className="wallet-btn connected" onClick={handleDisconnect}>
                    <i className="fas fa-wallet"></i> Connected
                </button>
            </div>
        );
    }

    return (
        <button className="wallet-btn" onClick={handleConnect}>
            <i className="fas fa-wallet"></i> Connect Wallet
        </button>
    );
}

export default WalletConnect;
