/** @flow */

import type TypeRegistry from "./registry";

export type RangeConfig = {
  key: string;
  min: uint32;
  max: uint32;
};

/**
 * Represents a range of ids grouped under a certain key.
 * The key is used to describe the category / class of type of all
 * ids within the range.
 * Ranges can contain Math.pow(2, 20) === 1048576 items, and there can be up to 4096 ranges.
 */
export default class IDRange {
  key: string;
  min: uint32;
  max: uint32;
  value: uint32;
  registry: TypeRegistry;

  /**
   * Initialize the range with the given config.
   */
  constructor (registry: TypeRegistry, config: RangeConfig) {
    this.registry = registry;
    this.key = config.key;
    this.min = config.min;
    this.max = config.max;
    this.value = this.min;
  }

  /**
   * Return the next available id in the range.
   */
  next (): uint32 {
    const registry = this.registry;
    while (registry.I[this.value]) {
      this.value++;
    }
    if (this.value >= this.max) {
      throw new RangeError(`Cannot create a new ID for key: ${this.key} - there are no remaining free slots between ${this.min} and ${this.max}.`)
    }
    const value = this.value;
    this.value++;
    return value;
  }

  /**
   * Generate new values until the range is exhausted.
   * @flowIssue TODO
   */
  *[Symbol.iterator] () {
    const registry = this.registry;
    while (this.value <= this.max) {
      while (registry.I[this.value]) {
        this.value++;
      }
      const value = this.value;
      this.value++;
      yield value;
    }
  }
}