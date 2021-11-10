const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function() {
	const dataToUpdate = {
		firstName: "test1",
		age: 32
	};

	const noDataToUpdate = {};

	const jsToSql = {
		firstName: "first_name"
	};

	test("Returns arrays of columns and values for SQL when given data to update", function() {
		const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);

		expect(setCols).toEqual(`"first_name"=$1, "age"=$2`);
		expect(values).toEqual(["test1", 32]);
	});

	test("Returns an error when given no data to update", function() {
		expect(() => sqlForPartialUpdate(noDataToUpdate, jsToSql)).toThrow("No data");
	});
});
