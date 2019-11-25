const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();
console.log(JSON.stringify(vapidKeys));
