require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorLogger, errorHandler, notFound } = require('./middleware/errorHandler');
const { startCronJobs } = require('./utils/cronJobs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // Увеличен лимит для изображений
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lots', require('./routes/lots'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auction API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Error handlers
app.use(notFound);
app.use(errorLogger);
app.use(errorHandler);

// Server initialization
const PORT = process.env.PORT || 3000;

const initializeServer = async () => {
  try {
    // Подключение к БД
    await connectDB();
    
    // Запуск cron jobs для автоматического закрытия лотов
    startCronJobs();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});