import Promise from 'bluebird';
import redis from 'redis';
Promise.promisifyAll(redis.RedisClient.prototype);

import Cors from 'cors'
// Initializing the cors middleware
const cors = Cors({
    methods: ['GET', 'HEAD'],
})

const client = redis.createClient({
    host: 'redis'
});
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}
export default async function handler(req, res) {
    await runMiddleware(req, res, cors)
    var network = req.query.network;

    network = network ? network.toLowerCase() : "dot";

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


    let latestEra = await client.getAsync(`${suffix}:latest.era`);

    const getStakingStat = async function ({ suffix, typeKey, statKey, era }) {

        //grab account
        var args = [`${suffix}:${typeKey}.${statKey}`, era];

        var account = await client.hgetAsync(args);

        //grab stats
        args = `${suffix}:${era}:${typeKey}:${account}`;

        var stat = await client.hgetallAsync(args);

        //grab identity
        args = `${suffix}:identities:${account}`;

        var identity = await client.hgetallAsync(args);

        stat.identity = identity;

        return stat;

    }

    const getStakingStatPre = function ({ suffix, era }) {
        return async function ({ typeKey, statKey }) {
            return await getStakingStat({ typeKey, statKey, suffix, era });
        }
    }

    const getStat = getStakingStatPre({ suffix: suffix, era: latestEra });

    var nominatorMinimum = await getStat({
        typeKey: 'nominators',
        statKey: 'minimum',
    });

    var validatorMinimum = await getStat({
        typeKey: 'validators',
        statKey: 'minimum',
    });

    var validatorMaximum = await getStat({
        typeKey: 'validators',
        statKey: 'maximum',
    });

    var nominationLowest = {
        totalStake: nominatorMinimum.valueF,
        nominator: nominatorMinimum.who,
    };

    var validatorHighest = {
        totalStake: validatorMaximum.totalF,
        validator: validatorMaximum.who,
    };

    var validatorLowest = {
        totalStake: validatorMinimum.totalF,
        validator: validatorMinimum.who,
    };

    res.json({
        nominationLowest,
        validatorHighest,
        validatorLowest,
        suffix,
        suffixFull,
    });

}