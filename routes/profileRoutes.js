const { Router } = require('express');
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');

const router = Router();

router.get('/', auth, async (req, res) => {
    res.render('profile', {
        title: 'Profile',
        isProfile: true,
        user: req.user.toObject(),
    });
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const userChange = { name: req.body.name };

        if (req.file) {
            userChange.avatarUrl = req.file.path;
        }

        Object.assign(user, userChange);
        await user.save();
        res.redirect('/profile');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
