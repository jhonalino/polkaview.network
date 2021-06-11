import { useEffect, useState } from "react";
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { hexToString } from '@polkadot/util';
import Identicon from '@polkadot/react-identicon';
import { BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto'
import Head from '../../../../components/Head';
import Header from '../../../../components/Header';
import { useRouter } from 'next/router';
import { useSuffix } from '../../../../hooks/index';
import BN from 'bn.js';
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

const usePolkadotApi = function () {

};

const useProfile = function (address) {

};

export default function Index() {

    const [suffix, suffixFull] = useSuffix();

    const [address, setAddress] = useQueryRouter('address');

    function createChildKey(trieIndex) {
        return u8aToHex(
            u8aConcat(
                ':child_storage:default:',
                blake2AsU8a(
                    u8aConcat('crowdloan', trieIndex.toU8a())
                )
            )
        );
    }

    function toUnit(balance, decimals) {
        var base = new BN(10).pow(new BN(decimals));
        var dm = new BN(balance).divmod(base);
        return parseFloat(dm.div.toString() + "." + dm.mod.toString())
    }

    useEffect(() => {
        async function loadApi() {

            if (!suffix) {
                return false;
            }

            let wsUrl = 'wss://polkadot-node.polkaview.network';

            if (suffix === 'ksm') {
                wsUrl = 'wss://kusama-node.polkaview.network';
            }

            const wsProvider = new WsProvider(wsUrl);

            const api = new ApiPromise({ provider: wsProvider });

            await api.isReady;
            // expose api for testing
            window.api = api;

            var paraId = 2007;
            const keyring = new Keyring({ type: 'sr25519' });
            const fund = await api.query.crowdloan.funds(paraId);
            const trieIndex = fund.unwrap().trieIndex;
            const key = createChildKey(trieIndex)
            const keys = await api.rpc.childstate.getKeys(key, '0x');
            const ksmKeys = keys.map(k => keyring.encodeAddress(k, 2));
            const ss58Keys = keys.map(k => keyring.encodeAddress(k, 42));

            const values = await Promise.all(keys.map(k => api.rpc.childstate.getStorage(key, k)));

            console.log(values);

            const contributions = values
                .map((v) => api.createType('Option<StorageData>', v))
                .map((o) =>
                    o.isSome
                        ? api.createType('Balance', o.unwrap())
                        : api.createType('Balance'))
                .map((v) => v.toJSON())
                .map((c, idx) => ({
                    address: ksmKeys[idx],
                    balance: c / 1000000000000,
                }));

                console.log(contributions);
        }

        loadApi();

    }, [suffix])

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


