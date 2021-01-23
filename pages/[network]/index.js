import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import NumberFormat from 'react-number-format';
import CountUp from 'react-countup';
import Link from 'next/link';

const redis = require('redis');
const client = redis.createClient();
const { promisify } = require("util");

const getAsync = promisify(client.get).bind(client);


const StatDisplay = function( props ) {

    return (
        <div className="stat-display">

            <p className={styles.description}>
                <span className="is-white "> { props.title } </span> { props.label }
            </p>

            <CountUp
                start={ 0 }
                delay={ 0 }
                end={ props.val }
                duration={0.75}
                separator=","
                decimals={ props.decimals || 0 }
                prefix={ props.prefix || "" }
            >
                {({ countUpRef, start }) => (
                    <h1 className={`${styles.title} }`} >
                        <a target="_blank" href={`https://polkascan.io/${props.suffixFull}/account/${props.address}`} >
                            <span className={`text-${props.suffix.toLowerCase()} letter-spacing-md`} ref={countUpRef}></span> 
                            <span className={`text-${props.suffix.toLowerCase()}`}> {props.suffix}</span>
                        </a>
                    </h1>
                )}
            </CountUp>

        </div>
    );


}

export default function Home(props) {
    console.log(props);

    var text = `~${ props.nominationLowest.totalStake } ${props.suffix} min stake | Polkaview`;

    return (
        <div className={`${styles.container} network-${props.suffix}`}>
            <Head>
                <title>{ text }</title>
                <link rel="icon" href="/favicon.ico" />
                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://polkaview.network/"/>
                <meta property="og:title" content={ text }/>
                <meta property="og:description" content={ text }/>
                <link rel="preconnect" href="https://fonts.gstatic.com"/>
                <link href="https://fonts.googleapis.com/css2?family=Orbitron&family=Raleway&display=swap" rel="stylesheet"/>
            </Head>

            <main className={styles.main}>
                
                <StatDisplay address={ props.nominationLowest.nominator }
                    val={ props.nominationLowest.totalStake } 
                    title="minimum staked" label=" to get rewards" 
                    decimals={10} suffix={props.suffix} suffixFull={props.suffixFull}
                />

                <StatDisplay address={ props.validatorLowest.validator }
                    val={ props.validatorLowest.totalStake } 
                    title="minimum staked validator" label=" backings"
                    suffix={props.suffix} suffixFull={props.suffixFull}

                />

                <StatDisplay address={ props.validatorHighest.validator }
                    val={ props.validatorHighest.totalStake } 
                    title="highest staked validator" label=" backings"
                    suffix={props.suffix} suffixFull={props.suffixFull}
                />

                <div>

                    <Link href={props.suffix === 'DOT' ? '/ksm' : '/dot' }>
                        <a className={`text-${props.suffix === 'DOT' ? 'ksm' : 'dot'} switch-network-link`}>
                            <span className="is-white">switch to </span> { props.suffix === 'DOT' ? 'kusama' : 'polkadot' }
                        </a>
                    </Link>

                    <a style={{color:'white', marginTop: '10px', marginLeft: '10px' }} target="_blank" href="https://github.com/jhonalino/polkaview.network">

                        <img style={{ width: '25px' }}src="/github.png"/>

                    </a>

                </div>
            </main>

        </div>
    )
}


export async function getServerSideProps(context) {

    function getSuffix () {

        var network = context.query.network;

        network = network ? network.toUpperCase() : "DOT";

        if (network === 'DOT' || network === 'KSM') {
            return network;
        }

        return 'DOT';

    }
    
    var suffixFull;

    if (getSuffix() === 'DOT') {
        suffixFull = 'polkadot';
    }  else if (getSuffix() === 'KSM') {
        suffixFull = 'kusama';
    }

    var nominationLowest = {};

    var validatorHighest = {};

    var validatorLowest = {};

    nominationLowest.totalStake = parseFloat(await getAsync(`nominationLowest.totalStake.${getSuffix()}`));
    nominationLowest.nominator = await getAsync(`nominationLowest.nominator.${getSuffix()}`);

    validatorHighest.totalStake = parseFloat(await getAsync(`validatorHighest.totalStake.${getSuffix()}`));
    validatorHighest.validator = await getAsync(`validatorHighest.validator.${getSuffix()}`);

    validatorLowest.totalStake = parseFloat(await getAsync(`validatorLowest.totalStake.${getSuffix()}`));
    validatorLowest.validator = await getAsync(`validatorLowest.validator.${getSuffix()}`);

    return {
        props: { 
            nominationLowest,
            validatorHighest,
            validatorLowest,
            suffix: getSuffix(),
            suffixFull,
        },
    }

}
