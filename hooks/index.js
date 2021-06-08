import { useRouter } from 'next/router';
import { useEffect, useState } from "react";

const useSuffix = function () {

    const router = useRouter();

    const [{ suffix, suffixFull }, setNetwork] = useState({
        suffix: '',
        suffixFull: '',
    });

    useEffect(() => {

        if (!router.query.network) {
            return;
        }

        var _network = {
            suffix: 'dot',
            suffixFull: 'polkadot',
        };

        let _suffix = router.query.network.toLowerCase();

        if (_suffix === 'ksm') {
            _network = {
                suffix: 'ksm',
                suffixFull: 'kusama',
            };
        }

        setNetwork(_network);

    }, [router.query])


    return [suffix, suffixFull];

};

export {
    useSuffix
};