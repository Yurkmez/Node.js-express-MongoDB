const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
    }); // 'courses' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars
});

module.exports = router;
