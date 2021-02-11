import Head from 'next/head'
import useSWR from 'swr'
import CountUp from 'react-countup';
import Link from 'next/link';
import Chart from 'chart.js';
import { useRef, useEffect } from 'react';
import axios from 'axios';

const redis = require('redis');
const client = redis.createClient();
const { promisify } = require("util");

const getAsync = promisify(client.get).bind(client);

const fetcher = url => axios.get(url).then(res => res.data)

const StatDisplay = function( props ) {

    return (
        <div className="mb-10">

            <CountUp
                start={ 0 }
                delay={ 0 }
                end={ props.val }
                duration={0.75}
                separator=","
                decimals={ props.decimals || 0 }
                prefix={ props.prefix || "" }
            >
                {({ countUpRef, start }) => (
                    <h1 className="">
                        <div className="text-right text-xl md:text-3xl lg:text-5xl font-secondary tracking-wider" >
                            <span className={`text-${props.suffix.toLowerCase()} letter-spacing-md`} ref={countUpRef}></span> 
                            <span className={`text-${props.suffix.toLowerCase()}`}> {props.suffix}</span>
                        </div>
                    </h1>
                )}
            </CountUp>

            <p className="text-gray-500 text-right">
                <span className="text-white"> { props.title } </span> { props.label }
            </p>

            <p className="text-right">
                <a className="text-blue-500" target="_blank" href={`https://polkascan.io/${props.suffixFull}/account/${props.address}`}>
                    <span className="mr-1">polkascan</span> 
                    <svg className="inline" width="16px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </p>

        </div>
    );


}

export default function Home(props) {

    var text = `${ props.nominationLowest.totalStake } ${props.suffix} min stake | Polkaview`;


    const { data, error } = useSWR('/api/v0/dot/stats', fetcher)

    var canvasRef = useRef(null);

    useEffect(() => {

        if (!data || props.suffix != `DOT`) {
            return
        }

        console.log('data', data);

        var canvas = canvasRef.current;
        var ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: data.nominationLowestList.map(a => 'Era ' + a.i),
                datasets: [{
                    label: 'Minimum staked to get rewards',
                    borderColor: '#e6007a',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#fff',
                    data: data.nominationLowestList.map(a => parseInt(a.stake))
                }]
            },

            // Configuration options go here
            options: {
                tooltips: {
                    position: 'nearest',
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Era'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        position: 'right',
                        scaleLabel: {
                            display: true,
                            labelString: 'Minimum Staked to get rewards'
                        }
                    }]
                }
            }
        });

    }, [data, props.suffix])

    return (
        <div className="w-full flex justify-center">

            <Head>
                <title>{ text }</title>
                <link rel="icon" href="/favicon.ico" />
                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://polkaview.network/"/>
                <meta property="og:title" content={ text }/>
                <meta property="og:description" content={ text }/>
                <link rel="preconnect" href="https://fonts.gstatic.com"/>
                <link href="https://fonts.googleapis.com/css2?family=Orbitron&family=Raleway&display=swap" rel="stylesheet"/>
            </Head>

            <div className="w-full max-w-screen-xl min-h-screen">

                <header className="flex justify-start p-4">
                    <img src="/polkaview-logo.png" className="w-56" /> 
                </header>

                <div className="flex justify-center content-area">
                    <main className="p-6 w-full">

                        <StatDisplay address={props.nominationLowest.nominator}
                            val={props.nominationLowest.totalStake}
                            title="minimum staked" label=" to get rewards"
                            decimals={10} suffix={props.suffix} suffixFull={props.suffixFull}
                        />

                        <StatDisplay address={props.validatorLowest.validator}
                            val={props.validatorLowest.totalStake}
                            title="minimum staked validator" label=" backings"
                            suffix={props.suffix} suffixFull={props.suffixFull}

                        />

                        <StatDisplay address={props.validatorHighest.validator}
                            val={props.validatorHighest.totalStake}
                            title="highest staked validator" label=" backings"
                            suffix={props.suffix} suffixFull={props.suffixFull}
                        />

                        <div className="flex flex-col mt-20">

                            <Link href={`/api/v0${props.suffix === 'DOT' ? '/dot' : '/ksm'}`} >
                                <a className={`text-${props.suffix === 'DOT' ? 'dot' : 'ksm'} mb-2 text-right`} >
                                    <span className="text-gray-500">check it out as</span> json
                                </a>
                            </Link>

                            <Link href={props.suffix === 'DOT' ? '/ksm' : '/dot'} >
                                <a className={`text-${props.suffix === 'DOT' ? 'ksm' : 'dot'} mb-2 text-right`} >
                                    <span className="text-gray-500">or switch to </span> {props.suffix === 'DOT' ? 'kusama' : 'polkadot'}
                                </a>
                            </Link>

                            <Link href={`https://github.com/jhonalino/polkaview.network`} >
                                <a className={`text-${props.suffix === 'DOT' ? 'dot' : 'ksm'} mb-2 text-right`} >
                                    <span className="text-gray-500">view source code from</span> github
                                </a>
                            </Link>

                        </div>

                        {props.suffix === 'DOT' && (
                            <div className=""
                                style={{
                                    position: 'relative',
                                    height: '400px',
                                    width: '100%'
                                }}>
                                <canvas ref={canvasRef}></canvas>
                            </div>
                        )}


                    </main>
                </div>
            </div>

        </div>
    )
}


export async function getServerSideProps(context) {

    function getSuffix () {

        var network = context.query.network;

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

    return {
        props: { 
            nominationLowest,
            validatorHighest,
            validatorLowest,
            suffix: getSuffix(),
            suffixFull,
        },
    }

}
