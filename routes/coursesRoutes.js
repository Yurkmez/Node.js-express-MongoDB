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

module.exports = router;
