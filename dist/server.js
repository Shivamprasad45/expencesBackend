"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Starting server...");
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// / Only listen when not in production (for local development)
if (process.env.NODE_ENV !== "production") {
    app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
// "scripts": {
//     "build": "npx tsc",
//     "start": "node dist/server.js",
//     "dev": "nodemon --exec ts-node src/server.ts",
//     "vercel-build": "npx tsc"
//   }
