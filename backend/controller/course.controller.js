const db = require('../db.origin')

class CourseController {

    // Create a new course
    async createCourse(req, res) {
        try {
            const { name, hours, mark } = req.body

            // required fields according to DB schema
            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' })
            }

            const result = await db.query(
                `INSERT INTO courses(
                    name, hours, mark
                ) VALUES($1,$2,$3) RETURNING *`,
                [
                    name,
                    hours || null,
                    mark || null
                ]
            )

            return res.status(201).json(result.rows[0])
        } catch (err) {
            console.error('createCourse error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // List all courses
    async getCourses(req, res) {
        try {
            const courses = await db.query(`
                SELECT c.id, c.name, c.mark, SUM(cl.hours) as hours FROM courses c
                LEFT JOIN course_lessons cl ON cl.course_id = c.id
                GROUP BY c.id, c.name
                `)
            return res.status(200).json(courses.rows)
        } catch (err) {
            console.error('getCourses error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // Get full course data by id
    async getCourseById(req, res) {
        try {
            const { id } = req.params
            
            const courseResult = await db.query(
                `SELECT * FROM courses WHERE id = $1`,
                [id]
            )

            if (courseResult.rows.length === 0) {
                return res.status(404).json({ error: 'Course not found' })
            }

            const lessonsResult = await db.query(
                `SELECT * FROM course_lessons WHERE course_id = $1 ORDER BY id`,
                [id]
            )

            const course = courseResult.rows[0]
            return res.json({ ...course, lessons: lessonsResult.rows })
        } catch (err) {
            console.error('getCourseById error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // Add a single lesson to course by id
    async addLessonToCourse(req, res) {
        try {
            const { id } = req.params

            // accept either { name, hours } or { lessons: { name, hours } }
            const { name, hours } = req.body

            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' })
            }
            if (!hours) {
                return res.status(400).json({ error: 'Missing required field: hours' })
            }

            // verify course exists
            const courseCheck = await db.query(
                `SELECT id FROM courses WHERE id = $1`,
                [
                    id
                ]
            )

            if (courseCheck.rows.length === 0) {
                return res.status(404).json({ error: `Course with value ${id} not found` })
            }

            const result = await db.query(
                `INSERT INTO course_lessons(name, hours, course_id)
                 VALUES($1,$2,$3) RETURNING *`,
                [
                    name,
                    hours,
                    id
                ]
            )

            const inserted = result.rows[0]

            const hoursNum = Number(hours)
            if (!Number.isNaN(hoursNum) && hoursNum > 0) {
                await db.query(
                    `UPDATE courses SET hours = COALESCE(hours, 0) + $1 WHERE id = $2`,
                    [
                        hoursNum,
                        id]
                )
            }

            return res.status(201).json(inserted)
        } catch (err) {
            console.error('addLessonToCourse error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = new CourseController()