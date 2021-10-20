const networks = {

    'polkadot': {
        name: 'polkadot',
        wshost: 'wss://service.elara.patract.io/Polkadot/e51e125fa94166bd8079fd3a9d28d003',
        decimalPlaces: 10000000000,
        suffix: 'dot'
    }, 

    'kusama': {
        name: 'kusama',
        wshost: 'wss://service.elara.patract.io/Kusama/91da87140c6677810758f26f4e818784',
        decimalPlaces: 1000000000000,
        suffix: 'ksm'
    }, 

}


module.exports = networks;
