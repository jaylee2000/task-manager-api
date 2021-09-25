const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'jaylee2000@snu.ac.kr',
		subject: 'Thanks for joining in!',
		text: `Welcome to the app, ${name}! Let me know how you get along with the app.`
	})
}

const sendFarewellEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'jaylee2000@snu.ac.kr',
		subject: 'Farewell!',
		text: `I'm sorry you had to leave, ${name}. We would be grateful if you could answer some our survey at https://www.fakesurvey.com`
	})
}

module.exports = {
	sendWelcomeEmail, sendFarewellEmail
}