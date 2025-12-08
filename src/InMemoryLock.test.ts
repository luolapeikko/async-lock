import {describe, expect, it} from 'vitest';
import {InMemoryLock} from './InMemoryLock';

const lock = new InMemoryLock(console);

describe('test hetu', () => {
	describe('test isValidPersonId', () => {
		it('should validate hetu', async () => {
			const release = await lock.acquire('test');
			expect(async () => await release()).not.throw(Error);
		});
		it('should validate hetu', async () => {
			const test1Promise = lock.acquire('test');
			const test2Promise = lock.acquire('test');
			const test1Release = await test1Promise;
			const test2Release = await test2Promise;
			await test1Release();
			await test2Release();
		});
	});
});
