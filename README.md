# KCPE Admin Dashboard

Modern React + TypeScript admin interface for managing Cloudflare D1 education database.

## 🚀 Features

- ✅ **React 18** with TypeScript
- ✅ **Nested Routes** with React Router v6
- ✅ **Modal-based CRUD** operations
- ✅ **Direct D1 Management** - No local storage
- ✅ **Express API Server** - Proxies to Cloudflare Workers
- ✅ **Modern UI** - Clean, responsive design
- ✅ **Vite** - Fast development & build

## 📁 Project Structure

```
kcpe-admin-ts/
├── src/
│   ├── server/
│   │   └── index.ts          # Express API server
│   └── client/
│       ├── main.tsx           # React entry point
│       ├── App.tsx            # Router configuration
│       ├── api/
│       │   └── index.ts       # API client (axios)
│       ├── components/
│       │   ├── Layout.tsx     # Main layout with sidebar
│       │   └── Modal.tsx      # Reusable modal component
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── CoursesPage.tsx
│       │   ├── SubjectsPage.tsx
│       │   ├── ExamSetsPage.tsx
│       │   ├── PastPapersPage.tsx
│       │   └── QuestionsPage.tsx
│       ├── types/
│       │   └── index.ts       # TypeScript interfaces
│       └── styles/
│           └── global.css     # Global styles
├── public/                    # Static assets
├── index.html                 # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # Client TypeScript config
├── tsconfig.server.json      # Server TypeScript config
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd /home/ngobiro/StudioProjects/kcpe-admin-ts
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
PORT=3000
CLOUDFLARE_API_URL=https://east-africa-education-api.pngobiro.workers.dev/api
CLOUDFLARE_API_KEY=ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure
```

### 3. Run Development Server

```bash
npm run dev
```

This starts:
- **Express API** on http://localhost:3000
- **Vite Dev Server** on http://localhost:5173

### 4. Build for Production

```bash
npm run build
npm start
```

## 🎨 Architecture

### Data Flow

```
React UI → Vite Dev Server → Express API → Cloudflare Workers → D1 Database
  (5173)        (proxy)         (3000)        (Workers API)      (SQLite)
```

### Key Technologies

- **Frontend**: React 18, TypeScript, React Router v6, Axios
- **Backend**: Express.js, TypeScript
- **Build**: Vite
- **Database**: Cloudflare D1 (via Workers API)
- **Styling**: Pure CSS (CSS Variables)

## 📋 API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create/update course
- `DELETE /api/courses/:id` - Delete course

### Subjects
- `GET /api/subjects?course_id=xxx` - List subjects
- `POST /api/subjects` - Create/update subject

### Exam Sets
- `GET /api/examsets?course_id=xxx` - List exam sets
- `POST /api/examsets` - Create/update exam set

### Past Papers
- `GET /api/pastpapers?subject_id=xxx` - List past papers
- `POST /api/pastpapers` - Create/update past paper

### Questions
- `GET /api/questions?exam_set_id=xxx` - List questions
- `POST /api/questions/upload` - Upload questions JSON
- `POST /api/questions/export` - Export questions

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start both server & client in dev mode
npm run server     # Start Express server only
npm run client     # Start Vite dev server only
npm run build      # Build for production
npm start          # Run production build
```

### Adding New Pages

1. Create component in `src/client/pages/`
2. Add route in `src/client/App.tsx`
3. Add navigation link in `src/client/components/Layout.tsx`

### Adding New API Endpoints

1. Add endpoint in `src/server/index.ts`
2. Add API function in `src/client/api/index.ts`
3. Add TypeScript interface in `src/client/types/index.ts`

## 🎯 Features to Implement

- [ ] Complete ExamSetsPage with CRUD operations
- [ ] Complete PastPapersPage with CRUD operations
- [ ] Complete QuestionsPage with bulk import/export
- [ ] Add authentication & authorization
- [ ] Add file upload for question papers (R2)
- [ ] Add search & filtering
- [ ] Add pagination
- [ ] Add form validation
- [ ] Add toast notifications
- [ ] Add loading states & error boundaries

## 📝 Notes

- **No Local Storage**: All data is managed directly in Cloudflare D1
- **RESTful API**: Express server proxies all requests to Workers API
- **Modals**: All create/edit operations use modal dialogs
- **Nested Routes**: Routes follow resource hierarchy (courses → subjects → past papers)

## 🚀 Deployment

### Server Deployment
- Build: `npm run build:server`
- Deploy Express app to any Node.js hosting (Railway, Render, etc.)

### Client Deployment
- Build: `npm run build` (creates `dist/client/`)
- Deploy to Cloudflare Pages, Vercel, or Netlify
- Configure API proxy to your Express server

## 🔗 Related Projects

- **Android App**: `/home/ngobiro/StudioProjects/kcsperevisionking`
- **Workers API**: `/home/ngobiro/StudioProjects/kcsperevisionking/education-api-worker`
- **Admin Dashboard**: This project

## 📞 Support

For issues or questions, contact the development team.

---

**Built with ❤️ using React, TypeScript, and Cloudflare D1**
# kcpe-admin-ts
