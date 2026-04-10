import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Route modules
import authRouter from './routes/authRoutes';
import postRouter from './routes/postRoutes';
import dashboardRouter from './routes/dashboardRoutes';
import rankingRouter from './routes/rankingRoutes';
import rewardRouter from './routes/rewardRoutes';
import noticeRouter from './routes/noticeRoutes';
import meetupRouter from './routes/meetupRoutes';
import profileRouter from './routes/profileRoutes';
import suggestionRouter from './routes/suggestionRoutes';

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/rewards', rewardRouter);
app.use('/api/notices', noticeRouter);
app.use('/api/meetups', meetupRouter);
app.use('/api/profile', profileRouter);
app.use('/api/suggestions', suggestionRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
