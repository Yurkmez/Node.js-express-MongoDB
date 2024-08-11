const { Router } = require('express');

const router = Router();
// Вход в логин
router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
    });
});

// Выход из авторизации и переход на страницу логин
router.get('/logout', (req, res) => {
    // выходим из сессии, можно так:
    // req.session.isAuthenticated = false;
    // res.redirect('/auth/login#login')
    // но можно и так
    req.session.destroy(() => res.redirect('/auth/login#login'));
});

router.post('/login', (req, res) => {
    req.session.isAuthenticated = true;
    res.redirect('/');
});

module.exports = router;
