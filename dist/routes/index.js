"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const roles_routes_1 = __importDefault(require("./roles.routes"));
const candidates_routes_1 = __importDefault(require("./candidates.routes"));
const apiRouter = (0, express_1.Router)();
apiRouter.use(auth_routes_1.default);
apiRouter.use(roles_routes_1.default);
apiRouter.use(candidates_routes_1.default);
exports.default = apiRouter;
