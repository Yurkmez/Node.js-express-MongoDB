const keys = require('../keys');

module.exports = function (email) {
    return {
        from: keys.EMAIL_FROM,
        to: email,
        subject: 'Account created',
        html: `
        <h3>Welcome to app Courses!</h3>
        <p> You create account with email: ${email}</p>
        <hr/>
        <a href = '${keys.BASE_URL}'>Course store</a>
        `,
    };
};
