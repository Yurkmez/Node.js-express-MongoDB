const User = require('../models/user');
const { body } = require('express-validator');

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('There is already such an email');
                }
            } catch (error) {
                console.log(error);
            }
        })
        .normalizeEmail(),
    body('name')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 6 characters long')
        .trim(),
    body('password', 'Password must be at least 6 characters long!')
        .isLength({ min: 6, max: 20 })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password must match!');
            }
            return true;
        })
        .trim(),
];
exports.loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password', 'Password must be at least 6 characters long!')
        .isLength({ min: 6, max: 20 })
        .isAlphanumeric()
        .trim(),
];

exports.courseValidators = [
    body('title')
        .isLength({ min: 3 })
        .withMessage('Name course must contein at least 3 characters')
        .trim(),
    body('price').isNumeric().withMessage('Enter correct price'),
    body('img', 'Enter correct url picture').isURL(),
];
