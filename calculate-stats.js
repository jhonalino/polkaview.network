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

    for (let k = 169; k <= currentEraIndex; k++) {

        for (let i = 0; i < currentValidators.length; i++) {

            const validatorStake = await api.query.staking.erasStakers(
            k,
                currentValidators[i]
            );

            const validatorNominators = validatorStake['others'].toJSON();

            let lowestMinNominatorInThisValidator = validatorNominators.reduce(function(acc, nominator) {

                if (acc === null || nominator.value <= acc.value) {
                    return nominator;
                } else {
                    return acc;
                }

            }, null);

            if (lowestMinNominator === null) {
                lowestMinNominator = lowestMinNominatorInThisValidator;
            } else if (lowestMinNominatorInThisValidator && lowestMinNominatorInThisValidator.value <= lowestMinNominator.value) {
                lowestMinNominator = lowestMinNominatorInThisValidator;
            }

        }


        const lowestMinNominatorStake = lowestMinNominator ? lowestMinNominator.value / decimal_places : 0;
        const lowestMinNominatorWho = lowestMinNominator ? lowestMinNominator.who : undefined;

        console.log(lowestMinNominatorStake);
        //client.set(`era_${}_nominationLowest.totalStake`, lowestMinNominator && lowestMinNominator.value);
	    lowestMinNominator = null;
    }



    process.exit();

})();


