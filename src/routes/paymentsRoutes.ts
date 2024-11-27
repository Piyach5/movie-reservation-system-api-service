import { Router } from "express";
import {
  confirmPayment,
  createPayment,
  processPayment,
} from "../controllers/paymentsController";
import { authenticateJWT } from "../middlewares/authenticateJWT";

const paymentsRoutes = Router();

paymentsRoutes.post("/", authenticateJWT, createPayment);
paymentsRoutes.post("/:id/process", authenticateJWT, processPayment);
paymentsRoutes.get("/:id/confirm", authenticateJWT, confirmPayment);

export default paymentsRoutes;

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a payment
 *     description: Creates a new payment record for a reservation.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reservation_id:
 *                 type: integer
 *                 description: ID of the reservation being paid for.
 *                 example: 1
 *               payment_method:
 *                 type: string
 *                 description: Payment method used. Must be one of the following, `credit_card`, `paypal`, `bank_transfer`.
 *                 example: "credit_card"
 *     responses:
 *       201:
 *         description: Payment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Reservation is already paid or cancelled.
 *       404:
 *         description: Reservation not found.
 *       500:
 *         description: Failed to create payment.
 */

/**
 * @swagger
 * /payments/{id}/process:
 *   post:
 *     summary: Process a payment
 *     description: Simulates the payment processing for a given payment ID. Payment status may randomly succeed or fail.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the payment to process.
 *     responses:
 *       200:
 *         description: Payment has been processed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Payment is already completed.
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Failed to process payment.
 */

/**
 * @swagger
 * /payments/{id}/confirm:
 *   get:
 *     summary: Confirm a payment
 *     description: Retrieves the payment status for a given payment ID.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the payment to confirm.
 *     responses:
 *       200:
 *         description: Payment status has been confirmed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Failed to confirm payment.
 */
