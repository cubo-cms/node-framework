import Application from './lib/Handler/Application.mjs';
import Router from './lib/Handler/Router.mjs';

let app = new Application();

app.use(Router);

//app.server({ secure: true, port: 8443, cert: './.cert/cert.pem', key: './.cert/privkey.pem' })
app.server()
  .then((data) => console.log(data));
