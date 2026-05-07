// Load polyfills FIRST
import './polyfills';

import { install } from 'react-native-quick-crypto';
install(); // Must be called before anything else

import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
