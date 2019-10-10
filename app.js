var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const socketIO = require('socket.io')
const micro = require('micro')
var logger = require('morgan');

const transporter = require("./nodemailer")
const {from, Observable,defer,of} = require("rxjs")
const {concatMap,delay} = require('rxjs/operators')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = micro(app)
const io = socketIO(server)


// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


io.on('connection', socket => {
  console.log('New client connected: '+socket.id)
  socket.on('send payload', payload => {
    console.log('Sent from: ' + socket.id)
    //console.log(payload)
    const mailOptions = payload.emails.split(',').filter(v => v).map(emailId => ({
      from: 'shubhamtiwarivevo@gmail.com',
      to: emailId,
      subject: payload.subject,
      html: `${payload.message}`
    }))

    let obs = from(mailOptions)
    .pipe(
      concatMap(mailOption => sendMail(mailOption)),
      delay(1000)
    ).subscribe(msg => {
      //console.log(msg)
      msg.subscribe(d => {
        //socket.emit('Sent: '+)
        console.log(d)

        typeof d === "object" ? socket.emit('sent','Sent: '+d.response) : socket.emit('fail', d)
      })
    })

    socket.on('cancel', val => {
      socket.emit('message', 'Cancelled!');
      obs.unsubscribe()
    })

  })


  function sendMail(options) {
    socket.emit('sending', 'Sending Mail to: '+options.to);
  console.log('Sending email....')
   return defer(async function(){
    let message = '' 
    try {
        message = await transporter.sendMail(options)
     } catch(err){
       message = err.message;
     }
     return of(message)
   }).pipe(
     delay(1000)
   )
  }

})


server.listen(8080, () => {
  console.log('socket server on 8080')
})

//module.exports = app;
