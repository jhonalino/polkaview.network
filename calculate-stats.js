const {ApiPromise, WsProvider} = require('@polkadot/api');
const redis = require('redis');
const client = redis.createClient();

client.on('error', function (error) {
    console.error(error);
});

function connectToNetwork(args) {

    let provider,
        network = 'polkadot',
        rpc = 'wss://rpc.polkadot.io',
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

    const [currentValidators, currentEra] = await Promise.all([
        api.query.session.validators(),
        api.query.staking.currentEra(),
    ]);

    let lowestMinNominator = null;
    let highestMinNominator = null;


    for (let i = 0; i < currentValidators.length; i++) {


        console.log(currentEra.toString());

        const validatorStake = await api.query.staking.erasStakers(
            2,
            currentValidators[i]
        );

        const validatorNominators = validatorStake['others'].toJSON();


        const { minNominator, maxNominator } = getMinMaxNominators(validatorNominators);

        lowestMinNominator = nominatorMin(minNominator, lowestMinNominator);
        highestMinNominator = nominatorMax(maxNominator, highestMinNominator);

    }

    console.log('min', lowestMinNominator.value);

    process.exit();

})();


