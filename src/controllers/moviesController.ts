import { Request, Response } from "express";
import pool from "../db/db";
import { Movie, ApiResponse, PaginatedResponse } from "../types";
import { createResponse } from "../utils/responseUtils";

export const getMovies = async (
  req: Request,
  res: Response<ApiResponse<PaginatedResponse<Movie>>>
) => {
  try {
    const { page = 1, limit = 10, genre, title } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const filters: string[] = [];
    const values: unknown[] = [];

    if (genre) {
      if (Array.isArray(genre)) {
        genre.forEach((value) => {
          filters.push(
            `LOWER(ARRAY_TO_STRING(movies.genre, ',')) LIKE LOWER($${
              values.length + 1
            })`
          );
          values.push(`%${value}%`);
        });
      } else {
        filters.push(
          `LOWER(ARRAY_TO_STRING(movies.genre, ',')) LIKE LOWER($${
            values.length + 1
          })`
        );
        values.push(`%${genre}%`);
      }
    }

    if (title) {
      filters.push(`LOWER(movies.title) LIKE LOWER($${values.length + 1})`);
      values.push(`%${title}%`);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" OR ")}` : "";
    values.push(Number(limit), offset);

    const totalCountResult = await pool.query(
      `SELECT COUNT(*) AS total FROM movies
       ${whereClause}`,
      values.slice(0, values.length - 2)
    );

    const totalCount = parseInt(totalCountResult.rows[0].total, 10);

    const result = await pool.query(
      `SELECT * FROM movies
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const movies: Movie[] = result.rows;

    if (movies.length === 0) {
      res.status(404).json(createResponse(false, "No movies found."));
      return;
    }

    const response = {
      data: movies,
      meta: {
        totalItems: totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    };

    res
      .status(200)
      .json(createResponse(true, "Movies fetched successfully.", response));
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json(createResponse(false, "Unable to fetch movies data."));
  }
};

export const createMovie = async (
  req: Request,
  res: Response<ApiResponse<Movie>>
) => {
  try {
    const {
      title,
      genre,
      release_year,
      minutes,
      description = "",
      poster_image = "",
    }: Movie = req.body;

    const duplicateCheck = await pool.query(
      `SELECT id FROM movies WHERE LOWER(title) = LOWER($1)`,
      [title]
    );

    if (duplicateCheck.rowCount && duplicateCheck.rowCount > 0) {
      res
        .status(400)
        .json(createResponse(false, "Movie with this title already exists!"));
      return;
    }

    const result = await pool.query(
      `  INSERT INTO movies (title, genre, release_year, minutes, description, poster_image)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
      [title, genre, release_year, minutes, description, poster_image]
    );

    const createdMovie: Movie = result.rows[0];

    res
      .status(201)
      .json(createResponse(true, "Movie added successfully.", createdMovie));
  } catch (err) {
    console.error("Error inserting movie:", err);
    res.status(500).json(createResponse(false, "Unable to add movie."));
  }
};

export const updateMovie = async (
  req: Request,
  res: Response<ApiResponse<Movie>>
) => {
  try {
    const movieId = req.params.id;

    const movie = await pool.query(`SELECT * FROM movies WHERE id = $1`, [
      movieId,
    ]);

    if (movie.rowCount === 0) {
      res.status(404).json(createResponse(false, "No movie found."));
      return;
    }

    const {
      title = movie.rows[0].title,
      genre = movie.rows[0].genre,
      release_year = movie.rows[0].release_year,
      minutes = movie.rows[0].minutes,
      description = movie.rows[0].description,
      poster_image = movie.rows[0].poster_image,
    }: Movie = req.body;

    const result = await pool.query(
      `UPDATE movies 
       SET title = $1, 
       genre = $2, 
       release_year = $3, 
       minutes = $4, 
       description = $5, 
       poster_image = $6
       WHERE id = $7
       RETURNING *`,
      [title, genre, release_year, minutes, description, poster_image, movieId]
    );

    const updatedMovie: Movie = result.rows[0];

    res
      .status(200)
      .json(createResponse(true, "Movie updated successfully.", updatedMovie));
  } catch (err: any) {
    console.error("Error updating movie:", err);
    if (err.code === "23505") {
      res
        .status(400)
        .json(
          createResponse(
            false,
            "Movie with this title or poster image already exists"
          )
        );
    }
    res.status(500).json(createResponse(false, "Unable to update movie."));
  }
};

export const deleteMovie = async (
  req: Request,
  res: Response<ApiResponse<Movie>>
) => {
  try {
    const movieId = req.params.id;
    const movie = await pool.query(`SELECT * FROM movies WHERE id = $1`, [
      movieId,
    ]);

    if (movie.rowCount === 0) {
      res.status(404).json(createResponse(false, "No movie found."));
      return;
    }

    const result = await pool.query(
      `DELETE FROM movies 
       WHERE id = $1
       RETURNING *`,
      [movieId]
    );

    const deletedMovie: Movie = result.rows[0];

    res
      .status(200)
      .json(createResponse(true, "Movie deleted successfully.", deletedMovie));
  } catch (err) {
    console.error("Error deleting movie:", err);
    res.status(500).json(createResponse(false, "Unable to delete movie."));
  }
};
