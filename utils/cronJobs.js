const mongoose = require('mongoose');

// Функция для автоматического закрытия истекших лотов
const closeExpiredLots = async () => {
  try {
    // Получаем модель из mongoose registry
    let Lot;
    try {
      Lot = mongoose.model('Lot');
    } catch (e) {
      // Если модель не зарегистрирована, требуем её
      Lot = require('../models/Lot');
    }
    
    // Проверяем что Lot модель загружена правильно
    if (!Lot || typeof Lot.closeExpiredLots !== 'function') {
      console.warn('Warning: Lot.closeExpiredLots not available yet, skipping cron job');
      return 0;
    }
    
    const closedCount = await Lot.closeExpiredLots();
    
    if (closedCount > 0) {
      console.log(`✅ Auto-closed ${closedCount} expired lot(s) at ${new Date().toISOString()}`);
    }
    
    return closedCount;
  } catch (error) {
    console.warn(' Warning during auto-closing lots:', error.message);
    return 0;
  }
};


const startCronJobs = () => {
  console.log(' Starting cron jobs...');
  
  
  setInterval(async () => {
    await closeExpiredLots();
  }, 60 * 1000); 
  
  // Don't call immediately, wait a bit for models to load
  setTimeout(() => {
    closeExpiredLots();
  }, 2000);
};

module.exports = {
  startCronJobs,
  closeExpiredLots
};