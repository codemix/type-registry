/* @flow */

import {EventEmitter} from "events";
import IDRange from "./id-range";

type Type = {
  id: uint32;
  name: string;
  (...args: any[]): any;
};

type TypeList = Type[] | {
  [alias: string|Symbol]: Type;
};

const $Size = Symbol('Size');

export default class TypeRegistry extends EventEmitter {

  T: {
    [name: string|Symbol]: Type;
  };

  I: {
    [name: uint32]: Type;
  };

  ranges: Map<string, IDRange>;

  /**
   * Initialize the type registry.
   */
  constructor (types?: TypeList) {
    super();
    this.setMaxListeners(0);
    Object.defineProperties(this, {
      T: {
        enumerable: true,
        value: Object.create(null)
      },
      I: {
        enumerable: true,
        value: Object.create(null)
      },
      ranges: {
        enumerable: true,
        value: new Map()
      }
    });

    /** @flowIssue TODO */
    this[$Size] = 0;

    Object.seal(this);

    if (Array.isArray(types)) {
      for (const type of types) {
        this.add(type);
      }
    }
    else if (types) {
      for (const name of Object.keys(types)) {
        this.add(types[name]);
      }
    }
  }

  /**
   * Get the number of items in the registry.
   */
  get size (): uint32 {
    /** @flowIssue TODO */
    return this[$Size];
  }

  /**
   * Adds a type to the registry. Throws if another type with the same name or id exists.
   */
  add (type: Type): TypeRegistry {
    /** @flowIssue TODO */
    if (typeof type.name !== "string" && typeof type.name !== "symbol") {
      throw new TypeError(`Type must have a name. Name can be a string or a symbol.`);
    }
    else if (this.T[type.name]) {
      if (this.T[type.name] === type) {
        // Nothing to do.
        return this;
      }
      else {
        throw new TypeError(`A type already exists with the given name (${typeof type.name === 'string' ? type.name : 'Symbol([[unknown]])'}).`)
      }
    }
    else if (typeof type.id !== "number" || type.id >>> 0 !== type.id) {
      throw new TypeError(`Type must have a unique integer id between 0 and ${Math.pow(2, 32)}.`);
    }
    else if (this.I[type.id]) {
      throw new TypeError(`A type already exists with id ${type.id}.`);
    }

    this.T[type.name] = type;
    this.I[type.id] = type;
    /** @flowIssue TODO */
    this[$Size]++;
    this.emit('add', type);
    return this;
  }

  /**
   * Determine whether the registry contains the given type, or a
   * type with the given name or id.
   */
  has (type: Type|string|Symbol|uint32): boolean {
    if (typeof type === 'number') {
      return !!this.I[type];
    }
    /** @flowIssue TODO */
    else if (typeof type === 'string' || typeof type === 'symbol') {
      return !!this.T[type];
    }
    else if (type != null && typeof type.id === 'number') {
      return this.I[type.id] === type;
    }
    else {
      return false;
    }
  }

  /**
   * Get the type with the given name or id.
   */
  get (nameOrId: string|Symbol|uint32): ?Type {
    if (typeof nameOrId === 'number') {
      return this.I[nameOrId];
    }
    else {
      return this.T[nameOrId];
    }
  }

  /**
   * Determines whether the given value is a valid type or not.
   */
  isValidType (value: Type|any): boolean {
    if (!value) {
      return false;
    }
    /** @flowIssue 285 */
    if (typeof value.name !== "string" && typeof value.name !== "symbol") {
      return false;
    }
    else if (typeof value.id !== "number" || value.id >>> 0 !== value.id) {
      return false;
    }
    else {
      return true;
    }
  }

  /**
   * Get the `IDRange` instance for the given key. If it does not exist, it will be created.
   *
   * The key is used to group certain classes/categories of type together.
   * For instance you might use `"PrimitiveType"` as the key for all
   * simple types and `"ArrayType"` as the key for all array based types.
   */
  range (key: string): IDRange {
    let range = this.ranges.get(key);
    if (!range) {
      const min = (this.ranges.size * Math.pow(2, 20)) || 1;
      const max = ((this.ranges.size + 1) * Math.pow(2, 20)) - 1;
      range = new IDRange(this, {key, min, max});
      this.ranges.set(key, range);
    }
    return range;
  }

  /**
   * Get the range key for the given type ID, or `undefined` if no such range exists.
   */
  rangeKeyForId (id: uint32): ?string {
    for (const [key, range] of this.ranges) {
      if (id >= range.min && id <= range.max) {
        return key;
      }
    }
  }

  /**
   * Iterate all the types in the registry.
   * @flowIssue TODO
   */
  *[Symbol.iterator] () {
    const T = this.T;
    for (const name of Object.keys(T)) {
      yield T[name];
    }
  }

}