const { response } = require('express')
const db = require('../db.origin')

class EmployeController {

    async createEmploye(req, res) {

        const { name, last_name, middle_name, organization } = req.body
        const newEmploye = await db.query(`INSERT INTO employees(name, last_name, middle_name, organization) 
            VALUES ($1, $2, $3, $4) RETURNING *`, [name, last_name, middle_name, organization])
        res.json(newEmploye.rows[0])
    }

    async getEmployees(req, res) {
        const employees = await db.query(`
            SELECT * FROM employees;`)
        res.json(employees.rows)
    }
}

module.exports = new EmployeController()