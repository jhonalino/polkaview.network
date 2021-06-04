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

    // const [filterFlags, setFilterFlags] = useState({

    //     registrar,
    //     council,
    //     validator,
    //     nominator,

    //     alphabetal
    //     balance

    //     has sub account

    // email twitter web element

    //     Unknown,
    //     FeePaid(Balance),
    //     Reasonable,
    //     KnownGood,
    //     OutOfDate,
    //     LowQuality,
    //     Erroneous,

    // });

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
            .filter(function ({ display, legal, address }) {

                var legalLower = legal.toLowerCase();
                var displayLower = display.toLowerCase();
                var searchLower = delayedSearchText.toLowerCase();

                return legalLower.includes(searchLower) || displayLower.includes(searchLower) || (delayedSearchText === address)

            });

    }, [delayedSearchText, identities]);

    const IdentityCardRow = ({ index, style }) => {
        let identity = filteredIdentities[index];

        return (
            <IdentityCard {...props} {...identity} style={style} />
        );
    };

    return (
        <div className="w-full flex justify-center">
            <Head title={props.suffixFull + ' identities | polkaview'} />
            <div className="w-full max-w-screen-2xl min-h-screen px-4">
                <Header suffix={props.suffix} />
                {loading ? (<></>) : (
                    <div className="flex flex-col justify-center items-center w-full">
                        <div className="w-full bg-kinda-black flex justify-center mb-4">
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
                )}
                <div className="w-full mb-24" style={{
                    minHeight: `calc(100vh - 138px)` //comes from manually calculating the header height
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
                            <div className="text-gray-200">
                                no results found for <span className={`text-${props.suffix === 'dot' ? 'dot' : 'ksm'} underline cursor-pointer`}
                                onClick={() => {
                                    setSearchText('');
                                }}>
                                    {delayedSearchText} 
                                </span>
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
