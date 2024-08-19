const multer = require('multer');

// Определяем, куда и как будут сохраняться файлы
const storage = multer.diskStorage({
    // Ф-ция, определяющая, куда сохранять файл
    destination(req, file, cb) {
        // null - это ошибка, у нас ее нет
        //  images - это директория, куда мы помещаем файл
        cb(null, 'images');
    },
    // Ф-ция, определяющая название создаваемого файла
    filename(req, file, cb) {
        // null - это ошибка, у нас ее нет
        cb(
            null,
            new Date().toISOString().replace(/:/g, '-') +
                '-' +
                file.originalname
        );
    },
});
// Создаем массив тех расширений, который мы допускаем
const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
// Для валидации файлов (cb - это калл-бэк ф-ция)
const fileFilter = (req, file, cb) => {
    // это валидатор, ограничим расширение файлов
    if (allowedTypes.includes(file.mimetype)) {
        // валидация пройдена
        cb(null, true);
    } else {
        // валидация не пройдена и файл мы не загружаем
        cb(null, false);
    }
};
module.exports = multer({
    storage,
    fileFilter,
});
