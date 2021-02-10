const {ApiPromise, WsProvider} = require('@polkadot/api');
const redis = require('redis');
const client = redis.createClient();

client.on('error', function (error) {
    console.error(error);
});

function connectToNetwork(args) {

	console.log('connecting');

    let provider,
        network = 'polkadot',
        rpc = 'ws://localhost:9944',
        decimal_places = 10000000000;

    if (args.length > 2 && args[2] === 'kusama') {

        network = 'kusama'
        rpc = 'wss://kusama-rpc.polkadot.io';
        decimal_places *= 100

    }

    provider = new WsProvider(rpc)

    return {provider, network, rpc, decimal_places};

}

function getMinMaxNominators(nominators) {

    let minNominator = null;
    let maxNominator = null;

    for (let j = 0; j < nominators.length; j++) {

        let currentNominator = nominators[j];

        if (!minNominator) {

            minNominator = maxNominator = currentNominator;

        } else {

            if (currentNominator.value >= maxNominator.value) {
                maxNominator = currentNominator;
            }

            if (currentNominator.value <= minNominator.value) {
                minNominator = currentNominator;
            }
        }

    }

    return { minNominator, maxNominator };

}

function nominatorMin(a, b) {

    if (!a && !b) {
        return null;
    }

    if (!a) {
        a = b;
        return a;
    }

    if (!b) {
        b = a;
        return b;
    }

    if (a.value <= b.value) {
        return a;
    }

    if (b.value <= a.value) {
        return b;
    }

}


function nominatorMax(a, b) {

    return nominatorMin(b, a)

}

(async () => {

    const { provider, network, decimal_places } = connectToNetwork(process.argv);

    const api = await ApiPromise.create({provider});

	console.log('connected');

    const [currentValidators, currentEra] = await Promise.all([
        api.query.session.validators(),
        api.query.staking.currentEra(),
    ]);

    let lowestMinNominator = null;
    let highestMinNominator = null;

    var currentEraIndex = parseInt(currentEra.toString());

    for (let k = 0; k < currentEraIndex; k++) {

        for (let i = 0; i < currentValidators.length; i++) {

            const validatorStake = await api.query.staking.erasStakers(
            k,
                currentValidators[i]
            );

            const validatorNominators = validatorStake['others'].toJSON();


            const { minNominator, maxNominator } = getMinMaxNominators(validatorNominators);

            lowestMinNominator = nominatorMin(minNominator, lowestMinNominator);
            highestMinNominator = nominatorMax(maxNominator, highestMinNominator);

        }

        if (lowestMinNominator) {
            console.log('era', k, lowestMinNominator.value);
        } else {
            console.log('era', k, 'no minimun nominator');
        }
    }



    process.exit();

})();


