console.log("Starting server...");
import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// / Only listen when not in production (for local development)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// "scripts": {
//     "build": "npx tsc",
//     "start": "node dist/server.js",
//     "dev": "nodemon --exec ts-node src/server.ts",
//     "vercel-build": "npx tsc"
//   }
