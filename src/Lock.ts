import {ILoggerLike} from '@avanio/logger-like';

/**
 * Options for acquiring a lock.
 * @since v0.0.1
 */
export interface ILockOptions {
	timeoutMs?: number; // Lock timeout in milliseconds
}

export type LockReleaseFunction = () => Promise<void> | void;

/**
 * Represents a generic lock. Implementations should extend this class.
 * @since v0.0.1
 */
export abstract class Lock {
	private timeoutMap = new Map<LockReleaseFunction, NodeJS.Timeout>();
	protected logger: ILoggerLike | undefined;
	protected defaultTimeoutMs: number;
	public constructor(logger?: ILoggerLike, defaultTimeoutMs = 30000) {
		this.logger = logger;
		this.defaultTimeoutMs = defaultTimeoutMs;
	}

	public async acquire(key: string, options?: ILockOptions): Promise<LockReleaseFunction> {
		this.logger?.debug(`Acquiring lock for key "${key}"`);
		const releaser = await this.buildAcquireCb(key);
		this.startTimeout(key, releaser, options?.timeoutMs ?? this.defaultTimeoutMs);
		return async () => {
			this.clearTimeout(key, releaser); // clear old timeout
			await releaser();
			this.logger?.debug(`Releasing lock for key "${key}"`);
		};
	}

	/**
	 * Sets a timeout for the lock. If not released before the timeout, it will be automatically released.
	 * @param {string} key - The key of the lock
	 * @param {LockReleaseFunction} releaseCallback - The callback to release the lock
	 * @param {number} timeoutMs The timeout in milliseconds.
	 */
	private startTimeout(key: string, releaseCallback: LockReleaseFunction, timeoutMs: number): void {
		this.logger?.debug(`Starting lock timeout for key "${key}" with timeout ${timeoutMs}ms`);
		this.clearTimeout(key, releaseCallback);
		this.timeoutMap.set(
			releaseCallback,
			setTimeout(async () => {
				await this.releaseTimeout(key, releaseCallback, new Error('Lock timeout'));
				this.clearTimeout(key, releaseCallback);
			}, timeoutMs),
		);
	}

	/**
	 * Clears the lock timeout.
	 * @param {string} key - The key of the lock
	 */
	private clearTimeout(key: string, releaseCallback: LockReleaseFunction): void {
		const existingTimeout = this.timeoutMap.get(releaseCallback);
		if (existingTimeout) {
			this.logger?.debug(`Clearing lock timeout for key "${key}"`);
			clearTimeout(existingTimeout);
			this.timeoutMap.delete(releaseCallback);
		}
	}

	/**
	 * Internal method to release the lock and update status. To be implemented by subclasses.
	 */
	protected abstract releaseInternal(key: string, releaseCallback: LockReleaseFunction): void | Promise<void>;

	protected abstract buildAcquireCb(key: string): LockReleaseFunction | Promise<LockReleaseFunction>;

	/**
	 * Handles the timeout for the lock.
	 */
	protected abstract releaseTimeout(key: string, releaseCallback: LockReleaseFunction, err: Error): void | Promise<void>;
}
