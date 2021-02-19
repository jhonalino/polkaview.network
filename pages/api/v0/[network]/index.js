const Cors = require('cors');
const redis = require('redis');
const { client } = require('../../../../redis');
const { promisify } = require("util");
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

export default async function handler (req, res) {

    await cors(req, res);

    if ( req.method != 'GET' ) {
        return;
    }


    function getSuffix () {

        var network = req.query.network;

        network = network ? network.toUpperCase() : "DOT";

        if (network === 'DOT' || network === 'KSM') {
            return network;
        }

        return 'DOT';

    }

    var suffixFull;

    if (getSuffix() === 'DOT') {
        suffixFull = 'polkadot';
    }  else if (getSuffix() === 'KSM') {
        suffixFull = 'kusama';
    }

    var nominationLowest = {};

    var validatorHighest = {};

    var validatorLowest = {};

    nominationLowest.totalStake = parseFloat(await getAsync(`nominationLowest.totalStake.${getSuffix()}`));
    nominationLowest.nominator = await getAsync(`nominationLowest.nominator.${getSuffix()}`);

    validatorHighest.totalStake = parseFloat(await getAsync(`validatorHighest.totalStake.${getSuffix()}`));
    validatorHighest.validator = await getAsync(`validatorHighest.validator.${getSuffix()}`);

    validatorLowest.totalStake = parseFloat(await getAsync(`validatorLowest.totalStake.${getSuffix()}`));
    validatorLowest.validator = await getAsync(`validatorLowest.validator.${getSuffix()}`);


    res.statusCode = 200;


    res.json({ 
        nominationLowest,
        validatorHighest,
        validatorLowest,
        suffix: getSuffix(),
        suffixFull,
    });

}
