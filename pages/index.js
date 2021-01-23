import Head from 'next/head'
import styles from '../styles/Home.module.css'
import NumberFormat from 'react-number-format';
import CountUp from 'react-countup';

const redis = require('redis');
const client = redis.createClient();
const { promisify } = require("util");

const getAsync = promisify(client.get).bind(client);


const StatDisplay = function( props ) {

    console.log("test", props);

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
                    <h1 className={styles.title}>
                        <a href="/" ><span className="letter-spacing-md" ref={countUpRef}></span><span> DOT</span></a>
                    </h1>
                )}
            </CountUp>

        </div>
    );


}

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
                
                <StatDisplay decimals={2} prefix="~" val={ props.minDotToNominate } title="minimum staked" label=" to get rewards" />

                <StatDisplay val={ props.lowestStakedNominatorDots } title="minimum staked validator" label=" backings" />

                <StatDisplay val={ props.highestStakedNominatorDots } title="highest staked validator" label=" backings" />

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
            minDotToNominate: parseFloat(minDotToNominate),
            lowestStakedNominatorDots: parseFloat(lowestStakedNominatorDots),
            highestStakedNominatorDots: parseFloat(highestStakedNominatorDots),
        },
    }

}
