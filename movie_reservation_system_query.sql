-- Drop tables if they exist
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS showtimes CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS auditoriums CASCADE;
DROP TABLE IF EXISTS rows CASCADE;
DROP TABLE IF EXISTS seat_types CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Create 'users' table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'regular' NOT NULL CHECK (role IN ('regular', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'movies' table
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) UNIQUE NOT NULL,
  genre TEXT[] NOT NULL,
  release_year INT NOT NULL,
  minutes INT NOT NULL,
  description TEXT,
  poster_image TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'auditoriums' table
CREATE TABLE auditoriums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'seat_types' table
CREATE TABLE seat_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(35) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert seat types (Standard, Premium)
INSERT INTO seat_types (name, price) 
VALUES 
  ('Standard', 150.00),
  ('Premium', 250.00);

-- Create 'rows' table
CREATE TABLE rows (
    id SERIAL PRIMARY KEY,
    auditorium_id INT REFERENCES auditoriums(id) ON DELETE CASCADE,
    row CHAR(1) NOT NULL,
    seat_type_id INT REFERENCES seat_types(id) ON DELETE CASCADE,
    seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'seats' table
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    row_id INT REFERENCES rows(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'showtimes' table
CREATE TABLE showtimes (
  id SERIAL PRIMARY KEY,
  movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  auditorium_id INT REFERENCES auditoriums(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'reservations' table
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  seat_id INT REFERENCES seats(id) ON DELETE CASCADE,
  showtime_id INT REFERENCES showtimes(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'bank_transfer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for faster querying
CREATE INDEX idx_showtimes_movie_id ON showtimes(movie_id);

-- Insert sample movies
INSERT INTO movies (title, genre, release_year, minutes, description, poster_image)
VALUES 
  ('Inception', ARRAY['Sci-Fi', 'Thriller'], '2010', 148, 'A skilled thief leads a team into the subconscious of their targets.', 'https://example.com/inception.jpg'),
  ('The Shawshank Redemption', ARRAY['Drama'], '1994', 142, 'Two imprisoned men bond over several years.', 'https://example.com/shawshank.jpg'),
  ('The Dark Knight', ARRAY['Action', 'Drama'], '2008', 152, 'Batman battles the Joker, who threatens Gotham City.', 'https://example.com/darkknight.jpg');

-- Create auditoriums (3 auditoriums with different capacities)
INSERT INTO auditoriums (name, capacity)
VALUES ('Auditorium 1', 50),
              ('Auditorium 2', 50),
              ('Auditorium 3', 50);

-- Insert rows for each auditorium (5 rows with 10 seats each, dynamic seat types, and seats)
DO $$ 
DECLARE 
  auditorium_id INT;
  row_char CHAR; 
  seat_type INT; -- Variable to hold the seat type ID dynamically
  row_id INT; -- To capture the ID of the inserted row
  seat_number INT; -- To loop through seat numbers
BEGIN
  -- Loop through each auditorium
  FOR auditorium_id IN (SELECT id FROM auditoriums) LOOP
    -- Loop through rows A to E
    FOR row_char IN 
      SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E']) 
    LOOP
      -- Determine seat type based on the row
      IF row_char IN ('A', 'B') THEN
        seat_type := 2; -- Premium
      ELSE
        seat_type := 1; -- Standard
      END IF;

      -- Insert a row for each auditorium
      INSERT INTO rows (auditorium_id, row, seat_type_id, seats)
      VALUES 
        (auditorium_id, row_char, seat_type, 10) 
      RETURNING id INTO row_id; -- Capture the row ID

      -- Insert 10 seats for the inserted row
      FOR seat_number IN 1..10 LOOP
        INSERT INTO seats (row_id, seat_number)
        VALUES 
          (row_id, row_char || seat_number::TEXT); -- Seat name as row+number (e.g., A1, A2)
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;

-- Function to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Add triggers for 'updated_at'
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_movies BEFORE UPDATE ON movies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_showtimes BEFORE UPDATE ON showtimes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_seats BEFORE UPDATE ON seats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert showtimes
DO $$ 
DECLARE 
  movie RECORD; 
  current_start_time TEXT; 
  start_times CONSTANT TEXT[] := ARRAY['10:00:00', '14:00:00', '19:00:00'];
BEGIN 
  -- Loop through all movies
  FOR movie IN 
    SELECT id 
    FROM movies 
  LOOP 
    -- Assign auditorium ID based on movie ID
    FOR day_offset IN 0..2 LOOP 
      -- Generate showtimes for each day and start time
      FOR i IN 1..array_length(start_times, 1) LOOP
        current_start_time := start_times[i];

        -- Insert showtime with matching movie and auditorium
        INSERT INTO showtimes (movie_id, date, start_time, auditorium_id) 
        VALUES (movie.id, CURRENT_DATE + day_offset, current_start_time::TIME, movie.id);
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;



