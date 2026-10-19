# AI Novel Writer - Client

Next.js client cho hệ thống đọc và sáng tác truyện với AI.

## 🚀 Phase 1 - Core Reader Features

### ✅ Đã hoàn thành

- **Authentication**
  - Đăng ký / Đăng nhập
  - Tự động refresh token
  - Protected routes

- **Novel Management**
  - CRUD novels (Create, Read, Update, Archive)
  - Danh sách truyện cá nhân
  - Chi tiết truyện

- **Chapter Management**
  - CRUD chapters
  - Import chapters từ file (.txt, .md)
  - Xem nội dung chương
  - Lock/Unlock chapters
  - Version history
  - Restore previous versions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📦 Cài đặt

```bash
# Install dependencies
npm install

# Chạy development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## ⚙️ Configuration

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📁 Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/             # Đăng nhập
│   │   ├── register/          # Đăng ký
│   │   ├── novels/            # Quản lý truyện
│   │   │   ├── [id]/          # Chi tiết truyện
│   │   │   │   └── chapters/  # Quản lý chương
│   │   │   └── new/           # Tạo truyện mới
│   │   └── page.tsx           # Homepage/redirect
│   ├── components/            # React components
│   │   └── layout/            # Layout components
│   └── lib/                   # Utilities & logic
│       ├── api/               # API client & endpoints
│       │   ├── client.ts      # Axios client with interceptors
│       │   ├── auth.ts        # Auth API
│       │   ├── novels.ts      # Novels API
│       │   └── chapters.ts    # Chapters API
│       ├── store/             # Zustand stores
│       │   └── auth.ts        # Auth state
│       ├── types.ts           # TypeScript types
│       └── utils.ts           # Helper functions
├── public/                    # Static assets
├── next.config.js            # Next.js config
├── tailwind.config.ts        # Tailwind config
└── tsconfig.json             # TypeScript config
```

## 🎨 Features Chi tiết

### 1. Authentication
- Form validation với Zod schema
- Token persistence trong localStorage
- Tự động refresh token khi hết hạn
- Redirect logic cho protected routes

### 2. Novel Management
- Grid layout responsive
- Status badges (Draft, Active, Completed, Archived)
- Metadata display (genre, chapter count, dates)
- Create/Edit forms với validation

### 3. Chapter Management
- Table of contents
- Bulk import từ file (hỗ trợ markdown headers)
- Chapter locking mechanism
- Version control system
- Rich text display với prose styling

### 4. UI/UX
- Dark mode support
- Responsive design (mobile-first)
- Loading states
- Error handling & display
- Toast notifications (có thể thêm)

## 🔌 API Integration

Client kết nối với NestJS backend qua REST API:

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Bearer token trong header
- **Auto-refresh**: Token tự động refresh khi expired

### Endpoints được sử dụng:

```
Auth:
  POST   /auth/register
  POST   /auth/login
  POST   /auth/refresh

Novels:
  GET    /novels
  POST   /novels
  GET    /novels/:id
  PATCH  /novels/:id
  DELETE /novels/:id

Chapters:
  POST   /novels/:novelId/chapters
  GET    /novels/:novelId/chapters
  POST   /novels/:novelId/chapters/import
  GET    /chapters/:id
  PUT    /chapters/:id/content
  PATCH  /chapters/:id/lock
  PATCH  /chapters/:id/unlock
  GET    /chapters/:id/versions
  GET    /chapters/:id/versions/:versionId
  POST   /chapters/:id/versions/:versionId/restore
```

## 🚧 Roadmap

### Phase 2 - Claude Pro Integration (Coming soon)
- MCP Server integration
- AI-powered chapter generation

### Phase 3 - Canon & Memory
- Canon facts management
- Story consistency tracking
- Conflict detection

### Phase 4 - Reliability & Polish
- Testing (Jest, React Testing Library)
- Error boundaries
- Audit logs
- Documentation

## 🤝 Contributing

Dự án này là một phần của AI Novel Writer system. Vui lòng xem BA.md để hiểu rõ hơn về architecture và requirements.

## 📄 License

Private project
