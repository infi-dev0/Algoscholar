// ============================================================
//  ScholarAgent — Algorand Service
//  File: backend/services/algorand_service.js
//  Purpose: Node.js wrapper for Algorand SDK operations
// ============================================================

const algosdk = require('algosdk');

const ALGOD_ADDRESS = process.env.ALGOD_ADDRESS || 'https://testnet-api.algonode.cloud';
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const INDEXER_ADDRESS = process.env.INDEXER_ADDRESS || 'https://testnet-idx.algonode.cloud';
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || '';

const APP_ID = parseInt(process.env.SCHOLARSHIP_APP_ID || '0');
const ASSET_ID = parseInt(process.env.SCHOLAR_ASSET_ID || '0');

function getAlgodClient() {
    return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_ADDRESS, '');
}

function getIndexerClient() {
    return new algosdk.Indexer(INDEXER_TOKEN, INDEXER_ADDRESS, '');
}

/**
 * Get treasury SCHOLAR token balance
 */
async function getTreasuryBalance(treasuryAddress) {
    const client = getAlgodClient();
    try {
        const info = await client.accountInformation(treasuryAddress).do();
        const asset = (info.assets || []).find(a => a['asset-id'] === ASSET_ID);
        return asset ? asset.amount / 100 : 0;
    } catch (error) {
        console.error('Algorand balance error:', error.message);
        return 0;
    }
}

/**
 * Get all disbursement transactions for the app
 */
async function getTransactionHistory() {
    const indexer = getIndexerClient();
    try {
        const response = await indexer
            .searchForTransactions()
            .applicationID(APP_ID)
            .txType('appl')
            .do();

        return (response.transactions || []).map(txn => ({
            txId: txn.id,
            round: txn['confirmed-round'],
            timestamp: txn['round-time'],
            sender: txn.sender,
            type: 'disbursement',
        }));
    } catch (error) {
        console.error('Indexer error:', error.message);
        return [];
    }
}

/**
 * Get student's transaction history
 */
async function getStudentHistory(studentAddress) {
    const indexer = getIndexerClient();
    try {
        const response = await indexer
            .searchForTransactions()
            .address(studentAddress)
            .txType('appl')
            .do();

        return (response.transactions || []).map(txn => ({
            txId: txn.id,
            round: txn['confirmed-round'],
            timestamp: txn['round-time'],
            type: txn['tx-type'],
        }));
    } catch (error) {
        console.error('Indexer error:', error.message);
        return [];
    }
}

/**
 * Get application global state from smart contract
 */
async function getAppState() {
    const client = getAlgodClient();
    try {
        const info = await client.getApplicationByID(APP_ID).do();
        const globalState = {};
        for (const item of (info.params['global-state'] || [])) {
            const key = Buffer.from(item.key, 'base64').toString();
            globalState[key] = item.value.type === 2
                ? item.value.uint
                : Buffer.from(item.value.bytes || '', 'base64').toString();
        }
        return globalState;
    } catch (error) {
        console.error('App state error:', error.message);
        return null;
    }
}

/**
 * Get SCHOLAR token holders
 */
async function getAssetHolders() {
    const indexer = getIndexerClient();
    try {
        const response = await indexer.lookupAssetBalances(ASSET_ID).do();
        return (response.balances || [])
            .filter(b => b.amount > 0)
            .map(b => ({
                address: b.address,
                amount: b.amount / 100,
            }));
    } catch (error) {
        console.error('Asset holders error:', error.message);
        return [];
    }
}

module.exports = {
    getAlgodClient,
    getIndexerClient,
    getTreasuryBalance,
    getTransactionHistory,
    getStudentHistory,
    getAppState,
    getAssetHolders,
    APP_ID,
    ASSET_ID,
};
