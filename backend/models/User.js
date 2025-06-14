const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: { 
      type: String, 
      required: true, 
      unique: true ,
      match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
          ]
      },
    phone: { type: String }, // for WhatsApp
    password: { type: String, required: true, minlength: 6  },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    tokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetTokenExpiry: { type: Date },
     role: {
        type: String,
        enum: ['customer', 'dealer'], // As per your project requirements
        default: 'customer',
    },
     isActive: { // Field for admin to enable/disable account
        type: Boolean,
        default: true,
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    lastLogin: {
        type: Date,
    },
  },
  { timestamps: true }
);

// Middleware: Encrypt password using bcrypt before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare user-entered password with the hashed password in the database
// THIS IS THE FUNCTION THAT WAS MISSING
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to sign and return a JWT for authentication
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ userId: this._id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });
};

module.exports = mongoose.model("User", userSchema);
