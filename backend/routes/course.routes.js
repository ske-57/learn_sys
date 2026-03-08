const Router = require('express')
const router = new Router()
const courseController = require('../controller/course.controller')

router.post('/courses', courseController.createCourse)

router.get('/courses', courseController.getCourses)

router.get('/courses/:id', courseController.getCourseById)

router.post('/courses/:id/lessons', courseController.addLessonToCourse)

// Partial update of course (mark, conclusion, etc.)
router.patch('/courses/:id', courseController.updateCourse)

router.patch('/courses/:course_id/lessons/:lesson_id', courseController.updateLesson)

router.delete('/courses/:course_id/lessons/:lesson_id', courseController.deleteLessonFromCourse)

module.exports = router