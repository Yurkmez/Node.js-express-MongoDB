const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                },
            },
        ],
    },
});

// Создаем метод добавления курса
// ! - обязательно через "function",
// чтобы была возможность использования "this"
userSchema.methods.addToCart = function (course) {
    // создаем новый массив в виде копии массива курсов
    //  у полученного курсаи, т.к.
    // используем спреад оператор, то
    // исходный массив мы не мутируем
    const cloneItems = [...this.cart.items];
    // console.log(cloneItems);
    const idx = cloneItems.findIndex((aaa) => {
        // т.к. courseId - объект, то ".toString()"
        return aaa.courseId.toString() === course._id.toString();
    });
    // console.log(idx);
    // Если такой курс есть "++", нет (idx = -1) - добавляем новый курс
    // ! - idx это не индекс, который присваивается базой даннных, а
    // а индекс элемента, т.е. 0, 1, 2, ...
    if (idx >= 0) {
        cloneItems[idx].count += 1;
    } else {
        cloneItems.push({
            courseId: course._id,
            count: 1,
        });
    }
    const newCart = { items: cloneItems };
    // В newCart полностью новый объект items: [...]
    // console.log(newCart);
    this.cart = newCart;
    // _______ либо в одну строку
    // this.cart = { items: newCart };
    return this.save();
};

userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items];
    const idx = items.findIndex(
        (item) => item.courseId.toString() === id.toString()
    );

    if (items[idx].count === 1) {
        items = items.filter(
            (item) => item.courseId.toString() !== id.toString()
        );
    } else {
        items[idx].count--;
    }
    this.cart = { items };
    return this.save();
};

module.exports = model('User', userSchema);
