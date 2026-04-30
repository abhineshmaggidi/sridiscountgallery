# Sri Discount Gallery 🛍️

An advanced e-commerce platform for electronics and gadgets built with Next.js, TypeScript, and Tailwind CSS.

## ✨ New Features (Latest Update)

### Customer Support Chat Widget
- Real-time chat interface for customer support
- Fixed position chat button
- Message history tracking
- Auto-response system
- Contact information display (9259595943)

### Product Comparison Tool
- Compare multiple products side-by-side
- Automatic spec difference detection
- Best value calculation based on price/rating
- Price difference percentage calculator

## 🚀 Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Payment:** UPI Direct (PhonePe, Google Pay)

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Git installed

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abhineshmaggidi/sridiscountgallery.git
cd sridiscountgallery
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-setup.sql`
4. This creates the necessary tables (users, orders, products)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Default Admin Access

- **Email:** admin@sridiscount.com
- **Password:** admin123
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

## 🎨 Features

### Current Features
- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ User authentication (Supabase)
- ✅ Admin dashboard
- ✅ Order management
- ✅ UPI payment integration (PhonePe, Google Pay)
- ✅ COD with convenience fee
- ✅ Customer support chat widget
- ✅ Product comparison tool
- ✅ Mobile responsive design
- ✅ Flash sale ticker

### Payment Options
- **UPI Direct**: PhonePe, Google Pay (₹99 delivery per item)
- **Cash on Delivery**: Available with ₹50 convenience fee

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📦 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_UPI_ID`
5. Deploy!

**Note:** This is a standalone Next.js app. It cannot run inside existing WooCommerce hosting. Use Vercel, Netlify, or similar platforms.

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- Supabase credentials
- UPI payment ID
- Site URL and configuration
- Feature flags (COD, delivery fees)

## 📞 Support

- **Phone:** 9259595943
- **Email:** admin@sridiscount.com
- **Chat Widget:** Available on the website

## 📄 License

This project is proprietary software for Sri Discount Gallery.

## 🙏 Acknowledgments

Built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- React Icons

---

Made with ❤️ for Sri Discount Gallery
