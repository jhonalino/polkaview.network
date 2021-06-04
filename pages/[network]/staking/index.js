import useSWR from 'swr'
import CountUp from 'react-countup';
import Link from 'next/link';
import Chart from 'chart.js';
import { useRef, useEffect } from 'react';
import axios from 'axios';
import Promise from 'bluebird';
import redis from 'redis';

import Head from '../../../components/Head';
import Header from '../../../components/Header';

const fetcher = url => axios.get(url).then(res => res.data)

const StatDisplay = function (props) {
    console.log(props.val, props.title)

    return (
        <div className="p-4 inline-flex w-96 h-52 flex-col items-start">

            <p className="text-gray-500">
                <span> {props.title} </span> {props.label}
            </p>

            <CountUp
                start={0}
                delay={0}
                end={parseFloat(props.val)}
                duration={0.75}
                separator=","
                decimals={props.decimals || 4}
                prefix={props.prefix || ""}
            >
                {({ countUpRef, start }) => (
                    <h1 className="">
                        <div className="text-2xl font-secondary tracking-wider" >
                            <span className={`text-${props.suffix.toLowerCase()} letter-spacing-md`} ref={countUpRef}></span>
                            <span className={`text-${props.suffix.toLowerCase()}`}> {props.suffix}</span>
                        </div>
                    </h1>
                )}
            </CountUp>
            <CountUp
                start={0}
                delay={0}
                end={parseFloat(props.val) * parseFloat(props.price)}
                duration={0.75}
                separator=","
                decimals={props.decimals || 4}
                prefix="$"
            >
                {({ countUpRef, start }) => (
                    <h1 className="text-right">
                        <div className="text-md font-secondary tracking-widest">
                            <span className={`text-${props.suffix.toLowerCase()}`} ref={countUpRef}></span>
                        </div>
                    </h1>
                )}
            </CountUp>

            <div className="">
                {props.suffixFull === 'polkadot' &&

                    <div>
                        <a className="text-blue-500 text-md lowercase" target="_blank" href={`https://dotscanner.com/account/${props.address}`}>
                            <span className="mr-1">DotScanner</span>
                            <svg className="inline" width="12px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>

                }
                <div>
                    <a className="text-blue-500 text-md lowercase" target="_blank" href={`https://polkascan.io/${props.suffixFull}/account/${props.address}`}>
                        <span className="mr-1">polkascan</span>
                        <svg className="inline" width="12px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>

        </div>
    );


}

