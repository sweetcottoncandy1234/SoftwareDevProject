create database recipe_db;
DROP TABLE IF EXISTS review;
CREATE TABLE IF NOT EXISTS review (
  id SERIAL PRIMARY KEY,
  meal_name VARCHAR(64),
  review TEXT,
  review_date TIMESTAMP
);