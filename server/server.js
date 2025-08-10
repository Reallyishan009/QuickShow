import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js'; // ✅ Uncomment this
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import tmdbRouter from './routes/tmdbRoutes.js';

const app = express();
const port = 3000;

// Connect to databasee
try {
    await connectDB();
} catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
}

app.use('/api/stripe',express.raw({ type: 'application/json' }),stripeWebhooks);

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// API Routes
app.get('/', (req, res) => {
    res.send("Server is live");
});
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter); // ✅ Add this line
app.use('/api/tmdb', tmdbRouter);

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
