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
                SELECT c.id, c.name, c.mark, SUM(cl.hours) as total_hours FROM courses c
                JOIN course_lessons cl ON cl.course_id = c.id
                GROUP BY c.id, c.name
                `)
            return res.status(200).json(courses.rows)
        } catch (err) {
            console.error('getCourses error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = new CourseController()