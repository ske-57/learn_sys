-- ==============================
-- DROP TABLES (обратный порядок)
-- ==============================

DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS course_lessons;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS organizations;

-- ==============================
-- CREATE TABLES
-- ==============================

-- Организации
CREATE TABLE IF NOT EXISTS organizations (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(256)
);

-- Курсы
CREATE TABLE IF NOT EXISTS courses (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(512) NOT NULL,
    hours INTEGER,
    mark  VARCHAR(32)
);

-- Сотрудники
CREATE TABLE IF NOT EXISTS employees (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(256) NOT NULL,
    last_name       VARCHAR(256) NOT NULL,
    middle_name     VARCHAR(256),
    snils           VARCHAR(32),
    birth_date      DATE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    grade           VARCHAR(512),
    phone           VARCHAR(32),
    email           VARCHAR(128),
    education       VARCHAR(512) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true
);

-- Группы
CREATE TABLE IF NOT EXISTS groups (
    id              INTEGER PRIMARY KEY,
    start_date      DATE NOT NULL,
    end_date        DATE, -- Must be not null in future
    course_id       INTEGER NOT NULL REFERENCES courses(id)
    -- Maybe must be organization_id with FK to organizations(id) ?!?!?!
);

-- Уроки курса
CREATE TABLE IF NOT EXISTS course_lessons (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(512) NOT NULL,
    hours     INTEGER NOT NULL,
    course_id INTEGER NOT NULL REFERENCES courses(id)
);

-- Члены групп (M:N сотрудники <-> группы)
CREATE TABLE IF NOT EXISTS group_members (
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    group_id    INTEGER NOT NULL REFERENCES groups(id),
    PRIMARY KEY (employee_id, group_id)
);

-- (Опционально индексы на FK — но можно и отдельной миграцией)
-- CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees (organization_id);
-- CREATE INDEX IF NOT EXISTS idx_groups_course_id          ON groups (course_id);
-- CREATE INDEX IF NOT EXISTS idx_groups_organization_id    ON groups (organization_id);
-- CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id  ON course_lessons (course_id);
-- CREATE INDEX IF NOT EXISTS idx_group_members_employee_id ON group_members (employee_id);
-- CREATE INDEX IF NOT EXISTS idx_group_members_group_id    ON group_members (group_id);
