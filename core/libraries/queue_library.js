/**
 * @file Library module for handling the Tebex purchases queue, as they will all be periodically pushed to Akaunting.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

let CurrentQueueData = {"ToBeProcessedPayments": {}, "AlreadyProcessedPayments": {}};

module.exports = {
	NewQueueEntry(queue, identifier, data) {
		CurrentQueueData[queue][identifier] = data;
	},
	DoesQueueEntryExist(queue, identifier) {
		if (CurrentQueueData[queue][identifier] != null) {
			return true;
		} else {
			return false;
		}
	},
	RemoveQueueEntry(queue, identifier) {
		CurrentQueueData[queue][identifier] = null;
	},
	ClearQueueEntries(queue) {
		CurrentQueueData[queue] = null;
	},
	FetchQueueEntries(queue) {
		return CurrentQueueData[queue][identifier];
	}
}