const db = require('../db.origin')

class EmployeController {

    // Create a new employee
    async createEmployee(req, res) {
        try {
            const {
                name,
                last_name,
                middle_name,
                organization_id,
                snils,
                birth_date,
                grade,
                phone,
                email,
                education
            } = req.body

            // required fields according to DB schema
            if (!name || !last_name || !organization_id || !education) {
                return res.status(400).json({ error: 'Missing required fields: name, last_name, organization_id, education' })
            }

            const result = await db.query(
                `INSERT INTO employees(
                    name, last_name, middle_name, snils, birth_date, organization_id, grade, phone, email, education
                ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                [
                    name,
                    last_name,
                    middle_name || null,
                    snils || null,
                    birth_date || null,
                    organization_id,
                    grade || null,
                    phone || null,
                    email || null,
                    education
                ]
            )

            return res.status(201).json(result.rows[0])
        } catch (err) {
            console.error('createEmploye error', err)
            // handle FK violation (invalid organization_id)
            if (err && err.code === '23503') {
                return res.status(400).json({ error: 'Invalid organization_id' })
            }
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    // List employees. By default only active employees are returned. Pass ?include_inactive=true to include all.
    async getEmployees(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true'
            var query;
            if (includeInactive) {
                query = `
                SELECT e.*, o.name AS organization_name
                FROM employees e
                LEFT JOIN organizations o ON o.id = e.organization_id
                ORDER BY id
                ` 
            } else {
                query = `
                SELECT e.*, o.name AS organization_name
                FROM employees e
                LEFT JOIN organizations o ON o.id = e.organization_id
                WHERE is_active = true
                ORDER BY id
                `
            }
            const result = await db.query(query)
            return res.json(result.rows)
        } catch (err) {
            console.error('getEmployees error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    async getSimpleEmployees(req, res) {
        try {
            const result = await db.query(`
                SELECT e.id, e.name, e.last_name, e.middle_name, o.name AS organization_name
                FROM employees e
                LEFT JOIN organizations o ON o.id = e.organization_id
                WHERE e.is_active = true
                ORDER BY e.id
            `)
            return res.json(result.rows)
        } catch (err) {
            console.error('getSimpleEmployees error', err)
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
                'name', 'last_name', 'middle_name', 'snils', 'birth_date', 'organization_id', 'grade', 'phone', 'email', 'is_active'
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

    async getOrganizations(req, res) {
        try {
            const result = await db.query(`
                SELECT o.id, o.name FROM organizations o 
                ORDER BY id`)
            return res.json(result.rows)
        } catch (err) {
            console.error('getOrganizations error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

}

module.exports = new EmployeController()