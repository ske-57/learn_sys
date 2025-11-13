const Router = require('express')
const router = new Router()
const employeeController = require('../controller/employee.controller')

router.post('/employees', employeeController.createEmploye)

router.get('/employees', employeeController.getEmployees)
// Soft delete employee by id
router.post('/employees/:id', employeeController.softDeleteEmploye)


module.exports = router