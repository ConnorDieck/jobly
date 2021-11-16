"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs */

class Job {
	/** Create a job (from data), update db, return new job data.
     * 
     * data should be { title, salary, equity, company_handle }
     * 
     * Returns data { id, title, salary, equity, company_handle }
     * 
     * Throws BadRequesteError if job already in database.
     */

	static async create({ title, salary, equity, companyHandle }) {
		const result = await db.query(
			`INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[title, salary, equity, companyHandle]
		);
		const job = result.rows[0];

		return job;
	}

	/** Find all jobs.
     * 
     * Returns [{id, title, salary, equity, companyHandle}, ...]
     */

	static async findAll(filter) {
		let jobsRes = {};

		if (!filter || Object.keys(filter).length === 0) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs`
			);

			return jobsRes.rows;
		}

		const { title, minSalary, hasEquity } = filter;

		if (title && !minSalary && !hasEquity) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs
               WHERE title = $1`,
				[title]
			);
		} else if (title && minSalary && !hasEquity) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs
               WHERE title = $1 AND salary >= $2`,
				[title, minSalary]
			);
		} else if (title && minSalary && hasEquity) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs
               WHERE title = $1 AND salary >= $2 AND equity IS NOT NULL`,
				[title, minSalary]
			);
		} else if (!title && minSalary && hasEquity) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs
               WHERE salary >= $1 AND equity IS NOT NULL`,
				[minSalary]
			);
		} else if (!title && minSalary && !hasEquity) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs
               WHERE salary >= $1`,
				[minSalary]
			);
		} else if (!title && !minSalary && hasEquity) {
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs
               WHERE equity IS NOT NULL`
			);
		} else {
			// This is required if a filter is passed through only saying that hasEquity is false. Will return same result as if no filter was passed
			jobsRes = await db.query(
				`SELECT id,
                       title,
                       salary,
                       equity,
                       company_handle AS "companyHandle"
               FROM jobs`
			);
		}

		if (jobsRes.rows[0] === {}) throw new NotFoundError("No job found matching given filter criteria");

		return jobsRes.rows;
	}

	/** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
			[id]
		);

		const job = jobRes.rows[0];

		if (!job) throw new NotFoundError(`No job with id: ${id}`);

		return job;
	}

	/** Update a job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

	static async update(id, data) {
		// sqlForPartialUpdate returns the columns of the data object in SQL update syntax (e.g. col1=$1) and the associated values as an array to be placed into a db query
		const { setCols, values } = sqlForPartialUpdate(data, {});

		// id will be located at the end of array of values passed in to be updated
		const idIdx = "$" + (values.length + 1);

		const result = await db.query(
			`
                  UPDATE jobs 
                  SET ${setCols} 
                  WHERE id = ${idIdx} 
                  RETURNING id, 
                            title, 
                            salary, 
                            equity,
                            company_handle AS "companyHandle"`,
			[...values, id]
		);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Given a job id, delete the job if it exists
   *
   * Returns { msg: "job deleted" }
   *
   * Throws NotFoundError if not found.
   **/

	static async remove(id) {
		const jobRes = await db.query(
			`DELETE 
            FROM jobs
            WHERE id = $1
            RETURNING id`,
			[id]
		);

		const job = jobRes.rows[0];

		if (!job) throw new NotFoundError(`No job with id: ${id}`);

		return { msg: "job deleted" };
	}
}

module.exports = Job;
