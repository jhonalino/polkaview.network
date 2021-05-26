import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import async from 'async';
import Promise from 'bluebird';
import redis from 'redis';

Promise.promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient({
    host: 'redis'
});

export default async function handler(req, res) {

    const wsProvider = new WsProvider('wss://polkadot-node.polkaview.network');

    var network = req.query.network;
    network = network ? network.toLowerCase() : "dot";

    var account = req.query.id;
    var suffix = '';

    if (network === 'dot' || network === 'ksm') {
        suffix = network;
    } else {
        suffix = 'dot';
    }

    var suffixFull;
    if (suffix === 'dot') {
        suffixFull = 'polkadot'
    } else {
        suffixFull = 'kusama'
    }

    let latestEra = await client.getAsync(`${suffix}:latest.era`);;

    const api = new ApiPromise({ provider: wsProvider })

    await api.isReady;



    // The actual address that we will use
    const ADDR = '14RYaXRSqb9rPqMaAVp1UZW2czQ6dMNGMbvukwfifi6m8ZgZ';
    // Retrieve the active era
    const activeEra = await api.query.staking.activeEra();
    const ctiveEra = await api.query.staking.currentEra();

    // retrieve all exposures for the active era
    const exposures = await api.query.staking.erasStakers.entries(activeEra.toJSON().index -5);

    console.log(exposures);
    exposures.forEach(([key, exposure]) => {
        console.log('key arguments:', key.args.map((k) => k.toHuman()));
        console.log('     exposure:', exposure.toHuman());
    });

    var glob = {
        exposures
    }

    console.log(glob)
    res.json(glob);

}

