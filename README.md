# 🎬 QuickShow - Movie Ticket Booking Platform

> A modern, full-stack movie ticket booking application that brings the cinema experience to your fingertips.

![QuickShow](https://img.shields.io/badge/QuickShow-Movie%20Booking-red?style=for-the-badge&logo=movie)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?style=for-the-badge&logo=mongodb)

## 🎯 About QuickShow

QuickShow is a comprehensive movie ticket booking platform inspired by BookMyShow, designed to provide users with a seamless cinema experience. From browsing the latest movies to booking seats and making payments, QuickShow handles the entire movie-going journey.

Live Link: QuickShow[https://quickshow-sigma.vercel.app/]

## ✨ Key Features

### 🎭 **For Movie Lovers**
- **🎬 Browse Latest Movies** - Discover now-showing movies with rich details
- **📺 Watch Trailers** - Dynamic trailer section powered by TMDB API
- **🎫 Smart Booking** - Intuitive seat selection with real-time availability
- **💳 Secure Payments** - Stripe-powered payment processing
- **📧 Instant Confirmations** - Automated email confirmations with beautiful templates
- **📱 My Bookings** - Track all your movie bookings and payment status
- **❤️ Favorites** - Save and manage your favorite movies
- **📱 Responsive Design** - Perfect experience on any device

### 👨‍💼 **For Administrators**
- **📊 Analytics Dashboard** - Real-time booking statistics and revenue tracking
- **🎬 Show Management** - Add new shows with automatic TMDB data integration
- **👥 User Management** - View and manage user bookings
- **💰 Revenue Insights** - Track earnings and booking trends

## 🛠️ Technology Stack

### **Frontend**
```
React 19          → Modern UI framework
Tailwind CSS      → Utility-first styling
React Router      → Client-side routing
Clerk             → Authentication & user management
Axios             → HTTP client
React Player      → Video player for trailers
Lucide React      → Beautiful icons
React Hot Toast   → Elegant notifications
```

### **Backend**
```
Node.js           → JavaScript runtime
Express.js        → Web application framework
MongoDB           → NoSQL database
Mongoose          → MongoDB object modeling
Stripe            → Payment processing
Clerk             → Authentication backend
Inngest           → Background job processing
Nodemailer        → Email service integration
TMDB API          → Movie data and images
```

### **Services & APIs**
```
TMDB API          → Movie data, trailers, cast information
Stripe            → Payment processing and webhooks
Clerk             → User authentication and management
Brevo (SendinBlue)→ Email delivery service
Inngest           → Background jobs and email automation
MongoDB Atlas     → Cloud database hosting
Vercel            → Deployment and hosting
```

## 🎨 How I Built It

### **1. Frontend Architecture**
- **Component-Based Design**: Modular React components for reusability
- **Context API**: Global state management for user data and app state
- **Custom Hooks**: Reusable logic for API calls and data fetching
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### **2. Backend Architecture**
- **RESTful API**: Clean API design with proper HTTP methods
- **MVC Pattern**: Organized controllers, models, and routes
- **Middleware**: Authentication, CORS, and error handling
- **Database Design**: Optimized schemas for movies, shows, bookings, and users

### **3. Payment Integration**
- **Stripe Checkout**: Secure payment processing
- **Webhook Handling**: Real-time payment status updates
- **Auto-Sync**: Fallback payment verification system
- **Error Handling**: Comprehensive error management

### **4. Email System**
- **Automated Confirmations**: Beautiful HTML email templates
- **Background Processing**: Inngest for reliable email delivery
- **Retry Logic**: Ensures emails are delivered successfully
- **Professional Design**: Branded email templates with booking details

### **5. Movie Data Integration**
- **TMDB API**: Real-time movie data, images, and trailers
- **Dynamic Content**: Auto-updating movie information
- **Fallback System**: Graceful handling of API failures
- **Optimized Caching**: Efficient data fetching and storage

## 🚀 Getting Started

### **Quick Setup**
1. **Clone the repository**
   ```bash
   git clone https://github.com/Reallyishan009/QuickShow.git
   cd QuickShow
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd client && npm install
   
   # Backend  
   cd ../server && npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` files in both client and server directories
   - Fill in your API keys and configuration

4. **Start the application**
   ```bash
   # Backend (Terminal 1)
   cd server && npm run server
   
   # Frontend (Terminal 2)
   cd client && npm run dev
   ```

### **Environment Variables**
Check `.env.example` files in both `client/` and `server/` directories for required configuration.

## 🎯 Core Functionality

### **User Journey**
1. **Discover** → Browse movies and watch trailers
2. **Select** → Choose movie, date, and time
3. **Book** → Select seats (up to 5 per booking)
4. **Pay** → Secure payment via Stripe
5. **Confirm** → Receive email confirmation
6. **Enjoy** → Show up and enjoy the movie!

### **Admin Workflow**
1. **Add Movies** → Use TMDB ID to add new shows
2. **Monitor** → Track bookings and revenue
3. **Manage** → View and manage all user bookings

## 🎨 Design Philosophy

- **User-Centric**: Intuitive interface designed for movie lovers
- **Performance**: Fast loading with optimized API calls
- **Reliability**: Robust error handling and fallback systems
- **Security**: Secure authentication and payment processing
- **Scalability**: Built to handle growing user base

## 🔧 Technical Highlights

- **Real-time Seat Booking** with conflict prevention
- **Automatic Payment Verification** with 30-second sync
- **Dynamic Trailer Integration** from TMDB API
- **Professional Email Templates** with booking details
- **Admin Dashboard** with live statistics
- **Responsive Design** for all screen sizes
- **Error Boundaries** and graceful failure handling

## 🌟 What Makes It Special

- **Seamless UX**: From browsing to booking in just a few clicks
- **Real-time Updates**: Live seat availability and booking status
- **Professional Emails**: Beautiful confirmation emails with all details
- **Smart Fallbacks**: Works even when external APIs fail
- **Admin Insights**: Comprehensive dashboard for business management

## 🚀 Deployment

This app is ready for deployment on:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Vercel, Railway, Heroku, or any Node.js hosting
- **Database**: MongoDB Atlas or any MongoDB hosting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🎬 Built with passion for cinema and modern web technologies**

*QuickShow - Where every movie night begins* ✨