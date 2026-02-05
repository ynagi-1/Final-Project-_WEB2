const express = require('express');
const router = express.Router();

const {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  placeBid,
  getBidHistory,
  closeAuction,
  getMyBids
} = require('../controllers/lotController');

const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public
router.get('/', getAllLots);
router.get('/:id', getLotById);
router.get('/:id/bids', getBidHistory);  

// Protected
router.post('/:id/bid', authenticate, placeBid);  
router.get('/my/bids', authenticate, getMyBids);  

// Только admin
router.post('/', authenticate, authorizeAdmin, createLot);
router.put('/:id', authenticate, authorizeAdmin, updateLot);
router.delete('/:id', authenticate, authorizeAdmin, deleteLot);
router.post('/:id/close', authenticate, authorizeAdmin, closeAuction);

module.exports = router;