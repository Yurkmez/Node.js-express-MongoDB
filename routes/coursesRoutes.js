const { Router } = require('express');
const Course = require('../models/course');

const router = Router();
// Роут получения всех курсов
router.get('/', async (req, res) => {
    // используем встроенный метод find (если в скобках пусто - забираем все курсы)
    const courses = await Course.find();
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        courses,
    }); // 'courses' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});
// Роут получения одного курса по id
router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id);
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
    // используем встроенный метод findById
    const course = await Course.findById(req.params.id);
    res.render('editCourse', {
        title: `Edit "${course.title}"`,
        course,
    });
});
// получили, отредактировали, сохраняем (update)
router.post('/edit', async (req, res) => {
    // чтобы не изменять id, мы его забираем из запроса и
    const { id } = req.body;
    // удаляем из body id,
    delete req.body.id;
    //  далее записываем req.body уже без id, используя встроенный метод findByIdAndUpdate
    const aaa = await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
});

module.exports = router;
