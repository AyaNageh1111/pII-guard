const autocannon = require('autocannon');
const { faker } = require('@faker-js/faker');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:9898'
function buildUrl() {
  const email = encodeURIComponent(faker.internet.email());
  const username = encodeURIComponent(faker.internet.username());
  return `/user/details?email=${email}&username=${username}`;
}

autocannon({
  url: TARGET_URL,
  connections: 1,
  duration: 1,
  requests: [
    {
      method: 'GET',
      setupRequest: (req) => {
        req.path = buildUrl();
        return req;
      }
    }
  ]
}, console.log);