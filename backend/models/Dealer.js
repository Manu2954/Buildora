// models/Dealer.js
const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  alternatePhone: String,
  businessType: {
    type: String,
    enum: ['retailer', 'wholesaler', 'distributor', 'contractor'],
    required: true
  },
  businessDetails: {
    gstin: {
      type: String,
      sparse: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
    },
    pan: String,
    shopLicense: String,
    establishedYear: Number,
    yearsInBusiness: Number
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  serviceAreas: [{
    city: String,
    pincode: String,
    radius: Number // in kilometers
  }],
  associatedCompanies: [{
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    approvedAt: Date,
    margin: {
      type: Number,
      default: 10
    },
    creditLimit: {
      type: Number,
      default: 0
    },
    paymentTerms: {
      type: String,
      enum: ['advance', 'cod', 'credit_15', 'credit_30'],
      default: 'advance'
    }
  }],
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  documents: {
    gstCertificate: {
      public_id: String,
      url: String
    },
    panCard: {
      public_id: String,
      url: String
    },
    shopLicense: {
      public_id: String,
      url: String
    },
    bankStatement: {
      public_id: String,
      url: String
    },
    ownerIdProof: {
      public_id: String,
      url: String
    }
  },
  profileImage: {
    public_id: String,
    url: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'inactive'],
    default: 'pending'
  },
  approvalDetails: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    approvedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    rejectedAt: Date,
    rejectionReason: String,
    notes: String
  },
  preferences: {
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      whatsapp: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    autoAcceptOrders: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    activeCustomers: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes
dealerSchema.index({ email: 1 });
dealerSchema.index({ phone: 1 });
dealerSchema.index({ status: 1 });
dealerSchema.index({ 'address.city': 1 });
dealerSchema.index({ 'address.state': 1 });
dealerSchema.index({ 'associatedCompanies.company': 1 });

// Method to approve dealer
dealerSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvalDetails.approvedBy = adminId;
  this.approvalDetails.approvedAt = new Date();
  return this.save();
};

// Method to reject dealer
dealerSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvalDetails.rejectedBy = adminId;
  this.approvalDetails.rejectedAt = new Date();
  this.approvalDetails.rejectionReason = reason;
  return this.save();
};

// Method to associate with company
dealerSchema.methods.associateWithCompany = function(companyId, terms = {}) {
  const existingAssociation = this.associatedCompanies.find(
    assoc => assoc.company.toString() === companyId.toString()
  );
  
  if (existingAssociation) {
    throw new Error('Already associated with this company');
  }
  
  this.associatedCompanies.push({
    company: companyId,
    margin: terms.margin || 10,
    creditLimit: terms.creditLimit || 0,
    paymentTerms: terms.paymentTerms || 'advance'
  });
  
  return this.save();
};

module.exports = mongoose.model('Dealer', dealerSchema);