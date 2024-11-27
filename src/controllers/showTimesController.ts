import { Request, Response } from "express";
import { Showtime, ApiResponse, AvailableSeatByShowtime } from "../types";
import { createResponse } from "../utils/responseUtils";
import pool from "../db/db";

export const getShowtimes = async (
  req: Request,
  res: Response<ApiResponse<Showtime[]>>
) => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate
      .toLocaleString("en-CA")
      .split(",")[0];
    const currentTime = currentDate.toTimeString().split(" ")[0];
    currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowDate = currentDate.toLocaleString("en-CA").split(" ")[0];

    const movieId = req.params.movieId;
    const { date = tomorrowDate } = req.query;

    if (new Date(date as string) < new Date(currentDateFormatted)) {
      res
        .status(400)
        .json(createResponse(false, "No Showtimes Available for past dates."));
      return;
    }
    const isToday = date === currentDateFormatted;
    const whereClause = isToday
      ? `WHERE movie_id = $1 AND date = $2 AND start_time > $3`
      : `WHERE movie_id = $1 AND date = $2`;
    const values = isToday ? [movieId, date, currentTime] : [movieId, date];

    const result = await pool.query(
      `SELECT * FROM showtimes 
         ${whereClause}`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json(createResponse(false, "No Showtimes Available."));
      return;
    }

    const showtimes: Showtime[] = result.rows;

    res
      .status(200)
      .json(createResponse(true, "Showtimes fetched successfully.", showtimes));
  } catch (err) {
    console.error("Error fetching showtimes:", err);
    res
      .status(500)
      .json(createResponse(false, "Unable to fetch showtimes data."));
  }
};

export const createShowtime = async (
  req: Request,
  res: Response<ApiResponse<Showtime>>
) => {
  try {
    const { movie_id, date, start_time }: Showtime = req.body;

    const duplicateCheck = await pool.query(
      `SELECT * FROM showtimes
       WHERE movie_id = $1 AND date = $2 AND start_time = $3`,
      [movie_id, date, start_time]
    );

    if (duplicateCheck.rowCount && duplicateCheck.rowCount > 0) {
      res
        .status(400)
        .json(
          createResponse(
            false,
            "Movie showtimes with this date and start time already exists!"
          )
        );
      return;
    }

    const result = await pool.query(
      `INSERT INTO showtimes(movie_id, date, start_time)
       VALUES($1, $2, $3)
       RETURNING *`,
      [movie_id, date, start_time]
    );

    const createdShowtime: Showtime = result.rows[0];

    res
      .status(201)
      .json(
        createResponse(true, "Showtimes created successfully.", createdShowtime)
      );
  } catch (err) {
    console.error("Error inserting showtime:", err);
    res.status(500).json(createResponse(false, "Unable to add showtime."));
  }
};

export const deleteShowtime = async (
  req: Request,
  res: Response<ApiResponse<Showtime>>
) => {
  try {
    const showtimeId = req.params.id;
    const showtime = await pool.query(`SELECT * FROM showtimes WHERE id = $1`, [
      showtimeId,
    ]);

    if (showtime.rowCount === 0) {
      res.status(404).json(createResponse(false, "No showtime found."));
      return;
    }

    const result = await pool.query(
      `DELETE FROM showtimes 
       WHERE id = $1
       RETURNING *`,
      [showtimeId]
    );

    const deletedShowtime: Showtime = result.rows[0];

    res
      .status(200)
      .json(
        createResponse(true, "Showtime deleted successfully.", deletedShowtime)
      );
  } catch (err) {
    console.error("Error deleting showtime:", err);
    res.status(500).json(createResponse(false, "Unable to delete showtime."));
  }
};

export const getAvailbleSeatsByShowtimeId = async (
  req: Request,
  res: Response<ApiResponse<AvailableSeatByShowtime[]>>
) => {
  try {
    const showtimeId = req.params.id;
    const result = await pool.query(
      `SELECT showtimes.id AS 
       showtime_id,
       rows.row AS row_name,
       seats.id AS seat_id,
       seats.seat_number AS seat_number
       FROM showtimes
       INNER JOIN rows 
       ON showtimes.auditorium_id = rows.auditorium_id
       INNER JOIN seats 
       ON rows.id = seats.row_id
       LEFT JOIN reservations 
       ON showtimes.id = reservations.showtime_id 
       AND seats.id = reservations.seat_id
       WHERE showtimes.id = $1
       AND (reservations.id IS NULL OR reservations.payment_status = 'cancelled');`,
      [showtimeId]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json(createResponse(false, "No available seat with this showtime."));
      return;
    }

    const availableSeat: AvailableSeatByShowtime[] = result.rows;

    res
      .status(200)
      .json(
        createResponse(
          true,
          "Available seat with this showtime fetched successfully.",
          availableSeat
        )
      );
  } catch (err) {
    console.error("Error fetching available seat with this showtime:", err);
    res
      .status(500)
      .json(
        createResponse(
          false,
          "Unable to fetch available seat with this showtime data."
        )
      );
  }
};
