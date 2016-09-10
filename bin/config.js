var config = {};

config.twitter = {};
config.mongo = {};
config.web = {};

//config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
config.twitter.user_name = process.env.TWITTER_USER || 'username';
config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';
//config.mongo.uri = process.env.DUOSTACK_DB_REDIS;
config.mongo.host = 'localhost';
config.mongo.db = 'hotelMgt';
config.mongo.port = 27017;
config.mongo.uri = 'mongodb://'+config.mongo.host+'/'+config.mongo.db;
config.mongo.user = 'olyjosh';
config.mongo.pass = 'livework2016';
config.web.port = process.env.WEB_PORT || 3000;

module.exports = config;