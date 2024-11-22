import express, { Application } from "express";
import authRoutes from "./routes/authRoutes";

const app: Record<string, any> = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Server is running at port 3000"));
