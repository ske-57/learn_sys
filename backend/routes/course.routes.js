const Router = require('express')
const router = new Router()
const courseController = require('../controller/course.controller')

router.post('/courses', courseController.createCourse)

router.get('/courses', courseController.getCourses)

module.exports = router