import { exportLeaderboard } from "../controllers/Premiuem";
import { checkPremium } from "../middleware/checkPremium";
import express from "express";
const router = express.Router();

router.get("/leaderboard", checkPremium, exportLeaderboard);

export default router;
