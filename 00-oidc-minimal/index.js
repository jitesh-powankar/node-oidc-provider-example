const assert = require('assert');
const Provider = require('oidc-provider');

// since dyno metadata is no longer available, you infer the app name from heroku remote you set
// manually. This is not specific to oidc-provider, just an easy way of getting up and running
if (!process.env.HEROKU_APP_NAME && process.env.X_HEROKU_REMOTE) {
  process.env.X_HEROKU_REMOTE.match(/\.com\/(.+)\.git/);
  process.env.HEROKU_APP_NAME = RegExp.$1;
}

assert(process.env.HEROKU_APP_NAME, 'process.env.HEROKU_APP_NAME missing');
assert(process.env.PORT, 'process.env.PORT missing');
assert(process.env.SECURE_KEY, 'process.env.SECURE_KEY missing, run `heroku addons:create securekey`');
assert.equal(process.env.SECURE_KEY.split(',').length, 2, 'process.env.SECURE_KEY format invalid');

// new Provider instance with no extra configuration, will run in default, just needs the issuer
// identifier, uses data from runtime-dyno-metadata heroku here
const oidc = new Provider(`https://${process.env.HEROKU_APP_NAME}.herokuapp.com`, {
  clients: [{
    client_id: 'foo',
    client_secret: 'bar',
    redirect_uris: ['http://lvh.me/cb'],
  }],
});

// Heroku has a proxy in front that terminates ssl, you should trust the proxy.
oidc.proxy = true;

// set the cookie signing keys (securekey plugin is taking care of those)
oidc.keys = process.env.SECURE_KEY.split(',');

// listen on the heroku generated port
oidc.listen(process.env.PORT);
