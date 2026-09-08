"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("./db");
const auth_router_1 = __importDefault(require("./modules/auth/auth.router"));
const roles_router_1 = __importDefault(require("./modules/roles/roles.router"));
const candidates_router_1 = __importDefault(require("./modules/candidates/candidates.router"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS setup
const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];
const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean)
    : defaultOrigins;
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Mount module routers directly
app.use('/api/auth', auth_router_1.default);
app.use('/api/roles', roles_router_1.default);
app.use('/api', candidates_router_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Centralized error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});
async function startServer() {
    try {
        // Initialize DB schema automatically
        await (0, db_1.initDb)();
        app.listen(PORT, () => {
            console.log(`Candidate Screener API running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize server or database connection:', error);
    }
}
startServer();
