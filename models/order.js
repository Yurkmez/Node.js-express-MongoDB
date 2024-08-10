const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    courses: [
        {
            course: {
                type: Object,
                require: true,
            },
            count: {
                type: Number,
                require: true,
            },
        },
    ],
    user: {
        name: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            require: true,
        },
    },
    date: {
        type: Date,
        default: Date.new,
    },
});

module.exports = model('Order', orderSchema);
