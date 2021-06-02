import Head from 'next/head'
import Link from 'next/link';
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';

function getIdentityDetails(identity) {

    if (identity) {

        console.log(identity)
        identity = identity.info;

        identity = {
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


export default function Index() {

    const [identities, setIdentities] = useState([]);

    useEffect(async function () {

        const wsProvider = new WsProvider('wss://polkadot-node.polkaview.network');

        const api = new ApiPromise({ provider: wsProvider });

        await api.isReady;

        let identities = await api.query.identity.identityOf.entries();

        identities = identities.map(function ([key, identity]) {

            return {
                id: key.args[0].toHuman(),
                ...getIdentityDetails(identity.toJSON())
            }

        });

        setIdentities(identities);

        console.log(identities[0]);

        var test = await api.query.identity.registrars();

        test = test.toHuman();

        var a = await api.query.identity.superOf(`1EpXirnoTimS1SWq52BeYx7sitsusXNGzMyGx8WPujPd1HB`);

        console.log(a.toHuman(), 'tesd')

    }, [])


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
                    {identities.map(function ({ id, display, legal }) {
                        return (
                            <div key={id} className="text-white p-1 box-border">
                                <div className='w-96 h-64 flex flex-col items-center justify-center bg-kinda-black rounded-sm'>
                                    <div className="identicon-container mb-4 border-2 border-dot rounded-full box-content p-2">
                                        <Identicon
                                            value={id}
                                            size={64}
                                            theme={'polkadot'}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-300">
                                            {display}
                                        </p>
                                        <p className="text-gray-400 text-xs">
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


