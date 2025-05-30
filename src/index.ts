import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { html } from 'hono/html'
import { createClient } from '@libsql/client'

// Types
interface Env {
    WORKERLINKS_SECRET: string
    ENABLE_INDEX_FORM: string
    DEFAULT_URL: string
    TURSO_DB_URL: string
    TURSO_DB_AUTH_TOKEN: string
}

interface Link {
    key: string
    url: string
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', cors())

// HTML template
const formHtml = html`
<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <title>URL Shortener</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="https://em-content.zobj.net/source/microsoft/378/link_1f517.png" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        // Theme configuration
        const themes = ['light', 'dark'];

        // Get current theme from localStorage or system preference
        function getCurrentTheme() {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme && themes.includes(savedTheme)) {
                return savedTheme
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }

        // Apply theme
        function applyTheme(theme) {
            document.documentElement.classList.remove(...themes)
            document.documentElement.classList.add(theme)
            localStorage.setItem('theme', theme)
        }

        // Initialize theme
        let currentTheme = getCurrentTheme()
        applyTheme(currentTheme)

        // Theme toggle function
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light'
            applyTheme(currentTheme)
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                currentTheme = e.matches ? 'dark' : 'light'
                applyTheme(currentTheme)
            }
        })

        // Configure Tailwind
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eef2ff',
                            100: '#e0e7ff',
                            200: '#c7d2fe',
                            300: '#a5b4fc',
                            400: '#818cf8',
                            500: '#6366f1',
                            600: '#4f46e5',
                            700: '#4338ca',
                            800: '#3730a3',
                            900: '#312e81',
                            950: '#1e1b4b',
                        },
                    },
                    animation: {
                        'gradient': 'gradient 8s linear infinite',
                    },
                    keyframes: {
                        gradient: {
                            '0%, 100%': {
                                'background-size': '200% 200%',
                                'background-position': 'left center'
                            },
                            '50%': {
                                'background-size': '200% 200%',
                                'background-position': 'right center'
                            }
                        }
                    }
                },
            },
        }
    </script>
    <style>
        /* Smooth transitions */
        * {
            transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <!-- Theme Toggle Button -->
        <div class="fixed top-4 right-4">
            <button
                id="theme-toggle"
                onclick="toggleTheme()"
                class="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-lg"
                title="Toggle theme"
                aria-label="Toggle theme"
            >
                <!-- Sun icon -->
                <svg class="w-5 h-5 hidden dark:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <!-- Moon icon -->
                <svg class="w-5 h-5 block dark:hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            </button>
        </div>

        <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <div class="flex items-center justify-center space-x-3 mb-8">
                    <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                        <span class="text-4xl">🔗</span>
                    </div>
                    <h2 class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 animate-gradient">
                        URL Shortener
                    </h2>
                </div>
            </div>

            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
                    <form id="myForm" class="space-y-6" onsubmit="submitForm(event)">
                        <div>
                            <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                URL to shorten
                            </label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="url"
                                    name="url"
                                    type="url"
                                    required
                                    autocomplete="off"
                                    placeholder="https://example.com/very-long-url"
                                    class="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 ease-in-out focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label for="customPath" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Custom path (optional)
                            </label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 dark:text-gray-400 sm:text-sm">/</span>
                                </div>
                                <input
                                    id="customPath"
                                    name="customPath"
                                    type="text"
                                    autocomplete="off"
                                    placeholder="my-custom-url"
                                    class="block w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-7 pr-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 ease-in-out focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label for="authKey" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Authorization Key
                            </label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="authKey"
                                    name="authKey"
                                    type="password"
                                    required
                                    autocomplete="off"
                                    placeholder="Enter your authorization key"
                                    class="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 ease-in-out focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                class="flex w-full justify-center items-center rounded-lg border border-transparent bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                Create Short URL
                            </button>
                        </div>
                    </form>

                    <div id="result" class="mt-6 hidden">
                        <div class="rounded-lg bg-green-50 dark:bg-green-900/50 p-4 border border-green-200 dark:border-green-800">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
                                        Success
                                    </h3>
                                    <div class="mt-2 text-sm text-green-700 dark:text-green-300">
                                        <p id="resultMessage"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="mt-8 text-center text-sm">
                    <p class="text-gray-600 dark:text-gray-400">
                        Crafted with <span class="inline-block transition-transform hover:scale-110">❤️</span> by
                        <a href="https://github.com/arcestia" target="_blank" class="text-primary-600 hover:text-primary-500">Laurensius Jeffrey</a>
                    </p>
                </footer>
            </div>
        </div>
    </div>

    <script>
        async function submitForm(event) {
            event.preventDefault()

            const form = document.getElementById('myForm')
            const url = document.getElementById('url').value
            const customPath = document.getElementById('customPath').value
            const authKey = document.getElementById('authKey').value

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': authKey
            }

            try {
                let response
                if (customPath) {
                    // Use PUT endpoint for custom path
                    response = await fetch('/api/links/' + customPath, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({ url })
                    })
                } else {
                    // Use POST endpoint for random path
                    response = await fetch('/api/links', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ url })
                    })
                }

                const data = await response.json()
                if (response.ok) {
                    updateUI(data)
                } else {
                    showError(data.message)
                }
            } catch (error) {
                showError('Failed to create short URL: ' + error.message)
            }
        }

        function updateUI(data) {
            const resultDiv = document.getElementById('result')
            const resultMessage = document.getElementById('resultMessage')
            resultDiv.classList.remove('hidden')
            resultDiv.classList.remove('bg-red-50', 'dark:bg-red-900/50', 'border-red-200', 'dark:border-red-800')
            resultDiv.classList.add('bg-green-50', 'dark:bg-green-900/50', 'border-green-200', 'dark:border-green-800')
            
            const shortUrl = window.location.origin + '/' + data.key
            resultMessage.innerHTML = 
                data.message + '<br>' +
                'Short URL: <a href="' + shortUrl + '" target="_blank" class="text-primary-600 hover:text-primary-500">' + shortUrl + '</a>' +
                '<br>Long URL: <a href="' + data.longurl + '" target="_blank" class="text-primary-600 hover:text-primary-500">' + data.longurl + '</a>'
        }

        function showError(message) {
            const resultDiv = document.getElementById('result')
            const resultMessage = document.getElementById('resultMessage')
            resultDiv.classList.remove('hidden')
            resultDiv.classList.remove('bg-green-50', 'dark:bg-green-900/50', 'border-green-200', 'dark:border-green-800')
            resultDiv.classList.add('bg-red-50', 'dark:bg-red-900/50', 'border-red-200', 'dark:border-red-800')
            resultMessage.textContent = message
        }
    </script>
</body>
</html>`

// Parse boolean environment variables
const parseBool = (value: string | boolean | undefined): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return false
}

