const mongoose = require('mongoose');


const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const lotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lot title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  startBid: {
    type: Number,
    required: [true, 'Starting bid is required'],
    min: [0, 'Starting bid must be a positive number']
  },
  currentBid: {
    type: Number,
    default: function() {
      return this.startBid;
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending'],
    default: 'active'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        
        return value > new Date();
      },
      message: 'End date must be in the future'
    }
  },
  
  images: [{
    type: String,  
    required: false
  }],
  
  // История ставок
  bids: [bidSchema],
  
  // Победитель аукциона (когда статус = закрыт)
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Минимальный ставки
  bidIncrement: {
    type: Number,
    default: 10,
    min: 1
  }
  
  
}, {
  timestamps: true,
  strictPopulate: false
});


lotSchema.index({ title: 'text', description: 'text' });

lotSchema.index({ endDate: 1, status: 1 });




lotSchema.methods.placeBid = async function(userId, bidAmount) {
  
  if (this.status !== 'active') {
    throw new Error('This lot is not active');
  }
  
  
  if (new Date() > this.endDate) {
    throw new Error('Auction has ended');
  }
  
  
  const minBid = this.currentBid + this.bidIncrement;
  if (bidAmount < minBid) {
    throw new Error(`Bid must be at least ${minBid}`);
  }
  
  
  if (this.createdBy && this.createdBy.toString() === userId.toString()) {
    throw new Error('You cannot bid on your own lot');
  }
  
 
  this.bids.push({
    user: userId,
    amount: bidAmount
  });
  
  
  this.currentBid = bidAmount;
  
  await this.save();
  
  return this;
};

lotSchema.methods.closeAuction = async function() {
  this.status = 'closed';
  
  
  if (this.bids.length > 0) {
    
    const lastBid = this.bids[this.bids.length - 1];
    this.winner = lastBid.user;
  }
  
  await this.save();
  return this;
};

// Текуший лидере
lotSchema.methods.getCurrentLeader = function() {
  if (this.bids.length === 0) {
    return null;
  }
  
  const lastBid = this.bids[this.bids.length - 1];
  return {
    user: lastBid.user,
    amount: lastBid.amount,
    timestamp: lastBid.timestamp
  };
};


lotSchema.statics.closeExpiredLots = async function() {
  const now = new Date();
  
  
  const expiredLots = await this.find({
    status: 'active',
    endDate: { $lte: now } 
  });
  
  // Закрываем каждый лот
  for (const lot of expiredLots) {
    await lot.closeAuction();
  }
  
  return expiredLots.length;
};

module.exports = mongoose.model('Lot', lotSchema);