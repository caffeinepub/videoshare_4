# VideoShare

## Current State

Fresh project with default Caffeine structure. No existing features or pages.

## Requested Changes (Diff)

### Add

**Backend:**
- User authentication system with role-based access control
- Video upload, storage, and retrieval system using blob storage
- Video metadata management (title, description, tags, upload date, view count, duration)
- Channel/user profile system
- Like/dislike functionality for videos
- Comment system with nested replies
- Video search and filtering capabilities
- Watch history tracking
- Subscription system (users can subscribe to channels)
- Video recommendations based on views and engagement

**Frontend:**
- Home page with video grid showing recommended/recent videos
- Video player page with full playback controls
- Video upload page with form for metadata (title, description, tags, thumbnail)
- Channel page showing channel info and uploaded videos
- User profile/dashboard for managing own videos
- Search functionality with results page
- Comment section with threaded replies
- Like/dislike buttons and subscription button
- Video thumbnail generation and display
- Responsive navigation bar with search, upload, and user menu
- Watch history page
- Subscriptions feed page

**Data Models:**
- Video (id, title, description, uploaderId, uploaderName, videoUrl, thumbnailUrl, views, likes, dislikes, uploadDate, duration, tags)
- Channel/User (id, name, avatar, subscriberCount, description, joinDate)
- Comment (id, videoId, userId, userName, content, timestamp, parentCommentId for replies, likes)
- Subscription (userId, channelId)
- WatchHistory (userId, videoId, watchedAt)

### Modify

None - new project.

### Remove

None - new project.

## Implementation Plan

1. **Select Caffeine components:**
   - authorization (for user authentication and roles)
   - blob-storage (for video file and thumbnail storage)

2. **Backend (Motoko):**
   - User authentication and profile management
   - Video CRUD operations with metadata
   - Blob storage integration for video files and thumbnails
   - Comment CRUD with nested reply support
   - Like/dislike tracking for videos and comments
   - Subscription management
   - Search and filter videos by title, tags, uploader
   - Watch history tracking
   - View count increment on video play
   - Get recommended videos based on popularity

3. **Frontend (React + TypeScript):**
   - Create routing structure: home, video player, upload, channel, search results, subscriptions, history
   - Home page: video grid with thumbnails, titles, uploader, views, upload date
   - Video player page: embedded video player, video info, like/dislike/subscribe buttons, comments section
   - Upload page: form with file upload, title, description, tags, thumbnail upload
   - Channel page: channel banner, info, video grid of channel's uploads
   - Search bar component in navigation with search results page
   - Comment component with nested replies, like button, timestamps
   - User authentication UI (login/register)
   - Responsive navigation with logo, search, upload button, user avatar/menu
   - Video card component for grid display
   - Subscriptions feed showing videos from subscribed channels
   - Watch history page with chronological video list

## UX Notes

- Video thumbnails should be clickable and link to video player page
- Video player should auto-load and be ready to play
- Comments should display in chronological order with newest first, with option to expand replies
- Like/dislike should update in real-time with optimistic UI
- Upload progress should show during video file upload
- Search should filter as user types or on submit
- Subscription button should toggle between "Subscribe" and "Subscribed"
- Navigation should be sticky at top
- Video grid should be responsive (4 columns on desktop, 2 on tablet, 1 on mobile)
- Use video player controls: play/pause, seek bar, volume, fullscreen
- Display video duration on thumbnails
- Show subscriber count on channel pages
- Use relative timestamps (e.g., "2 hours ago", "3 days ago")
