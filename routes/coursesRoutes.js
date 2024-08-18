// res.redirect - instructs the client to redirect to another URL,
// res.render  - generates HTML on the server and delivers it to the client.

const { Router } = require('express');
const Course = require('../models/course');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators.js');

// Защита роутов (вход через браузер)
const auth = require('../middleware/authMiddleware');
const { log } = require('handlebars');

const router = Router();

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

// Роут получения всех курсов
router.get('/', async (req, res) => {
    // ______ опция (select) ограничивает вывод данных в браузере ...find().select('title img');
    // ______ опция (populate) достает данные из моделей по ссылке (второй параметр - ограничивает набор доставаемых данных)
    try {
        const courses = await Course.find().populate('userId', 'email name');
        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses,
        }); // 'courses' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
    } catch (error) {
        console.log(error);
    }
});
// Роут получения одного курса по id
router.get('/:id', async (req, res) => {
    try {
        // console.log('id:', req.params.id);
        const course = await Course.findById(req.params.id);
        res.render('singleCourse', {
            layout: 'empty',
            title: `Course "${course.title}"`,
            course,
        });
    } catch (error) {
        console.log(error);
    }
});

// Роут получения одного курса (по id) для редактирования
router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }
    try {
        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req)) {
            res.redirect('/');
        }
        res.render('editCourse', {
            title: `Edit "${course.title}"`,
            course,
        });
    } catch (error) {
        console.log(error);
    }
});
// получили, отредактировали, сохраняем (update)
router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    const { id } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
    }
    try {
        // чтобы не изменять id, мы его забираем из запроса и
        const { id } = req.body;
        // удаляем из body id,
        delete req.body.id;
        const course = await Course.findById(id);
        if (!isOwner(course, req)) {
            res.redirect('/');
        }
        // Заменяем курс на новый, полученный из req.body
        Object.assign(course, req.body);
        await course.save();
        //  как вариант, далее записываем req.body уже без id, используя встроенный метод findByIdAndUpdate
        // await Course.findByIdAndUpdate(id, req.body);
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        });
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
