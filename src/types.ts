import { Client } from '@libsql/client'

export interface Env {
    WORKERLINKS_SECRET: string
    ENABLE_INDEX_FORM: boolean
    DEFAULT_URL: string
    TURSO_DB_URL: string
    TURSO_DB_AUTH_TOKEN: string
}

export interface Context {
    db: Client
}

export interface Link {
    key: string
    url: string
}
