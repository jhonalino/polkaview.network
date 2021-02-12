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

    const [currentEra] = await Promise.all([
        api.query.staking.currentEra(),
    ]);

    let lowestMinNominator = null;
    let highestMinNominator = null;

    var currentEraIndex = parseInt(currentEra.toString());

    for (let k = currentEraIndex - 10; k <= currentEraIndex; k++) {

        var allNominatorsThisEra = {};

        const exposures = await api.query.staking.erasStakers.entries(k);

        exposures.forEach(function([{ args: [ , validatorID] }, exposure], index) {

            //console.log('validatorid', validatorID.toString());
            //console.log(exposure.others.toJSON());

            var noms = exposure.others.toJSON();

            noms.forEach(nom => {

                if (allNominatorsThisEra[nom.who]) {

                    allNominatorsThisEra[nom.who].push(nom.value);

                } else {

                    allNominatorsThisEra[nom.who] = [nom.value];

                }

            });


        });


        for (var item in allNominatorsThisEra) {
            var totalNominated = allNominatorsThisEra[item].reduce((acc, val) => acc + val, 0);

            if (lowestMinNominator === null || lowestMinNominator.totalStake >= totalNominated) {
                lowestMinNominator = {
                    who: item,
                    totalStake: totalNominated / decimal_places
                }
            }

        }

        client.set(`era_${k}_nominationLowest.stake`, lowestMinNominator.totalStake, redis.print);
        client.set(`era_${k}_nominationLowest.who`, lowestMinNominator.who, redis.print);

        lowestMinNominator = null;

    }



    process.exit();

})();


