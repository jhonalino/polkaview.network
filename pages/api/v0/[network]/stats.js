import initMiddleware from "../../../../lib/init-middleware";
const Cors = require('cors');
const redis = require('redis');
const redisconn = require('../../../../redisconn');
const client = redis.createClient(redisconn);
const JSONCache = require('redis-json');
const {promisify} = require("util");

const jsonCache = new JSONCache(client);
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



    const currentEra = await getAsync(`dot:currentEra`);




    const topNominators = await jsonCache.get(`dot:nominators:top:${currentEra}`);
    const bottomNominators = await jsonCache.get(`dot:nominators:bottom:${currentEra}`);

    const topValidators = await jsonCache.get(`dot:validators:top:${currentEra}`);
    const bottomValidators = await jsonCache.get(`dot:validators:bottom:${currentEra}`);

    res.statusCode = 200;

    res.json({
        nominationLowestList: [],
        currentEra,
        topNominators,
        bottomNominators,
        topValidators,
        bottomValidators
    });

}

