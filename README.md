# type-registry
A simple container used to declare different kinds of Type.

[![Build Status](https://travis-ci.org/codemix/type-registry.svg?branch=master)](https://travis-ci.org/codemix/type-registry)

## What?
Yeah. This doesn't make much sense in isolation, it's part of a larger (soon to be released) project centering around typed objects.

## Installation

Install via [npm](https://npmjs.org/package/type-registry).
```sh
npm install type-registry
```

## Usage

```js

import TypeRegistry from "type-registry";

const Uint32 = {
  id: 1, // Unique id for this type, mandatory
  name: 'UInt32', // Unique name for this type, can be a string or symbol, mandatory.
  anythingElseYouWant: 'goes here'
};

const Float64 = {
  id: 2,
  name: 'Float64'
};

const registry = new TypeRegistry();

registry.has(Uint32); // false
registry.add(Uint32);
registry.has(Uint32); // true

let added = false;
registry.on('add', (newType) => {
  added = true;
});

added === false;

registry.add(Float64);
added === true;


registry.get('Uint32') === Uint32;
registry.get(1) === Uint32;
registry.get(2) === Float64;

registry.T.Uint32 === Uint32;
registry.T.Float64 === Float64;

registry.I[1] === Uint32;
registry.I[2] === Float64;

registry.isValidType({}); // false
registry.isValidType({id: 123}); // false
registry.isValidType({id: 123, name: 'User'}); // true

function User {};
registry.isValidType(User); // false

User.id = 456;

registry.isValidType(User); // true

console.log('Total number of items in the registry:', registry.size);

for (const type of registry) {
  console.log(type);
}
```


## License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).
