var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

/**
* Stream statuses filtered by keyword
* number of tweets per second depends on topic popularity
**/
var io = require('socket.io')();
io.on('connection', function (socket) {
  console.log('connection');

});
io.listen(8080);
console.log("started")
client.stream('statuses/filter', {track: '#ioextendedbrest'},  function(stream){
  stream.on('data', function(tweet) {
    console.log(tweet);
    console.log(tweet.text);
    io.emit('tweet', tweet);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
// Kill process if we need it
process.on('SIGINT', function(){
  process.stdout.write('\n end \n');
  process.exit();
});
