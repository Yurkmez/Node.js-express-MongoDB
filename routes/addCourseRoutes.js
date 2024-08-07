const { Router } = require('express');
const Course = require('../models/course');
const e = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.render('addCourse', {
        title: 'Add course',
        isAddCourse: true,
    }); // 'addCourse' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});

router.post('/', async (req, res) => {
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
    });
    try {
        await course.save();
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
