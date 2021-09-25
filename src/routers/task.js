const express = require('express')
const router = new express.Router()
const tasks = require('../controllers/task')
const auth = require('../middleware/auth')

router.route('/')
	.post(auth, tasks.createTask)
	.get(auth, tasks.readTasks)

router.route('/:id')
	.get(auth, tasks.readTask)
	.patch(auth, tasks.updateTask)
	.delete(auth, tasks.deleteTask)

module.exports = router