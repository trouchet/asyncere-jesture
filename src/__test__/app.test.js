import request from 'supertest';

import app from '../app.js';
import { errorHandler } from '../middlewares.js';
import users from '../database.js';
import { fixtures } from './fixtures.js';

const new_user = fixtures.new_user;
const inexistent_update_user = fixtures.inexistent_update_user;
const existent_update_user = fixtures.existent_update_user;

/**
 * Mocked Express Request object.
 */
let req

/**
 * Mocked Express Response object.
 */
let res

/**
 * Mocked Express Next function.
 */
const next = jest.fn()

describe('API testing', () => {
    /**
     * Reset the `req` and `res` object before each test is ran.
     */
    beforeEach(() => {
        req = {
          params: {},
          body: {}
        }

        res = {
          data: null,
          code: null,
          status (status) {
            this.code = status
            return this
          },
          send (payload) {
            this.data = payload
          }
        }

        next.mockClear()
    })

    it('Get all users', async () => {
        const expectedResponse = users;

        const response = await request(app).get('/users');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expectedResponse)
    })

    it('Create a user', async () => {
        const expectedResponse = [
            ...users, new_user
        ]

        const response = await request(app).post('/users').send(new_user);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expectedResponse)
    })

    it('Get user by id', async () => {
        const expectedResponse = users[0]

        const response = await request(app).get('/users/42')

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expectedResponse)

    })

    it('Update an existent user', async () => {
        const expectedResponse = existent_update_user

        const response = await request(app)
                                .put('/users/42')
                                .send(existent_update_user)

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expectedResponse)
    })

    it('Update an inexistent user', async () => {
        const expectedResponse = {
            message: 'No user found with given ID'
        }

        const response = await request(app)
                                .put('/users/2')
                                .send(inexistent_update_user);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expectedResponse)
    })

    it('Get user which does not exists', async () => {
        const expectedResponse = {
            message: 'No user found with given ID'
        }

        const response = await request(app).get('/users/2')

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expectedResponse)
    })

    it('Handle error for error handler middleware', () => {
        errorHandler(
            {
                status: 500,
                message: 'Fire!'
            }, req, res, next
        )

        expect(res.code).toBeDefined()
        expect(res.code).toBe(500)

        expect(res.data).toBeDefined()
        expect(res.data).toBe('Fire!')
    })
})
