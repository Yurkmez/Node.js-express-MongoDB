// Реализация опции защиты роутов, т.е.
// при отсутствии регистрации мы не можем
// через п. меню попасть на страницы редактирования
// курсов, но мы можем это сделать через браузер
// вписав путь к данной странице
module.exports = function (req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/login#login');
    }
    next();
};
