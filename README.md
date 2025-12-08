# Finnish Person ID Check

![github action](https://github.com/mharj/hetu/actions/workflows/main.yml/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/3dca350166c6d1ea4105/maintainability)](https://codeclimate.com/github/mharj/hetu/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3dca350166c6d1ea4105/test_coverage)](https://codeclimate.com/github/mharj/hetu/test_coverage)

## Overview

This module provides functions to validate Finnish person IDs (Henkilötunnus) and determine the gender based on the ID. A valid Finnish person ID consists of 11 characters in the format `DDMMYYCZZZQ`, where:

- `DDMMYY` represents the date of birth.
- `C` is the century sign ('+' for 1800s, '-' for 1900s, 'A' for 2000s).
- `ZZZ` is an individual number (odd numbers are males, even numbers are females).
- `Q` is a checksum character.

## Installation

To install the module, run the following command:

```bash
npm install fi-pin
```

or direct import from unpkg (i.e., on a web page):

```typescript
import {isValidPersonId, isMale, isFemale} from 'https://unpkg.com/fi-pin@latest/dist/index.mjs';
```

## Usage

```typescript
const personId = '131052-308T';

if (isValidPersonId(personId)) {
	console.log('male', isMale(personId));
	console.log('female', isFemale(personId));
}

// functions can also be extended with branded types to narrow down the type guard of the personId (as example with zod BRAND)
if (isValidPersonId<z.BRAND<'PersonID'>>(personId)) {
	// personId is typed as: string & z.BRAND<'PersonID'>
	if (isMale<z.BRAND<'MalePersonID'>>(personId)) {
		// personId is typed as: string & z.BRAND<'PersonID'> & z.BRAND<'MalePersonID'>
	}
	if (isFemale<z.BRAND<'FemalePersonID'>>(personId)) {
		// personId is typed as: string & z.BRAND<'PersonID'> & z.BRAND<'FemalePersonID'>
	}
}
```

## Functions

### `isValidPersonId<BRAND = string>(personId: string): personId is string & BRAND`

Validates if the provided string is a valid Finnish person ID.

**Parameters:**

- `personId` - The person ID string to validate

**Returns:**

- `true` if the person ID is valid, `false` otherwise

**Example:**

```javascript
isValidPersonId('131052-308T'); // true
isValidPersonId('131052-3082'); // false
```

### `isMale<BRAND = string>(personId: string): personId is string & BRAND`

Checks if the provided Finnish person ID belongs to a male.

**Parameters:**

- `personId` - The Finnish person ID string

**Returns:**

- `true` if the person ID belongs to a male, `false` otherwise

**Example:**

```javascript
isMale('131052-309U'); // true
isMale('131052-308T'); // false
```

### `isFemale<BRAND = string>(personId: string): personId is string & BRAND`

Checks if the provided Finnish person ID belongs to a female.

**Parameters:**

- `personId` - The Finnish person ID string

**Returns:**

- `true` if the person ID belongs to a female, `false` otherwise

**Example:**

```javascript
isFemale('131052-308T'); // true
isFemale('131052-309U'); // false
```
