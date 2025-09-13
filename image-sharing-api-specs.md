# 🖼️ Image Sharing Platform - API Specifications & Data Flow

## API Endpoints

### Authentication & User Management

#### POST /api/v1/auth/register
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123456",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### POST /api/v1/auth/login
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### GET /api/v1/users/profile
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123456",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://cdn.example.com/avatars/user_123456.jpg",
    "followersCount": 1250,
    "followingCount": 340,
    "postsCount": 89,
    "bio": "Photography enthusiast",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Image Operations

#### POST /api/v1/images/upload
**Headers:** 
- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Body:**
```json
{
  "image": "<binary_file_data>",
  "caption": "Beautiful sunset at the beach",
  "tags": ["sunset", "beach", "nature"],
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "name": "San Francisco, CA"
  },
  "privacy": "public"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "post_789012",
    "imageUrl": "https://cdn.example.com/images/post_789012_original.jpg",
    "thumbnailUrl": "https://cdn.example.com/images/post_789012_thumbnail.jpg",
    "processingStatus": "processing",
    "estimatedProcessingTime": 30
  }
}
```

#### GET /api/v1/images/{postId}
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "post_789012",
    "userId": "user_123456",
    "username": "johndoe",
    "imageUrl": "https://cdn.example.com/images/post_789012_original.jpg",
    "thumbnailUrl": "https://cdn.example.com/images/post_789012_thumbnail.jpg",
    "caption": "Beautiful sunset at the beach",
    "tags": ["sunset", "beach", "nature"],
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "name": "San Francisco, CA"
    },
    "likesCount": 245,
    "commentsCount": 12,
    "isLiked": false,
    "createdAt": "2024-01-20T18:45:00Z",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "fileSize": 2048576,
      "format": "JPEG",
      "camera": "iPhone 14 Pro"
    }
  }
}
```

### Social Features

#### GET /api/v1/feed
**Headers:** `Authorization: Bearer <access_token>`
**Query Parameters:**
- `page`: 1 (default)
- `limit`: 20 (default, max 50)
- `cursor`: "2024-01-20T18:45:00Z" (for pagination)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "postId": "post_789012",
        "userId": "user_123456",
        "username": "johndoe",
        "avatar": "https://cdn.example.com/avatars/user_123456.jpg",
        "imageUrl": "https://cdn.example.com/images/post_789012_thumbnail.jpg",
        "caption": "Beautiful sunset at the beach",
        "likesCount": 245,
        "commentsCount": 12,
        "isLiked": false,
        "createdAt": "2024-01-20T18:45:00Z"
      }
    ],
    "pagination": {
      "nextCursor": "2024-01-20T17:30:00Z",
      "hasMore": true
    }
  }
}
```

#### POST /api/v1/posts/{postId}/like
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "post_789012",
    "isLiked": true,
    "likesCount": 246
  }
}
```

#### POST /api/v1/posts/{postId}/comments
**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "content": "Amazing shot! 📸"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commentId": "comment_345678",
    "postId": "post_789012",
    "userId": "user_789012",
    "username": "photographer_jane",
    "content": "Amazing shot! 📸",
    "createdAt": "2024-01-20T19:00:00Z"
  }
}
```

#### POST /api/v1/users/{userId}/follow
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123456",
    "isFollowing": true,
    "followersCount": 1251
  }
}
```

### Search

#### GET /api/v1/search/users
**Query Parameters:**
- `q`: "john" (search query)
- `page`: 1
- `limit`: 20

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "user_123456",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://cdn.example.com/avatars/user_123456.jpg",
        "followersCount": 1250,
        "isFollowing": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "hasMore": false
    }
  }
}
```

#### GET /api/v1/search/posts
**Query Parameters:**
- `q`: "sunset" (search query)
- `tags`: "nature,beach" (comma-separated tags)
- `page`: 1
- `limit`: 20

## Data Flow Diagrams

### 1. Image Upload Flow

```
Client App
    │
    │ POST /api/v1/images/upload
    │ (multipart/form-data)
    ▼
API Gateway
    │
    │ Rate limiting & Auth
    ▼
Load Balancer
    │
    │ Route to Image Service
    ▼
Image Service
    │
    │ 1. Validate file
    │ 2. Generate unique ID
    │ 3. Store in Object Storage
    │
    ▼
Object Storage (S3)
    │
    │ Store original image
    │
    ▼
Message Queue (Kafka)
    │
    │ Publish processing job
    │
    ▼
Background Worker
    │
    │ 1. Download image
    │ 2. Generate thumbnails
    │ 3. Extract metadata
    │ 4. Compress images
    │
    ▼
Object Storage (S3)
    │
    │ Store processed images
    │
    ▼
Database (PostgreSQL)
    │
    │ Update post metadata
    │
    ▼
Cache (Redis)
    │
    │ Invalidate user feed cache
    │
    ▼
Response to Client
```

### 2. Feed Generation Flow

