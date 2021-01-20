import Head from 'next/head'
import styles from '../styles/Home.module.css'

const redis = require('redis');
const client = redis.createClient();
const { promisify } = require("util");

const getAsync = promisify(client.get).bind(client);

export default function Home(props) {
    return (
        <div className={styles.container}>
            <Head>
                <title>Polkaview</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    <a href="/">~{ props.minDotToNominate } DOT</a>
                </h1>

                <p className={styles.description}>
                    minimum dot to stake this era
                </p>

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
