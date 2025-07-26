"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Premiuem_1 = require("../controllers/Premiuem");
const checkPremium_1 = require("../middleware/checkPremium");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/leaderboard", checkPremium_1.checkPremium, Premiuem_1.exportLeaderboard);
exports.default = router;
