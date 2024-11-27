import express from "express";
import authRoutes from "./routes/authRoutes";
import moviesRoutes from "./routes/moviesRoutes";
import reservationsRoutes from "./routes/reservationsRoutes";
import showtimesRoutes from "./routes/showtimesRoutes";
import paymentsRoutes from "./routes/paymentsRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/movies", moviesRoutes);
app.use("/showtimes", showtimesRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/payments", paymentsRoutes);

app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
