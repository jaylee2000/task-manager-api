const express = require('express')
const router = new express.Router()
const users = require('../controllers/user')
const auth = require('../middleware/auth')
const multer = require('multer')

const _1MB = 1000000
const upload = multer({
	limits: {
		fileSize: _1MB
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload an image'))
		}
		cb(undefined, true)
	}
})

const handleError = (error, req, res, next) => {
	res.status(400).send({error: error.message})
}

router.route('/')
	.post(users.createUser)

router.route('/me')
	.get(auth, users.readMyProfile)
	.delete(auth, users.deleteUser)
	.patch(auth, users.updateUser)

router.route('/me/avatar')
	.post(auth, upload.single('avatar'), users.uploadAvatar, handleError)
	.delete(auth, users.deleteAvatar)

router.route('/:id/avatar')
	.get(users.getAvatar)

router.route('/login')
	.post(users.loginUser)

router.route('/logout')
	.post(auth, users.logoutUser)

router.route('/logoutAll')
	.post(auth, users.logoutAll)

module.exports = router