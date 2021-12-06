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
        subject: `Regarding Update on your ${store.sensorName} Sensor`,
        html: ` <h3> Dear ${store.userName} </h3>
                <h3>
                Your Sensor Located at ${store.geolocation} has crossed the threshold value.
                </h3>
                <p> Your Threshold Value is <b>${store.minThreshold}</b> </p>
                <p> Your current sensor value is <b>${store.currentData}</b> </p>
                <br>
                <p>Regards</p>
                <p> Admin IoT Web Portal</p>
                <br>
                <p> <b> Note: </b> This is an auto-generated mail. DO NOT REPLY </p>
              `
       // text: `
       //      Dear ${store.userName}
       //      Your ${store.sensorName} Sensor Located at ${store.geolocation} has crossed the threshold value.
       //      Your Threshold Value is ${store.minThreshold}.
       //      Your Current Sensor Value is ${store.currentData}.

       //      Regards
       //      Admin IoT Web Portal

       //      Note: This is an auto-generated mail. DO NOT REPLY.
       //      `
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