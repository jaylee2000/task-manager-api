const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect(process.env.MONGODB_URL)
	.then( (result) => {
		console.log('Mongoose connection success')
	})
	.catch( (error) => {
		console.log('Mongoose connection failed', error);
	})
