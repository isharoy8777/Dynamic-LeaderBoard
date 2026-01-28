# Dynamic Leaderboard System

A high-performance, real-time leaderboard system built with **Golang** backend and **React Native (Expo)** frontend. Designed to handle 10,000+ users with O(1) rank updates using a rating bucket strategy.

## Live Demo

- **Backend API**: https://dynamic-leaderboard-production.up.railway.app
- **Health Check**: https://dynamic-leaderboard-production.up.railway.app/health

## Features

- Real-time leaderboard with 10,000+ users
- O(1) rating updates using fixed-size rating bucket strategy
- LeetCode-style page-based pagination
- Case-insensitive username search
- Rating simulation for testing
- Auto-polling (refreshes every 8 seconds)
- Dark/Light theme support
- Pull-to-refresh functionality

## Tech Stack

### Backend
- **Language**: Go (Golang)
- **Framework**: Gin
- **Database**: PostgreSQL
- **Deployment**: Railway

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## Architecture & Approach

### The Problem
Traditional ranking requires sorting all users (O(n log n)) which doesn't scale with frequent updates and millions of users.

### The Solution: Rating Bucket Strategy
Since ratings are bounded (100-5000), we maintain a fixed-size array:
```
ratingCount[5001]int where ratingCount[r] = count of users with rating r
```

### How Ranking Works

**Rank Calculation Formula:**
```
rank = 1 + sum(ratingCount[r] for all r > user.rating)
```

This means: "Your rank is 1 plus the count of all users with higher ratings"

**Example:**
- If 10 users have rating 5000 and 5 have rating 4999:
  - Rank of rating 5000 users = 1 + 0 = **1** (they're the best)
  - Rank of rating 4999 users = 1 + 10 = **11** (10 users are better)

### Benefits
| Operation | Traditional | Our Approach |
|-----------|-------------|--------------|
| Rating Update | O(n log n) | **O(1)** |
| Rank Calculation | O(n) | **O(4900)** ≈ O(1) |
| Same Rating Handling | Complex | **Automatic** (same rank) |

### Thread Safety
- Read operations use `RLock` (concurrent access allowed)
- Write operations use `Lock` (exclusive access)
- Maximizes throughput for read-heavy workloads

## Project Structure

```
├── backend/
│   ├── main.go          # Application entry point
│   ├── db.go            # Database connection and queries
│   ├── models.go        # Data structures
│   ├── ranking.go       # In-memory ranking engine
│   ├── handlers.go      # HTTP request handlers
│   ├── seed.go          # Database seeding utilities
│   ├── Dockerfile       # Container configuration
│   └── docker-compose.yml
│
├── frontend/
│   ├── app/             # Expo Router pages
│   ├── screens/         # Screen components
│   │   ├── leaderboard-screen.tsx
│   │   └── search-screen.tsx
│   ├── api/
│   │   └── api.ts       # API client
│   ├── components/      # Reusable components
│   └── app.config.js    # Expo configuration
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/stats` | Ranking engine statistics |
| GET | `/leaderboard?page=1&limit=100` | Paginated leaderboard |
| GET | `/search?username=query&page=1&limit=100` | Search users |
| POST | `/simulate` | Bulk random rating updates |
| POST | `/simulate` | Update specific user rating |

### Example Responses

**GET /leaderboard?page=1&limit=3**
```json
{
  "success": true,
  "data": [
    { "rank": 1, "username": "player_123", "rating": 5000 },
    { "rank": 2, "username": "gamer_456", "rating": 4998 },
    { "rank": 3, "username": "pro_789", "rating": 4995 }
  ],
  "count": 3,
  "page": 1,
  "limit": 3,
  "hasMore": true
}
```

**POST /simulate (specific user)**
```json
{
  "username": "player_123",
  "new_rating": 4500
}
```

## Local Setup

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Dynamic-LeaderBoard.git
   cd Dynamic-LeaderBoard/backend
   ```

2. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Run the backend**
   ```bash
   DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=postgres DB_NAME=leaderboard go run .
   ```

4. **Verify it's running**
   ```bash
   curl http://localhost:8080/health
   # Expected: {"service":"leaderboard-api","status":"healthy"}
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file**
   ```env
   # For local development
   EXPO_PUBLIC_API_URL=http://localhost:8080
   
   # For production
   # EXPO_PUBLIC_API_URL=https://dynamic-leaderboard-production.up.railway.app
   ```

5. **Start Expo**
   ```bash
   npx expo start --clear
   ```

6. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Full PostgreSQL connection URL | - |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_NAME` | Database name | leaderboard |
| `PORT` | Server port | 8080 |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | http://localhost:8080 |

## Deployment

### Backend (Railway)

1. Push code to GitHub
2. Connect repository to Railway
3. Add PostgreSQL plugin
4. Set `DATABASE_URL` environment variable
5. Deploy

### Frontend (Expo)

**For testing (Expo Go):**
```bash
npx expo start
```

**For production build:**
```bash
npm install -g eas-cli
eas login
eas build --platform android  # or ios
```

## Key Design Decisions

1. **Ranks are NEVER stored in the database** - Always computed on-the-fly for consistency

2. **Frontend NEVER computes ranks** - All rank data comes from the backend

3. **Frontend NEVER sorts data** - Displays exactly what the backend returns

4. **Async rating updates** - API returns immediately, in-memory buckets update first, database updates in background

5. **Same rating = Same rank** - Automatic tie handling built into the algorithm

## Performance

- **10,000 users**: Instant response
- **Rating update**: O(1) time complexity
- **Rank calculation**: O(4900) worst case (effectively constant)
- **Leaderboard query**: Uses DB index, never loads full table
- **Search**: Case-insensitive with PostgreSQL ILIKE

## License

MIT License