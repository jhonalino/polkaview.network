const Cors = require('cors');
const redis = require('redis');
//const { client } = require('../../../../redis');
const client = redis.createClient({
    host: 'redis',
    port: 6379
});
const {promisify} = require("util");
import initMiddleware from "../../../../lib/init-middleware";

const getAsync = promisify(client.get).bind(client);
// Initialize the cors middleware
const cors = initMiddleware(
    // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST'],
    })
)

export default async function handler(req, res) {

    await cors(req, res);

    if (req.method != 'GET') {
        return;
    }


    var suffixFull;

    if (getSuffix(req) === 'DOT') {
        suffixFull = 'polkadot';
    } else if (getSuffix() === 'KSM') {
        suffixFull = 'kusama';
    }


    var nominationLowestList = [];

    var currentEra = await getAsync(`currentEra`);

    var currentEraIndex = parseInt(currentEra);

    for (var i = 0; i <= currentEraIndex; i++) {

        const who = await getAsync(`era_${i}_nominationLowest.who`);
        const stake = await getAsync(`era_${i}_nominationLowest.stake`);

        if (who == null || stake == null) {
            continue
        }

        nominationLowestList.push({
            who,
            stake,
            i
        });

    }

    res.statusCode = 200;

    res.json({
        nominationLowestList
    });

}

function getSuffix(req) {

    var network = req.query.network;

    network = network ? network.toUpperCase() : "DOT";

    if (network === 'DOT' || network === 'KSM') {
        return network;
    }

    return 'DOT';

}
