const networks = {

    'polkadot': {
        name: 'polkadot',
        rpc: 'ws://localhost:9944',
        decimalPlaces: 10000000000,
        suffix: 'dot'
    }, 

    'kusama': {
        name: 'kusama',
        rpc: 'wss:/kusama-rpc.polkadot.io',
        decimalPlaces: 1000000000000,
        suffix: 'ksm'
    }, 

}


module.exports = networks;
