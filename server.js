//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var moment = require('moment')
var server = require('http').createServer(app);
var QRCode = require('qrcode')
var io = require('socket.io')(server);

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('qr', function (msg) {

      let name = moment().format('x')
      QRCode.toFile(`public/images/${name}.svg`, 'Some text', {
          color: {
            dark: '#000',  // Blue dots
            light: '#0000' // Transparent background
          }
        }, function (err) {
          if (err) throw err
          console.log('done')
        })
      
      
      setTimeout(() => { io.sockets.emit('messages', {name: name, message:msg}); }, 4000)


  });
});

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

app.get('/', function (req, res) {
    res.render('index.html', { pageCountMessage : null});
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


server.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
