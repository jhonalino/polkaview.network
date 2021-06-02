import Head from 'next/head'
import Link from 'next/link';
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';
import async from 'async';

function toShortAddress(_address) {

    const address = (_address || '');

    return (address.length > 13)
        ? `${address.slice(0, 6)}…${address.slice(-6)}`
        : address;

}

function getIdentityDetails(identity) {

    if (identity) {

        var judgements = identity.judgements;

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


export default function Index() {

    const [identities, setIdentities] = useState([]);
    const [registrar, setRegistrars] = useState([]);


    useEffect(async function () {

        const wsProvider = new WsProvider('wss://polkadot-node.polkaview.network');

        const api = new ApiPromise({ provider: wsProvider });

        await api.isReady;

        var registrars = await api.query.identity.registrars();

        registrars = registrars.toHuman();

        console.log(registrars);

        setRegistrars(registrars);

        let identities = await api.query.identity.identityOf.entries();

        identities = await async.mapLimit(identities, async function ([key, identity]) {

            var address = key.args[0].toHuman();
            var details = await getIdentityDetails(identity.toJSON());

            var nominator = await api.query.staking.nominators(address);
            var isNominator = !nominator.isEmpty;

            var validator = await api.query.staking.validators(address);
            var isValidator = !validator.isEmpty;

            console.log(address);

            return {
                ...address,
                ...details,
                isValidator,
                isNominator
            };

        });


        console.log('iden', identities);
        setIdentities(identities);

    }, [])

    console.log('testtt')
    const text = '';
    const props = {};

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

            <div className="w-full max-w-screen-xl min-h-screen">
                <header className="flex p-4 items-center justify-between">
                    <div className="flex items-center justify-start">
                        <div>
                            <img src="/polkaview-logo.png" className="w-56" />
                        </div>
                    </div>
                    <div>

                        <Link href={props.suffix === 'dot' ? '/ksm/staking' : '/dot/staking'} >
                            <a className={`text-${props.suffix === 'dot' ? 'ksm' : 'dot'} mb-2 text-right`} >
                                <span className="text-gray-500">switch to </span> {props.suffix === 'dot' ? 'kusama' : 'polkadot'}
                            </a>
                        </Link>
                    </div>
                </header>
                <div className="flex flex-wrap items-center justify-center">
                    {identities && identities.map(function ({ address, display, legal }) {
                        return (
                            <div key={address} className="text-white p-1 box-border">
                                <div className='w-96 h-64 flex flex-col items-center justify-center bg-kinda-black rounded-sm'>
                                    <div className="identicon-container mb-4 border-2 border-dot rounded-full box-content p-2">
                                        <Identicon
                                            value={address}
                                            size={64}
                                            theme={'polkadot'}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-300">
                                            {display}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {legal}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


