const express = require('express');
const exphbs = require('express-handlebars');
const homeRouter = require('./routes/homeRoutes');
const coursesRouter = require('./routes/coursesRoutes');
const addCourseRouter = require('./routes/addCourseRoutes');

const app = express();

// ____ handlebars ________________
//
//  Создаем и формируем параметры движка
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});
app.engine('hbs', hbs.engine); // Регистрируем hbs в качестве движка для рендеринга HTML страниц
app.set('view engine', 'hbs'); // Установки по умолчанию: название движка
app.set('views', 'views'); // и директория, в которй будут размещены файлы для рендеринга
// ___________________________________

// Папка "static" определяется как общая для доступа с файлов приложения, в частности, обеспечивает доступ к index.css
app.use(express.static('public'));
// Middleware
app.use(express.urlencoded({ extended: true }));
// Подключение роутов, вынесенных в отдельные модули
app.use('/', homeRouter);
app.use('/courses', coursesRouter);
app.use('/add', addCourseRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
