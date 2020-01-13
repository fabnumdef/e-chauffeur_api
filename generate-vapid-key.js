const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();
// eslint-disable-next-line no-console
console.log(JSON.stringify(vapidKeys));
