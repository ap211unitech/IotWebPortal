require('dotenv').config();

const nodemailer = require("nodemailer");
const password = process.env.PASSWORD


const sendEmail = (store) => {
    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'iitj.iotwebportal@gmail.com',
                pass: password
            }
        }
    )
    const mailOptions = {
        from: 'iitj.iotwebportal@gmail.com',
        to: store.to,
        subject: `Regarding Update of Sensor ${store.geolocation}`,
        text: `Message from 'req.body.email' from your portfolio\nreq.body.message`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // res.send('Error');
            console.log(error);
            return;
        }
        console.log(info.response);
    })
}

module.exports = sendEmail;