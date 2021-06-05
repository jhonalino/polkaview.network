import Link from 'next/link';
import { useEffect, useMemo, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';
import async from 'async';
import IdentityCard from '../../../components/IdentityCard';
import Head from '../../../components/Head';
import Header from '../../../components/Header';
import ReactPaginate from 'react-paginate';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { capitalCase } from "change-case";

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
    const [itemsToLoad, setItemsToLoad] = useState(32);

    const [filterFlags, setFilterFlags] = useState({
        registrar: false,
        council: false,
        'elected validator': false,
        'elected nominator': false,
        email: false,
        twitter: false,
        web: false,
        element: false,
        reasonable: false,
        'known good': false,
    });

    //debounce effect
    useEffect(() => {

        var timeoutId = window.setTimeout(function () {
            setDelayedSearchText(searchText);
        }, 300);

        return function () {
            window.clearTimeout(timeoutId);
        };

    }, [searchText])

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
                setIdentities(result);
                setLoading(false);
            });


        }

        fetch();

        return function () {
        }

    }, [props.suffix]);

    var filteredIdentities = useMemo(() => {

        return identities
            .filter(function ({ display, legal, address, isCouncil, isPrimeCouncil, isRegistrar,
                isValidator, isNominator,
                email, web, riot, twitter,
                judgements
            }) {

                var legalLower = legal.toLowerCase();
                var displayLower = display.toLowerCase();
                var searchLower = delayedSearchText.toLowerCase();

                var searchFilterValue = legalLower.includes(searchLower) || displayLower.includes(searchLower) || (delayedSearchText === address)


                let hasFilterFlagOn = false;
                let filterMatch = true;

                for (let flag in filterFlags) {
                    let flagVal = filterFlags[flag];

                    if (flagVal) {
                        hasFilterFlagOn = true

                        if (flag === 'council' && !isCouncil) {
                            filterMatch = false;
                        }

                        if (flag === 'registrar' && !isRegistrar) {
                            filterMatch = false;
                        }

                        if (flag === 'elected validator' && !isValidator) {
                            filterMatch = false;
                        }

                        if (flag === 'elected nominator' && !isNominator) {
                            filterMatch = false;
                        }

                        if (flag === 'email' && !email) {
                            filterMatch = false;
                        }

                        if (flag === 'twitter' && !twitter) {
                            filterMatch = false;
                        }

                        if (flag === 'web' && !web) {
                            filterMatch = false;
                        }

                        if (flag === 'element' && !riot) {
                            filterMatch = false;
                        }

                        if (flag === 'reasonable' && !judgements.some(({result}) => result.toLowerCase() === 'reasonable')) {
                            filterMatch = false;
                        }

                        if (flag === 'known good' && !judgements.some(({result}) => capitalCase(result).toLowerCase() === 'known good')) {
                            filterMatch = false;
                        }

                    }

                }


                if (hasFilterFlagOn) {
                    return searchFilterValue && filterMatch;
                } else {
                    return searchFilterValue;
                }

            });


    }, [delayedSearchText, identities, filterFlags]);

    const IdentityCardRow = ({ index, style }) => {
        let identity = filteredIdentities[index];

        return (
            <IdentityCard {...props} {...identity} style={style} />
        );
    };

    const handleFilterFlagClick = (flag) => {

        var selectedFlagVal = filterFlags[flag];

        setFilterFlags({
            ...filterFlags,
            [flag]: !selectedFlagVal
        });

    };

    const clearFilterFlags = () => {

        var copy = {
            ...filterFlags
        };

        for (var flag in copy) {
            copy[flag] = false;
        }

        setFilterFlags(copy);

    };

    return (
        <div className="w-full flex justify-center">
            <Head title={props.suffixFull + ' identities | polkaview'} />
            <div className="w-full max-w-screen-2xl min-h-screen px-4">
                <Header suffix={props.suffix} />
                {loading ? (<></>) : (<>
                    <div className="flex flex-col justify-center items-center w-full">
                        <div className="w-full bg-kinda-black flex justify-center">
                            <div className="bg-transparent w-full relative">
                                <input type="text" className={`m-auto px-4 py-4 box-border text-${props.suffix === 'dot' ? 'dot' : 'ksm'} text-2xl  w-full bg-transparent outline-none`}
                                    onFocus={() => {
                                        setSearchInputFocus(true);
                                    }}
                                    onBlur={() => {
                                        setSearchInputFocus(false);
                                    }}
                                    placeholder={searchInputFocus ? `search by name or account` : `search ${props.suffixFull} identities`} value={searchText} onInput={(e) => {
                                        setSearchText(e.target.value);
                                    }} />
                                {searchText && (
                                    <div className={`text-${props.suffix === 'dot' ? 'dot' : 'ksm'} h-16 w-16 absolute right-0 top-0 cursor-pointer`}
                                        onClick={() => {
                                            setSearchText('');
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
                    <div className="w-full h-10 flex items-center overflow-x-auto relative">
                        {Object.keys(filterFlags).map(function (flag) {
                            return (
                                <span key={flag}
                                    onClick={() => {
                                        handleFilterFlagClick(flag);
                                    }}
                                    className={`cursor-pointer select-none text-gray-400 rounded-lg px-4 py-2 whitespace-nowrap ${filterFlags[flag] ? (
                                        `text-${props.suffix === 'dot' ? 'dot' : 'ksm'}`
                                    ) : ""}`}>
                                    {flag}
                                </span>
                            )
                        })}
                    </div>
                </>
                )}
                <div className="w-full mb-24" style={{
                    minHeight: `calc(100vh - 178px)` //comes from manually calculating the header height
                }}>
                    {loading ? (
                        <div className="text-gray-200">
                            {loadingText}...
                        </div>
                    ) : (filteredIdentities.length > 0 ?
                        (<AutoSizer>
                            {({ width, height }) => {
                                return (
                                    <List
                                        height={height}
                                        itemCount={filteredIdentities.length}
                                        itemSize={380} //comes from manually calculating what fits
                                        width={width}
                                    >
                                        {IdentityCardRow}
                                    </List>
                                )
                            }}
                        </AutoSizer>)
                        : (
                            <div className="text-gray-200"
                                onClick={() => {
                                    if (delayedSearchText) {
                                        setSearchText('');
                                    } else {
                                        clearFilterFlags();
                                    }
                                }}>
                                no results found for
                                <span className={`mx-1 text-${props.suffix === 'dot' ? 'dot' : 'ksm'} underline cursor-pointer`}>
                                    {delayedSearchText || 'the selected filter'}...
                                </span>
                                lets <span className="underline cursor-pointer">clear</span> it?
                            </div>
                        )
                    )}
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
