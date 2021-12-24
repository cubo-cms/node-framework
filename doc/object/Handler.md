## Handler

The Cubo CMS `Handler` interface is used to perform certain actions based on provided data and the original request. The `Handler` will return generated data and could also provide responses. The interface is used throughout the CMS to generate the requested output. The `Handler` interface can also be used to add *middleware* to your project. The interface is primarily used to define classes that extend this interface.

### Class Definition

`class extends Handler {}`

> Defines a class using the `Handler` interface.

~~~javascript
// Example:
import Cubo from '@cubo-cms.com/node-framework';

class Car extends Cubo.Handler {
  // class properties and methods
}
~~~

### Constructor

`Handler(*data*)`

> Creates a new `Handler` instance and passes provided data to store as in the `data` property.

~~~javascript
// Example:
import Cubo from '@cubo-cms.com/node-framework';

class Car extends Cubo.Handler {
  // class properties and methods
}

const app = new Car({ make: 'Ford' });

console.log(app);
// Output: Car { data: { make: 'Ford' } }
~~~

### Properties

`Handler.default`

> Object that contains defaults for this instance. These defaults can be automatically loaded as default values using the `Handler.load` method if they are not explicitly provided.

~~~javascript
// Example:
import Cubo from '@cubo-cms.com/node-framework';

class Car extends Cubo.Handler {
  default = {
    make: 'Toyota'
  }
  // other class properties and methods
}

const newCar = new Car();

newCar.load().then(data => console.log(data));
// Output: { make: 'Toyota' }
~~~

`Handler.data`

> Object that contains properties and values specific for this instance. These defaults can be automatically loaded as default values using the `Handler.load` method if they are not explicitly provided. Instance data can be set through the `Handler.set` method and retrieved through the `Handler.get` method.


