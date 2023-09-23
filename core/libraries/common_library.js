/**
 * @file Library module for holding all commonly used functions that might be useful.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

module.exports = {
	GetCurrentDateYYYYMMDD() {
		const currentDate = new Date();

		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1 and pad with 0 if needed
		const day = String(currentDate.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	},
	GetUUIDv4() {
		const { v4: uuidv4 } = require('uuid');

		return uuidv4();
	}
}