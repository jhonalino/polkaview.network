import Link from 'next/link';
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';

import Head from '../../../../components/Head';
import Header from '../../../../components/Header';

import { useRouter } from 'next/router';
import { useSuffix } from '../../../../hooks/index';

const useQueryRouter = function (key) {

    const router = useRouter();

    const [state, setState] = useState({});

    useEffect(() => {

        let temp = {
            ...state
        };

        temp[key] = router.query[key];

        setState(temp);

    }, [router.query]);

    return [
        state[key]
    ];

};

export default function Index() {

    const [suffix, suffixFull] = useSuffix();

    const [address, setAddress] = useQueryRouter('address');

    console.log(address);

    return (
        <>
            <Head title={`Polkaview`} />

            <div className="w-full max-w-screen-xl min-h-screen">

                <Header />

                <div className={`h-12 w-12 flex-shrink-0 md:h-44 md:w-44 border-2 ${suffix === 'dot' ? 'border-dot' : 'border-ksm'} rounded-full box-content p-2 bg-black`}>
                    <Identicon
                        style={{
                            height: '100%',
                            width: '100%',
                        }}
                        value={address}
                        size={'100%'}
                        theme={'polkadot'}
                    />
                </div>

            </div>

        </>
    )

}


