import Link from 'next/link';
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';

import Head from '../../../components/Head';
import Header from '../../../components/Header';
export default function Index() {

    useEffect(async function () {

    }, [])

    return (
        <>
            <Head title={`Polkaview`} />

            <div className="w-full max-w-screen-xl min-h-screen">

                <Header suffix={props.suffix} />

            </div>

        </>
    )
}


