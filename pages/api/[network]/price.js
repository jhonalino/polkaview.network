import async from 'async';
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

    await runMiddleware(req, res, cors);

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

    var usdPrice = await client.getAsync(`${suffix}:price`);
    var called = false;
    if (!usdPrice) {

        try {

            var priceResult = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${suffixFull}&vs_currencies=usd`)
                .then(function (response) {
                    return response.json();
                });

            if (priceResult && priceResult[suffixFull]) {

                usdPrice = priceResult[suffixFull].usd;

            } else {
                throw new Error("bad price data");
            }

        } catch (err) {
            //-1 for any errors so we can tell easily 
            usdPrice = -1
        }

        var args = [
            `${suffix}:price`,
            usdPrice,
            "ex", "60" // expre in 60 seconds
        ];

        await client.setAsync(args);

    }

    res.statusCode = 200;

    res.json({
        usdPrice: parseFloat(usdPrice)
    });

}

