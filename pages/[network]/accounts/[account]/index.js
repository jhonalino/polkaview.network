import Link from 'next/link';
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';

import Head from '../../../../components/Head';
import Header from '../../../../components/Header';

import { useRouter } from 'next/router';
import { useSuffix } from '../../../../hooks/index';

export default function Index() {

    const [suffix, suffixFull] = useSuffix();

    useEffect(async function () {

    }, [])

    return (
        <>
            <Head title={`Polkaview`} />

            <div className="w-full max-w-screen-xl min-h-screen">

                <Header />


            </div>

        </>
    )

}


