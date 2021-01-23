module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dot',
        permanent: true,
      },
    ]
  },
}
