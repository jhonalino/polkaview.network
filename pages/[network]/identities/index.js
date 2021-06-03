import Head from 'next/head'
import Link from 'next/link';
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';
import async from 'async';
import { debounce } from 'lodash';
import {
    capitalCase,
} from "change-case";
function toShortAddress(_address) {

    const address = (_address || '');

    return (address.length > 13)
        ? `${address.slice(0, 6)}…${address.slice(-6)}`
        : address;

}

function getIdentityDetails(identity) {

    if (identity) {

        var judgements = identity.judgements;


        var colorMap = {
            unknown: 'text-gray-300',
            feePaid: 'text-gray-400',
            reasonable: 'text-green-400',
            knownGood: 'text-yellow-500',
            outOfDate: 'text-red-400',
            lowQuality: 'text-red-300',
            erroneous: 'text-red-500',
        };

        judgements = judgements.map(function ([index, result]) {

            var result = Object.keys(result)[0];

            return {
                index,
                result: result,
                textColorClass: colorMap[result]
            };

        });


        identity = identity.info;

        identity = {
            display: identity.display.raw ? hexToString(identity.display.raw) : "",
            legal: identity.legal.raw ? hexToString(identity.legal.raw) : "",
            web: identity.web.raw ? hexToString(identity.web.raw) : "",
            riot: identity.riot.raw ? hexToString(identity.riot.raw) : "",
            email: identity.email.raw ? hexToString(identity.email.raw) : "",
            twitter: identity.twitter.raw ? hexToString(identity.twitter.raw) : "",
            judgements: judgements,
        }

    } else {
        //explicit null cause I'm not sure what goes in identity
        // if its falsy
        //loll
        identity = null;
    }

    return identity;

}


