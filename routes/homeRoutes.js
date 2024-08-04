const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home',
        isHome: true,
    });
}); // 'index' - указываем название файла, находящегося в директории views, ктр мы указали при регистрации движка handlebars

module.exports = router;
