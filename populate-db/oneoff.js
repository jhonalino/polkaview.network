const {ApiPromise, WsProvider} = require('@polkadot/api');
const { hexToString } = require('@polkadot/util');
const redis = require('redis');

const client = redis.createClient({
    host: 'redis'
});
const networks = require('./networks');
const yargs = require('yargs');
const async = require('async');

(async () => {

    const argv = yargs
        .option('network',{
            describe: 'select network',
            alias: 'n',
            default: 'polkadot'
        })
        .option('era',{
            describe: 'target era to calculate',
            alias: 'e'
        })
        .option('from',{
            describe: `the startin era to calculate from. this will stop to target era so if --era 33 --from 0 means start calculating from 0 and top at 33`,
            alias: 'f'
        })
        .argv;

    const selectedNetwork = argv.network;

    const network = networks[selectedNetwork];

    const { decimalPlaces, suffix } = network;

    const  provider = new WsProvider(network.wshost); 

    console.log('kiko balisko', network.wshost);

    const api = await ApiPromise.create({provider});

    const [currentEra] = await Promise.all([
        api.query.staking.currentEra(),
    ]);

    const targetEra = parseInt(argv.era) >= 0 ? argv.era : currentEra.toString();

    const fromEra = argv.from || targetEra;

    let allValidators = [];
    let allNominators = {};

    var hrstart = process.hrtime();

    for (let k = fromEra; k <= targetEra; k++) {

        let allNominatorsThisEra = {};

        const exposures = await api.query.staking.erasStakers.entries(k);

        var counter = 0;


        for (var [{args: [, validatorID]}, exposure] of exposures) { 

            let validator = exposure.toJSON();

            let identity = await getIdentity(validatorID.toString(), api);

            validator = {
                ...validator,
                ...identity,
                who: validatorID.toString(),
                total: parseInt(validator.total)
            }

            allValidators.push(validator);

            async.each(validator.others, async function (nominator) {

                if (allNominators[nominator.who]) {

                    // console.log('====');
                    // console.log(allNominators[nominator.who]);
                    // console.log(nominator);
                    // console.log('====');
                    //console.log('===');

                    allNominators[nominator.who].value = parseInt(allNominators[nominator.who].value) + parseInt(nominator.value);
                    //console.log(allNominators[nominator.who].value);

                } else {

                    let identity = await getIdentity(nominator.who, api)

                    allNominators[nominator.who] = {
                        ...nominator,
                        ...identity,
                        validator: validator.who,
                        identity: identity,
                        value: parseInt(nominator.value)
                    };

                }


            }, function (err) {

                if (err) {
                    console.error('we have an error', err);
                }

                counter++;

                //console.log('era', k);
                //console.log('progress', ((counter / exposures.length) * 100) + '%');

            });

        }

        allNominators = Object.values(allNominators);

        allNominators.sort(function(a,b) {
            return a.value - b.value;
        });

        allNominators = allNominators.map(nominator => {
            return {
                ...nominator,
                valueF: nominator.value / decimalPlaces
            }
        });


        allValidators.sort(function(a,b) {
            return a.total - b.total;
        });

        allValidators = allValidators.map(validator => {
            return {
                ...validator,
                totalF: validator.total / decimalPlaces
            }
        });



        var limit = 10;

        var bottomNominators = allNominators.slice(0, limit);
        var topNominators = allNominators.slice(allNominators.length - limit);

        var bottomValidators = allValidators.slice(0, limit);
        var topValidators = allValidators.slice(allValidators.length - limit);



    }


    client.set(`${suffix}:currentEra`, currentEra.toString(), redis.print);

    var [seconds] = process.hrtime(hrstart)
    //console.log(`total seconds`, seconds);

    process.exit();

})();


async function getIdentity(accountId, api) {

    let identity = await api.query.identity.identityOf(accountId);
    
    identity = identity.toJSON();

    if (identity) {

        identity = identity.info;

        identity = {
            display: identity.display.Raw ? hexToString(identity.display.Raw) : "",
            legal: identity.legal.Raw ? hexToString(identity.legal.Raw) : "",
            web: identity.web.Raw ? hexToString(identity.web.Raw) : "",
            riot: identity.riot.Raw ? hexToString(identity.riot.Raw) : "",
            email: identity.email.Raw ? hexToString(identity.email.Raw) : "",
            twitter: identity.twitter.Raw ? hexToString(identity.twitter.Raw) : "",
        }

    }

    return identity;
}
