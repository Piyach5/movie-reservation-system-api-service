import { body } from "express-validator";

export const createShowtimeValidation = [
  body("movie_id")
    .notEmpty()
    .withMessage("Movie id is required.")
    .isInt({ min: 1 })
    .withMessage("Movie id must be an positive integer."),
  body("date")
    .notEmpty()
    .withMessage("Date is required.")
    .isISO8601()
    .withMessage("Date must be in 'YYYY-MM-DD' format."),
  body("start_time")
    .notEmpty()
    .withMessage("Start time is required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in 'HH:MM' format."),
];
