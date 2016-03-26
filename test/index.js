import {TypeRegistry} from "../src";

describe('TypeRegistry', function () {

  const Simple = {
    id: 11,
    name: 'Simple'
  };

  const User = {
    id: 22,
    name: 'User'
  };

  const Role = {
    id: 44,
    name: 'Role'
  };

  const Thing = {
    id: 66,
    name: Symbol('Thing')
  };

  describe('.constructor()', function () {
    it('should create an instance with default params', function () {
      const registry = new TypeRegistry();
      registry.size.should.equal(0);
      Array.from(registry).length.should.equal(0);
    });

    it('should create an instance with some types in an array', function () {
      const registry = new TypeRegistry([User, Role]);
      registry.size.should.equal(2);
      Array.from(registry).length.should.equal(2);
    });

    it('should create an instance with some types in an object', function () {
      const registry = new TypeRegistry({User, Role});
      registry.size.should.equal(2);
      Array.from(registry).length.should.equal(2);
    });
  });

  describe('.add(), .has(), .get(), *[Symbol.iterator]', function () {
    const registry = new TypeRegistry();
    let added = 0;
    registry.on('add', () => added++);

    it('should not have the unadded types', function () {
      registry.has(User).should.equal(false);
      registry.has(Role).should.equal(false);
    });

    it('should not have a type by id', function () {
      registry.has(0).should.equal(false);
    });

    it('should not have a type by name', function () {
      registry.has('User').should.equal(false);
    });

    it('should not have nothing', function () {
      registry.has().should.equal(false);
    });

    it('should add a type to the registry', function () {
      registry.size.should.equal(0);
      added.should.equal(0);
      registry.add(User);
      added.should.equal(1);
      registry.size.should.equal(1);
    });

    it('should have the added type', function () {
      registry.has(User).should.equal(true);
    });

    it('should not have the unadded type', function () {
      registry.has(Role).should.equal(false);
    });

    it('should have a type by id', function () {
      registry.has(22).should.equal(true);
    });

    it('should have a type by name', function () {
      registry.has('User').should.equal(true);
    });

    it('should add another type to the registry', function () {
      registry.size.should.equal(1);
      registry.add(Role);
      added.should.equal(2);
      registry.size.should.equal(2);
    });

    it('should have the added type', function () {
      registry.has(Role).should.equal(true);
    });

    it('should add a type with a symbol name', function () {
      registry.add(Thing);
    });

    it('should have a type by id', function () {
      registry.has(66).should.equal(true);
    });

    it('should have a type by symbol', function () {
      registry.has(Thing.name).should.equal(true);
    });

    it('should get a type by id', function () {
      registry.get(66).should.equal(Thing);
    });

    it('should get a type by symbol', function () {
      registry.get(Thing.name).should.equal(Thing);
    });

    it('should silently accept a type which already exists in the registry', function () {
      registry.size.should.equal(3);
      registry.add(Role);
      registry.size.should.equal(3);
    });

    it('should not add a type without a name', function () {
      registry.size.should.equal(3);
      (() => registry.add({id: 123})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type with an invalid name', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: {}, id: 123})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type with a duplicate name', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: 'User', id: 999})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type with a duplicate symbol name', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: Thing.name, id: 444})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type without an id', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: "Test"})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type with an invalid id', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: "Test", id: "nope"})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type with an invalid numeric id', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: "Test", id: -123})).should.throw(TypeError);
      registry.size.should.equal(3);
    });

    it('should not add a type with a duplicate id', function () {
      registry.size.should.equal(3);
      (() => registry.add({name: 'Test', id: 22})).should.throw(TypeError);
      registry.size.should.equal(3);
    });
  });

  describe('.isValidType()', function () {
    const registry = new TypeRegistry();

    it('should reject falsy faluse', function () {
      registry.isValidType().should.equal(false);
    });

    it('should accept valid function types', function () {
      function Test () {};
      Test.id = 123;
      registry.isValidType(Test).should.equal(true);
    });

    it('should accept valid object types', function () {
      const Test = {
        name: 'Test',
        id: 123
      };
      registry.isValidType(Test).should.equal(true);
    });

    it('should accept valid object types with symbol names', function () {
      const Test = {
        name: Symbol('Test'),
        id: 123
      };
      registry.isValidType(Test).should.equal(true);
    });

    it('should reject invalid function types', function () {
      function Test () {};
      registry.isValidType(Test).should.equal(false);
    });

    it('should reject invalid object types without names', function () {
      const Test = {
        id: 123
      };
      registry.isValidType(Test).should.equal(false);
    });

    it('should reject invalid object types without ids', function () {
      const Test = {
        name: 'Test',
      };
      registry.isValidType(Test).should.equal(false);
    });

    it('should reject invalid object types without valid names', function () {
      const Test = {
        id: 123,
        name: {}
      };
      registry.isValidType(Test).should.equal(false);
    });

    it('should reject invalid object types without valid ids', function () {
      const Test = {
        name: 'Test',
        id: Math.pow(2, 48)
      };
      registry.isValidType(Test).should.equal(false);
    });

    it('should reject invalid object types with symbol names', function () {
      const Test = {
        name: Symbol('Test'),
        id: -123
      };
      registry.isValidType(Test).should.equal(false);
    });
  });

  describe('IDRange', function () {
    const registry = new TypeRegistry();

    describe('@@iterator()', function () {
      it('should generate some ids for a new key PrimitiveType', function () {
        let count = 0;
        let first, last;
        for (const id of registry.range("PrimitiveType")) {
          if (count === 0) {
            first = id;
          }
          last = id;
          count++;
          if (count === 10) {
            break;
          }
        }
        count.should.equal(10);
        first.should.equal(1); // Never generate zero.
        last.should.equal(10);
      });

      it('should generate all the ids for the ArrayType key', function () {
        let count = 0;
        let first, last;
        for (const id of registry.range("ArrayType")) {
          if (count === 0) {
            first = id;
          }
          last = id;
          count++;
        }
        count.should.equal(Math.pow(2, 20));
        first.should.equal(Math.pow(2, 20));
        last.should.equal(first + count - 1);
      });

      it('should registry an id within the PrimitiveType range ', function () {
        registry.add(Simple);
      });

      it('should generate the remaining ids in PrimitiveType', function () {
        let count = 0;
        let first, last;
        for (const id of registry.range("PrimitiveType")) {
          if (count === 0) {
            first = id;
          }
          last = id;
          count++;
        }
        first.should.equal(12);
        count.should.equal((Math.pow(2, 20) - first));
        last.should.equal(Math.pow(2, 20) - 1);
      });
    });

    describe('.range()', function () {
      it('should get the range for the given existing key', function () {
        const range = registry.range("PrimitiveType");
        range.min.should.equal(1);
        range.max.should.equal(Math.pow(2, 20) - 1);
      });

      it('should get the range for another existing key', function () {
        const range = registry.range("ArrayType");
        range.min.should.equal(Math.pow(2, 20));
        range.max.should.equal((Math.pow(2, 20) * 2) - 1);
      });

      it('should create the range for a missing key', function () {
        const range = registry.range("HashMapType");
        range.min.should.equal(Math.pow(2, 20) * 2);
        range.max.should.equal((Math.pow(2, 20) * 3) - 1);
      });

      it('should create the range for another missing key', function () {
        const range = registry.range("LinkedListType");
        range.min.should.equal(Math.pow(2, 20) * 3);
        range.max.should.equal((Math.pow(2, 20) * 4) - 1);
      });
    });

    describe('next()', function () {
      let range;
      let Demo;
      it('should acquire the range.', function () {
        range = registry.range("LinkedListType")
      });

      it('should generate the next value', function () {
        const value = range.next();
        value.should.be.within(range.min, range.max);
      });

      it('should register a new type within the range', function () {
        Demo = {
          id: range.value,
          name: 'Demo'
        };
        registry.add(Demo);
      });

      it('should skip over the next id', function () {
        const value = range.next();
        value.should.equal(Demo.id + 1);
      });

      it('should exhaust the available ids and throw', function () {
        (() => {
          let id;
          while (id = range.next()) {
            id.should.be.within(range.min, range.max);
          }
        }).should.throw(RangeError);
      });
    });

    describe('.rangeKeyForId()', function () {
      it('should get the range for the given id', function () {
        const key = registry.rangeKeyForId(10);
        key.should.equal("PrimitiveType");
      });

      it('should get the range for another id', function () {
        const key = registry.rangeKeyForId(Math.pow(2, 20));
        key.should.equal("ArrayType");
      });

      it('should return nothing for an id without an associated range', function () {
        (registry.rangeKeyForId(Math.pow(2, 20) * 600) === undefined).should.equal(true);
      });
    });
  });
});