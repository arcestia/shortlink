# URL Shortener Service

A simple and efficient URL shortener service built with Elysia.js and Bun.

## Features

- Shorten long URLs to easy-to-remember keys
- Custom key support
- Light/Dark theme support
- Configurable index page visibility
- Secure API with authorization
- SQLite database using Turso

## API Endpoints

### Create Short URL

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Authorization: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Create Custom Short URL

```bash
curl -X PUT http://localhost:3000/api/links/custom-key \
  -H "Authorization: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Access Short URL

```
GET /:key
```

Redirects to the original URL if found.

## Environment Variables

- `WORKERLINKS_SECRET`: API authorization secret
- `ENABLE_INDEX_FORM`: Show/hide the index form (true/false)
- `DEFAULT_URL`: Default URL to redirect to when index form is disabled
- `TURSO_DB_URL`: Turso database URL
- `TURSO_DB_AUTH_TOKEN`: Turso database authentication token

## Project Structure

The project follows Elysia's best practices with a service-based architecture:

- `DatabaseService`: Handles database connections and operations
- `URLService`: Manages URL-related operations (create, get, check)
- `AuthService`: Handles API authentication

## Development

1. Install dependencies:

```bash
bun install
```

2. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

3. Run development server:

```bash
bun run dev
```

## Production

Build and run for production:

```bash
bun run build
bun run start
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

- Maintained by: [Laurensius Jeffrey](https://github.com/arcestia)
