var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');




app=express()
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Body parser and cookie parser middleware
app.use(logger('dev'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('<h1>Test</h1>')
});


const apiRouter = require('./routes/api/routes')
app.use('/api/', apiRouter);





app.listen(5000);
console.log('Server started on port 5000');

module.exports = app;