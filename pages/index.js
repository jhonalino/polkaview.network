import Head from 'next/head'
import styles from '../styles/Home.module.css'
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db  = lowdb(adapter);


export default function Home(props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Polkaview</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
           <a href="/">{ props.minDotToNominate } DOT</a>
        </h1>

        <p className={styles.description}>
            minimum dot to stake this era
        </p>

      </main>

    </div>
  )
}


export async function getServerSideProps(props) {

    var minDotToNominate = db.get( 'minDotToNominate' )
        .value();

    return {
        props: { minDotToNominate: parseFloat(minDotToNominate).toFixed(2) },
    }

}
