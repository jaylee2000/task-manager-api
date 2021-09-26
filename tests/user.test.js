const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')
const mongoose = require('mongoose')

beforeEach(setupDatabase)

test('Should sign up a new user', async () => {
	const response = await request(app).post('/users').send({
		name: 'Andrew',
		email: 'andrew@example.com',
		password: 'MyPass777!'
	}).expect(201)
	
	// Assert that the database was changed correctly
	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()
	
	// Assertions about the response
	expect(response.body).toMatchObject({
		user: {
			name: 'Andrew',
			email: 'andrew@example.com'
		},
		token: user.tokens[0].token
	})
	
	// Assert that password isn't stored in plain text
	expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
	const response = await request(app).post('/users/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200)
	
	const user = await User.findById({_id: response.body.user._id})
	expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login nonexistent user', async() => {
	await request(app).post('/users/login').send({
		email: 'notexist@example.com',
		password: 'nopassword!!'
	}).expect(400)
})

test('Should get profile for user', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401)
})

test('Should delete account for user', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
	
	const user = await User.findById({_id: userOneId})
	expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401)
})

test('Should upload avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200)
	// Assert that the uploaded image is of type Buffer
	const user = await User.findById(userOneId)
	expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Johnson'
		})
		.expect(200)
	
	const user = await User.findById(userOneId)
	expect(user.name).toBe('Johnson')
})

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			location: 'Maryland'
		})
		.expect(400)
})

test('Should not signup user with invalid email', async () => {
	const _id = mongoose.Types.ObjectId()
	await request(app)
		.post('/users')
		.send({
			_id,
			name: 'Minamino',
			email: 'asdfkj@',
			password: 'dfkjskdj1212!!'
		})
		.expect(400)
	const user = await User.findById(_id)
	expect(user).toBe(null)
})

test('Should not signup user with invalid password', async () => {
	const _id = mongoose.Types.ObjectId()
	await request(app)
		.post('/users')
		.send({
			_id,
			name: 'NabyKeita',
			email: 'asdfkj@example.com',
			password: 'password'
		})
		.expect(400)
	const user = await User.findById(_id)
	expect(user).toBe(null)
})

test('Should not update user if unauthenticated', async () => {
	await request(app)
		.patch('/users/me')
		.send({
			name: 'Jackson'
		})
		.expect(401)
})

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated