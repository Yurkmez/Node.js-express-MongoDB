const { Router } = require('express');
const Course = require('../models/course');

const router = Router();

router.get('/', async (req, res) => {
    const courses = await Course.getAll();
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        courses,
    }); // 'courses' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});

router.get('/:id', async (req, res) => {
    const course = await Course.getById(req.params.id);
    res.render('singleCourse', {
        layout: 'empty',
        title: `Course "${course.title}"`,
        course,
    });
});
module.exports = router;
