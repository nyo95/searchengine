# Architecture & Interior Product Catalog

A comprehensive Next.js 15 fullstack application for managing architecture and interior product catalogs with advanced search capabilities and learning engine.

## 🚀 Features

### 🔍 **Advanced Search Engine**
- **Bilingual Search**: Indonesia/English with synonym support
- **Google-like UI**: Autocomplete and real-time suggestions
- **Smart Filtering**: By category, brand, price range
- **Learning Algorithm**: Personalized results based on user behavior

### 📊 **Product Management**
- **Hierarchical Structure**: Brand → Product Type → Product (SKU) → Variant
- **Flexible Attributes**: JSON-based attribute system
- **Media Support**: Images, datasheets, CAD files
- **Variant Management**: Multiple configurations per product

### 📋 **Schedule Builder**
- **Project-based Scheduling**: Organize by project
- **Export Capabilities**: CSV/JSON/Excel formats
- **Specialized Schedules**: Material/Lighting/Furniture schedules
- **Real-time Updates**: Live schedule management

### 🧠 **Learning Engine**
- **Activity Tracking**: Search, views, schedule additions
- **Preference Learning**: Brand/category/attribute preferences
- **Smart Ranking**: Results based on usage patterns
- **Analytics Dashboard**: Usage insights and trends

### 📈 **Analytics & Insights**
- **Popular Products**: Most viewed and used items
- **Brand Analysis**: Market share and trends
- **Category Distribution**: Usage by category
- **Search Trends**: Popular search terms

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** with App Router
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### **Backend**
- **Next.js API Routes** for serverless functions
- **Prisma ORM** for database management
- **PostgreSQL** with Full-Text Search (FTS)
- **JSON Storage** for flexible attributes

### **State Management**
- **React Hooks** for local state
- **API Integration** for server state
- **Real-time Updates** with optimistic UI

## 📁 Project Structure

```
architecture-product-catalog/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage with search
│   │   ├── product/[id]/page.tsx       # Product details
│   │   ├── schedule/page.tsx           # Schedule management
│   │   ├── insights/page.tsx           # Analytics dashboard
│   │   └── api/
│   │       ├── search/route.ts         # Search API
│   │       ├── suggestions/route.ts    # Autocomplete API
│   │       ├── activity/route.ts       # Activity tracking API
│   │       ├── schedule/items/route.ts # Schedule CRUD API
│   │       └── placeholder/[...slug]/route.ts # Image placeholder API
│   ├── components/ui/                  # shadcn/ui components
│   ├── lib/db.ts                     # Database connection
│   └── hooks/use-toast.ts            # Toast notifications
├── prisma/
│   └── schema.prisma                # Database schema
├── public/                          # Static assets
├── package.json                     # Dependencies
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### **Installation**

1. **Extract Archive**
   ```bash
   tar -xzf architecture-product-catalog.tar.gz
   cd architecture-product-catalog
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Open http://localhost:3000
   - API endpoints available at http://localhost:3000/api/*

## 🎯 Usage Guide

### **1. Product Search**
- Visit homepage
- Type search queries (bilingual supported)
- Use filters for precise results
- Click products to view details

### **2. Product Management**
- View detailed specifications
- Select variants
- Add to schedules
- Download datasheets

### **3. Schedule Building**
- Create project schedules
- Add products with quantities
- Set areas and notes
- Export to various formats

### **4. Analytics**
- Monitor popular products
- Track brand preferences
- Analyze search trends
- View usage insights

## 🔧 Configuration

### **Database Schema**
The system uses a hierarchical structure:
- **Categories** (Lighting, Material, Furniture, Hardware)
- **Brands** (Philips, Taco, Herman Miller, etc.)
- **Product Types** (Downlight, HPL, Chair, etc.)
- **Products** (SKUs with base pricing)
- **Variants** (Specific configurations with JSON attributes)

### **Search Configuration**
- **Full-Text Search**: PostgreSQL FTS with trigrams
- **Bilingual Support**: Indonesian/English synonym mapping
- **Relevance Scoring**: Based on usage and preferences
- **Learning Algorithm**: Tracks user behavior patterns

### **API Endpoints**

#### **Search & Discovery**
- `GET /api/search` - Advanced product search
- `GET /api/suggestions` - Autocomplete suggestions
- `GET /api/product/[id]` - Product details

#### **Schedule Management**
- `GET /api/schedule/items` - List schedule items
- `POST /api/schedule/items` - Add item to schedule
- `DELETE /api/schedule/items` - Remove schedule item

#### **Analytics & Tracking**
- `POST /api/activity` - Track user activities
- `GET /api/insights` - Analytics data

## 🎨 Customization

### **Adding New Categories**
1. Update `prisma/schema.prisma`
2. Add category to mock data
3. Update UI components

### **Extending Attributes**
1. Modify JSON schema in `Variant` model
2. Update product detail UI
3. Add search indexing

### **Custom Export Formats**
1. Extend export functions in schedule page
2. Add new format buttons
3. Implement format-specific logic

## 🔒 Security Features

- **Input Validation**: All API endpoints validate inputs
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Prevention**: React's built-in protection
- **CSRF Protection**: Next.js security headers

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: 44px minimum touch targets
- **Adaptive Layout**: Responsive grid systems
- **Progressive Enhancement**: Works without JavaScript

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Optimized search queries
- **Caching**: API response caching

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build production
npm run build

# Start production
npm start
```

## 📈 Scalability

### **Database Scaling**
- **Read Replicas**: For search queries
- **Connection Pooling**: Prisma connection management
- **Indexing Strategy**: Optimized for search

### **Application Scaling**
- **Serverless**: Next.js API routes
- **CDN Ready**: Static asset optimization
- **Microservices**: Modular API structure

## 🔮 Future Enhancements

### **AI Integration**
- **Vector Search**: For semantic similarity
- **Image Recognition**: Product photo analysis
- **Recommendation Engine**: ML-based suggestions

### **Advanced Features**
- **Real-time Collaboration**: Multi-user scheduling
- **Mobile App**: React Native application
- **Advanced Analytics**: Business intelligence
- **API Marketplace**: Third-party integrations

## 📞 Support

For issues and feature requests:
1. Check the documentation
2. Review the code comments
3. Test with provided examples
4. Create detailed bug reports

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.**