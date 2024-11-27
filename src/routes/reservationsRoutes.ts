import { Router } from "express";
import { validation } from "../middlewares/validationMiddleware";
import {
  cancelReservation,
  createReservation,
  getReservations,
  getReservationsByUserId,
} from "../controllers/reservationsController";
import { createReservationValidation } from "../middlewares/reservationsValidation";
import { authenticateJWT } from "../middlewares/authenticateJWT";
import { roleCheck } from "../middlewares/roleMiddleware";

const reservationsRoutes = Router();

reservationsRoutes.post(
  "/",
  authenticateJWT,
  createReservationValidation,
  validation,
  createReservation
);

reservationsRoutes.put("/:id/cancel", authenticateJWT, cancelReservation);

reservationsRoutes.get("/:userId", authenticateJWT, getReservationsByUserId);

reservationsRoutes.get("/", authenticateJWT, roleCheck, getReservations);

export default reservationsRoutes;

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a reservation
 *     description: Creates a new reservation for a user with the selected seat and showtime.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user making the reservation.
 *                 example: 1
 *               seat_id:
 *                 type: integer
 *                 description: ID of the seat being reserved.
 *                 example: 5
 *               showtime_id:
 *                 type: integer
 *                 description: ID of the showtime for the reservation.
 *                 example: 3
 *     responses:
 *       201:
 *         description: Reservation created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Seat with this showtime is not available or user not found.
 *       404:
 *         description: Seat or user not found.
 *       500:
 *         description: Failed to create reservation.
 */

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   put:
 *     summary: Cancel a reservation
 *     description: Cancels an existing reservation by updating its payment status to "cancelled" and removing associated payments.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the reservation to be cancelled.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Reservation not found or already cancelled.
 *       500:
 *         description: Failed to cancel reservation.
 */

/**
 * @swagger
 * /reservations/{userId}:
 *   get:
 *     summary: Get reservations by user ID
 *     description: Fetches all reservations for a specific user by their user ID.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user whose reservations are being fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Reservations fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: No reservations found for this user.
 *       500:
 *         description: Failed to fetch reservations.
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservations
 *     description: Fetches all reservations from the system.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservations fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Failed to fetch reservations.
 */
