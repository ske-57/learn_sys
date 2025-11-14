const Router = require('express')
const router = new Router()
const employeeController = require('../controller/employee.controller')

router.post('/employees', employeeController.createEmployee)

router.get('/employees', employeeController.getEmployees)
// Soft delete employee by id
router.post('/employees/:id', employeeController.softDeleteEmploye)

// Helper api endpoint to get organizations
router.get('/organizations', employeeController.getOrganizations)

module.exports = router