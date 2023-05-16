const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controlers/errorControler');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bookingRoutes = require('./routes/bookingRoutes')
const viewRoutes = require('./routes/viewRoutes');



// Further HELMET configuration for Security Policy (CSP)
// const scriptSrcUrls = [
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   ];
  // const styleSrcUrls = [
  //   "https://api.mapbox.com/",
  //   "https://api.tiles.mapbox.com/",
  //   "https://fonts.googleapis.com/",
  // ];
  // const connectSrcUrls = [
  //   "https://api.mapbox.com/",
  //   "https://a.tiles.mapbox.com/",
  //   "https://b.tiles.mapbox.com/",
  //   "https://events.mapbox.com/",
  // ];
  // const fontSrcUrls = [
  //   'fonts.googleapis.com',
  //   'fonts.gstatic.com'
  // ];

const scriptSrcUrls = [
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/',
  'https://*.stripe.com',
  'https:',
  'data:'
];
const styleSrcUrls = [
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
  'https:'
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com/',
  'http://127.0.0.1:3000'
];
const fontSrcUrls = [
  'fonts.googleapis.com',
    'fonts.gstatic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'https:',
  'data:'
];
const frameSrcUrls = [
  'https://*.stripe.com',
];


// start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//1 GLOBAL MIDDLEWARES
// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//SET SECURITY HTTP HEADERS
// app.use(helmet())

app.use(
  helmet({
      crossOriginEmbedderPolicy: false
  })
);

app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: ["'self'", 'data:', 'blob:'],
          baseUri: ["'self'"],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", 'data:', 'blob:'],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
          fontSrc: ["'self'", ...fontSrcUrls],
          childSrc: ["'self'", 'blob:'],
          frameSrc: ["'self'", ...frameSrcUrls],
          upgradeInsecureRequests: []
      }
  })
);

// app.use(
//   helmet.contentSecurityPolicy({
//   directives:{
//   defaultSrc:[],
//   connectSrc:["'self'",...connectSrcUrls],
//   scriptSrc:["'self'",...scriptSrcUrls],
//   styleSrc:["'self'","'unsafe-inline'",...styleSrcUrls],
//   workerSrc:["'self'","blob:"],
//   objectSrc:[],
//   imgSrc:["'self'",
//           "blob:",
//           "data:"
//   ],fontSrc:["'self'",...fontSrcUrls],
//   },}));

// LIMITS REQUEST FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*100,
  message: 'Too many request from this IP, please try again in one hour.'
});

app.use('/api',limiter);

// BODY PARSER( READING DATA FROM THE BODY INTO REQ.BODY)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({
  extended: true, 
  limit: '10kb'
}))
app.use(cookieParser());

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION 
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(hpp({
  whitelist:[
    'duration',
    'ratingsQuantity', 
    'ratingsAverage', 
    'maxGroupSize', 
    'difficulty', 
    'price'
  ]
}));


// SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));



// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  
  next();
});

// ROUTE HANDLERS
//ROUTES


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/', viewRoutes);


//START THE SERVER

app.all('*', (req, res, next)=>{
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});


app.use(globalErrorHandler);

module.exports = app;
