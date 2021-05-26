// we define a minimal configuration
var klarConfig = {
    acceptAll: true,
    // How Klaro should store the user's preferences. It can be either 'cookies'
    // or 'localStorage'. If undefined, Klaro will use cookies.
    klaroStorage: "localStorage",

    // You can customize the name of the cookie that Klaro uses for storing
    // user consent decisions. If undefined, Klaro will use 'klaro'.
    cookieName: "polkaviewNetworkCookie",

    // You can also set a custom expiration time for the Klaro cookie.
    // By default, it will expire after 120 days.
    cookieExpiresAfterDays: 120,

    // Put a link to your privacy policy here (relative or absolute).
    privacyPolicy: "/privacypolicy",

    // Defines the default state for applications (true=enabled by default).
    default: true,

    // If "mustConsent" is set to true, Klaro will directly display the consent
    // manager modal and not allow the user to close it before having actively
    // consented or declines the use of third-party apps.
    mustConsent: false,
    // Example config that shows how to overwrite translations:
    // https://github.com/DPKit/klaro/blob/master/src/configs/i18n.js
    translations: {
        // If you erase the "consentModal" translations, Klaro will use the
        // defaults as defined in translations.yml
        en: {
            consentModal: {
                title: 'Information that we collect',
                description: 'Measuring our audience gives us useful statistics to improve the website and the products we build for you. By allowing these third party services, you accept their cookies and the use of tracking technologies necessary for their functioning.  For more information on how these tracking mechanisms work please see our ',
            },
            privacyPolicy: {
                text: '{privacyPolicy}.',
                name: 'privacy policy',
            },
            consentNotice: {
                description: "By browsing this website, you are allowing cookies from third-party services",
                learnMore: "learn more..."
            },
            googleAnalytics: {
                description:
                    "Collection of information about how visitors use our website",
            },
            googleTagManager: {
                description:
                    "Collection of information about how visitors use our website",
            },
            purposes: {
                analytics: "analytics and improvement of our sites",
            },
        },
    },
    services: [
        {
            name: 'google-tag-manager',
            purposes: ['analytics'],
            onAccept: `
              // we notify the tag manager about all services that were accepted. You can define
              // a custom event in GTM to load the service if consent was given.
              for(let k of Object.keys(opts.consents)){
                  if (opts.consents[k]){
                      let eventName = 'klaro-'+k+'-accepted'
                      dataLayer.push({'event': eventName})
                  }
              }
              // if consent for Google Analytics was granted we enable analytics storage
              if (opts.consents[opts.vars.googleAnalyticsName || 'google-analytics']){
                  console.log("Google analytics usage was granted")
                  gtag('consent', 'update', {'analytics_storage': 'granted'})
              }
              // if consent for Google Ads was granted we enable ad storage
              if (opts.consents[opts.vars.adStorageName || 'google-ads']){
                  console.log("Google ads usage was granted")
                  gtag('consent', 'update', {'ad_storage': 'granted'})
              }
          `,
            onInit: `
              // initialization code here (will be executed only once per page-load)
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){dataLayer.push(arguments)}
              gtag('consent', 'default', {'ad_storage': 'denied', 'analytics_storage': 'denied'})
              gtag('set', 'ads_data_redaction', true)
          `,
            onDecline: `
              // initialization code here (will be executed only once per page-load)
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){dataLayer.push(arguments)}
              gtag('consent', 'default', {'ad_storage': 'denied', 'analytics_storage': 'denied'})
              gtag('set', 'ads_data_redaction', true)
          `,
            vars: {
                googleAnalytics: 'google-analytics'
            }
        },
        {
            // In GTM, you should define a custom event trigger named `klaro-google-analytics-accepted` which should trigger the Google Analytics integration.
            name: 'google-analytics',
            purposes: ['analytics'],
            cookies: [
                /^_ga(_.*)?/ // we delete the Google Analytics cookies if the user declines its use
            ],
        }
    ]
}

export default klarConfig;