const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', function(error) {
    console.error(error);
});

module.exports = {
    client
};
