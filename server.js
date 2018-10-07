const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongo = require('mongodb')
const mongoose = require('mongoose')
const pug = require('pug')
const async = require('async')

const Moment = require('moment')
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);


mongoose.connect(process.env.MLAB_URI, { useMongoClient: true });
var db = mongoose.connection;
const Schema = mongoose.Schema;
// check connection errors
db.on('error', console.error.bind(console, 'connection error:'));

app.use(cors())
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// SCHEMA/MODEL Setup
const userSchema = new Schema({
  username: {
      type: String,
      required: true,
      unique: true
  },
}, {timestamps: true});

const userModel = mongoose.model('userModel', userSchema);

const logSchema = new Schema({
  description: {
      type: String,
      required: true,
  },
  userId: Schema.Types.ObjectId,
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
}, {timestamps: true});

const logModel = mongoose.model('logModel', logSchema);





// New User Registration
app.post('/api/exercise/new-user', function(req, res, next) {
    
   const username = req.body.username;

    if (username === ''){
      res.send("Username is blank/empty")
    } else {
        
        var data = new userModel({
          username: username
        })
      
        data.save(err=>{
            if(err){
              return res.send(err);
            } else {
               res.json({ username: data.username, _id: data._id });
            }
        })  
    }
 
 
})

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

// Add Exercise log
app.post('/api/exercise/add', function(req, res, next) {
    let { userId, description, duration, date } = req.body;
    let username;
    
    userModel.findOne({ _id: userId.toObjectId() }, 'username', function (err, data) { 
        if (err){ return res.send('Error reading Db') } 
        else if (!data) {
          res.send('Username not found');
        } 
        else if (data) { 
          username = data.username;
          
          if (date !== '' && isNaN(Date.parse(date)) === true) {
            res.send('Date is incorrect');
          }

          if (date === '') {
            date = new Date();
          } else {
            date = Date.parse(date);
          }
          
          var data = new logModel({
              userId: userId,
              description: description,
              duration: duration,
              date: date
           })
      
          data.save(err=>{
              if(err){
                return res.send(err);
              } else {
                  res.json({ userId: userId, description: description, date: date, username: username });
              }
          })  
                        
        }
       
    })

})

// Check Exercise Log
app.get('/api/exercise/log?:userId/:from?/:to?/:limit?', function(req, res, next) {
  const { userId, from, to, limit } = req.query;

  
  if (!userId) return res.status(400).send('User Id Required');
  
  let query = {
    userId: userId
  };
  
  if(req.query.from || req.query.to) {
    query.date = {};
    if(req.query.from)
      query.date.$gte = moment(req.query.from).format('YYYY-MM-DD');
    if(req.query.to)
      query.date.$lte = moment(req.query.to).format('YYYY-MM-DD');
  }
  
  
logModel.find(query).sort({ 'date': -1 }).select('userId description date duration ').limit(parseInt(limit)).exec((err, data) => {
    if (err){ return res.send(err) } 
    else {
      res.json({ data: data });
    }
  })

})

app.get('/results', (req, res) => {
  
var userList = userModel.find({});
var logList = logModel.find({});

var resourcesStack = {
    usersList: userList.exec.bind(userList),
    logList: logList.exec.bind(logList),
};

async.parallel(resourcesStack, function (error, resultSet){
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.render('results', { title: 'Exercise Tracker Results', users: resultSet.usersList, exercises: resultSet.logList })
});
    
  
  
});
  

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
