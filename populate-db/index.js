const { ApiPromise, WsProvider } = require('@polkadot/api');
const { hexToString } = require('@polkadot/util');
const redis = require('redis');
const Promise = require("bluebird");

Promise.promisifyAll(redis.RedisClient.prototype);
// parent.js
var child_process = require('child_process');

var numchild = require('os').cpus().length;

console.log({ child_process, numchild });

const client = redis.createClient({
    host: 'redis'
});
const networks = require('./networks');
const yargs = require('yargs');
const async = require('async');
const util = require('util');

(async () => {

    const argv = yargs
        .option('network', {
            describe: 'select network',
            alias: 'n',
            default: 'polkadot'
        })
        .option('era', {
            describe: 'target era to calculate',
            alias: 'e'
        })
        .option('from', {
            describe: `the startin era to calculate from. this will stop to target era so if --era 33 --from 0 means start calculating from 0 and top at 33`,
            alias: 'f'
        })
        .argv;

    const selectedNetwork = argv.network;

    const network = networks[selectedNetwork];

    const { decimalPlaces, suffix } = network;

    const provider = new WsProvider(network.wshost);

    console.log('network', network);

    const api = await ApiPromise.create({ provider });


    console.log('connected');

    const [latestEra] = await Promise.all([
        api.query.staking.currentEra(),
    ]);


    await client.setAsync(`${suffix}:latest.era`, latestEra.toString());

    let targetEra = parseInt(argv.era) >= 0 ? argv.era : latestEra.toString();

    let fromEra = parseInt(argv.from) >= 0 ? argv.from : targetEra;

    targetEra = parseInt(targetEra);
    fromEra = parseInt(fromEra);

    console.log('era', { fromEra, targetEra });

    const eras = [];
    for (let k = fromEra; k <= targetEra; k++) {
        eras.push(k);
    }

    await async.eachLimit(eras, 5, async function (k) {

        let allValidators = [];
        let allNominators = {};


        let allNominatorsThisEra = {};

        const exposures = await api.query.staking.erasStakers.entries(k);

        var counter = 0;

        for (var [{ args: [, validatorID] }, exposure] of exposures) {

            let validator = exposure.toJSON();

            let identity = await getIdentity(validatorID.toString(), api);


            validator = {
                ...validator,
                who: validatorID.toString(),
                identity: identity,
                total: parseInt(validator.total),
            }
            var moreValidatorData = await api.query.staking.validators(validator.who);

            moreValidatorData = moreValidatorData.toHuman();

            console.log(moreValidatorData);
            validator.commission = moreValidatorData.commission || "";

            allValidators.push(validator);

            await async.each(validator.others, async function (nominator) {


                if (allNominators[nominator.who]) {

                    //accumate nominated value for accurate minimum
                    allNominators[nominator.who].value = parseInt(allNominators[nominator.who].value)
                        + parseInt(nominator.value);

                } else {

                    let identity = await getIdentity(nominator.who, api)

                    allNominators[nominator.who] = {
                        ...nominator,
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

            });

        }

        //grab and sort all nominators in ascending order
        allNominators = Object.values(allNominators);

        allNominators = allNominators.map(nominator => {
            return {
                ...nominator,
                valueF: nominator.value / decimalPlaces
            }
        });


        //grab and sort all validators in ascending order
        allValidators = allValidators.map(validator => {
            return {
                ...validator,
                ownF: validator.own / decimalPlaces,
                totalF: validator.total / decimalPlaces
            }
        });

        //cache nominators
        for (let nominatorIndex = 0; nominatorIndex < allNominators.length; nominatorIndex++) {

            let { who, value, validator, valueF, identity } = allNominators[nominatorIndex];

            let args = [
                `${suffix}:${k}:nominators`,
                valueF,
                who
            ];

            //sorted set by valueF
            await client.zaddAsync(args);

            args = [
                `${suffix}:${k}:nominators:${who}`,
                "who", who,
                "value", value,
                "validator", validator,
                "valueF", valueF,
            ]

            //after the sort are cached
            //then cache the properties as hash
            try {

                //make sure to delete key first to its fresh everytime we set it.
                //otherwise hmset just appends stuff
                response = await client.hmsetAsync(args);

                if (identity) {

                    var { display, legal, web, riot, email, twitter } = identity;

                    args = [
                        `${suffix}:identities:${who}`,
                        "display", display,
                        "legal", legal,
                        "web", web,
                        "riot", riot,
                        "email", email,
                        "twitter", twitter,
                    ]

                    response = await client.hmsetAsync(args);

                }

            } catch (error) {
                console.log(error);
            }

        }

        args = [
            `${suffix}:${k}:nominators`,
            "0",
            "-1",
        ]

        //already sorted in ascending order by redis sorted set
        var nominators = await client.zrangeAsync(args);

        var minimumNominator = nominators[0];
        var maximumNominator = nominators[nominators.length - 1];
        var medianNominator = nominators[Math.ceil(nominators.length / 2)];

        if (minimumNominator) {

            args = [
                `${suffix}:nominators.minimum`,
                k,
                minimumNominator,
            ]

            await client.hmsetAsync(args);
        }

        if (maximumNominator) {

            args = [
                `${suffix}:nominators.maximum`,
                k,
                maximumNominator,
            ]

            await client.hmsetAsync(args);
        }

        if (medianNominator) {

            args = [
                `${suffix}:nominators.median`,
                k,
                medianNominator,
            ]

            await client.hmsetAsync(args);
        }


        //cache validators
        for (let validatorIndex = 0; validatorIndex < allValidators.length; validatorIndex++) {

            let { who, totalF, ownF, identity, others, commission } = allValidators[validatorIndex];
            console.log({"kiko": commission});
            let args = [
                `${suffix}:${k}:validators`,
                totalF,
                who
            ];

            //sorted set by totalF
            client.zadd(args, function (err, res) {


                if (err) {
                    console.log('error when addding', err);
                    throw err;
                };


            });

            args = [
                `${suffix}:${k}:validators:${who}`,
                "who", who,
                "ownF", ownF,
                "totalF", totalF,
                "nominatorCount", others.length,
                "commission", commission
            ]

            //after the sort are cached
            //then cache the properties as hash
            try {

                //make sure to delete key first to its fresh everytime we set it.
                //otherwise hmset just appends stuff
                response = await client.hmsetAsync(args);


                //console.log('validator identity', identity);
                if (identity) {

                    var { display, legal, web, riot, email, twitter } = identity;

                    args = [
                        `${suffix}:identities:${who}`,
                        "display", display,
                        "legal", legal,
                        "web", web,
                        "riot", riot,
                        "email", email,
                        "twitter", twitter,
                    ]

                    response = await client.hmsetAsync(args);

                }

            } catch (error) {
                console.log(error);
            }

        }



        args = [
            `${suffix}:${k}:validators`,
            "0",
            "-1",
        ]
        //already sorted in ascending order by redis sorted set
        var validators = await client.zrangeAsync(args);

        var minimumValidator = validators[0];
        var maximumValidator = validators[validators.length - 1];
        var medianValidator = validators[Math.ceil(validators.length / 2)];


        if (minimumValidator) {

            args = [
                `${suffix}:validators.minimum`,
                k,
                minimumValidator,
            ]

            await client.hmsetAsync(args);
        }


        if (maximumValidator) {

            args = [
                `${suffix}:validators.maximum`,
                k,
                maximumValidator,
            ]

            await client.hmsetAsync(args);
        }


        if (medianValidator) {

            args = [
                `${suffix}:validators.median`,
                k,
                medianValidator,
            ]

            await client.hmsetAsync(args);
        }


        console.clear();

    })



    process.exit();

})();


async function getIdentity(accountId, api) {
    //   ===========================
    //assume we are dealing with sub account
    //so we can fall back to checking parent account
    var subAccount = accountId;

    let subIdentity = await api.query.identity.superOf(subAccount);
    subIdentity = subIdentity.toJSON();

    //if it is a subidentity then lets get the parent
    //cause the identity is only associated with the parent
    let parentAccount = null;
    if (subIdentity) {
        parentAccount = subIdentity[0];

    } else {
        //otherwise lets check if its a parent/main account
        parentAccount = subAccount
    }

    let identity = await api.query.identity.identityOf(parentAccount);
    identity = identity.toJSON();

    if (identity) {

        identity = identity.info;

        identity = {
            parentAccount: parentAccount != subAccount ? parentAccount : "",
            display: identity.display.raw ? hexToString(identity.display.raw) : "",
            legal: identity.legal.raw ? hexToString(identity.legal.raw) : "",
            web: identity.web.raw ? hexToString(identity.web.raw) : "",
            riot: identity.riot.raw ? hexToString(identity.riot.raw) : "",
            email: identity.email.raw ? hexToString(identity.email.raw) : "",
            twitter: identity.twitter.raw ? hexToString(identity.twitter.raw) : "",
        }

    } else {
        //explicit null cause I'm not sure what goes in identity
        // if its falsy
        //loll
        identity = null;
    }

    return identity;

}
