import { query, body, param } from "express-validator";

export const getMovieValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a positive integer up to 100."),
];

export const createMovieValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters."),
  body("genre")
    .isArray({ min: 1 })
    .withMessage("Genre must be a non-empty array."),
  body("genre.*")
    .isString()
    .withMessage("Each genre must be a string.")
    .isLength({ max: 50 })
    .withMessage("Each genre entry cannot exceed 50 characters."),
  body("release_year")
    .notEmpty()
    .withMessage("Release year is required.")
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage("Release year must be between 1800 and the current year."),
  body("minutes")
    .notEmpty()
    .withMessage("Minutes is required")
    .isInt()
    .withMessage("Minutes must be an integer."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string.")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
  body("poster_image")
    .optional()
    .isURL()
    .withMessage("Poster image must be a valid URL."),
];

export const updateMovieValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Movie id must be positive integer"),
  body("title")
    .trim()
    .optional()
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters."),
  body("genre")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Genre must be a non-empty array."),
  body("genre.*")
    .isString()
    .withMessage("Each genre must be a string.")
    .isLength({ max: 50 })
    .withMessage("Each genre entry cannot exceed 50 characters."),
  body("release_year")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage("Release year must be between 1800 and the current year."),
  body("minutes").optional().isInt().withMessage("Minutes must be an integer."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string.")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
  body("poster_image")
    .optional()
    .isURL()
    .withMessage("Poster image must be a valid URL."),
];
