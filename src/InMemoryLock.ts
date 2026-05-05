import type {ILoggerLike} from '@avanio/logger-like';
import {Mutex} from 'async-mutex';
import {Lock, type LockReleaseFunction} from './Lock';

export class InMemoryLock extends Lock {
	private locks = new Map<string, Mutex>();

	public constructor(logger?: ILoggerLike) {
		super(logger);
	}

	protected buildAcquireCb(key: string): Promise<LockReleaseFunction> {
		let mutex = this.locks.get(key);
		if (!mutex) {
			mutex = new Mutex();
			this.locks.set(key, mutex);
			this?.logger?.debug(`Acquiring Mutex lock for key "${key}" (create)`);
		} else {
			this?.logger?.debug(`Acquiring Mutex lock for key "${key}" (current)`);
		}
		return mutex.acquire();
	}

	protected async releaseInternal(_key: string, releaseCb: LockReleaseFunction): Promise<void> {
		await releaseCb();
	}

	protected async releaseTimeout(_key: string, releaseCb: LockReleaseFunction, _err: Error): Promise<void> {
		await releaseCb();
	}
}
