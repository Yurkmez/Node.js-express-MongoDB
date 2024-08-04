const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

// ____ handlebars ________________
//  Создаем и формируем параметры движка
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});
app.engine('hbs', hbs.engine); // Регистрируем hbs в качестве движка для рендеринга HTML страниц
app.set('view engine', 'hbs'); // Установки по умолчанию: название движка
app.set('views', 'views'); // и директория, в которй будут размещены файлы для рендеринга
// ___________________________________

// Папка "static" определяется как общая для доступа с файлов приложения
// в частности, обеспечивает доступ к index.css
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home',
        isHome: true,
    }); // Здесь мы просто указываем название файла, т.к. выше мы указали директорию views в параметрах по умолчанию
});
app.get('/courses', (req, res) => {
    res.render('courses', {
        title: 'Courses',
        isCourses: true,
    }); // - " -
});
app.get('/add', (req, res) => {
    res.render('addCourse', {
        title: 'Add course',
        isAddCourse: true,
    }); // - " -
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
