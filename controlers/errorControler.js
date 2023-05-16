const AppError = require('../utils/appError');

const handleCastErrorDB = err =>{
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) =>{
  const value = err.keyValue.name;       
  // .errmsg.match( /(["'])(\\?.)*?\1/ )[0];

  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = (err)=>{
  const errors = Object.values(err.errors).map(el => el.properties.message);

  const message = `Invalid input data. ${errors.join(' ALSO -> ')}.`;
  return new AppError(message, 400);
}

const handleJWTExpiredError = () => new AppError('Your token has expired. please login again!', 401);
const handleJWTError = () => new AppError('Invalid Token. Please login again!!', 401);

const sendErrorDev = (err,req, res)=>{

  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }else{
    res.status(err.statusCode).render('error', {
      title: 'Somethings went wrong',
      msg: err.message
    });
  }
  
}
const sendErrorProd = (err,req, res)=>{
  if(req.originalUrl.startsWith('/api')){
    // operational , trusted error: send message to client
    if(err.isOperational ){
      return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    }); 
    // peormagrmming or oter unknown error: DON'T LEAK ERROR DETAILS TO CLIENT.
    }
      
      // 1. LOG ERROR
      console.error('ERROR BOOM !!!', err)
      // 2 SEND GENERIC MESSAGE
      return res.status(500).json({
        status: 'error',
        msg: 'Something went very wrong!'
      })
    }
  
    // rendered website
    if(err.isOperational ){
      return res.status(err.statusCode).render('error', {
        title: 'Somethings went wrong',
        msg: err.message
      });
    }
      
      // 1. LOG ERROR
      console.error('ERROR BOOM !!!', err)
      // 2 SEND GENERIC MESSAGE
      return res.status(err.statusCode).render('error', {
        title: 'Somethings went wrong',
        msg: 'Please try again later.'
      }); 
};

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
       sendErrorDev(err,req, res);

    }else if(process.env.NODE_ENV === 'production'){
      let error = { ...err };
      error.message = err.message;
      
      if(err.name === 'CastError') error = handleCastErrorDB(error);
      if(error.code === 11000) error = handleDublicateFieldsDB(error);
      if(err.name === 'ValidationError') error = handleValidationErrorDB(error);
      if(err.name === 'JsonWebTokenError') error = handleJWTError();
      if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();

      sendErrorProd(error,req, res);
    }
  }