import Head from 'next/head'
import styles from '../styles/Home.module.css'

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
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    <a href="/">~{ props.minDotToNominate } DOT</a>
                </h1>

                <p className={styles.description}>
                    minimum dot to stake this era
                </p>
                <a style={{color:'white', marginTop: '10px' }} target="_blank" href="https://github.com/jhonalino/polkaview.network">
                    <img style={{ width: '25px' }}src="/github.png"/>
                </a>
            </main>

        </div>
    )
}


export async function getServerSideProps(props) {

    var minDotToNominate = await getAsync('lowestMinStake'); 

    return {
        props: { 
            minDotToNominate: parseFloat(minDotToNominate).toFixed(1),
        },
    }

}
