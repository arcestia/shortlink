# URL Shortener Service

A simple URL shortener service powered by Cloudflare Workers and Turso.

## Features

- Create short URLs with random keys
- Create custom short URLs
- Authorization required for creating URLs
- Beautiful UI with dark mode support
- Redirect to default URL when form is disabled

## Tech Stack

- [Hono](https://hono.dev/) - Fast, Lightweight, Web-standards Web Framework
- [Turso](https://turso.tech/) - Edge-hosted SQLite database
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/shortlink.git
   cd shortlink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.dev.vars` file with your environment variables:
   ```env
   WORKERLINKS_SECRET=your_secret
   TURSO_DB_URL=your_turso_db_url
   TURSO_DB_AUTH_TOKEN=your_turso_auth_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Configure your secrets in Cloudflare:
   ```bash
   npx wrangler secret put WORKERLINKS_SECRET
   npx wrangler secret put TURSO_DB_URL
   npx wrangler secret put TURSO_DB_AUTH_TOKEN
   ```

3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## API Usage

### Create Random Short URL

```bash
curl -X POST https://your-domain.com/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: your_secret" \
  -d '{"url":"https://example.com"}'
```

Response:
```json
{
  "message": "URL created successfully",
  "key": "abc123",
  "shorturl": "https://your-domain.com/abc123",
  "longurl": "https://example.com"
}
```

### Create Custom Short URL

```bash
curl -X PUT https://your-domain.com/api/links/custom-path \
  -H "Content-Type: application/json" \
  -H "Authorization: your_secret" \
  -d '{"url":"https://example.com"}'
```

Response:
```json
{
  "message": "URL created successfully",
  "key": "custom-path",
  "shorturl": "https://your-domain.com/custom-path",
  "longurl": "https://example.com"
}
```

## License

MIT License - see [LICENSE](LICENSE) for details
