const { Router } = require('express');
const Course = require('../models/course');
// Защита роутов (вход через браузер)
const auth = require('../middleware/authMiddleware');
const e = require('express');

const router = Router();

router.get('/', auth, (req, res) => {
    res.render('addCourse', {
        title: 'Add course',
        isAddCourse: true,
    }); // 'addCourse' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});

router.post('/', auth, async (req, res) => {
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        // В index.js есть мидлваре, где "req.user = user"
        userId: req.user,
    });
    try {
        await course.save();
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
