import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { html } from '@elysiajs/html'
import { createClient } from '@libsql/client'
import { Context, Env } from './types'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read HTML template
const formHtml = readFileSync(join(__dirname, 'views/index.html'), 'utf-8')

// Parse boolean environment variables
const parseBool = (value: string | undefined): boolean => {
    return value?.toLowerCase() === 'true'
}

// Initialize the app with plugins
const app = new Elysia()
    .use(cors())
    .use(html())
    .decorate('env', {
        ...process.env,
        ENABLE_INDEX_FORM: parseBool(process.env.ENABLE_INDEX_FORM),
    } as unknown as Env)
    .derive(({ env }) => ({
        db: createClient({
            url: env.TURSO_DB_URL,
            authToken: env.TURSO_DB_AUTH_TOKEN
        })
    }))

// Root path handler
app.get('/', async ({ env, set }) => {
    // If form is disabled, redirect to default URL
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

    // Show form page
    return formHtml
})

// Handle GET requests for short URLs
app.get('/:key', async ({ params: { key }, db, set }) => {
    // Skip favicon.ico requests
    if (key === 'favicon.ico') {
        set.status = 404
        return { success: false, message: 'Not found' }
    }

    try {
        console.log('Looking up URL for key:', key)
        const result = await db.execute({
            sql: 'SELECT url FROM links WHERE key = ?',
            args: [key]
        })
        
        if (!result?.rows?.length) {
            console.log('URL not found for key:', key)
            set.status = 404
            return { success: false, message: 'URL not found' }
        }

        const url = result.rows[0].url as string
        console.log('Found URL:', url)
        
        // Perform HTTP redirect
        set.headers['Location'] = url
        set.status = 302
        return ''
    } catch (error) {
        console.error('Error looking up URL:', error)
        set.status = 500
        return { success: false, message: 'Internal server error' }
    }
})

// Create new link with random key
app.post('/', async ({ body, db, set, headers, env }) => {
    // Check authorization
    const authHeader = headers.authorization
    if (!authHeader || authHeader !== env.WORKERLINKS_SECRET) {
        set.status = 401
        return { success: false, message: 'Unauthorized' }
    }

    const { url } = body as { url?: string }
    
    if (!url) {
        set.status = 400
        return { success: false, message: 'URL is required' }
    }
    
    // Generate random key
    const key = Math.random().toString(36).substring(2, 8)
    
    try {
        console.log('Creating new link:', { key, url })
        await db.execute({
            sql: 'INSERT INTO links (key, url) VALUES (?, ?)',
            args: [key, url]
        })
        console.log('Link created successfully')

        return { 
            success: true, 
            message: 'Link created successfully',
            result: { key, url }
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

// Create new link with custom key
app.put('/:key', async ({ params: { key }, body, db, set, headers, env }) => {
    // Check authorization
    const authHeader = headers.authorization
    if (!authHeader || authHeader !== env.WORKERLINKS_SECRET) {
        set.status = 401
        return { success: false, message: 'Unauthorized' }
    }

    const { url } = body as { url?: string }
    
    if (!url) {
        set.status = 400
        return { success: false, message: 'URL is required' }
    }
    
    try {
        console.log('Checking if key exists:', key)
        const existing = await db.execute({
            sql: 'SELECT * FROM links WHERE key = ?',
            args: [key]
        })
        
        if (existing?.rows?.length > 0) {
            console.log('Key already exists')
            set.status = 409
            return { 
                success: false, 
                message: 'This short URL is already taken' 
            }
        }

        console.log('Creating custom link:', { key, url })
        await db.execute({
            sql: 'INSERT INTO links (key, url) VALUES (?, ?)',
            args: [key, url]
        })
        console.log('Custom link created successfully')

        return { 
            success: true, 
            message: 'Link created successfully',
            result: { key, url }
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

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`🦊 Server is running at http://localhost:${port}`)
})
