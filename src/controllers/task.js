const Task = require('../models/task')

module.exports.createTask = async (req, res) => {
	// const task = new Task(req.body);
	const task = new Task({
		...req.body,
		owner: req.user._id
	})
	try {
		await task.save()
		res.status(201).send(task)
	} catch(e) {
		res.status(400).send(e)
	}
}

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=3 	... Get 4~13th results
// GET /tasks?sortBy=createdAt:asc     createdAt:desc
module.exports.readTasks = async (req, res) => {
	const match = {};
	const sort = {};
	
	// req.query.completed is a STRING, not a BOOLEAN
	if(req.query.completed) {
		match.completed = req.query.completed === 'true'
	}
	
	if(req.query.sortBy) {
		const parts = req.query.sortBy.split(':')		
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
	}
	
	try {
		await req.user.populate({
			path: 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit) || 10,
				skip: parseInt(req.query.skip) || 0,
				sort
			}
		})
		res.send(req.user.tasks)
	} catch(e) {
		res.status(500).send()
	}
}

module.exports.readTask = async (req, res) => {
	const {id} = req.params;
	try {
		const task = await Task.findOne({_id: id, owner: req.user._id})
		if(!task) {
			return res.status(404).send()
		}
		res.send(task)
	} catch(e) {
		res.status(500).send()
	}
}

module.exports.updateTask = async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']
	const isValidOperation = updates.every( (update) => allowedUpdates.includes(update))
	
	if(!isValidOperation) {
		return res.status(400).send('Invalid update parameter!')
	}
	
	const { id } = req.params;
	try {
		const task = await Task.findOne({_id: id, owner: req.user._id})
		if(!task) {
			res.status(404).send('Task not found!')
		}
		updates.forEach( (update) => task[update] = req.body[update]);
		await task.save()
		res.send(task)
	} catch(e) {
		res.status(400).send()
	}
}

module.exports.deleteTask = async (req, res) => {
	const {id} = req.params;
	try {
		const task = await Task.findOneAndDelete({_id: id, owner: req.user._id})
		if(!task) {
			return res.status(404).send('Task not found')
		}
		res.send(task)
	} catch(e) {
		res.status(500).send()
	}
}