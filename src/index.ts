import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { html } from '@elysiajs/html'
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Env } from './types'

// Read HTML template
const formHtml = readFileSync(join(__dirname, 'views/index.html'), 'utf-8')

// Parse boolean environment variables
const parseBool = (value: string | undefined): boolean => {
    return value?.toLowerCase() === 'true'
}

// Main application
new Elysia()
    .use(cors())
    .use(html())
    .decorate('env', {
        ...process.env,
        ENABLE_INDEX_FORM: parseBool(process.env.ENABLE_INDEX_FORM),
    } as unknown as Env)
    .derive(({ env }) => {
        const db = createClient({
            url: env.TURSO_DB_URL,
            authToken: env.TURSO_DB_AUTH_TOKEN
        })

        return {
            db,
            isAuthorized: ({ headers }: { headers: { authorization?: string } }) => 
                headers.authorization === env.WORKERLINKS_SECRET,
            async getUrl(key: string) {
                const result = await db.execute({
                    sql: 'SELECT url FROM links WHERE key = ?',
                    args: [key]
                })
                return result.rows[0]?.url as string | undefined
            },
            async createUrl(key: string, url: string) {
                await db.execute({
                    sql: 'INSERT INTO links (key, url) VALUES (?, ?)',
                    args: [key, url]
                })
                return { key, url }
            },
            async checkKeyExists(key: string) {
                const result = await db.execute({
                    sql: 'SELECT 1 FROM links WHERE key = ?',
                    args: [key]
                })
                return result.rows.length > 0
            }
        }
    })
    // Root handler
    .get('/', ({ env, set }) => {
        if (!env.ENABLE_INDEX_FORM) {
            if (!env.DEFAULT_URL) {
                set.status = 500
                return { success: false, message: 'No default URL configured' }
            }
            set.status = 302
            set.headers = {
                Location: env.DEFAULT_URL
            }
            return
        }
        return formHtml
    })
    // URL redirect handler
    .get('/:key', async ({ params: { key }, getUrl, set }) => {
        if (key === 'favicon.ico') {
            set.status = 404
            return { success: false, message: 'Not found' }
        }

        try {
            const url = await getUrl(key)
            
            if (!url) {
                set.status = 404
                return { success: false, message: 'URL not found' }
            }

            set.status = 302
            set.headers = {
                Location: url
            }
            return
        } catch (error) {
            console.error('Error looking up URL:', error)
            set.status = 500
            return { success: false, message: 'Internal server error' }
        }
    })
    // Create short URL
    .post('/api/links', async ({ headers, createUrl, isAuthorized, body, set }) => {
        if (!isAuthorized({ headers })) {
            set.status = 401
            return { success: false, message: 'Unauthorized' }
        }

        try {
            const { url } = body as { url?: string }
            if (!url) {
                set.status = 400
                return { success: false, message: 'URL is required' }
            }

            const key = Math.random().toString(36).substring(2, 8)
            const result = await createUrl(key, url)

            return { 
                success: true, 
                message: 'Link created successfully',
                result
            }
        } catch (error) {
            console.error('Error creating link:', error)
            set.status = 500
            return { 
                success: false, 
                message: 'Failed to create link: ' + (error instanceof Error ? error.message : String(error))
            }
        }
    })
    // Create custom short URL
    .put('/api/links/:key', async ({ headers, params: { key }, createUrl, checkKeyExists, isAuthorized, body, set }) => {
        if (!isAuthorized({ headers })) {
            set.status = 401
            return { success: false, message: 'Unauthorized' }
        }

        try {
            const { url } = body as { url?: string }
            if (!url) {
                set.status = 400
                return { success: false, message: 'URL is required' }
            }

            const exists = await checkKeyExists(key)
            if (exists) {
                set.status = 409
                return { 
                    success: false, 
                    message: 'This short URL is already taken' 
                }
            }

            const result = await createUrl(key, url)
            return { 
                success: true, 
                message: 'Link created successfully',
                result
            }
        } catch (error) {
            console.error('Error creating custom link:', error)
            set.status = 500
            return { 
                success: false, 
                message: 'Failed to create link: ' + (error instanceof Error ? error.message : String(error))
            }
        }
    })
    .listen(process.env.PORT || 3000, () => {
        console.log(`🦊 Server is running at http://localhost:${process.env.PORT || 3000}`)
    })
