import Cubo from './Namespace.mjs';

await Cubo.load();

console.log(Cubo.modules());

const { Application } = Cubo;

const app = new Application('$/application.json');

//app.use(Router);

app.server();
