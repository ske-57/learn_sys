const db = require('../db.origin')

class EmployeController {

    // Create a new employee
    async createEmploye(req, res) {
        try {
            const { name, last_name, middle_name, organization, snils, birthday_date, grade, phone, email } = req.body

            if (!name || !last_name || !middle_name || !organization) {
                return res.status(400).json({ error: 'Missing required fields: name, last_name, middle_name, organization' })
            }

            const result = await db.query(
                `INSERT INTO employees(name, last_name, middle_name, organization, snils, birthday_date, grade, phone, email)
                 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                [name, last_name, middle_name, organization, snils || null, birthday_date || null, grade || null, phone || null, email || null]
            )

            return res.status(201).json(result.rows[0])
        } catch (err) {
            console.error('createEmploye error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // List employees. By default only active employees are returned. Pass ?include_inactive=true to include all.
    async getEmployees(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true'
            const query = includeInactive ? `SELECT * FROM employees ORDER BY id` : `SELECT * FROM employees WHERE is_active = true ORDER BY id`
            const result = await db.query(query)
            return res.json(result.rows)
        } catch (err) {
            console.error('getEmployees error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // Get single employee by id
    async getEmployeById(req, res) {
        try {
            const { id } = req.params
            const result = await db.query(`SELECT * FROM employees WHERE id = $1`, [id])
            if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' })
            return res.json(result.rows[0])
        } catch (err) {
            console.error('getEmployeById error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // Update allowed employee fields
    async updateEmploye(req, res) {
        try {
            const { id } = req.params

            const allowed = [
                'name', 'last_name', 'middle_name', 'snils', 'birthday_date', 'organization', 'grade', 'phone', 'email', 'is_active'
            ]

            const keys = Object.keys(req.body).filter(k => allowed.includes(k))
            if (keys.length === 0) return res.status(400).json({ error: 'No valid fields provided for update' })

            const sets = []
            const values = []
            keys.forEach((k, i) => {
                sets.push(`${k} = $${i + 1}`)
                values.push(req.body[k])
            })

            values.push(id)
            const q = `UPDATE employees SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`
            const result = await db.query(q, values)
            if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' })
            return res.json(result.rows[0])
        } catch (err) {
            console.error('updateEmploye error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // Soft delete an employee (set is_active = false)
    async softDeleteEmploye(req, res) {
        try {
            const { id } = req.params
            const result = await db.query(`UPDATE employees SET is_active = false WHERE id = $1 RETURNING *`, [id])
            if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' })
            return res.json({ message: 'Employee soft-deleted', employee: result.rows[0] })
        } catch (err) {
            console.error('softDeleteEmploye error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

}

module.exports = new EmployeController()