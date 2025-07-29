import { playable } from './state-mediators/playable';
import { audible } from './state-mediators/audible';
import { createMediaStore as factory } from './factory';
// Example of default media store with default state mediator definitions. (CJP)
// NOTE: We can also change the API to take an array of stateMediators (or either/both) (CJP)
const stateMediator = { ...playable, ...audible };
type Params = Partial<Parameters<typeof factory>[0]>;
export const createMediaStore = (params: Params = {}) =>
  factory({ stateMediator, ...params });