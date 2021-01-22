import Head from 'next/head'
import styles from '../styles/Home.module.css'
import NumberFormat from 'react-number-format';

const redis = require('redis');
const client = redis.createClient();
const { promisify } = require("util");

const getAsync = promisify(client.get).bind(client);

export default function Home(props) {

    var text = `~${ props.minDotToNominate } DOT min stake | Polkaview`;
    return (
        <div className={styles.container}>
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
                <div className="stat-display">

                    <h1 className={styles.title}>
                        <a href="/" ><span class="letter-spacing-md">~{ props.minDotToNominate }</span> DOT</a>
                    </h1>

                    <p className={styles.description}>
                        <span class="is-white ">minimum staked</span> to get rewards
                    </p>

                </div>

                <div className="stat-display">

                    <h1 className={styles.title}>
                        <a href="/"><span class="letter-spacing-md"><NumberFormat displayType={'text'} thousandSeparator={true} value={ props.lowestStakedNominatorDots } /></span> DOT</a>
                    </h1>

                    <p className={styles.description}>
                        <span class="is-white">LOWEST Staked Validator </span> backings
                    </p>

                </div>

                <div className="stat-display">

                    <h1 className={styles.title}>
                        <a href="/"><span class="letter-spacing-md"><NumberFormat displayType={'text'} thousandSeparator={true} value={ props.highestStakedNominatorDots } /></span> DOT</a>
                    </h1>

                    <p className={styles.description}>
                        <span class="is-white">Highest Staked Validator </span> backings
                    </p>

                </div>

                <a style={{color:'white', marginTop: '10px' }} target="_blank" href="https://github.com/jhonalino/polkaview.network">

                    <img style={{ width: '25px' }}src="/github.png"/>

                </a>

            </main>

        </div>
    )
}


export async function getServerSideProps(props) {

    var minDotToNominate = await getAsync('lowestMinStake'); 
    var lowestStakedNominatorDots = await getAsync('lowestStakedValidator'); 
    var highestStakedNominatorDots = await getAsync('highestStakedValidator'); 

    return {
        props: { 
            minDotToNominate: parseFloat(minDotToNominate).toFixed(1),
            lowestStakedNominatorDots: parseFloat(lowestStakedNominatorDots).toFixed(0),
            highestStakedNominatorDots: parseFloat(highestStakedNominatorDots).toFixed(0),
        },
    }

}
