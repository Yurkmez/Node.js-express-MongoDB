const { body } = require('express-validator');

exports.registerValidators = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('name')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 6 characters long'),
    body('password', 'Password must be at least 6 characters long!')
        .isLength({ min: 6, max: 20 })
        .isAlphanumeric(),
    body('confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password must match!');
        }
        return true;
    }),
];
