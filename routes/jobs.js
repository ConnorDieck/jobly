"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login, admin
 */

router.post("/", [ensureLoggedIn, ensureIsAdmin], async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, jobNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (err) {
		return next(err);
	}
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function(req, res, next) {
	try {
		// parse ints for minSalary and boolean for hasEquity from query string
		// This must be done conditionally as not to force the filter to have properties not included in the query string
		let filter = {
			...req.query,
			...(req.query.minSalary && { minSalary: parseInt(req.query.minSalary) }),
			...(req.query.hasEquity && { hasEquity: req.query.hasEquity === "true" })
		};

		const validator = jsonschema.validate(filter, jobFilterSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const jobs = await Job.findAll(filter);
		return res.json({ jobs });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  =>  { job }
 *
 *  job should be { title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get("/:id", async function(req, res, next) {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[id] { data } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login, admin
 */

router.patch("/:id", [ensureLoggedIn, ensureIsAdmin], async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, jobUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const job = await Job.update(req.params.id, req.body);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[id]  =>  { msg: "job deleted" }
 *
 * Authorization: login, admin
 */

router.delete("/:id", [ensureLoggedIn, ensureIsAdmin], async function(req, res, next) {
	try {
		const resp = await Job.remove(req.params.id);
		return res.json({ deleted: req.params.id });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
