import { Client } from '@libsql/client'

export interface Env {
	WORKERLINKS_SECRET: string
	ENABLE_INDEX_FORM: boolean
	DEFAULT_URL: string
	TURSO_DB_URL: string
	TURSO_DB_AUTH_TOKEN: string
}

export interface Link {
	key: string
	url: string
}

export interface URLService {
	getUrl(key: string): Promise<string | undefined>
	createUrl(key: string, url: string): Promise<Link>
	checkKeyExists(key: string): Promise<boolean>
}

export interface Database {
	client: Client
}

export interface Auth {
	isAuthorized: boolean
}
