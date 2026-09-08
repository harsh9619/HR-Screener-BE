"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.initDb = initDb;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbName = process.env.PGDATABASE || 'candidate_screener';
const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        database: dbName,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
    };
const pool = new pg_1.Pool(poolConfig);
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});
async function ensureDatabaseExists() {
    let targetDb = dbName;
    if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            targetDb = url.pathname.replace(/^\//, '') || dbName;
        }
        catch {
            targetDb = dbName;
        }
    }
    const adminClientConfig = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL.replace(/\/[^/]*$/, '/postgres') }
        : {
            host: process.env.PGHOST || 'localhost',
            port: parseInt(process.env.PGPORT || '5432', 10),
            database: 'postgres',
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || 'postgres',
        };
    const adminClient = new pg_1.Client(adminClientConfig);
    try {
        await adminClient.connect();
        const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
        if (res.rows.length === 0) {
            console.log(`Database "${targetDb}" does not exist. Creating database automatically...`);
            await adminClient.query(`CREATE DATABASE "${targetDb}"`);
            console.log(`Database "${targetDb}" created successfully.`);
        }
    }
    catch (error) {
        console.warn('Database auto-creation check note:', error.message);
    }
    finally {
        await adminClient.end().catch(() => { });
    }
}
async function query(text, params) {
    return pool.query(text, params);
}
async function initDb() {
    await ensureDatabaseExists();
    // const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaPath = path_1.default.join(process.cwd(), "src", "db", "schema.sql");
    const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
    try {
        await pool.query(schemaSql);
        console.log('PostgreSQL database schema initialized successfully.');
    }
    catch (error) {
        console.error('Error initializing PostgreSQL schema:', error);
        throw error;
    }
}
exports.default = pool;
