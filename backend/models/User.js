const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
