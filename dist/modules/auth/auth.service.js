"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_query_1 = require("./auth.query");
const JWT_SECRET = process.env.JWT_SECRET || 'crystal_group_candidate_screener_super_secret_jwt_key_2026';
const loginUser = async (email, password) => {
    const user = await (0, auth_query_1.findUserByEmail)(email);
    if (!user) {
        throw new Error('Invalid credentials.');
    }
    const isPasswordValid = bcryptjs_1.default.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials.');
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    };
};
exports.loginUser = loginUser;
const getCurrentUser = async (id) => {
    const user = await (0, auth_query_1.findUserById)(id);
    if (!user) {
        throw new Error('User not found.');
    }
    return user;
};
exports.getCurrentUser = getCurrentUser;
