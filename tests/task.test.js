const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOneId, userOne, setupDatabase,
	  userTwoId, userTwo,
	  taskOne, taskTwo, taskThree} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'From my test'
		})
		.expect(201)
	const task = await Task.findById({_id: response.body._id})
	expect(task).not.toBeNull()
	expect(task.completed).toEqual(false)
})

test('Should get two tasks from userOne', async () => {
	const tasks = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
	
	expect(tasks.body.length).toEqual(2)
})

test('Should be unable to delete task of other user', async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404)
	
	const theTask = await Task.findById(taskOne._id)
	expect(theTask).toMatchObject(taskOne)
})

test('Should sort tasks by createdAt', async () => {
	const userOneTasksAsc = await request(app)
		.get('/tasks?sortBy=createdAt:asc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
	
	const t1 = userOneTasksAsc.body[0].createdAt
	const t2 = userOneTasksAsc.body[1].createdAt
	const x = t1 <= t2
	expect(x).toBe(true)
	
	const userOneTasksDesc = await request(app)
		.get('/tasks?sortBy=createdAt:desc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
	
	const t3 = userOneTasksDesc.body[0].createdAt
	const t4 = userOneTasksDesc.body[1].createdAt
	const y = t3 >= t4
	expect(y).toBe(true)
})

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks