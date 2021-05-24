import async from 'async';
import Promise from 'bluebird';
import redis from 'redis';
Promise.promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient({
    host: 'redis'
});

export default async function handler(req, res) {

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

    let latestEra = await client.getAsync(`${suffix}:latest.era`);;

    let args = [
        `${suffix}:${latestEra}:validators`,
        "0",
        "-1",
    ]

    //already sorted in ascending order by redis sorted set
    var validators = await client.zrangeAsync(args);

    validators = await async.map(validators, async function (address) {
             //grab identity
        var validator = {};

        var identity = await client.hgetallAsync(`${suffix}:identities:${address}`);
        var validatorProps =  await client.hgetallAsync(`${suffix}:${latestEra}:validators:${address}`);

        validator = {
            ...validatorProps,
            identity
        };

        return validator;

    });

    validators.sort(function (a, b) {
        return parseInt(b.nominatorCount) - parseInt(a.nominatorCount);
    });

    res.statusCode = 200;

    res.json({
        validators
    });

}

