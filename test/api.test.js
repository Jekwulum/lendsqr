require('dotenv').config();
const test = require('supertest');
const server = require('../app');

const apiRoute = `/apis/${process.env.VERSION}/`;

/** 
 * Testing all users endpoints
 */

describe('API tests', () => {

    let token = "";

    before((done) => {
        test(server)
            .post(`${apiRoute}/login`)
            .send({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD
            })
            .end((err, res) => {
                token = res.body.data[0].token;
                done();
            });
    });

    it('responds with a list of all users containing a list of all users',
        (done) => {
            test(server)
                .get(`${apiRoute}/users`)
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

    it('should be able to get a particular user',
        (done) => {
            test(server)
                .get(`${apiRoute}/users/${process.env.ADMIN_EMAIL}`)
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

    it('should be able to create a user',
        (done) => {
            test(server)
                .post(`${apiRoute}/users/`)
                .send({
                    first_name: "Phil",
                    last_name: "Dexter",
                    email: "phil@dexter.com",
                    password: "pass001",
                    confirmPassword: "pass001",
                    transaction_pin: 1233,
                    amount: 10000
                })
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(201, done);
        });

    it("should be able to update a user account's details",
        (done) => {
            test(server)
                .put(`${apiRoute}/users/${process.env.ADMIN_EMAIL}`)
                .send({
                    first_name: "admin",
                })
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(201, done);
        });

    it("should be able to delete a user's account",
        (done) => {
            test(server)
                .delete(`${apiRoute}/users/phil@dexter.com`)
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

    it('should be able to transfer funds',
        (done) => {
            test(server)
                .put(`${apiRoute}/funds/transfer-funds`)
                .send({
                    sender_acct_no: 924736217,
                    receiver_acct_no: 901438838,
                    amount: 10,
                    transaction_pin: 2222
                })
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    it('should be able to fund account',
        (done) => {
            test(server)
                .put(`${apiRoute}/funds/fund-acct`)
                .send({
                    receiver_acct_no: 901438838,
                    amount: 10,
                    transaction_pin: 2222
                })
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    it('should be able to withdraw from account',
        (done) => {
            test(server)
                .put(`${apiRoute}/funds/withdraw`)
                .send({
                    acct_no: 901438838,
                    amount: 10,
                    transaction_pin: 2222
                })
                .set('Accept', 'application/json')
                .set("authorization", token)
                .set("x-access-token", token)
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
});