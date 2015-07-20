var program = require('commander');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var config = require('./config.js');
var natural = require('natural');


var CLASSIFIER_PATH = './classifier-data.json';

program
  .version('0.0.1')
  .option('-t, --train', 'Train Classifier')
  .option('-x, --test', 'Test Classifier')
  .option('-d, --train-data <s>', 'Training Data')
  .option('-s, --test-data <s>', 'Test Data')
  .option('-u, --status', 'Status')
  .option('-n, --node', 'Use the "natural" module')
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


function classifyText(text){
  return new Promise(function(resolve, reject){
    var classifierData = require(CLASSIFIER_PATH);

    var classifier = makeClassifier();

    var params = {
      classifier: classifierData.classifier_id,
      text: text
    };

    classifier.classify(params, function(err, results){
      if(err){
        return reject(err);
      }

      resolve(results);
    });
  });
}

function testClassifier(){
  var classifier = makeClassifier();
  var testDataPath = program.testData || './data/test.json';
  var testData = require(testDataPath);
  var promises = [];

  testData.training_data.forEach(function(datum){
    promises.push(classifyText(datum.text));
  });

  return Promise.all(promises);
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


function trainAndTestWithNatural(){
  var trainingData = require(program.trainData || './data/train.json');
  var testData = require(program.testData || './data/test.json');

  var baysClassifier = new natural.BayesClassifier();
  var logisticClassifier = new natural.LogisticRegressionClassifier();

  trainingData.training_data.forEach(function(comment){
    baysClassifier.addDocument(comment.text, comment.classes[0]);
    logisticClassifier.addDocument(comment.text, comment.classes[0]);
  });

  baysClassifier.train();
  logisticClassifier.train();

  var outputBays = [];
  var outputLogistic = [];

  testData.training_data.forEach(function(comment){
    outputBays.push({
      text: comment.text,
      classes: baysClassifier.getClassifications(comment.text)
    });

    outputLogistic.push({
      text: comment.text,
      classes: logisticClassifier.getClassifications(comment.text)
    });
  });

  
  fs.writeFileSync('./results-bays.json', JSON.stringify(outputBays, null, 2));
  console.log('Bays Classifier results in: results-bays.json');
  fs.writeFileSync('./results-logistic.json', JSON.stringify(outputLogistic, null, 2));
  console.log('Logistic Classifier results in: results-logistic.json');
}



if(program.train){
  trainClassifier();
} else if(program.test){
  testClassifier().then(function(results){
    fs.writeFileSync('./results.json', JSON.stringify(results, null, 2));
  });
} else if (program.node){
  trainAndTestWithNatural()
} else {
  getStatus();
}