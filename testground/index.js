import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import async from 'async';
import 'regenerator-runtime/runtime';
async function handler(req, res) {
    const wsProvider = new WsProvider('wss://polkadot-node.polkaview.network');

    const api = new ApiPromise({ provider: wsProvider });

    await api.isReady;

    let users = await api.query.identity.identityOf.entries();

    users.forEach(function ([key, identity]) {

        console.log(key.args[0].toHuman())

        console.log(identity.toHuman());

    });
}




document.addEventListener('DOMContentLoaded', handler);