// Database helper functions
const createDb = (env: Env) => {
    const db = createClient({
        url: env.TURSO_DB_URL,
        authToken: env.TURSO_DB_AUTH_TOKEN
    })

    return {
        async getUrl(key: string): Promise<string | undefined> {
            const result = await db.execute({
                sql: 'SELECT url FROM links WHERE key = ?',
                args: [key]
            })
            return result.rows[0]?.url as string | undefined
        },
        async createUrl(key: string, url: string): Promise<Link> {
            await db.execute({
                sql: 'INSERT INTO links (key, url) VALUES (?, ?)',
                args: [key, url]
            })
            return { key, url }
        },
        async checkKeyExists(key: string): Promise<boolean> {
            const result = await db.execute({
                sql: 'SELECT 1 FROM links WHERE key = ?',
                args: [key]
            })
            return result.rows.length > 0
        }
    }
}

// Auth middleware
const auth = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization')
    if (authHeader !== c.env.WORKERLINKS_SECRET) {
        return c.json({ message: 'Unauthorized' }, 401)
    }
    return next()
}

// Root handler
app.get('/', (c) => {
    const enableIndexForm = parseBool(c.env.ENABLE_INDEX_FORM)
    if (!enableIndexForm) {
        if (!c.env.DEFAULT_URL) {
            return c.json({ message: 'No default URL configured' }, 500)
        }
        return c.redirect(c.env.DEFAULT_URL)
    }
    return c.html(formHtml)
})

// URL redirect handler
app.get('/:key', async (c) => {
    const key = c.req.param('key')
    if (key === 'favicon.ico') {
        return c.json({ message: 'Not found' }, 404)
    }

    try {
        const db = createDb(c.env)
        const url = await db.getUrl(key)
        
        if (!url) {
            return c.json({ message: 'URL not found' }, 404)
        }

        return c.redirect(url)
    } catch (error) {
        console.error('Error looking up URL:', error)
        return c.json({ message: 'Internal server error' }, 500)
    }
})

// Create short URL
app.post('/api/links', auth, async (c) => {
    try {
        const db = createDb(c.env)
        const { url } = await c.req.json<{ url?: string }>()
        
        if (!url) {
            return c.json({ message: 'URL is required' }, 400)
        }

        const key = Math.random().toString(36).substring(2, 8)
        await db.createUrl(key, url)

        return c.json({ 
            message: 'URL created successfully',
            key,
            shorturl: `https://skiddle.link/${key}`,
            longurl: url
        })
    } catch (error) {
        console.error('Error creating link:', error)
        return c.json({ 
            message: 'Failed to create link: ' + (error instanceof Error ? error.message : String(error))
        }, 500)
    }
})

// Create custom short URL
app.put('/api/links/:key', auth, async (c) => {
    try {
        const db = createDb(c.env)
        const key = c.req.param('key')
        const { url } = await c.req.json<{ url?: string }>()
        
        if (!url) {
            return c.json({ message: 'URL is required' }, 400)
        }

        const exists = await db.checkKeyExists(key)
        if (exists) {
            return c.json({ 
                message: 'This short URL is already taken'
            }, 409)
        }

        await db.createUrl(key, url)
        return c.json({ 
            message: 'URL created successfully',
            key,
            shorturl: `https://skiddle.link/${key}`,
            longurl: url
        })
    } catch (error) {
        console.error('Error creating custom link:', error)
        return c.json({ 
            message: 'Failed to create link: ' + (error instanceof Error ? error.message : String(error))
        }, 500)
    }
})

export default app
