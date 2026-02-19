# 🔖 SmartMark - Smart Bookmark Manager

A modern, full-stack bookmark management application built with Next.js 14, Supabase, and TypeScript. Save, organize, and access your favorite links from anywhere with real-time synchronization.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## 🌟 Features

- **🔐 Secure Authentication**: Google OAuth integration via Supabase Auth
- **📚 Bookmark Management**: Create, view, and delete bookmarks with ease
- **🎨 Modern UI**: Beautiful dark mode with glassmorphism effects
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **⚡ Real-time Sync**: Changes reflect instantly across all devices
- **🔒 Privacy First**: Row-level security ensures your bookmarks are private
- **🎯 Smart Metadata**: Automatic favicon fetching for visual identification

## 🚀 Live Demo

**Production URL**: [https://smart-bookmark-app-six-ivory.vercel.app](https://smart-bookmark-app-six-ivory.vercel.app)

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel
- **Authentication**: Google OAuth 2.0

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for OAuth)
- Vercel account (for deployment)

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-bookmark-app
npm install
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Run the following SQL in the SQL Editor:

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```


3. Configure Google OAuth:
   - Go to **Authentication** > **Providers** > **Google**
   - Enable Google provider
   - Add your Google Client ID and Secret

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/auth/callback`
     - `https://<your-supabase-project>.supabase.co/auth/v1/callback`

### 4. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Post-Deployment Configuration

Update redirect URIs in:

**Supabase** (Authentication > URL Configuration):
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

**Google Cloud Console**:
- Authorized redirect URIs: `https://your-app.vercel.app/auth/callback`

## 🐛 Problems Encountered & Solutions

### Problem 1: Vercel Build Failure - Prerender Error

**Issue**: During deployment, Next.js tried to statically generate pages at build time, but Supabase environment variables weren't available, causing the error:
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Solution**: Added `export const dynamic = 'force-dynamic'` to all pages (`login/page.tsx`, `page.tsx`, `dashboard/page.tsx`) to force dynamic rendering instead of static generation.

```typescript
export const dynamic = 'force-dynamic'
```

### Problem 2: Same-Tab Optimistic Updates Not Working

**Issue**: When adding a bookmark, it would appear in other tabs via Realtime but not in the same tab where it was created.

**Solution**: Implemented optimistic UI updates by:
1. Using `forwardRef` and `useImperativeHandle` in `BookmarkList` to expose an `addBookmark` method
2. Creating a `BookmarkManager` wrapper component to coordinate between `AddBookmark` and `BookmarkList`
3. Calling `addBookmark` immediately after successful insertion

```typescript
const BookmarkList = forwardRef<BookmarkListRef, BookmarkListProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    addBookmark: (bookmark: Bookmark) => {
      setBookmarks(prev => [bookmark, ...prev])
    }
  }))
})
```

### Problem 3: Realtime Subscription Not Receiving Updates

**Issue**: Realtime updates weren't working initially.

**Solution**: 
1. Enabled Realtime for the `bookmarks` table in Supabase:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
   ```
2. Properly configured the Realtime subscription with correct channel and filters:
   ```typescript
   supabase
     .channel('bookmarks-changes')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'bookmarks',
       filter: `user_id=eq.${userId}`
     }, handleRealtimeUpdate)
     .subscribe()
   ```

### Problem 4: Insert Not Returning Data

**Issue**: After inserting a bookmark, the response didn't include the newly created bookmark data.

**Solution**: Added `.select()` to the insert query to return the inserted row:
```typescript
const { data, error } = await supabase
  .from('bookmarks')
  .insert([newBookmark])
  .select()
  .single()
```


### Problem 5: Environment Variables in Vercel

**Issue**: Build succeeded locally but failed on Vercel even after adding environment variables.

**Solution**: Used Vercel CLI to properly add environment variables to all environments (Production, Preview, Development):
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📁 Project Structure

```
smart-bookmark-app/
├── src/
│   ├── app/
│   │   ├── auth/callback/      # OAuth callback handler
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── login/              # Login page
│   │   └── page.tsx            # Root redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # Desktop navigation
│   │   │   └── MobileHeader.tsx # Mobile navigation
│   │   ├── AddBookmark.tsx     # Add bookmark modal
│   │   ├── BookmarkCard.tsx    # Individual bookmark card
│   │   ├── BookmarkList.tsx    # Bookmark grid display
│   │   └── BookmarkManager.tsx # Coordinator component
│   └── lib/
│       └── supabase/
│           ├── client.ts        # Browser Supabase client
│           ├── server.ts        # Server Supabase client
│           └── middleware.ts    # Auth middleware
├── .env.local                   # Environment variables (gitignored)
└── README.md
```

## 🎨 Design Decisions

- **Slate/Zinc Color Palette**: Professional dark mode aesthetic
- **Glassmorphism**: Subtle transparency and blur effects for modern UI
- **Responsive Grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Lucide Icons**: Lightweight, consistent icon library
- **Modal Pattern**: Cleaner UX for adding bookmarks vs inline forms

## 🔮 Future Enhancements

- [ ] Edit bookmark functionality
- [ ] Tags and categories
- [ ] Search and filter
- [ ] Bulk operations
- [ ] Chrome extension
- [ ] Import/export bookmarks
- [ ] Bookmark sharing


