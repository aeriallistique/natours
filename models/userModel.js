const crypto = require('crypto');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcryptjs');


//create a schema with 5 fields: name, email, pjoto( string), password, passwordConfirm
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name.'],
        trim: true,
        maxlength: [40, 'A user name must have less or equal than 40 characters.'],
        minlength: [6, 'A tour name must have more or equal to 6 charatcters.'],
    },
    email: {
        type: String,
        required : [true, 'A user must have an email address.'],
        unique: true, 
        lowercase: true,
        validate: [isEmail, 'Invalid Email !!!'],
    },
    photo: {
        type: String, 
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },        

    password:{
        type: String,
        required: [true, 'A user must have a password.'],
        minlength: [8, 'A tour password must have more or equal to 8 charatcters.'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        // this will ONLY WORK ON "CREATE" AND ON "SAVE"!!!
        validate: {
            validator: function (el){
                return el === this.password;
            },
            message: 'Passwords are not matching!'
        }
    },
    passwordChangedAt: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password'))return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});



userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew ) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    // this points to the current query
    this.find({ active: {$ne: false}});
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestap){
    if(this.passwordChangedAt){
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestap < changedTimestamp;
    }
    
    return false; // this means not changed password
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    // console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 *1000;

    return resetToken;
};



const User = mongoose.model('User', userSchema);

module.exports = User;
