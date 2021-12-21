import Application from './lib/Handler/Application.mjs';

let app = new Application();

app.handler({}, {}, {}).then((result) => {
  console.log('Final result:',result);
});
