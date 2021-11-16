"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const { findAll } = require("./user.js");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function() {
	const newJob = {
		title: "newJob",
		salary: 100000,
		equity: "0.5",
		companyHandle: "c1"
	};

	test("works", async function() {
		let job = await Job.create(newJob);
		expect(job).toEqual({
			...newJob,
			id: expect.any(Number)
		});
	});
});

/************************************** findAll */

describe("findAll", function() {
	test("works: no filter", async function() {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: "j1",
				salary: 100,
				equity: "0.5",
				companyHandle: "c1"
			},
			{
				id: expect.any(Number),
				title: "j2",
				salary: 200,
				equity: "0.75",
				companyHandle: "c2"
			},
			{
				id: expect.any(Number),
				title: "j3",
				salary: 300,
				equity: null,
				companyHandle: "c3"
			}
		]);
	});

	test("works: filter title", async function() {
		let filter = { title: "j1" };
		let jobs = await Job.findAll(filter);
		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: "j1",
				salary: 100,
				equity: "0.5",
				companyHandle: "c1"
			}
		]);
	});

	test("works: filter minSalary", async function() {
		let filter = {
			minSalary: 200
		};

		let jobs = await Job.findAll(filter);

		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: "j2",
				salary: 200,
				equity: "0.75",
				companyHandle: "c2"
			},
			{
				id: expect.any(Number),
				title: "j3",
				salary: 300,
				equity: null,
				companyHandle: "c3"
			}
		]);
	});
	test("works: filter has equity", async function() {
		let filter = {
			hasEquity: true
		};

		let jobs = await Job.findAll(filter);

		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: "j1",
				salary: 100,
				equity: "0.5",
				companyHandle: "c1"
			},
			{
				id: expect.any(Number),
				title: "j2",
				salary: 200,
				equity: "0.75",
				companyHandle: "c2"
			}
		]);
	});
	test("works: if hasEquity is false, filters all jobs regardless of equity", async function() {
		let filter = {
			hasEquity: false
		};

		let jobs = await Job.findAll(filter);

		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: "j1",
				salary: 100,
				equity: "0.5",
				companyHandle: "c1"
			},
			{
				id: expect.any(Number),
				title: "j2",
				salary: 200,
				equity: "0.75",
				companyHandle: "c2"
			},
			{
				id: expect.any(Number),
				title: "j3",
				salary: 300,
				equity: null,
				companyHandle: "c3"
			}
		]);
	});

	test("works: returns NotFoundError if no matching filter criteria", async function() {
		let filter = {
			title: "j1",
			minSalary: 200,
			hasEquity: true
		};

		expect(async () => await Job.findAll(filter).toThrow("No job found matching given filter criteria"));
	});
});

/************************************** get */

describe("get", function() {
	test("works", async function() {
		let job = await Job.get(testJobIds[0]);
		expect(job).toEqual({
			id: expect.any(Number),
			title: "j1",
			salary: 100,
			equity: "0.5",
			companyHandle: "c1"
		});
	});

	test("returns NotFoundError if given nonexistent id", async function() {
		try {
			await Job.get(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe("update", function() {
	let updateData = {
		title: "New",
		salary: 500,
		equity: "0.5"
	};
	test("works", async function() {
		let job = await Job.update(testJobIds[0], updateData);
		expect(job).toEqual({
			id: testJobIds[0],
			companyHandle: "c1",
			...updateData
		});
	});

	test("not found if no such job", async function() {
		try {
			await Job.update(0, {
				title: "test"
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test("bad request with no data", async function() {
		try {
			await Job.update(testJobIds[0], {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** delete */

describe("delete", function() {
	test("works", async function() {
		let result = await Job.remove(testJobIds[0]);
		expect(result).toEqual({
			msg: "job deleted"
		});
	});

	test("returns NotFoundError if given nonexistent id", async function() {
		try {
			await Job.get(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
