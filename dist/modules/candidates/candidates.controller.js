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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCandidate = exports.compareCandidates = exports.getCandidateById = exports.getCandidatesByRole = exports.createCandidate = void 0;
const candidatesService = __importStar(require("./candidates.service"));
const createCandidate = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { name, email, resumeText } = req.body;
        if (!name || !email || !resumeText) {
            return res.status(400).json({ error: 'Name, email, and resume text are required.' });
        }
        const result = await candidatesService.createCandidate(roleId, { name, email, resumeText });
        return res.status(201).json({
            message: 'Candidate created and evaluated successfully.',
            ...result,
        });
    }
    catch (error) {
        if (error.message === 'Role not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.createCandidate = createCandidate;
const getCandidatesByRole = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { sortBy, order, search } = req.query;
        const candidates = await candidatesService.listCandidatesByRole(roleId, { sortBy, order, search });
        return res.json({ candidates });
    }
    catch (error) {
        next(error);
    }
};
exports.getCandidatesByRole = getCandidatesByRole;
const getCandidateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const candidate = await candidatesService.getCandidateDetails(id);
        return res.json({ candidate });
    }
    catch (error) {
        if (error.message === 'Candidate not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.getCandidateById = getCandidateById;
const compareCandidates = async (req, res, next) => {
    try {
        const { candidateIdA, candidateIdB } = req.body;
        if (!candidateIdA || !candidateIdB) {
            return res.status(400).json({ error: 'Both candidateIdA and candidateIdB are required.' });
        }
        const comparison = await candidatesService.compareCandidates(candidateIdA, candidateIdB);
        return res.json(comparison);
    }
    catch (error) {
        if (error.message === 'One or both candidates were not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.compareCandidates = compareCandidates;
const deleteCandidate = async (req, res, next) => {
    try {
        const { id } = req.params;
        await candidatesService.deleteCandidate(id);
        return res.json({ message: 'Candidate deleted successfully.' });
    }
    catch (error) {
        if (error.message === 'Candidate not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.deleteCandidate = deleteCandidate;
