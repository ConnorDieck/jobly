"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u2Token,
	adminToken,
	testJobIds
} = require("./_testCommon");
const { BadRequestError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function() {
	const newJob = {
		title: "new",
		salary: 1000,
		equity: "0.5",
		companyHandle: "c1"
	};

	test("works for admin", async function() {
		const resp = await request(app).post("/jobs").send(newJob).set("authorization", `Bearer ${adminToken}`);
		console.log(resp.error);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: {
				title: "new",
				id: expect.any(Number),
				salary: 1000,
				equity: "0.5",
				companyHandle: "c1"
			}
		});
	});

	test("doesn't work for normal user", async function() {
		const resp = await request(app).post("/jobs").send(newJob).set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("doesn't work with empty data", async function() {
		const resp = await request(app).post("/jobs").send({}).set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("doesn't work with wrong data", async function() {
		const resp = await request(app)
			.post("/jobs")
			.send({ ...newJob, wrongKey: "wrong value" })
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /jobs */

describe("GET /jobs", function() {
	test("ok for anon", async function() {
		const resp = await request(app).get("/jobs");
		expect(resp.body).toEqual({
			jobs: [
				{
					title: "j1",
					id: expect.any(Number),
					salary: 100,
					equity: "0.1",
					companyHandle: "c1"
				},
				{
					title: "j2",
					id: expect.any(Number),
					salary: 200,
					equity: "0.2",
					companyHandle: "c2"
				},
				{
					title: "j3",
					id: expect.any(Number),
					salary: 300,
					equity: "0.3",
					companyHandle: "c3"
				}
			]
		});
	});
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function() {
	test("works for admin", async function() {
		const resp = await request(app).get(`/jobs/${testJobIds[0]}`).set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			job: {
				title: "j1",
				id: expect.any(Number),
				salary: 100,
				equity: "0.1",
				companyHandle: "c1"
			}
		});
	});

	test("works for anon", async function() {
		const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
		expect(resp.body).toEqual({
			job: {
				title: "j1",
				id: expect.any(Number),
				salary: 100,
				equity: "0.1",
				companyHandle: "c1"
			}
		});
	});

	test("not found for no such company", async function() {
		const resp = await request(app).get(`/jobs/0`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** UPDATE /jobs/:id */

describe("PATCH /jobs/:id", function() {
	test("ok for admin", async function() {
		const data = {
			salary: 999
		};
		const resp = await request(app)
			.patch(`/jobs/${testJobIds[0]}`)
			.send(data)
			.set("authorization", `Bearer ${adminToken}`);

		expect(resp.statusCode).toEqual(200);
		expect(resp.body).toEqual({
			job: {
				title: "j1",
				id: expect.any(Number),
				salary: 999,
				equity: "0.1",
				companyHandle: "c1"
			}
		});
	});
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function() {
	test("works for admins", async function() {
		const resp = await request(app).delete(`/jobs/${testJobIds[0]}`).set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: `${testJobIds[0]}` });
	});

	test("unauth for anon", async function() {
		const resp = await request(app).delete(`/jobs/${testJobIds[0]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for non admin users", async function() {
		const resp = await request(app).delete(`/jobs/${testJobIds[0]}`).set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found for no such company", async function() {
		const resp = await request(app).delete(`/jobs/0`).set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});
