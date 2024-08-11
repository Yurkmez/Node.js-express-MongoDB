// res.redirect - instructs the client to redirect to another URL,
// res.render  - generates HTML on the server and delivers it to the client.

const { Router } = require('express');
const Order = require('../models/order');
// Защита роутов (вход через браузер)
const auth = require('../middleware/authMiddleware');

const router = Router();

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id,
        }).populate('user.userId');

        res.render('order', {
            isOrder: true,
            title: 'Order',
            orders: orders.map((item) => {
                return {
                    ...item._doc,
                    price: item.courses.reduce((total, current) => {
                        return (total += current.count * current.course.price);
                    }, 0),
                };
            }),
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.courseId');
        // console.log('user - ', user);
        const courses = user.cart.items.map((item) => ({
            course: { ...item.courseId._doc },
            count: item.count,
        }));
        // console.log('courses - ', courses);

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            courses: courses,
        });

        // console.log('order - ', order);

        await order.save();
        // После заказа очищаем корзину
        await req.user.clearBasket();

        res.redirect('/order');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
