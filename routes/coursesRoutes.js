const { Router } = require('express');
const Course = require('../models/course');

const router = Router();
// Роут получения всех курсов
router.get('/', async (req, res) => {
    const courses = await Course.getAll();
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        courses,
    }); // 'courses' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});
// Роут получения одного курса по id
router.get('/:id', async (req, res) => {
    const course = await Course.getById(req.params.id);
    res.render('singleCourse', {
        layout: 'empty',
        title: `Course "${course.title}"`,
        course,
    });
});

// Роут получения одного курса (по id) для редактирования
router.get('/:id/edit', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }
    const course = await Course.getById(req.params.id);
    res.render('editCourse', {
        title: `Edit "${course.title}"`,
        course,
    });
});
// получили, отредактировали, сохраняем (update)
router.post('/edit', async (req, res) => {
    await Course.update(req.body);
    res.redirect('/courses');
});

module.exports = router;