export default function Home(props) {

    console.log(props);

    const { data, error } = useSWR(`/api/${props.suffix}/validators`, fetcher)


    useEffect(() => {

        if (!data) {
            return
        }

        console.log(data)

    }, [data, props.suffix])

    return (
        <div className="w-full flex justify-center">

            <Head title={`${props.nominatorMinimum.valueF} ${props.suffixUppercase} min stake | Polkaview`}  />

            <div className="w-full max-w-screen-xl min-h-screen">

                <Header suffix={props.suffix} />

                <div className="flex justify-center text-center">
                    <Link href="/dot/identities" >
                        <a className="text-dot underline">
                            checkout identities beta
                        </a>
                    </Link>
                </div>
                <div className="flex justify-center">

                    <main className="p-6 w-full flex flex-wrap justify-center items-center">

                        <StatDisplay address={props.nominatorMinimum.who}
                            val={props.nominatorMinimum.valueF}
                            title="minimum staked"
                            price={props.usdPrice}
                            suffix={props.suffixUppercase} suffixFull={props.suffixFull}
                        />

                        <StatDisplay address={props.nominatorMedian.who}
                            val={props.nominatorMedian.valueF}
                            title="median staked"
                            price={props.usdPrice}
                            suffix={props.suffixUppercase} suffixFull={props.suffixFull}
                        />


                        <StatDisplay address={props.nominatorMaximum.who}
                            val={props.nominatorMaximum.valueF}
                            title="most staked"
                            price={props.usdPrice}
                            suffix={props.suffixUppercase} suffixFull={props.suffixFull}
                        />


                        {/* validator */}
                        <StatDisplay address={props.validatorMinimum.who}
                            val={props.validatorMinimum.totalF}
                            title="minimum validator backings"
                            price={props.usdPrice}
                            suffix={props.suffixUppercase} suffixFull={props.suffixFull}
                        />

                        <StatDisplay address={props.validatorMedian.who}
                            val={props.validatorMedian.totalF}
                            title="median validator backings"
                            price={props.usdPrice}
                            suffix={props.suffixUppercase} suffixFull={props.suffixFull}
                        />

                        <StatDisplay address={props.validatorMaximum.who}
                            val={props.validatorMaximum.totalF}
                            title="highest validator backings"
                            price={props.usdPrice}
                            suffix={props.suffixUppercase} suffixFull={props.suffixFull}
                        />

                    </main>
                </div>

                <div className="text-white">

                    <table className={`table-auto table-${props.suffix}`}>
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Address</th>
                                <th>Nominators</th>
                                <th>Own Stake</th>
                                <th>Total Stake</th>
                                <th>Commission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.validators && data.validators.map(function ({ identity,
                                ownF,
                                totalF,
                                who,
                                nominatorCount,
                                commission }) {

                                return (
                                    <tr key={who}>
                                        <td>{identity?.display || 'none'}</td>
                                        <td>{who}</td>
                                        <td>{nominatorCount}</td>
                                        <td className="font-secondary tracking-widest">
                                            <CountUp
                                                start={0}
                                                delay={0}
                                                separator=","
                                                duration={0.1}
                                                decimals={2}
                                                end={parseFloat(ownF)}
                                            >
                                                {({ countUpRef, start }) => (
                                                    <h1 className="">
                                                        <div className="font-secondary tracking-wider" >
                                                            <span className="font-secondary tracking-widest" ref={countUpRef}></span>
                                                        </div>
                                                    </h1>
                                                )}
                                            </CountUp>
                                        </td>
                                        <td >
                                            <CountUp
                                                start={0}
                                                delay={0}
                                                separator=","
                                                duration={0.1}
                                                decimals={2}
                                                end={parseFloat(totalF)}
                                            >
                                                {({ countUpRef, start }) => (
                                                    <h1 className="">
                                                        <div className="font-secondary tracking-wider" >
                                                            <span className="font-secondary tracking-widest" ref={countUpRef}></span>
                                                        </div>
                                                    </h1>
                                                )}
                                            </CountUp>
                                        </td>
                                        <td>{commission}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                </div>
            </div>

        </div>
    )
}


export async function getServerSideProps(context) {
    Promise.promisifyAll(redis.RedisClient.prototype);


    const client = redis.createClient({
        host: 'redis'
    });


    var network = context.query.network;

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


    let latestEra = await client.getAsync(`${suffix}:latest.era`);

    const getStakingStat = async function ({ suffix, typeKey, statKey, era }) {

        //grab account
        var args = [`${suffix}:${typeKey}.${statKey}`, era];

        var account = await client.hgetAsync(args);

        //grab stats
        args = `${suffix}:${era}:${typeKey}:${account}`;

        var stat = await client.hgetallAsync(args);

        //grab identity
        args = `${suffix}:identities:${account}`;

        var identity = await client.hgetallAsync(args);

        stat.identity = identity;

        return stat;

    }

    const getStakingStatPre = function ({ suffix, era }) {
        return async function ({ typeKey, statKey }) {
            return await getStakingStat({ typeKey, statKey, suffix, era });
        }
    }

    const getStat = getStakingStatPre({ suffix: suffix, era: latestEra });

    var nominatorMinimum = await getStat({
        typeKey: 'nominators',
        statKey: 'minimum',
    });

    var nominatorMaximum = await getStat({
        typeKey: 'nominators',
        statKey: 'maximum',
    });

    var nominatorMedian = await getStat({
        typeKey: 'nominators',
        statKey: 'median',
    });

    var validatorMinimum = await getStat({
        typeKey: 'validators',
        statKey: 'minimum',
    });

    var validatorMaximum = await getStat({
        typeKey: 'validators',
        statKey: 'maximum',
    });

    var validatorMedian = await getStat({
        typeKey: 'validators',
        statKey: 'median',
    });

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

    //

    return {
        props: {
            nominatorMinimum, nominatorMedian, nominatorMaximum,
            validatorMinimum, validatorMedian, validatorMaximum,
            latestEra,
            suffix,
            suffixFull,
            usdPrice: parseFloat(usdPrice),
            suffixUppercase: suffix.toUpperCase()
        },
    }

}
