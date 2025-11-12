DROP TABLE IF EXISTS employees CASCADE;

CREATE TABLE employees (
  id            BIGINT PRIMARY KEY,
  name          VARCHAR(255)       NOT NULL,
  last_name     VARCHAR(255)       NOT NULL,
  middle_name   VARCHAR(255)       NOT NULL,
  snils         VARCHAR(20) ,
  birthday_date DATE,
  organization  VARCHAR(255)       NOT NULL,
  grade         VARCHAR(127),
  phone         VARCHAR(32),
  email         VARCHAR(255),
  is_active     BOOLEAN            NOT NULL DEFAULT TRUE
);