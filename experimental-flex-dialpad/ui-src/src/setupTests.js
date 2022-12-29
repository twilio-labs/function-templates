require('babel-polyfill');

import { configure } from 'enzyme/build';
import Adapter from 'enzyme-adapter-react-16/build';

configure({
  adapter: new Adapter(),
});
