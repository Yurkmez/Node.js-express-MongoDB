const { Router } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const keys = require('../keys');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { registerValidators } = require('../utils/validators');
// Почта
const nodemailer = require('nodemailer');
const regEmail = require('../email/registration');
const resetPassEmail = require('../email/resetPassEmail');
// Генерация случайного числа (токена) для восстановления пароля
const router = Router();

// Почта
// смотри https://yandex.ru/video/preview/13851045663545686522
// по деталям создания транспортера
const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
        user: keys.EMAIL_FROM,
        pass: keys.API_GMAIL, // generated from the App Passwords
    },
    secure: true,
});

// Вход в логин
router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        errorLogin: req.flash('errorLogin'),
        errorRegister: req.flash('errorRegister'),
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
                req.flash('errorLogin', 'Incorrect password!');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('errorLogin', 'There is no user with such email!');
            res.redirect('/auth/login#login');
        }
    } catch (error) {
        console.log(error);
    }
});

// Регистрация
router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, name, password, confirm } = req.body;
        const candidate = await User.findOne({ email });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errorRegister', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }

        if (candidate) {
            req.flash('errorRegister', 'This email address already exists!');
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
            await transporter.sendMail(regEmail(email));
        }
    } catch (error) {
        console.log(error);
    }
});

// Сброс пароля (переход на страницу resetPass)
router.get('/reset', (req, res) => {
    res.render('auth/resetPass', {
        title: 'Fogot password?',
        error: req.flash('error'),
    });
});

// Создание нового пароля
router.post('/reset', (req, res) => {
    // Логика. Сначала генерируется случайный ключ (токен),
    // ктр записывается в БД. Потом пользователю отправляется
    // данный ключ. Пользователь перейдет по пересланной ссылке
    // и его переход содержит данный ключ. Если ключ совпадет и
    // время жизни ключа не истекло, то ему предоставляется
    // возможность поменять пароль.
    try {
        // используем встроенную библиотеку (без npm, только импорт)
        // по генерации случайного кода (cripto):
        // Генерируем случайное к-во байт (32) и в коллбэк ф-ции
        // получаем результат (двоичный код)
        crypto.randomBytes(32, async (error, buffer) => {
            if (error) {
                req.flash(
                    'error',
                    'Something go wrong, please try again later'
                );
                return res.redirect('/auth/reset');
            }
            // hex - это формат
            const token = buffer.toString('hex');
            // проверяем совпадение почты
            const candidate = await User.findOne({ email: req.body.email });
            if (candidate) {
                // кстати, расширяем свойства User (resetToken: String, resetTokenExp: Date)
                // заносим туда данные - сам токен
                candidate.resetToken = token;
                // и время его жизни - 1 час
                candidate.resetTokenExp = Date.now() + 3600000;
                // Сохраняем данные
                await candidate.save();
                // Дождались сохранения данных, отправляем письмо
                // (кстати, создаем в папке email файл resetEmail.js)
                await transporter.sendMail(
                    resetPassEmail(candidate.email, token)
                );
                res.redirect('/auth/login');
            } else {
                req.flash('error', 'There is no such email');
                res.redirect('/auth/reset');
            }
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/password/:token', async (req, res) => {
    // Организовываем защиту
    if (!req.params.token) {
        return res.redirect('/auth/login');
    }
    try {
        // Находим пользователя, у которого присутствует данный токен
        // и время жизни токена не истекло
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() },
        });
        if (!user) {
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Restore access',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token,
            });
        }
    } catch (error) {
        console.log(error);
    }
});

// Итак, какая логика смены пароля.
// 1. Нажимаем кнопку "Забыл пароль" на странице логин.
// - отправляем запрос на роут: a href='/auth/reset', это гет запрос (здесь же)
// там мы переходим на страницу: res.render('auth/resetPass'...
// там мы просим ввести емайл и отправляем пост запрос <form action='/auth/reset' method='POST'>
// в пост запросе (выше) мы проверяем
// почту на совпадение в базе и формируем токен и время его жизни
// отправляем на почту
// далее sendMail(resetPassEmail(candidate.email, token)
// из почты пользователь попадает на страницу password через роут
// <a href = '${keys.BASE_URL}/auth/password/${token}
// в роуте мы передаем туда userId: user._id и token
// там формируется новый пароль и отправляется пост запрос сюда, ниже
router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        });
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('error', 'Time to change password expired...');
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
