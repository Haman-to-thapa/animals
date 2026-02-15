import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimiter } from "./middlewares/rateLimit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import healthRoute from "./routes/health.route";
import postRoute from './routes/post'
import reportRoute from './routes/report'
import blockRoute from './routes/block'
import feedRoute from "./routes/feed.route";
import likeRoute from "./routes/like.route";
import adminRoute from "./routes/admin.route";
import aiRoute from "./routes/aiRoutes";

const app = express();


app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "100kb" })); // prevent abuse
app.use(rateLimiter);


app.use("/health", healthRoute);
app.use("/posts", postRoute);
app.use("/reports", reportRoute);
app.use("/blocks", blockRoute);
app.use("/feed", feedRoute);
app.use("/likes", likeRoute);
app.use("/admin", adminRoute);
app.use("/ai", aiRoute);


app.use(errorHandler);

export default app;
