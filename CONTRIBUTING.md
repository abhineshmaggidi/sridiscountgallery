# Contributing to Sri Discount Gallery

Thank you for your interest in contributing to Sri Discount Gallery! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sridiscountgallery.git
   cd sridiscountgallery
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   ```bash
   cp .env.example .env.local
   ```

5. **Set up the database**:
   - Run the SQL script in your Supabase project:
   ```bash
   # Execute supabase-setup.sql in your Supabase SQL editor
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/wishlist`)
- `fix/` - Bug fixes (e.g., `fix/checkout-validation`)
- `docs/` - Documentation updates (e.g., `docs/setup-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/payment-logic`)

### Creating a New Feature

1. Create a new branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit regularly:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

### Commit Message Guidelines

Follow the conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add wishlist functionality
fix: resolve checkout validation error
docs: update README with deployment steps
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (ESLint)
- Use Tailwind CSS for styling
- Write meaningful variable and function names
- Add comments for complex logic

## Testing Checklist

Before submitting a PR, ensure:

- [ ] Code runs without errors
- [ ] All existing features still work
- [ ] New feature is tested manually
- [ ] No console errors or warnings
- [ ] Mobile responsive (test on different screen sizes)
- [ ] Code follows project conventions

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utility functions and configurations
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## Key Features to Know

- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: UPI Direct (PhonePe, Google Pay)
- **Admin Dashboard**: `/admin` route
- **Product Categories**: Projectors, Inflatable Beds, Massagers, Tools, etc.

## Need Help?

- Check existing issues on GitHub
- Review the README.md for setup instructions
- Contact: support@sridiscount.com or 9259595943

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing! 🎉
