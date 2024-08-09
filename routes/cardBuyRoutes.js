const { Router } = require('express');
const Course = require('../models/course');

const router = Router();

function mapCartItems(cart) {
    return cart.items.map((item) => ({
        ...item.courseId._doc,
        count: item.count,
    }));
}

function computePrice(courses) {
    return courses.reduce((acc, current) => {
        return (acc += current.price * current.count);
    }, 0);
}

router.post('/add', async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    // помним, что у нас есть мидлваре, в котором
    // мы внесли в  req.user юзера

    res.redirect('/card');
});

router.delete('/remove/:id', async (req, res) => {
    const card = await Card.remove(req.params.id);
    res.status(200).json(card);
});

router.get('/', async (req, res) => {
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
