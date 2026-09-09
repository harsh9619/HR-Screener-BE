"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
const db_1 = __importDefault(require("../../db"));
const findUserByEmail = async (email) => {
    const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    return result.rows[0] || null;
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    const result = await db_1.default.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.findUserById = findUserById;
const createUser = async (email, passwordHash, name) => {
    const { v4: uuidv4 } = await Promise.resolve().then(() => __importStar(require('uuid')));
    const id = uuidv4();
    const now = new Date().toISOString();
    const result = await db_1.default.query(`INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`, [id, email.toLowerCase().trim(), passwordHash, name.trim(), now, now]);
    return result.rows[0];
};
exports.createUser = createUser;
