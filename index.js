var Twitter = require('twitter');
var tweets = [];
var twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

/**
* Stream statuses filtered by keyword
* number of tweets per second depends on topic popularity
**/
var app = require('express')();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Streaming Twitter
twitter.stream('statuses/filter', {track: '#ioextendedbrest'},  function(stream){
  //twitter.stream('statuses/filter', {track: '#Eurovision'},  function(stream){
  stream.on('data', function(tweet) {
    console.log("new tweet!")
    tweets.push(tweet);

    // Checking size of buffer and purge it if necessary
    if(tweets.length > 50) {
      tweets.push(50,1)
    }
    // Fire event
    io.emit('tweet', tweet);
  });
  stream.on('error', function(error) {
    console.log(error);
  });
});

// New client
io.on('connection', function(socket){
  console.info('New client connected (id=' + socket.id + ').');

  // Push cached
  for (var i = 0; i < tweets.length; i++) {
    console.log("pushing cached tweet " + i)
    socket.emit('tweet', tweets[i])
  }

});

console.log("started")
server.listen(8080);


// Kill process if we need it
process.on('SIGINT', function(){
  process.stdout.write('\n end \n');
  process.exit();
});
