import Document, { Html, Head, Main, NextScript } from 'next/document'




class MyDocument extends Document {

    render() {
        return (
            <Html>
                <Head>
                    <script data-type="application/javascript" type="text/plain" data-name="google-tag-manager" dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','GTM-KNWPRC3');`
                    }}>
                    </script>
                </Head>
                <Head />
                <body>
                    <noscript dangerouslySetInnerHTML={{
                        __html: `<iframe data-name="google-tag-manager" data-src="https://www.googletagmanager.com/ns.html?id=GTM-KNWPRC3"
                        height="0" width="0" style="display:none;visibility:hidden"></iframe>`
                    }}></noscript>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument