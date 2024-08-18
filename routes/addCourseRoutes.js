const { Router } = require('express');
const Course = require('../models/course');
const { courseValidators } = require('../utils/validators.js');
const { validationResult } = require('express-validator');

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

router.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('addCourse', {
            title: 'Add course',
            isAddCourse: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            },
        });
    }
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
