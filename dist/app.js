"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const Premiume_route_1 = __importDefault(require("./routes/Premiume.route"));
dotenv_1.default.config();
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// CORS configuration
app.use((0, cors_1.default)({
    origin: ["https://expences-tracker-f.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
// app.options("*", cors());
app.use("/api/expenses", expenseRoutes_1.default);
// Connect Database
(0, db_1.default)();
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/payment", payments_routes_1.default);
app.use("/api/premium", Premiume_route_1.default);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
exports.default = app;
