#!/bin/bash
# Setup script for refresh token implementation

echo "🔧 Installing dependencies..."
pnpm install cookie-parser @types/cookie-parser

echo ""
echo "📦 Building TypeScript..."
pnpm run build

echo ""
echo "🗄️  Applying database migration..."
pnpm run push

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your .env file has JWT_SECRET set"
echo "2. Set NODE_ENV=production for production deployments"
echo "3. Set FRONTEND_URL to your frontend's URL for CORS"
echo "4. Start the server with: pnpm run dev"
echo ""
echo "📖 See REFRESH_TOKEN_SETUP.md for detailed documentation"
