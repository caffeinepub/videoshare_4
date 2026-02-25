# VideoShare

A YouTube-like video sharing platform built on the Internet Computer with React 19 and TypeScript.

## Features

- **Video Upload & Management**: Upload videos with thumbnails, titles, and descriptions
- **Video Discovery**: Browse all videos in a responsive grid layout
- **Video Player**: Watch videos with HTML5 player and full controls
- **User Interactions**: Like videos, comment on videos, subscribe to channels
- **Channel Pages**: View user channels with their uploaded videos and subscriber counts
- **Personal Dashboard**: Manage your uploaded videos with delete functionality
- **Subscriptions Feed**: Follow your favorite creators
- **Internet Identity Auth**: Secure authentication using Internet Identity
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** with OKLCH color system
- **shadcn/ui** component library
- **next-themes** for dark/light mode

### Backend
- **Motoko** canister on Internet Computer
- **Authorization** component for user management
- **Blob Storage** component for video and thumbnail storage

## Design System

**Visual Direction**: Cinematic Editorial — Modern editorial meets high-energy media

**Color Palette**:
- Primary: Deep Teal (`oklch(0.48 0.11 200)`)
- Accent: Electric Coral (`oklch(0.68 0.18 25)`)
- Subtle blue undertones with warm coral accents

**Typography**:
- Display: Lexend (headings, titles)
- Body: Inter (body text, UI)
- Sans: Space Grotesk (general UI)

**Signature Detail**: Cinematic card shadows with subtle hover transforms and film grain texture overlay

## Project Structure

```
src/frontend/src/
├── components/
│   ├── ui/              # shadcn/ui components (auto-generated)
│   ├── CommentForm.tsx
│   ├── CommentList.tsx
│   ├── Navbar.tsx
│   ├── ProfileSetupModal.tsx
│   ├── VideoCard.tsx
│   └── VideoPlayer.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── VideoPlayerPage.tsx
│   ├── UploadPage.tsx
│   ├── ChannelPage.tsx
│   ├── MyVideosPage.tsx
│   └── SubscriptionsPage.tsx
├── hooks/
│   ├── useQueries.ts    # React Query hooks for backend
│   ├── useActor.ts      # Actor connection (generated)
│   └── useInternetIdentity.ts  # Auth hook (generated)
├── utils/
│   └── format.ts        # Time and number formatting utilities
├── App.tsx              # Router setup and layout
└── main.tsx             # App entry point
```

## Routes

- `/` - Home page with all videos
- `/video/:videoId` - Video player page
- `/upload` - Upload new video (auth required)
- `/channel/:userId` - User channel page
- `/my-videos` - Current user's videos (auth required)
- `/subscriptions` - Subscription feed (auth required)

## Key Components

### VideoCard
Displays video thumbnail, title, uploader, views, and timestamp in a responsive card with cinematic hover effects.

### VideoPlayer
HTML5 video player with controls and support for multiple video formats.

### CommentList & CommentForm
Comment system with add/delete functionality and relative timestamps.

### ProfileSetupModal
First-time user onboarding to set up username (required after first login).

## Backend Integration

All backend calls use React Query hooks from `hooks/useQueries.ts`:

**Video Queries**:
- `useGetAllVideos()` - Fetch all videos
- `useGetVideo(id)` - Fetch single video
- `useGetVideosByUploaderId(userId)` - Fetch videos by user

**Video Mutations**:
- `useCreateVideo()` - Upload new video
- `useDeleteVideo()` - Delete own video
- `useIncrementViewCount()` - Increment view count
- `useLikeVideo()` / `useUnlikeVideo()` - Toggle like

**Comment Queries/Mutations**:
- `useGetVideoComments(videoId)` - Fetch comments
- `usePostComment()` - Add comment
- `useDeleteComment()` - Delete own comment

**User Profile**:
- `useGetCallerUserProfile()` - Get current user profile
- `useGetUserProfile(userId)` - Get any user profile
- `useSaveCallerUserProfile()` - Update profile

**Subscriptions**:
- `useGetChannelSubscribers(channelId)` - Get subscriber count
- `useSubscribeToChannel()` / `useUnsubscribeFromChannel()` - Toggle subscription

## Development

```bash
# Install dependencies
pnpm install

# Run type checking
pnpm --filter '@caffeine/template-frontend' typescript-check

# Run linter
pnpm --filter '@caffeine/template-frontend' lint

# Build for production
pnpm --filter '@caffeine/template-frontend' build:skip-bindings
```

## Design Notes

This app follows the Caffeine design system principles:

1. **Token-only styling** - No raw color values in components
2. **OKLCH color space** - For perceptual color consistency
3. **Distinctive typography** - Lexend + Inter for editorial feel
4. **Cinematic shadows** - Deep, dramatic shadows on hover
5. **Film grain texture** - Subtle noise overlay for atmosphere
6. **Generous spacing** - Let content breathe
7. **Staggered animations** - Fade-in and scale-in effects
8. **Mobile-first responsive** - 1-2-3-4 column grid breakpoints

---

© 2026. Built with love using [caffeine.ai](https://caffeine.ai)
