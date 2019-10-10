var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'websbiz00@gmail.com',
        pass: 'sam$%samsee1%$'
    }
});

module.exports = transporter;