import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    credentials: true,
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void
    ) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://benign-fashion-frontend-pearl.vercel.app"
      ];

      // Allow non-browser requests (no origin) and whitelisted domains
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error("Not allowed by CORS"));
    },
  })
);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});