import { Request, Response } from "express";
import { Payment, ApiResponse } from "../types";
import { createResponse } from "../utils/responseUtils";
import pool from "../db/db";

export const createPayment = async (
  req: Request,
  res: Response<ApiResponse<Payment>>
) => {
  try {
    const { reservation_id, payment_method }: Payment = req.body;

    const reservation = await pool.query(
      `
        SELECT reservations.id as reservation_id, 
        reservations.user_id, reservations.payment_status as status, 
        seats.seat_number, seat_types.name as type, 
        seat_types.price as amount FROM reservations
	    INNER JOIN seats
	    ON seats.id = reservations.seat_id
        INNER JOIN rows
        ON rows.id = seats.row_id
        INNER JOIN seat_types
        ON seat_types.id = rows.seat_type_id
	    WHERE reservations.id = $1`,
      [reservation_id]
    );

    if (reservation.rowCount === 0) {
      res.status(404).json(createResponse(false, "Reservation not found"));
      return;
    }

    if (reservation.rows[0].status !== "pending") {
      res
        .status(400)
        .json(createResponse(false, "Reservation paid or cancalled"));
      return;
    }

    const { user_id, amount }: Payment = reservation.rows[0];

    const result = await pool.query(
      `
      INSERT INTO payments(reservation_id, user_id, amount, payment_method)
      VALUES($1, $2, $3, $4)
      RETURNING *`,
      [reservation_id, user_id, amount, payment_method]
    );

    const createdPayment: Payment = result.rows[0];

    res
      .status(201)
      .json(
        createResponse(true, "Payment created successfully", createdPayment)
      );
  } catch (err) {
    console.error("Error inserting payment:", err);
    res.status(500).json(createResponse(false, "Failed to create payment"));
  }
};

export const processPayment = async (
  req: Request,
  res: Response<ApiResponse<Payment>>
) => {
  const paymentId = req.params.id;

  try {
    const payment = await pool.query(`SELECT * FROM payments WHERE id = $1`, [
      paymentId,
    ]);

    if (payment.rowCount === 0) {
      res.status(404).json(createResponse(false, "Payment not found!"));
      return;
    }

    const { reservation_id, status } = payment.rows[0];

    if (status !== "pending" || status !== "failed") {
      res.status(400).json(createResponse(false, "Payment completed"));
      return;
    }

    const isSuccessful = Math.random() > 0.2;
    const paymentStatus = isSuccessful ? "completed" : "failed";

    const result = await pool.query(
      `UPDATE payments SET status = $1 WHERE payments.id = $2
       RETURNING *`,
      [paymentStatus, paymentId]
    );

    if (paymentStatus === "completed") {
      await pool.query(
        `UPDATE reservations SET payment_status = $1 WHERE id = $2`,
        [`paid`, reservation_id]
      );
    }

    const paymentResult: Payment = result.rows[0];

    res
      .status(200)
      .json(createResponse(true, "Payment has been processed", paymentResult));
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json(createResponse(false, "Failed to process payment"));
  }
};

export const confirmPayment = async (
  req: Request,
  res: Response<ApiResponse<Payment>>
) => {
  const paymentId = req.params.id;

  try {
    const payment = await pool.query(`SELECT * FROM payments WHERE id = $1`, [
      paymentId,
    ]);

    if (payment.rowCount === 0) {
      res.status(404).json(createResponse(false, "Payment not found"));
      return;
    }

    const confirmPayment: Payment = payment.rows[0];

    res
      .status(200)
      .json(
        createResponse(
          true,
          "Payment status has been confirmed",
          confirmPayment
        )
      );
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json(createResponse(false, "Failed to confirm payment"));
  }
};
