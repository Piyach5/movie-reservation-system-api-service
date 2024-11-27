import { Request, Response } from "express";
import { Reservation, ApiResponse } from "../types";
import { createResponse } from "../utils/responseUtils";
import pool from "../db/db";

export const getReservations = async (
  req: Request,
  res: Response<ApiResponse<Reservation[]>>
) => {
  try {
    const result = await pool.query(`SELECT * FROM reservations`);

    const reservations: Reservation[] = result.rows;

    res
      .status(200)
      .json(
        createResponse(true, "Reservations fetched successfully.", reservations)
      );
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res
      .status(500)
      .json(createResponse(false, "Unable to fetch reservations."));
  }
};

export const createReservation = async (
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  try {
    const { user_id, seat_id, showtime_id }: Reservation = req.body;

    const duplicateCheck = await pool.query(
      `SELECT * FROM reservations
         WHERE seat_id = $1 AND showtime_id = $2 AND (payment_status = $3 OR payment_status = $4)`,
      [seat_id, showtime_id, `pending`, `paid`]
    );

    if (duplicateCheck.rowCount && duplicateCheck.rowCount > 0) {
      res
        .status(400)
        .json(
          createResponse(false, "Seat with this showtime is not available")
        );
      return;
    }

    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      user_id,
    ]);

    if (user.rowCount === 0) {
      res.status(404).json(createResponse(false, "User not found"));
      return;
    }

    const seat = await pool.query(
      `SELECT * FROM showtimes
	     INNER JOIN rows
	     ON showtimes.auditorium_id = rows.auditorium_id
	     INNER JOIN seats
	     ON rows.id = seats.row_id
	     WHERE seats.id = $1 and showtimes.id = $2`,
      [seat_id, showtime_id]
    );

    if (seat.rowCount === 0) {
      res
        .status(404)
        .json(createResponse(false, "Seat id not found for this showtimes"));
      return;
    }

    if ((await user).rowCount === 0) {
      res.status(404).json(createResponse(false, "User not found"));
      return;
    }

    const result = await pool.query(
      `INSERT INTO reservations(user_id, seat_id, showtime_id)
         VALUES($1, $2, $3)
         RETURNING *`,
      [user_id, seat_id, showtime_id]
    );

    await pool.query(`
      DELETE FROM reservations
      WHERE id IN (SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY showtime_id, seat_id ORDER BY created_at DESC) AS row_num
      FROM reservations
      WHERE showtime_id = 3) t WHERE row_num > 1)`);

    const createdReservation: Reservation = result.rows[0];

    res
      .status(201)
      .json(
        createResponse(
          true,
          "Reservation created successfully.",
          createdReservation
        )
      );
  } catch (err) {
    console.error("Error inserting reservation:", err);
    res.status(500).json(createResponse(false, "Unable to add reservation."));
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  try {
    const reservationId = req.params.id;

    const reservation = await pool.query(
      `SELECT * FROM reservations
         WHERE id = $1 AND (payment_status = $2 OR payment_status = $3)`,
      [reservationId, `pending`, `paid`]
    );

    if (reservation.rowCount === 0) {
      res
        .status(404)
        .json(
          createResponse(false, "Reservation not found or already cancelled!")
        );
      return;
    }

    const result = await pool.query(
      `UPDATE reservations
       SET payment_status = $1
       WHERE id = $2
       RETURNING *`,
      [`cancelled`, reservationId]
    );

    await pool.query(`DELETE FROM payments WHERE reservation_id = $1`, [
      reservationId,
    ]);

    const cancelledReservation: Reservation = result.rows[0];

    res
      .status(200)
      .json(
        createResponse(
          true,
          "Reservation cancelled successfully.",
          cancelledReservation
        )
      );
  } catch (err) {
    console.error("Error cancelling reservation:", err);
    res
      .status(500)
      .json(createResponse(false, "Unable to cancel reservation."));
  }
};

export const getReservationsByUserId = async (
  req: Request,
  res: Response<ApiResponse<Reservation[]>>
) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      `SELECT * FROM reservations WHERE user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      res
        .status(404)
        .json(
          createResponse(false, "Reservations not found with this user id.")
        );
      return;
    }

    const reservations: Reservation[] = result.rows;

    res
      .status(200)
      .json(
        createResponse(true, "Reservations fetched successfully.", reservations)
      );
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res
      .status(500)
      .json(createResponse(false, "Unable to fetch reservations."));
  }
};
