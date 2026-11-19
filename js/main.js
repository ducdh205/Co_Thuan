import { parseParams } from './timing.js';
import { boot } from './boot.js';

const params = parseParams(location.search);
boot({ params, loadWorld: async () => {}, onStart: () => {} });
