const { Schema, model } = require('mongoose');

const course = new Schema({
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

// Экспортируе название модели - 'Course' и схему - course
module.exports = model('Course', course);
