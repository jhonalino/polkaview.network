


export default function Header() {
    return (
        <Head>
            <title>{text}</title>
            <link rel="icon" href="/favicon.ico" />
            <meta property="og:type" content="website" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:url" content="https://polkaview.network/" />
            <meta property="og:title" content={text} />
            <meta property="og:description" content={text} />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Raleway&display=swap" rel="stylesheet" />
        </Head>
    );
}