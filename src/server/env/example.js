// Replace the following with your values
const serverPort = 3001;

// Make up a secret that is unique, random and long for your app to use.
// Also, make sure to use a different secret for each environment you plan to use.
const sessionSecret = 'your-unique-randomly-generated-secret';

const cosmos = {
  accountName: 'your-value-goes-here',
  databaseName: 'your-value-goes-here',
  key: 'your-value-goes-here',
  port: 10255
};

const twitter = {
  consumerKey: 'your-value-goes-here',
  consumerSecret: 'your-value-goes-here',
  callbackURL: `http://localhost:3001/api/auth/twitter/callback`
};

module.exports = {
  serverPort,
  sessionSecret,
  cosmos,
  twitter
};
