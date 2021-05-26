module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dot/staking',
        permanent: false,
      },
      {
        source: '/dot',
        destination: '/dot/staking',
        permanent: false,
      },
      {
        source: '/ksm',
        destination: '/ksm/staking',
        permanent: false,
      },
    ]
  },
}
