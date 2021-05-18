const networks = {

    'polkadot': {
        name: 'polkadot',
        wshost: 'wss://polkadot-node.polkaview.network',
        decimalPlaces: 10000000000,
        suffix: 'dot'
    }, 

    'kusama': {
        name: 'kusama',
        wshost: 'wss://kusama-node.polkaview.network',
        decimalPlaces: 1000000000000,
        suffix: 'ksm'
    }, 

}


module.exports = networks;
