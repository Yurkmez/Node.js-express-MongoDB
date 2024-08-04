const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.render('addCourse', {
        title: 'Add course',
        isAddCourse: true,
    }); // 'addCourse' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.redirect('/courses');
});

module.exports = router;
