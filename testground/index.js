import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import async from 'async';
import 'regenerator-runtime/runtime';

async function handler(req, res) {
    const wsProvider = new WsProvider('wss://polkadot-node.polkaview.network');

    const api = new ApiPromise({ provider: wsProvider });

    await api.isReady;

    // get the chain information
    const chainInfo = await api.derive.staking.waitingInfo({ withController: true, withPrefs: true });
    window.a = chainInfo;
    console.log(chainInfo);
}




document.addEventListener('DOMContentLoaded', handler);