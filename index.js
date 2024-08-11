const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
// Данный пакет синхронизирует суссию с БД
// это конструктор -> MongoStore - класс
// на основе ктр мы создадим экземпляр класса new MongoStore
const MongoStore = require('connect-mongodb-session')(session);
// Solve the problem with the error "Handlebars: Access has been denied to resolve the property ..."
// See "https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access"
const Handlebars = require('handlebars');
const {
    allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
// ____________________ Routers _____________________________________________________________
const homeRoutes = require('./routes/homeRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const addCourseRoutes = require('./routes/addCourseRoutes');
const cardRoutes = require('./routes/cardBuyRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
// ___________________ models ______________________________
const User = require('./models/user');
// ___________________ middleware ______________________________________
const varMiddleware = require('./middleware/variablesMiddleware');

const app = express();
const MONGODB_URL =
    'mongodb+srv://Yurkmez:kaplumbaga_7777@shaps.v2qkanr.mongodb.net/NewCourses';
// ________ class for store session in MongjDB
const store = new MongoStore({
    collection: 'sessions',
    // именно uri! (не url)
    uri: MONGODB_URL,
});
// store - передаем ниже в app.use(session ...

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
// _________ Middleware: ___________________
// ____________________ session _______________
app.use(
    session({
        secret: 'some secret value',
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
// ___________________ ? _______________________

// то есть, если есть авторизация,
//  а это в authRoutes, в POST запросе: req.session.isAuthenticated = true,
// то в variableMiddleware(varMiddleware) мы имеем: res.locals.isAuth = req.session.isAuthenticated;
// соответственно, isAuth = true
// что позволяет скрыть некоторые п. меню до авторизации
app.use(varMiddleware);
// _____________________ ? _____________________
app.use(express.urlencoded({ extended: true }));
// ____________________ req.user = user _________

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
app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addCourseRoutes);
app.use('/card', cardRoutes);
app.use('/order', orderRoutes);
app.use('/auth', authRoutes);

// Start MongoDB
async function start() {
    try {
        await mongoose.connect(MONGODB_URL);
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () =>
            console.log(`Server is running on port ${PORT}`)
        );
    } catch (error) {
        console.log(error);
    }
}
start();
