import initModel2 from './Model';
import { update } from './Update';
import view from './View';
import app from './App';

const node = document.getElementById('app');

app(initModel2, update, view, node);


