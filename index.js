const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

// Solve the problem with the error "Handlebars: Access has been denied to resolve the property ..."
// See "https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access"
const Handlebars = require('handlebars');
const {
    allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
// ____________________ Routers _____________________________________________________________
const homeRouter = require('./routes/homeRoutes');
const coursesRouter = require('./routes/coursesRoutes');
const addCourseRouter = require('./routes/addCourseRoutes');
const cardRoutes = require('./routes/cardBuyRoutes');
const orderRouters = require('./routes/orderRoutes');
// ___________________ models ______________________________
const User = require('./models/user');
// _________________________________________________________

const app = express();

// ____ handlebars ________________
//  Создаем и формируем параметры движка
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    // Solve the problem with the error "Handlebars: Access has been denied to resolve the property ..."
    handlebars: allowInsecurePrototypeAccess(Handlebars),
});
app.engine('hbs', hbs.engine); // Регистрируем hbs в качестве движка для рендеринга HTML страниц
app.set('view engine', 'hbs'); // Установки по умолчанию: название движка
app.set('views', 'views'); // и директория, в которй будут размещены файлы для рендеринга
// _______ Папка "static" определяется как общая для доступа с файлов приложения, в частности, обеспечивает доступ к index.css
app.use(express.static(path.join(__dirname, 'public')));
// _________ Middleware ___________________
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('66b4b7db28f521879dabd9c8');
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
    }
});
// _________ Подключение роутов, вынесенных в отдельные модули
// ____ <a href ____ интересно, что мы обращаемся, например, из "courses.hbs" -
// _________________  в варианте <a href='/courses/{{id}}'... или
// _________________  в варианте <a href='/courses/{{id}}/edit?allow=true' ...
// _________________ попадаем на app.use('/courses'..., далее в роуты coursesRouter,
// _________________ после (а получается что в таких вариантах это GET запросы по умолчанию) ?
// _________________ попадаем на роуты router.get('/:id' ...
// _________________ или router.get('/:id/edit' ..., соответственно,
// _________________ в которых реализуется логика обработки запросов:
// _________________ получение данных с помощью модели из внешних источников, после - redirect или render страниц
// _________________ с передачей туда полученных данных
// ____ form _______ Из формы мы обращаемся указывая соответствующие атрибутыЖ action, method.
// _________________ <form action='/card/add' method='POST'>
// ____ fetch ______ мы можем также осуществить запрос методом fetch
// _________________ что реализуется в файле app.js (в папке public)
// _________________ (в таком варианте мы прямо указываем метод запроса
// _________________ fetch('/card/remove/' + id, {method: 'delete',})
app.use('/', homeRouter);
app.use('/courses', coursesRouter);
app.use('/add', addCourseRouter);
app.use('/card', cardRoutes);
app.use('/order', orderRouters);

const url =
    'mongodb+srv://Yurkmez:kaplumbaga_7777@shaps.v2qkanr.mongodb.net/NewCourses';
// Start MongoDB
async function start() {
    try {
        await mongoose.connect(url);
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () =>
            console.log(`Server is running on port ${PORT}`)
        );
        // Проверяем, есть ли хотя бы один пользователь
        // findOne() - если пользователь есть, то этот метод
        // нам что то вернет
        const candidate = await User.findOne();
        if (!candidate) {
            const user = new User({
                email: 'qqq@gmail.com',
                name: 'Q',
                cart: { items: [] },
            });
            await user.save();
        }
    } catch (error) {
        console.log(error);
    }
}
start();
