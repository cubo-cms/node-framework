import Application from './lib/Handler/Application.mjs';
import Router from './lib/Handler/Router.mjs';

const app = new Application('$/application.json');

//app.use(Router);

app.server();