```
Client App
    │
    │ GET /api/v1/feed
    │
    ▼
API Gateway
    │
    │ Auth & Rate limiting
    ▼
Load Balancer
    │
    │ Route to Social Service
    ▼
Social Service
    │
    │ Check Redis cache
    │
    ▼
Cache Hit? ──Yes──► Return cached feed
    │
    No
    ▼
Social Database (MongoDB)
    │
    │ Get user's following list
    │
    ▼
Primary Database (PostgreSQL)
    │
    │ Get recent posts from followed users
    │
    ▼
Social Service
    │
    │ 1. Format feed data
    │ 2. Add user context (likes, etc.)
    │ 3. Cache result
    │
    ▼
Cache (Redis)
    │
    │ Store feed for 5 minutes
    │
    ▼
Response to Client
```

### 3. Image Viewing Flow

```
Client App
    │
    │ GET /api/v1/images/{postId}
    │
    ▼
CDN (CloudFront)
    │
    │ Check cache
    │
    ▼
Cache Hit? ──Yes──► Return cached image
    │
    No
    ▼
Object Storage (S3)
    │
    │ Fetch image
    │
    ▼
CDN
    │
    │ 1. Cache image
    │ 2. Serve to client
    │
    ▼
Client App
```

### 4. Real-time Notifications Flow

```
User Action (Like/Follow/Comment)
    │
    ▼
Social Service
    │
    │ Process action
    │
    ▼
Message Queue (Kafka)
    │
    │ Publish notification event
    │
    ▼
Notification Service
    │
    │ 1. Get user preferences
    │ 2. Format notification
    │ 3. Send push notification
    │
    ▼
Push Service (FCM/APNS)
    │
    │ Deliver to device
    │
    ▼
Client App
    │
    │ Show notification
```

## Database Schema

### PostgreSQL (Primary Database)

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Posts Table
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    privacy VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX idx_posts_location ON posts(latitude, longitude);
```

#### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

#### Follows Table
```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

### MongoDB (Social Graph Database)

#### User Social Graph Collection
```javascript
{
  _id: ObjectId("..."),
  userId: "user_123456",
  followers: [
    {
      userId: "user_789012",
      username: "photographer_jane",
      followedAt: ISODate("2024-01-15T10:30:00Z")
    }
  ],
  following: [
    {
      userId: "user_345678", 
      username: "nature_lover",
      followedAt: ISODate("2024-01-10T14:20:00Z")
    }
  ],
  feed: [
    {
      postId: "post_789012",
      userId: "user_345678",
      timestamp: ISODate("2024-01-20T18:45:00Z"),
      score: 0.95
    }
  ],
  lastFeedUpdate: ISODate("2024-01-20T18:45:00Z")
}
```

#### Activity Feed Collection
```javascript
{
  _id: ObjectId("..."),
  userId: "user_123456",
  activities: [
    {
      type: "like",
      actorId: "user_789012",
      actorUsername: "photographer_jane",
      targetId: "post_789012",
      timestamp: ISODate("2024-01-20T19:00:00Z")
    },
    {
      type: "comment",
      actorId: "user_345678",
      actorUsername: "nature_lover", 
      targetId: "post_789012",
      content: "Amazing shot! 📸",
      timestamp: ISODate("2024-01-20T19:05:00Z")
    }
  ],
  lastActivity: ISODate("2024-01-20T19:05:00Z")
}
```

## Performance Optimizations

### Caching Strategy

#### Redis Cache Keys
```
# User sessions
session:{user_id} -> {access_token, expires_at}

# User profiles  
profile:{user_id} -> {user_data} (TTL: 1 hour)

# User feeds
feed:{user_id} -> {posts_array} (TTL: 5 minutes)

# Popular posts
popular_posts -> {posts_array} (TTL: 30 minutes)

# Post details
post:{post_id} -> {post_data} (TTL: 1 hour)

# User relationships
following:{user_id} -> {following_list} (TTL: 10 minutes)
followers:{user_id} -> {followers_list} (TTL: 10 minutes)
```

#### CDN Caching
```
# Image files
/images/{post_id}_{size}.jpg -> TTL: 30 days

# User avatars  
/avatars/{user_id}.jpg -> TTL: 7 days

# Static assets
/css/*, /js/* -> TTL: 1 year
```

### Database Optimizations

#### Read Replicas
- **Primary**: Write operations (POST, PUT, DELETE)
- **Replica 1**: Read operations for user profiles
- **Replica 2**: Read operations for feeds and posts

#### Connection Pooling
```javascript
// PostgreSQL connection pool
const pool = new Pool({
  host: 'primary-db.example.com',
  port: 5432,
  database: 'imagesharing',
  user: 'app_user',
  password: 'secure_password',
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Query Optimization
```sql
-- Optimized feed query with proper indexing
SELECT p.*, u.username, u.avatar_url
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN follows f ON f.following_id = p.user_id
WHERE f.follower_id = $1
ORDER BY p.created_at DESC
LIMIT 20;

-- Index for this query
CREATE INDEX idx_follows_follower_created 
ON follows(follower_id, created_at DESC);
```

This comprehensive API specification and data flow design provides a solid foundation for implementing the image sharing platform with proper scalability, performance, and maintainability considerations.
