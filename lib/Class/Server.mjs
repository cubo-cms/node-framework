/** Server module starts the HTTP/2 server to listen for requests. The requests
  * are passed back to the application.
  *
  * @package        @cubo-cms/node-framework
  * @module         /lib/Class/Server.mjs
  * @version        0.5.39
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import http2 from 'http2';

import Class from '../Class.mjs';
import Loader from '../Helper/Loader.mjs';
import JLoader from '../Helper/JLoader.mjs';

export default class Server extends Class {
  static default = {
    digest: 'sha-256',
    poweredBy: 'Cubo CMS',
    port: 8443,
    secure: true,
    cert: `-----BEGIN CERTIFICATE-----
MIIC8DCCAdigAwIBAgIUUAgIC8LpUEfrWLpK8e1KsBE1UcIwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTIxMTIyMjAwNTM0MloXDTIyMDEy
MTAwNTM0MlowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEA2OzmRmCSAmlvKTKZjb2Wp15ey/rthIpUHSGiB//Ti850
Mub7t/b3wAvO2wavOd+iaFSj7qkBWL6oC/yvGHyJnCX6LUWJK/9nlydbVpU0GE93
kYF83nZT3xty0dSYp7lUx+Lsr0Ft4zvKQnKKKoAWTrcPX1TSuI172iuVfuvKZAXG
+ORHpu4wtFVPW306cXL34xxsxg3nxQLWuCd6nyrYa8XeGR6aInhT/O1liZJ1pZ+7
FugxNKSUetJj9Vwl+waSfDr8TIBQw55NjIxwVliMOZZvLaPt9gsq4zxDLltJe/j+
bmeDchytrJp3y4uaQ8stc3iztV49lVyI0j1rmTCxTQIDAQABozowODAUBgNVHREE
DTALgglsb2NhbGhvc3QwCwYDVR0PBAQDAgeAMBMGA1UdJQQMMAoGCCsGAQUFBwMB
MA0GCSqGSIb3DQEBCwUAA4IBAQCwjPfp7JIcRaNvLwlSjaDgc7XTLyUOLPAkaHUf
4+GnnCctIe0XbFm+iffeYcpUkMxlJ/RJRgDRXTybLXrzIQLDxg30xEXGje5wk/8/
DUlpU7wc3PSNxhi1mHuH5Du2/IMumiBbpiEYbSzYU2PCfHQGWtkjEauxBCdR8chh
NR3ldxQn76RoLbcRaIW5fN4pWEBd2kyD5S0ZVaZOT67yQ3Cf3q4L8cOZcCnrGa8B
slACYHw1Aglc/Op22R416ecYFYk8EHGctIHwNYfUfom3IIGCshvxd+wGciNiqWUb
zkYQmQOc+omJCB8jzFrVdJfb98YeY1F6G81ZPW6iu2OGWDLf
-----END CERTIFICATE-----`,
  key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDY7OZGYJICaW8p
MpmNvZanXl7L+u2EilQdIaIH/9OLznQy5vu39vfAC87bBq8536JoVKPuqQFYvqgL
/K8YfImcJfotRYkr/2eXJ1tWlTQYT3eRgXzedlPfG3LR1JinuVTH4uyvQW3jO8pC
cooqgBZOtw9fVNK4jXvaK5V+68pkBcb45Eem7jC0VU9bfTpxcvfjHGzGDefFAta4
J3qfKthrxd4ZHpoieFP87WWJknWln7sW6DE0pJR60mP1XCX7BpJ8OvxMgFDDnk2M
jHBWWIw5lm8to+32CyrjPEMuW0l7+P5uZ4NyHK2smnfLi5pDyy1zeLO1Xj2VXIjS
PWuZMLFNAgMBAAECggEBANRUxm361tB/jWxg+AbSnaWD7PxyyIzkrcK6ChUUZ2hA
lGLCz39ZwVX8+ORRHbFjYmAHAVN5oDTSokDhfC5WsIfkcIZhuwwS+r3sqy4L66sk
FeCaQ7SpVB1di70yAJ6j/QWO7Kf7PmmfO7Jg1TcWmz8/Vk+1AnHdI28BHFrYyAmw
BCOGVXA7ez+JVV8A8C1l4I5qVYikKUfewFOTd1EYo3ROatti762HBkmoS7RUo1Kb
vsxPGOj1jMUVmSoya4UrfXJ35Gbw+0xxpCL0xvldaeCkAV1Ew6GFm1yzc0YnvZCG
4ZTIS08yJpa31eAs4udrQHYMo47xMjXZwJ74GuYJYi0CgYEA9wOdUh91WlUjoU5Y
1DbpdNRjtJAatDnj6Ji0r02KtYNWhRyMW46J1lDCWep1ZsqjFuVLhX9o1DehZVJn
GZq/Eagl05nllZm42j0gWZ0uuSJ111Ku1ia5Go1zhe6iwf1S61dgGjwWteZr6ths
d1ErcaHrK8gybrm9g3WzkSLBKbcCgYEA4NETWO98dojvPzZH+tJFjOOyus8NAGgH
x37W02TQI25S4ZfmAlklSb8nUxnCM/O6oB11lr6ZBuZEKTru3SbUOqj0JfoHUkMe
KPscYO0MjT+sY0CvHcdfxbk7vVefAX1YkhFTpCHDvzTUnhoKO5z0bMsYcfOHgIAI
2D1ZI6nlDRsCgYAqhNvCtBmOOBOPA550wRMEgj67aQa/uStK8WZAurdCsV3mQdjD
NdDyLCqYMayNyhmyqjuKujjANuc4Oqv2k1WKY4hHWTlUvAY+wsDbzBur0Iu6SchA
op/AO1MEXeR0QffQ/NRVD7zVCNnQrfpVu4of4EBL5AUSXDSL+Wm0dOgNFwKBgQDO
Gp70H8opGWzMtMTUi8U7XtxSKtOulbDcEcp8zqWKdfAB5bH2YSewLlCs/KZv3ngv
phJRerbr/lpquh6WHKzgglgiINBpeCLES0I/EdM6Ay/VZk2krU1+BU1hTlz1jqaO
ctgNVu8P8i0iLJlJAaGLw73LagnFopt5MvTvnyfgFQKBgHLIBDkJSdIeRCP8Nwt6
pCCyK3qe9gFkwJwDD1i81594MT1FM69J+RM4x2h1YLi0gDdvM90YdjkgdxyqEVrz
z5cVcQetIkt8aGtWB2cT6uqmhrJ0CPSrfOxMKLpZdW9AZE107Z4qA2TyCFQU0gVm
VMU03PVNxCQuXJQ3kKdK4ovH
-----END PRIVATE KEY-----`
  };

  request(data = {}, request, response) {
    let payload = [];
    let requestReceived = Date.now();
    request.on('data', (chunk) => {
      // Get request data and store as payload
      payload.push(chunk);
    }).on('end', () => {
      payload = Buffer.concat(payload).toString();
      // Call handler
      this.caller.handler({ payload: payload, requestReceived: requestReceived }, request, response).then((data) => {
        response.statusCode = 200;
        response.end(JSON.stringify(data));
      });
    }).on('error', (error) => {
      throw error;
    });
  }
  listen(data = {}) {
    return new Promise((resolve, reject) => {
      // Load data
      this.load(data).then((data) => {
        return Loader.loadAll({ cert: this.get('cert'), key: this.get('key') });
      }).then((certData) => {
        this.data = {...this.data, ...certData};
        let server;
        // Call server to listen for requests
        if(this.get('secure')) {
          // Secure connection
          server = http2.createSecureServer({ cert: this.get('cert'), key: this.get('key') });
        } else {
          // Although there is an option to use an insecure connection, several browsers will not accept these connections
          server = http2.createServer({ cert: this.get('cert'), key: this.get('key') });
        };
        server.on('request', (request, response) => {
          this.request(this.data, request, response);
        }).on('error', (error) => {
          throw error;
        }).listen(this.get('port'), (error) => {
          if(error) throw error;
          log.info(`Server is listening on port ${this.get('port')}`);
        });
        resolve(`Server starts`);
      }).catch((error) => {
        reject(error);
      });
    })
  }
}
