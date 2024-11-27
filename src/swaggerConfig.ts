import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Movie Reservation System API",
      version: "1.0.0",
      description: "API documentation for the Movie Reservation System",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        security: { bearerAuth: [] },
        "x-security": { roles: ["admin", " user"] },
      },
      schemas: {
        Showtime: {
          type: "object",
          properties: {
            id: { type: "integer" },
            movie_id: { type: "integer" },
            date: { type: "string", format: "date" },
            start_time: { type: "string", format: "time" },
          },
        },
        AvailableSeatByShowtime: {
          type: "object",
          properties: {
            showtime_id: { type: "integer" },
            row_name: { type: "string" },
            seat_id: { type: "integer" },
            seat_number: { type: "string" },
          },
        },
        Movie: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the movie",
              example: 1,
            },
            title: {
              type: "string",
              description: "Title of the movie",
              example: "Inception",
            },
            genre: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Genres of the movie",
              example: ["Action", "Sci-Fi"],
            },
            release_year: {
              type: "integer",
              description: "Year the movie was released",
              example: 2010,
            },
            minutes: {
              type: "integer",
              description: "Duration of the movie in minutes",
              example: 148,
            },
            description: {
              type: "string",
              description: "Brief description of the movie",
              example:
                "A thief who steals corporate secrets through the use of dream-sharing technology.",
            },
            poster_image: {
              type: "string",
              description: "URL to the movie's poster image",
              example: "https://example.com/inception-poster.jpg",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the movie was added",
              example: "2024-11-27T14:20:00Z",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation was successful",
            },
            data: {
              type: "object",
              example: {},
            },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the payment.",
              example: 1,
            },
            reservation_id: {
              type: "integer",
              description: "ID of the associated reservation.",
              example: 1,
            },
            user_id: {
              type: "integer",
              description: "ID of the user who made the payment.",
              example: 42,
            },
            amount: {
              type: "number",
              format: "float",
              description: "Amount paid.",
              example: 50.5,
            },
            payment_method: {
              type: "string",
              description:
                "Payment method used. Must be one of the following: `credit_card`, `paypal`, `bank_transfer`",
              example: "credit_card",
            },
            status: {
              type: "string",
              description:
                "Status of the payment (e.g., pending, completed, failed).",
              example: "pending",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the payment was created.",
              example: "2024-11-27T14:20:00Z",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
