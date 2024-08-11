const { Router } = require('express');
const Course = require('../models/course');
// Защита роутов (вход через браузер)
const auth = require('../middleware/authMiddleware');

const router = Router();

function mapCartItems(cart) {
    return cart.items.map((item) => ({
        ...item.courseId._doc,
        id: item.courseId.id,
        count: item.count,
    }));
}

function computePrice(courses) {
    return courses.reduce((acc, current) => {
        return (acc += current.price * current.count);
    }, 0);
}
// Добавление курса в корзину
router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    // После того как мы доставали user через req.user,
    // мы применяли к нему такого рода методы:
    // ______ await req.user.addToCart(course);
    // после организации session нам надо его доставать:
    // _______await req.session.user.addToCart(course);
    // но так напрямую не работает, т.к., user, полученный из
    // req.session.user не получен из модели,
    // и метод addToCart не распознает req.session.user. (undefined)
    // поэтому создаем миделваре (userMiddleware.js) где
    // req.user = await User.findById(req.session.user._id);
    // т. е. тот же req.user мы получаем из модели, и тогда это работает
    await req.user.addToCart(course);
    // помним, что у нас есть мидлваре, в котором
    // мы внесли в  req.user юзера

    res.redirect('/card');
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId');
    // console.log('user: ', user);
    const courses = mapCartItems(user.cart);
    // console.log('courses: ', courses);
    const cart = {
        courses,
        price: computePrice(courses),
    };
    console.log('cart.price: ', cart.price);
    res.status(200).json(cart);
});

router.get('/', auth, async (req, res) => {
    const user = await req.user.populate('cart.items.courseId');
    // console.log(user.cart.items);
    const courses = mapCartItems(user.cart);

    res.render('card', {
        title: 'Basket',
        isCard: true,
        courses: courses,
        price: computePrice(courses),
    });
});

module.exports = router;
