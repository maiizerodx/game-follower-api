# Game Follower API

An API for tracking follower counts across multiple social media platforms for games and developers.

## Features

- Track follower counts on Twitter, Steam, Reddit, and Facebook
- Secure API access with JWT authentication
- Rate limiting to prevent abuse
- Puppeteer-based scraping for platforms without public APIs

## Getting Started

### Prerequisites

- Node.js 14 or higher
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies:

```bash
npm install