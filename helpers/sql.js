const { BadRequestError } = require("../expressError");

// sqlForPartialUpdate takes a JS object and updates given keys to match SQL column formatting. Instructions for which keys to update and how are passed in with the second parameter, jsToSql.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError("No data");

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);

	return {
		setCols: cols.join(", "),
		values: Object.values(dataToUpdate)
	};
}

module.exports = { sqlForPartialUpdate };
