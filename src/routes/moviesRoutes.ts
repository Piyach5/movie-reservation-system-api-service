import { Router } from "express";
import {
  deleteMovie,
  getMovies,
  createMovie,
  updateMovie,
} from "../controllers/moviesController";
import {
  getMovieValidation,
  createMovieValidation,
  updateMovieValidation,
} from "../middlewares/moviesValidation";
import { validation } from "../middlewares/validationMiddleware";
import { authenticateJWT } from "../middlewares/authenticateJWT";
import { roleCheck } from "../middlewares/roleMiddleware";

const moviesRoutes = Router();

moviesRoutes.get("/", getMovieValidation, validation, getMovies);
moviesRoutes.post(
  "/",
  authenticateJWT,
  roleCheck,
  createMovieValidation,
  validation,
  createMovie
);
moviesRoutes.put(
  "/:id",
  authenticateJWT,
  roleCheck,
  updateMovieValidation,
  validation,
  updateMovie
);
moviesRoutes.delete("/:id", authenticateJWT, roleCheck, deleteMovie);

export default moviesRoutes;

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get a list of movies
 *     description: Fetch a paginated list of movies, with optional filters for genre and title.
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page.
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           example: Action
 *         description: Filter movies by genre.
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *           example: Matrix
 *         description: Filter movies by title (partial match).
 *     responses:
 *       200:
 *         description: Movies fetched successfully.
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
 *                   example: Movies fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 50
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       404:
 *         description: No movies found.
 *       500:
 *         description: Unable to fetch movies data.
 */

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     description: Adds a new movie to the database.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Movie added successfully.
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
 *                   example: Movie added successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Movie with this title already exists.
 *       500:
 *         description: Unable to add movie.
 */

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update a movie
 *     description: Updates the details of an existing movie by ID.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *         description: The ID of the movie to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Movie updated successfully.
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
 *                   example: Movie updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       404:
 *         description: No movie found.
 *       500:
 *         description: Unable to update movie.
 */

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie
 *     description: Deletes a movie from the database by ID.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *         description: The ID of the movie to delete.
 *     responses:
 *       200:
 *         description: Movie deleted successfully.
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
 *                   example: Movie deleted successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       404:
 *         description: No movie found.
 *       500:
 *         description: Unable to delete movie.
 */
