// Primary file for the API

// Dependencies
const http = require( 'http' );
const https = require( 'https' );
const url = require( 'url' );
const fs = require( 'fs' );
const StringDecoder = require( 'string_decoder' ).StringDecoder;
const config = require( './config' );

var httpsServerOptions = {
   'key': fs.readFileSync( './https/key.pem' ),
   'cert': fs.readFileSync( './https/cert.pem' ),
};

function initiateServer( serverType, myEngine ) {
   var myServer, myPort;
   if ( Object.keys( serverType ).length === Object.keys( http ).length) {
      myPort = 'httpPort';
      myServer = http.createServer( function( req, res ){
         myEngine( req, res );
      });
   } else {
      myPort = 'httpsPort';
      myServer = https.createServer( httpsServerOptions, function( req, res ){
         myEngine( req, res );
      });
   }
   myServer.listen( config[myPort], function(){
      console.log( 'The server is listening on port ' + config[myPort] + ' in ' + config.envName + ' mode' );
   })
   return myServer;
};

initiateServer( http, serverEngine );
initiateServer( https, serverEngine );

// All the server logic for both the http and https createServer
function serverEngine( req, res ){

   // Get the URL and parse it
   var parsedUrl = url.parse( req.url, true );

   // Get the path
   var path = parsedUrl.pathname;
   var trimmedPath = path.replace( /^\/+|\/+$/g, '' );

   // Get the query string as an object
   var queryStringObject = parsedUrl.query;

   // get the HTTP Method
   var method = req.method.toLowerCase();

   // Get the headers an an object
   var headers = req.headers;

   // Get the payload, if any
   var decoder = new StringDecoder( 'utf-8' );
   var buffer = '';
   req.on( 'data', function( data ){
      buffer += decoder.write( data );
   });
   req.on( 'end', function(){
      buffer += decoder.end();

      // Choose the handler this request should go to
      // If not found, return not found handler
      var chosenHandler = typeof( router[trimmedPath] ) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // construct data object to send to the handler
      var data = {
         'trimmedPath' : trimmedPath,
         'queryStringObject' : queryStringObject,
         'method' : method,
         'headers' : headers,
         'payload' : buffer
      };

      // Route the request to the handler specified in the router
      chosenHandler( data, function( statusCode, payload ){
         // Use the status back called back by handler or default to 200
         statusCode = typeof( statusCode ) == 'number' ? statusCode : 200;

         // Use the payload called back by the handler or default to empty object
         payload = typeof( payload ) == 'object' ? payload : {};

         // Convert  the payload to string
         var payloadString = JSON.stringify(payload);

         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);

         console.log('Returning this response ', statusCode, payloadString);
      });
   });
};

var dataFile = JSON.parse( fs.readFileSync( './data/data.json' ) );
var nCount = Object.keys( dataFile ).length;

// Define the handlers
var handlers= {
   ping: function( data, callback ){
      callback( 200 );
   },

   hello: function(data, callback){
      var nIndex = Math.floor( Math.random() * nCount );
      var payload = Object.values(dataFile)[nIndex];
      callback( 200, payload );
   },

   notFound: function( data, callback ){
      callback( 404 );
   }
};

// Define a request router
var router = {
   'ping': handlers.ping,
   'hello': handlers.hello,
};
