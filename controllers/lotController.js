const Lot = require('../models/Lot');

// Получить все лоты
const getAllLots = async (req, res) => {
  try {
    const { status, category, sort } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    let sortOptions = { createdAt: -1 };
    
    if (sort === 'bid-asc') {
      sortOptions = { currentBid: 1 };
    } else if (sort === 'bid-desc') {
      sortOptions = { currentBid: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'ending-soon') {
      sortOptions = { endDate: 1 };  // Заканчивающиеся раньше - первыми
    }

    const lots = await Lot.find(query)
      .populate('category', 'name slug')
      .populate('createdBy', 'email name')
      .populate('winner', 'email name')
      .sort(sortOptions);

    res.json({
      success: true,
      count: lots.length,
      data: lots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lots',
      error: error.message
    });
  }
};

// Получить лот по ID
const getLotById = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
      .populate('category', 'name description slug')
      .populate('createdBy', 'email name')
      .populate('winner', 'email name')
      .populate('bids.user', 'email name');  // Заполняем пользователей в ставках

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Lot not found'
      });
    }

    res.json({
      success: true,
      data: lot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lot',
      error: error.message
    });
  }
};

// Создать лот (только admin)
const createLot = async (req, res) => {
  try {
    const { title, startBid, description, category, endDate, bidIncrement, images } = req.body;

    // Проверяем endDate
    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date is required'
      });
    }

    const endDateObj = new Date(endDate);
    if (endDateObj <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'End date must be in the future'
      });
    }

    const lotData = {
      title,
      startBid,
      description,
      endDate: endDateObj,
      createdBy: req.user._id
    };

    if (category) lotData.category = category;
    if (bidIncrement) lotData.bidIncrement = bidIncrement;
    if (images && Array.isArray(images)) lotData.images = images;

    const lot = await Lot.create(lotData);

    await lot.populate('category', 'name slug');
    await lot.populate('createdBy', 'email name');

    res.status(201).json({
      success: true,
      message: 'Lot created successfully',
      data: lot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lot',
      error: error.message
    });
  }
};

// Обновить лот (только admin)
const updateLot = async (req, res) => {
  try {
    const { title, startBid, description, category, endDate, status, bidIncrement, images } = req.body;

    let lot = await Lot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Lot not found'
      });
    }

    if (title !== undefined) lot.title = title;
    if (startBid !== undefined) lot.startBid = startBid;
    if (description !== undefined) lot.description = description;
    if (category !== undefined) lot.category = category;
    if (status !== undefined) lot.status = status;
    if (bidIncrement !== undefined) lot.bidIncrement = bidIncrement;
    if (images !== undefined) lot.images = images;
    
    if (endDate !== undefined) {
      const endDateObj = new Date(endDate);
      if (endDateObj <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'End date must be in the future'
        });
      }
      lot.endDate = endDateObj;
    }

    await lot.save();

    await lot.populate('category', 'name slug');
    await lot.populate('createdBy', 'email name');

    res.json({
      success: true,
      message: 'Lot updated successfully',
      data: lot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lot',
      error: error.message
    });
  }
};

// Удалить лот (только admin)
const deleteLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Lot not found'
      });
    }

    await lot.deleteOne();

    res.json({
      success: true,
      message: 'Lot deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lot',
      error: error.message
    });
  }
};



const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const lotId = req.params.id;
    const userId = req.user._id;

    // Проверка суммы
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid amount'
      });
    }

    // Находим лот
    let lot = await Lot.findById(lotId);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Lot not found'
      });
    }

    // Размещаем ставку (используем метод из модели)
    await lot.placeBid(userId, amount);

    // Заполняем данные для ответа
    await lot.populate('category', 'name slug');
    await lot.populate('createdBy', 'email name');
    await lot.populate('bids.user', 'email name');

    res.json({
      success: true,
      message: 'Bid placed successfully',
      data: lot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Получить историю ставок для лота
const getBidHistory = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
      .populate('bids.user', 'email name')
      .select('title bids currentBid');

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Lot not found'
      });
    }

    // Сортируем ставки по времени (новые первыми)
    const sortedBids = lot.bids.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      data: {
        lotTitle: lot.title,
        currentBid: lot.currentBid,
        totalBids: sortedBids.length,
        bids: sortedBids
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bid history',
      error: error.message
    });
  }
};

// Закрыть аукцион вручную (только admin)
const closeAuction = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Lot not found'
      });
    }

    if (lot.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Auction is already closed'
      });
    }

    await lot.closeAuction();
    await lot.populate('winner', 'email name');

    res.json({
      success: true,
      message: 'Auction closed successfully',
      data: lot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing auction',
      error: error.message
    });
  }
};


const getMyBids = async (req, res) => {
  try {
    const userId = req.user._id;

   
    const lots = await Lot.find({
      'bids.user': userId
    })
      .populate('category', 'name slug')
      .populate('createdBy', 'email name')
      .populate('winner', 'email name')
      .sort({ updatedAt: -1 });
    
    const lotsWithMyBids = lots.map(lot => {
      const myBids = lot.bids.filter(
        bid => bid.user.toString() === userId.toString()
      );
      
      const isLeading = lot.bids.length > 0 && 
        lot.bids[lot.bids.length - 1].user.toString() === userId.toString();
      
      const isWinner = lot.winner && lot.winner.toString() === userId.toString();

      return {
        lot: {
          _id: lot._id,
          title: lot.title,
          currentBid: lot.currentBid,
          status: lot.status,
          endDate: lot.endDate,
          category: lot.category
        },
        myBids: myBids,
        myHighestBid: Math.max(...myBids.map(b => b.amount)),
        isLeading,
        isWinner
      };
    });

    res.json({
      success: true,
      count: lotsWithMyBids.length,
      data: lotsWithMyBids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your bids',
      error: error.message
    });
  }
};

module.exports = {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  placeBid,           
  getBidHistory,      
  closeAuction,       
  getMyBids          
};