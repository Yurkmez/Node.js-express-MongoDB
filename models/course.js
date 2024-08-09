const { Schema, model } = require('mongoose');

const courseSchema = new Schema({
    title: {
        type: String,
        // ниже требование обязательности данного поля
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    img: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    // поле id мы не указываем,
    // оно будет создаваться mongoose автоматически
});

// В приложении есть путаница _id и id,
// данный метод это решает
// и необходимы изменения в функции mapCartItems (cardByRuters.js)
courseSchema.method('toClient', function () {
    const course = this.toObject();
    course.id = course._id;
    delete course._id;
    return course;
});

// Экспортируе название модели - 'Course' и схему - course
module.exports = model('Course', courseSchema);
