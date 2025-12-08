import {InMemoryLock} from './InMemoryLock';
import {LockManager} from './LockManager';

async function main() {
	const lockManager = new LockManager();

	// Register different types of locks
	lockManager.registerLock(new InMemoryLock('user:123'));
	lockManager.registerLock(new InMemoryLock('group:456'));
	lockManager.registerLock(new InMemoryLock('resource:abc', 10000)); // Custom default timeout

	// Attempt to acquire a user lock
	let releaseUserLock: (() => Promise<void>) | undefined;
	try {
		console.log('Attempting to acquire user lock...');
		releaseUserLock = await lockManager.acquire('user:123', {timeoutMs: 5000});
		console.log('User lock acquired.');

		// Simulate some work
		await new Promise((resolve) => setTimeout(resolve, 3000));
	} catch (error) {
		console.error('Error acquiring user lock:', error);
	} finally {
		if (releaseUserLock) {
			console.log('Releasing user lock...');
			await releaseUserLock();
			console.log('User lock released.');
		}
	}

	// Attempt to acquire the same user lock again
	let releaseUserLockAgain: (() => Promise<void>) | undefined;
	try {
		console.log('\nAttempting to acquire user lock again...');
		releaseUserLockAgain = await lockManager.acquire('user:123', {timeoutMs: 2000});
		console.log('User lock acquired again.');
	} catch (error) {
		console.error('Error acquiring user lock again:', error);
	} finally {
		if (releaseUserLockAgain) {
			await releaseUserLockAgain();
		}
	}

	// Demonstrate lock timeout
	let releaseGroupLock: (() => Promise<void>) | undefined;
	try {
		console.log('\nAttempting to acquire group lock...');
		releaseGroupLock = await lockManager.acquire('group:456', {timeoutMs: 1000});
		console.log('Group lock acquired.');

		// Simulate work longer than the timeout
		await new Promise((resolve) => setTimeout(resolve, 2000));
	} catch (error) {
		console.error('Error acquiring group lock:', error);
	} finally {
		if (releaseGroupLock) {
			console.log('Releasing group lock...'); // This might not be reached if timeout occurs first
			await releaseGroupLock();
			console.log('Group lock released.');
		}
	}

	// Demonstrate trying to acquire an already held lock
	const resourceLockInstance = lockManager.getLock('resource:abc') as InMemoryLock | undefined; // Type assertion for example
	let releaseResourceLock: (() => Promise<void>) | undefined;
	if (resourceLockInstance) {
		try {
			console.log('\nAttempting to acquire resource lock...');
			releaseResourceLock = await lockManager.acquire('resource:abc');
			console.log('Resource lock acquired.');

			let releaseResourceLockAgain: (() => Promise<void>) | undefined;
			try {
				console.log('Attempting to acquire resource lock again (should fail)...');
				releaseResourceLockAgain = await lockManager.acquire('resource:abc', {timeoutMs: 1000});
				console.log('Resource lock acquired again (unexpected!).');
				if (releaseResourceLockAgain) {
					await releaseResourceLockAgain();
				}
			} catch (error) {
				console.error('Error acquiring resource lock again (expected):', error);
			}
		} catch (error) {
			console.error('Error acquiring resource lock:', error);
		} finally {
			if (releaseResourceLock) {
				console.log('Releasing resource lock...');
				await releaseResourceLock();
				console.log('Resource lock released.');
			}
		}
	}
}

main().catch(console.error);
