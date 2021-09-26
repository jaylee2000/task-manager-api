const User = require('../models/user')
const sharp = require('sharp')
const {sendWelcomeEmail, sendFarewellEmail} = require('../emails/account')


module.exports.createUser = async (req, res) => {
	const user = new User(req.body);
	try {
		sendWelcomeEmail(user.email, user.name)
		const token = await user.generateAuthToken();
		await user.save()
		// user.save() is called in generateAuthToken()
		res.status(201).send({user, token});
	} catch(e) {
		res.status(400).send(e);
	}
}

module.exports.readMyProfile = async (req, res) => {
	res.send(req.user)
}

module.exports.updateUser = async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password', 'age']
	const isValidOperation = updates.every( (update) => allowedUpdates.includes(update))

	if(!isValidOperation) {
		return res.status(400).send({error: 'Invalid updates!'})
	}

	const id = req.user._id;
	try {
		updates.forEach( (update) => req.user[update] = req.body[update])
		await req.user.save()
		res.send(req.user)
	} catch(e) {
		res.status(400).send()
	}
}

module.exports.deleteUser = async (req, res) => {
	const id = req.user._id;
	try {
		sendFarewellEmail(req.user.email, req.user.name)
		await req.user.remove()
		res.send(req.user)
	} catch(e) {
		res.status(500).send()
	}
}

module.exports.loginUser = async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send( {user, token} )
	} catch(e) {
		res.status(400).send()
	}
}

module.exports.logoutUser = async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter( (token) => {
			return token.token !== req.token
		})
		await req.user.save()
		res.send()
	} catch(e) {
		res.status(500).send()
	}
}

module.exports.logoutAll = async (req, res) => {
	try {
		req.user.tokens.splice(0, req.user.tokens.length)
		req.user.save()
		res.send()
	} catch(e) {
		res.status(500).send()
	}
}

module.exports.uploadAvatar = async (req, res) => {
	// req.user.avatar = req.file.buffer
	const buffer = await sharp(req.file.buffer)
						.resize({width: 250, height: 250})
						.png()
						.toBuffer()
	req.user.avatar = buffer
	await req.user.save()
	res.send()
}

module.exports.deleteAvatar = async (req, res) => {
	req.user.avatar = undefined
	await req.user.save()
	res.send()
}

module.exports.getAvatar = async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user || !user.avatar) {
			throw new Error()
		}
		res.set('Content-Type', 'image/png')
		res.send(user.avatar)
	} catch (e) {
		res.status(404).send()
	}
}