# A simple demo of node.js with canvas to video
A simple demo of node.js with canvas to video using WebSockets and Node.js


# Installation

    > git clone git://github.com/alejandromg/nvideo.git
    > cd nvideo
    > make dirs && make
    # If the setup is ok:
    > node server

# Api
`server.js`:

``` 
var nvideo = require('./nvideo')
nvideo(server /*, path to ws server */)

```

`index.html`

```
... html ...
<script src="/socket.io/socket.io.js"></script>
<script src="/nvideo/nvideo.client.js"></script>
<script>
  var converter = Converter.init('/video') // ws server

  converter.emit('line', [px, py])
  converter.emit('path', [px, py]) /*etc*/

  // when you are done:
  converter.process(function(error, status){
    // status => :url
  })

</script>
```
# To come:

A really deep implementation of this demo for using with a textarea and record every keyStroke with sound if it's posible, stay tune.

# Contribution

- [Alejandro Morales](http://github.com/alejadromg)
- [Guillermo Rauch](http://github.com/rauchg)

