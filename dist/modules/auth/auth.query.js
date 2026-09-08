"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByEmail = void 0;
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
