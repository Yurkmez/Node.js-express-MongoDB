const { Router } = require('express');
const User = require('../models/user');
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

router.post('/login', async (req, res) => {
    const user = await User.findById('66b4b7db28f521879dabd9c8');
    req.session.user = user;
    req.session.isAuthenticated = true;
    // Но, верхние операции могут не успеть завершится, а мы уже
    // выполним переход (redirect), поэтому используем
    // встроенный метод save()
    req.session.save((error) => {
        if (error) {
            throw error;
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