export default function Index(props) {

    const [identities, setIdentities] = useState([]);
    const [searchText, setSearchText] = useState(props.search);
    const [delayedSearchText, setDelayedSearchText] = useState(props.search);
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('loading');
    const [searchInputFocus, setSearchInputFocus] = useState(false);

    // const [filterFlags, setFilterFlags] = useState({

    //     registrar,
    //     council,
    //     validator,
    //     nominator,

    //     alphabetal
    //     balance

    //     has sub account

    //     Unknown,
    //     FeePaid(Balance),
    //     Reasonable,
    //     KnownGood,
    //     OutOfDate,
    //     LowQuality,
    //     Erroneous,

    // });
    const _setDelayedSearchText = debounce(setDelayedSearchText, 100)

    useEffect(function () {
        async function fetch() {
            setLoading(true);

            setLoadingText('connecting to ' + props.suffixFull + ' blockchain');

            let wsUrl = 'wss://polkadot-node.polkaview.network';

            if (props.suffix === 'ksm') {
                wsUrl = 'wss://kusama-node.polkaview.network';
            }

            const wsProvider = new WsProvider(wsUrl);

            setLoadingText('connected');

            const api = new ApiPromise({ provider: wsProvider });

            setLoadingText('connecting to ' + props.suffixFull + ' api');

            await api.isReady;

            // expose api for testing
            window.api = api;

            setLoadingText('getting registrars');

            var registrars = await api.query.identity.registrars();

            registrars = registrars.toHuman();

            setLoadingText('getting council members');

            var councilMembers = await api.query.council.members();
            councilMembers = councilMembers.toJSON();

            var primeCouncil = await api.query.council.prime();
            primeCouncil = primeCouncil.toJSON();

            setLoadingText('loading ' + props.suffixFull + ' identities');

            let identities = await api.query.identity.identityOf.entries();

            async.map(identities, async function ([key, identity], cb) {
                var address = key.args[0].toHuman();
                var details = await getIdentityDetails(identity.toJSON());

                var accountDetails = await api.query.system.account(address);

                const { reserved: reservedRaw, free: freeRaw } = accountDetails.toJSON().data || {}

                accountDetails = accountDetails.toHuman().data || {};

                var subs = await api.query.identity.subsOf(address);

                //get sub accounts, excluding the balance
                subs = subs.toJSON()[1];

                var nominator = await api.query.staking.nominators(address);
                var isNominator = !nominator.isEmpty;

                var validator = await api.query.staking.validators(address);
                var isValidator = !validator.isEmpty;

                var result = {
                    //make sure to check sub accounts for some flags
                    isRegistrar: registrars.some(({ account }) => account === address) || subs.some(sub => (registrars.some(({ account }) => account === sub))),
                    isCouncil: councilMembers.includes(address) || subs.some(sub => councilMembers.includes(sub)),
                    isPrimeCouncil: address === primeCouncil || subs.some((sub => primeCouncil === sub)),
                    ...accountDetails,
                    freeRaw,
                    reservedRaw,
                    subs,
                    address,
                    ...details,
                    isValidator,
                    isNominator
                };

                cb(null, result)

            }, function (err, result) {

                if (err) {
                    console.log(err, 'err');
                    return;
                }
                console.log('result:', result[0]);
                setIdentities(result);
                setLoading(false);
            });


        }

        fetch();

        return function () {
            console.log('cleanup effect');
        }

    }, [props.suffix]);

    const text = props.suffixFull + ' identities | polkaview';

    console.log('render');

    return (
        <div className="w-full flex justify-center">

            <Head>
                <title>{text}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta property="og:type" content="website" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:url" content="https://polkaview.network/" />
                <meta property="og:title" content={text} />
                <meta property="og:description" content={text} />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Raleway&display=swap" rel="stylesheet" />
            </Head>

            <div className="w-full max-w-screen-3xl min-h-screen">
                <header className="flex p-4 items-center justify-between">
                    <div className="flex items-center justify-start">
                        <Link href="/" >
                            <a>
                                <img src="/polkaview-logo.png" className="w-56" />
                            </a>
                        </Link>
                    </div>
                    <div className="text-right flex justify-end">
                        <Link href={props.suffix === 'dot' ? '/ksm/identities' : '/dot/identities'} >
                            <a className={`text-${props.suffix === 'dot' ? 'ksm' : 'dot'} mb-2 text-right`} >
                                <span className="text-gray-500">switch to </span> {props.suffix === 'dot' ? 'kusama' : 'polkadot'}
                            </a>
                        </Link>
                    </div>
                </header>

                {loading ? (<></>) : (
                    <div className="flex flex-col justify-center items-center w-full">
                        <div className="w-full bg-kinda-black flex justify-center mb-4">
                            <div className="max-w-screen-2xl bg-transparent w-full relative">
                                <input type="text" className={`m-auto px-4 py-4 text-${props.suffix === 'dot' ? 'dot' : 'ksm'} text-2xl  w-full bg-transparent outline-none`}
                                    onFocus={() => {
                                        setSearchInputFocus(true);
                                    }}
                                    onBlur={() => {
                                        setSearchInputFocus(false);
                                    }}
                                    placeholder={searchInputFocus ? `search by name or account` : `search ${props.suffixFull} identities`} value={searchText} onInput={(e) => {
                                        setSearchText(e.target.value);
                                        _setDelayedSearchText(e.target.value);
                                    }} />
                                {searchText && (
                                    <div className={`text-${props.suffix === 'dot' ? 'dot' : 'ksm'} h-16 w-16 absolute right-0 top-0 cursor-pointer`}
                                        onClick={() => {
                                            setSearchText('');
                                            setDelayedSearchText('');
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="gray" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-center">
                    {loading ? (
                        <div className="text-gray-200">
                            {loadingText}...
                        </div>
                    ) : (identities
                        .filter(function ({ display, legal, address }) {

                            var legalLower = legal.toLowerCase();
                            var displayLower = display.toLowerCase();
                            var searchLower = delayedSearchText.toLowerCase();

                            return legalLower.includes(searchLower) || displayLower.includes(searchLower) || (searchText === address)

                        })
                        .map(function ({ address, display, legal, isValidator, isNominator, judgements, isPrimeCouncil, isCouncil, free, reserved, isRegistrar, riot, web, twitter, email, subs }) {
                            return (
                                <div key={address} className="text-white p-1 box-border">
                                    <div className='w-96 h-96 flex flex-col items-start justify-start bg-kinda-black rounded-sm p-4'>
                                        <div className="flex w-full items-center">
                                            <div className={`identicon-container border-2 ${props.suffix === 'dot' ? 'border-dot' : 'border-ksm'} rounded-full box-content p-2`}>
                                                <Identicon
                                                    value={address}
                                                    size={44}
                                                    theme={'polkadot'}
                                                />
                                            </div>
                                            <div className="flex flex-col items-center justify-center w-full text-center">
                                                <p className="text-gray-300">
                                                    {display}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    {legal}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {toShortAddress(address)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col mt-4">
                                            <div className="text-md text-gray-500">
                                                free: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} font-secondary`}>{free} </span>
                                            </div>
                                            <div className="text-md text-gray-500">
                                                reserved: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} font-secondary`}>{reserved} </span>
                                            </div>
                                            <div class="my-1"></div>
                                            <div className="text-md text-gray-500">
                                                twitter: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{twitter || '-'}</span>
                                            </div>
                                            <div className="text-md text-gray-500">
                                                email: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{email || '-'}</span>
                                            </div>
                                            <div className="text-md text-gray-500">
                                                web: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{web || '-'}</span>
                                            </div>
                                            <div className="text-md text-gray-500">
                                                element: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{riot || '-'}</span>
                                            </div>
                                            <div class="my-1"></div>
                                            <div className="text-md text-gray-500">
                                                subs count: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{subs.length}</span>
                                            </div>
                                            <div className="text-md text-gray-500">
                                                staking:
                                                {isValidator && (
                                                    <span className="text-blue-400 inline-block mx-1">
                                                        validator
                                                    </span>)
                                                }
                                                {isNominator && (
                                                    <span className="text-purple-400 inline-block mx-1">
                                                        nominator
                                                    </span>)
                                                }
                                                {!isValidator && !isNominator && (
                                                    <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} mx-1`}>-</span>
                                                )}
                                            </div>
                                            <div className="text-md text-gray-500">
                                                judgements:
                                                {
                                                    judgements.map(function ({ index, result, textColorClass }) {
                                                        return (<span key={index} className={`${textColorClass} inline-block mx-1`}>
                                                            {capitalCase(result).toLowerCase()}
                                                        </span>)
                                                    })
                                                }
                                                {
                                                    judgements.length === 0 && (
                                                        <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} mx-1`}>-</span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div class="my-1"></div>
                                        <div className="text-center w-full">
                                            <div className="flex flex-wrap justify-start font-bold text-lg uppercase">
                                                {isRegistrar && (
                                                    <span className="text-yellow-100 inline-block mr-1">
                                                        registrar
                                                    </span>)
                                                }
                                                {isPrimeCouncil && (
                                                    <span className="text-yellow-300 inline-block mr-1">
                                                        prime council
                                                    </span>)
                                                }
                                                {(isCouncil && !isPrimeCouncil) && (
                                                    <span className="text-pink-400 inline-block mr-1">
                                                        council
                                                    </span>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }))}
                </div>
            </div>
        </div >
    )
}



export async function getServerSideProps(context) {

    var network = context.query.network;

    network = network ? network.toLowerCase() : "dot";

    var search = context.query.search || '';

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

    return {
        props: {
            suffix,
            suffixFull,
            search
        }
    };

}
