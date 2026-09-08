"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResumeFile = parseResumeFile;
exports.extractResumeTextFromInput = extractResumeTextFromInput;
const pdfParse = require('pdf-parse');
const mammoth_1 = __importDefault(require("mammoth"));
/**
 * Extracts plain text from an uploaded resume file (PDF, DOCX, TXT, MD)
 */
async function parseResumeFile(buffer, mimeType, fileName) {
    const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
    const type = (mimeType || '').toLowerCase();
    // 1. PDF Documents
    if (type.includes('pdf') || ext === 'pdf') {
        try {
            const data = await pdfParse(buffer);
            if (data && data.text && data.text.trim()) {
                return data.text.trim();
            }
        }
        catch (err) {
            console.warn('PDF parsing fallback applied:', err.message);
            // Fallback text extraction if pdf-parse encounters standard stream header issues
            return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
        }
    }
    // 2. Word Documents (.docx)
    if (type.includes('wordprocessingml') ||
        type.includes('msword') ||
        ext === 'docx' ||
        ext === 'doc') {
        try {
            const result = await mammoth_1.default.extractRawText({ buffer });
            if (result && result.value && result.value.trim()) {
                return result.value.trim();
            }
        }
        catch (err) {
            console.warn('DOCX parsing fallback applied:', err.message);
        }
    }
    // 3. Plain Text / Markdown / Fallback
    return buffer.toString('utf-8').trim();
}
/**
 * Helper to process Base64 encoded file input or return raw string
 */
async function extractResumeTextFromInput(resumeText, fileInput) {
    if (fileInput && fileInput.fileData) {
        const base64Data = fileInput.fileData.includes(',')
            ? fileInput.fileData.split(',')[1]
            : fileInput.fileData;
        const buffer = Buffer.from(base64Data, 'base64');
        const parsedText = await parseResumeFile(buffer, fileInput.mimeType, fileInput.fileName);
        if (parsedText) {
            return parsedText;
        }
    }
    return (resumeText || '').trim();
}
