// Create and export configuration variables

// Container for all the environments
var environments = {};

// Staging (default) environment
environments.staging = {
   'httpPort': 80,
   'httpsPort': 443,
   'envName' : 'staging'
};

// Production environment
environments.production = {
   'httpPort': 5080,
   'httpsPort': 5443,
   'envName' : 'production'
};

// Determine which environment to export
var currentEnvironment = typeof( process.env.NODE_ENV ) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that currentEnvironment defined and returns default if not
var environmentToExport = typeof( environments[currentEnvironment] ) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
