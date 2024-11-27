import { body } from "express-validator";

export const createReservationValidation = [
  body("user_id")
    .notEmpty()
    .withMessage("User id is required.")
    .isInt({ min: 1 })
    .withMessage("User id must be a positive integer."),
  body("seat_id")
    .notEmpty()
    .withMessage("Seat id is required.")
    .isInt({ min: 1 })
    .withMessage("Seat id must be a positive integer."),
  body("showtime_id")
    .notEmpty()
    .withMessage("Showtime id is required.")
    .isInt({ min: 1 })
    .withMessage("Showtime id must be a positive integer."),
];
