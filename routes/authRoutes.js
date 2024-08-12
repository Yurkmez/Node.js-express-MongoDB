const { Router } = require('express');
const bcrypt = require('bcryptjs');
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

// Авторизация
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            const isPassOk = await bcrypt.compare(password, candidate.password);
            if (isPassOk) {
                req.session.user = candidate;
                // и, учитывая, что у нас миддлваре user, где
                // req.user = await User.findById(req.session.user._id);
                // то в дальнейшем у нас user "сидит" в req.user
                // там где используется этот миделваре
                req.session.isAuthenticated = true;
                req.session.save((error) => {
                    if (error) {
                        throw error;
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                res.redirect('/auth/login#login');
            }
        } else {
            res.redirect('/auth/login#login');
        }
    } catch (error) {
        console.log(error);
    }
});

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, name, password, confirm } = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            res.redirect('/auth/login#register');
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({
                email: email,
                name: name,
                password: hashPassword,
                cart: { items: [] },
            });
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
