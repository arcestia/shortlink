# URL Shortener

A simple URL shortener service powered by [Bun](https://bun.sh), [Elysia.js](https://elysiajs.com), and [Turso](https://turso.tech).

## Features

- Create short URLs with random keys
- Create short URLs with custom keys
- API authorization using secret key
- Automatic redirection to target URLs
- Optional form interface (can be disabled)
- Dark mode support
- TypeScript support

## Prerequisites

- [Bun](https://bun.sh) installed
- [Turso](https://turso.tech) database credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/arcestia/shortlink.git
cd shortlink
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables in `.env`:
```env
WORKERLINKS_SECRET=your-secret-key
ENABLE_INDEX_FORM=true
DEFAULT_URL=https://your-default-url.com
TURSO_DB_URL=your-turso-db-url
TURSO_DB_AUTH_TOKEN=your-turso-db-token
```

4. Run the development server:
```bash
bun run dev
```

5. For production:
```bash
bun run start
```

## API Endpoints

All endpoints for creating links require authorization via the `Authorization` header with your `WORKERLINKS_SECRET` value.

### Create Random Short URL

```bash
curl -X POST http://localhost:3000/ \
  -H "Authorization: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Create Custom Short URL

```bash
curl -X PUT http://localhost:3000/custom-path \
  -H "Authorization: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Access Short URL

```bash
curl -i http://localhost:3000/your-key
```

Note: Accessing short URLs does not require authorization.

## Configuration

- `WORKERLINKS_SECRET`: Secret key required for creating short URLs
- `ENABLE_INDEX_FORM`: Set to `true` to show the form interface, `false` to redirect to `DEFAULT_URL`
- `DEFAULT_URL`: URL to redirect to when form is disabled
- `TURSO_DB_URL`: Your Turso database URL
- `TURSO_DB_AUTH_TOKEN`: Your Turso database auth token

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

- Original Author: [Erisa A](https://erisa.link)
- Maintained by: [Laurensius Jeffrey](https://github.com/arcestia)
