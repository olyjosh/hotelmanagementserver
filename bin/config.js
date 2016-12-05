var config = {};

config.twitter = {};
config.twitter.user_name = process.env.TWITTER_USER || 'username';
config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';

config.mongo = {};
//config.mongo.uri = process.env.DUOSTACK_DB_REDIS;
config.mongo.host = 'localhost';
config.mongo.db = 'hotelmgt';
config.mongo.port = 27017;
config.mongo.uri = 'mongodb://'+config.mongo.host+'/'+config.mongo.db;
config.mongo.user = 'olyjosh';
config.mongo.pass = 'theWhiteTeam2016';

config.web = {};
config.web.port = process.env.WEB_PORT || 3000;

config.mail = {};
config.mail.user = 'softprogcode@outlook.com';
config.mail.pass = 'complic8dhno3';
config.mail.server = 'smtp-mail.outlook.com';

module.exports = config;