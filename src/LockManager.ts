import {Lock, ILockOptions, LockReleaseFunction} from './Lock'; // Assuming lock.ts is in the same directory

export class LockManager {
	private locks = new Map<string, Lock>();

	/**
	 * Registers a new lock instance with the manager.
	 * @param lock The lock instance to register.
	 */
	registerLock(lock: Lock): void {
		if (this.locks.has(lock.key)) {
			console.warn(`Lock with key "${lock.key}" already registered.`);
		}
		this.locks.set(lock.key, lock);
	}

	/**
	 * Gets an existing lock instance by its key.
	 * @param key The unique key of the lock.
	 * @returns The lock instance or undefined if not found.
	 */
	getLock(key: string): Lock | undefined {
		return this.locks.get(key);
	}

	/**
	 * Attempts to acquire a lock by its key. If the lock doesn't exist, it will throw an error.
	 * @param key The unique key of the lock.
	 * @param options Optional lock options.
	 * @returns A promise that resolves to a release function, or rejects if it fails.
	 */
	async acquire(key: string, options?: ILockOptions): Promise<LockReleaseFunction> {
		const lock = this.getLock(key);
		if (!lock) {
			throw new Error(`Lock with key "${key}" not registered.`);
		}
		return lock.acquire(options);
	}
}
