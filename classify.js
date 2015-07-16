var program = require('commander');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var config = require('./config.js');


var CLASSIFIER_PATH = './classifier-data.json';

program
  .version('0.0.1')
  .option('-t, --train', 'Train Classifier')
  .option('-x, --test', 'Test Classifier')
  .option('-d, --train-data', 'Training Data')
  .option('-s, --test-data', 'Test Data')
  .option('-u, --status', 'Status')
  .parse(process.argv);

function makeClassifier(){
    return watson.natural_language_classifier({
      username: config.credentials.username,
      password: config.credentials.password,
      version: 'v1'
  });
}

function trainClassifier(){
  var trainingDataPath = program.trainData || './data/train.json';

  var classifier = makeClassifier();

  var trainingData = require(trainingDataPath);

  classifier.create(trainingData, function(err, response){
    if(err){
      console.log(err);
      return;
    }

    fs.writeFileSync(CLASSIFIER_PATH, JSON.stringify(response, null, 2));
    console.log(response.status_description);
  });
} 


function testClassifier(){
  var testDataPath = program.testData || './data/test.json';
  var classifierData = require(CLASSIFIER_PATH);

  var classifier = makeClassifier();

  var params = {
    classifier: classifierData.classifier_id,
    text: 'You\'d also have to take into account that those who choose to have an abortion are probably more likely to regret having kids if they\'re forced to (both because they\'re in circumstances that make them want an abortion, and because being forced to have kids you don\'t want is probably in and of itself traumatic).\n\nOne way to tackle this is with a regression discontinuity design. That\'s the approach Diana Foster at UCSF takes. The basic result is that almost no one will say that they regret having their child once it arrives -- you can imagine how psychologically costly that might be! -- but that women forced to bear children do suffer adverse consequences of various sorts.'
  };

  classifier.classify(params, function(err, results){
    if(err){
      console.log(err);
      return;
    }

    console.log(results);
  });
}

function getStatus() {
  var classifierData = require(CLASSIFIER_PATH);
  var classifier = makeClassifier();
  
  classifier.status({ classifier: classifierData.classifier_id }, function(err, response) {
    if (err){
      console.log(err);
      return;
    }
    
    console.log(response);
  });
}



if(program.train){
  trainClassifier();
} else if(program.test){
  testClassifier();
} else {
  getStatus();
}