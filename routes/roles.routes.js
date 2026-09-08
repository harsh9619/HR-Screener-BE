"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_router_1 = __importDefault(require("../modules/roles/roles.router"));
const router = (0, express_1.Router)();
router.use('/roles', roles_router_1.default);
exports.default = router;
