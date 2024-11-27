import { Router } from "express";
import {
  getShowtimes,
  createShowtime,
  deleteShowtime,
  getAvailbleSeatsByShowtimeId,
} from "../controllers/showTimesController";
import { createShowtimeValidation } from "../middlewares/showtimesValidation";
import { validation } from "../middlewares/validationMiddleware";
import { authenticateJWT } from "../middlewares/authenticateJWT";
import { roleCheck } from "../middlewares/roleMiddleware";

const showtimesRoutes = Router();

showtimesRoutes.get("/:movieId", getShowtimes);
showtimesRoutes.post(
  "/",
  authenticateJWT,
  roleCheck,
  createShowtimeValidation,
  validation,
  createShowtime
);
showtimesRoutes.delete("/:id", authenticateJWT, deleteShowtime);
showtimesRoutes.get("/:id/available-seats", getAvailbleSeatsByShowtimeId);

export default showtimesRoutes;

/**
 * @swagger
 * /showtimes/{movieId}:
 *   get:
 *     summary: "Fetch showtimes for a movie"
 *     description: "Fetch showtimes for a specific movie. Optionally, you can filter by a specific date."
 *     tags:
 *       - Showtimes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: movieId
 *         in: path
 *         required: true
 *         description: "The ID of the movie"
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         required: false
 *         description: "The date to filter the showtimes (default is tomorrow)."
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: "Successfully fetched showtimes"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Showtimes fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Showtime'
 *       400:
 *         description: "Invalid date or no showtimes available."
 *       404:
 *         description: "No showtimes found for this movie."
 *       500:
 *         description: "Error fetching showtimes."
 *
 */

/**
 * @swagger
 * /showtimes:
 *   post:
 *     summary: "Create a new showtime"
 *     description: "Create a new showtime for a movie. Requires JWT authentication and role check."
 *     tags:
 *       - Showtimes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Showtime'
 *     responses:
 *       201:
 *         description: "Showtime created successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Showtimes created successfully."
 *                 data:
 *                   $ref: '#/components/schemas/Showtime'
 *       400:
 *         description: "Showtime with this date and start time already exists."
 *       401:
 *         description: "Unauthorized access."
 *       403:
 *         description: "Forbidden: insufficient role."
 *       500:
 *         description: "Error creating showtime."
 */

/**
 * @swagger
 * /showtimes/{id}:
 *   delete:
 *     summary: "Delete a showtime"
 *     description: "Delete a showtime by ID. Requires JWT authentication and role check."
 *     tags:
 *       - Showtimes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "The ID of the showtime to be deleted."
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Showtime deleted successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Showtime deleted successfully."
 *                 data:
 *                   $ref: '#/components/schemas/Showtime'
 *       404:
 *         description: "No showtime found with the provided ID."
 *       401:
 *         description: "Unauthorized access."
 *       403:
 *         description: "Forbidden: insufficient role."
 *       500:
 *         description: "Error deleting showtime."
 */

/**
 * @swagger
 * /showtimes/{id}/available-seats:
 *   get:
 *     summary: "Get available seats for a showtime"
 *     description: "Fetch the available seats for a specific showtime. A seat is available if it is not reserved or if the reservation was cancelled."
 *     tags:
 *       - Showtimes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "The ID of the showtime."
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Available seats fetched successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Available seat with this showtime fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AvailableSeatByShowtime'
 *       404:
 *         description: "No available seats found for the showtime."
 *       500:
 *         description: "Error fetching available seats."
 */
