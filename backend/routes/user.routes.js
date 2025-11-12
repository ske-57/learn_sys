const Router = require('express')
const router = new Router()
const employeController = require('../controller/employe.controller')

router.post('/employees', employeController.createEmploye)
router.get('/employees', employeController.getEmployees)


module.exports = router