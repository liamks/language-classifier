var program = require('commander');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var config = require('./config.js');
var natural = require('natural');
var Table = require('cli-table');


var CLASSIFIER_PATH = './classifier-data.json';

program
  .version('0.0.1')
  .option('-t, --train', 'Train Classifier')
  .option('-x, --test', 'Test Classifier')
  .option('-d, --train-data <s>', 'Training Data')
  .option('-s, --test-data <s>', 'Test Data')
  .option('-u, --status', 'Status')
  .option('-n, --node', 'Use the "natural" module')
  .option('-r, --results', 'Compare results')
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

  var bayesClassifier = new natural.BayesClassifier();
  var logisticClassifier = new natural.LogisticRegressionClassifier();

  trainingData.training_data.forEach(function(comment){
    bayesClassifier.addDocument(comment.text, comment.classes[0]);
    logisticClassifier.addDocument(comment.text, comment.classes[0]);
  });

  bayesClassifier.train();
  logisticClassifier.train();

  var outputBayes = [];
  var outputLogistic = [];

  testData.training_data.forEach(function(comment){
    outputBayes.push({
      text: comment.text,
      classes: bayesClassifier.getClassifications(comment.text)
    });

    outputLogistic.push({
      text: comment.text,
      classes: logisticClassifier.getClassifications(comment.text)
    });
  });

  
  fs.writeFileSync('./results-bayes.json', JSON.stringify(outputBayes, null, 2));
  console.log('Bayes Classifier results in: results-bayes.json');
  fs.writeFileSync('./results-logistic.json', JSON.stringify(outputLogistic, null, 2));
  console.log('Logistic Classifier results in: results-logistic.json');
}

function reportAccuracy(){
  var testData = require(program.testData || './data/test.json');
  var watsonResults = require('./results.json');
  var bayesResults = require('./results-bayes.json');
  var logisticResults = require('./results-logistic.json');
  var watsonAccuracy = 0;
  var bayesAccuracy = 0;
  var logisticAccuracy = 0;
  var correctClass;
  var n = testData.training_data.length;

  testData.training_data.forEach(function(comment, i){
    correctClass = comment.classes[0];
    watsonAccuracy += correctClass === watsonResults[i].classes[0].class_name ? 1 : 0;
    bayesAccuracy += correctClass === bayesResults[i].classes[0].label ? 1 : 0;
    logisticAccuracy += correctClass === logisticResults[i].classes[0].label ? 1 : 0;
  });

  function percent(n){
    return (n * 100).toPrecision(4) + '%';
  }

  var accuracy = [percent(watsonAccuracy/n), percent(bayesAccuracy/n), percent(logisticAccuracy/n)];

  var table = new Table({
    head: ['Watson', 'Bayes', 'Logistic']
  });

  table.push(accuracy);

  console.log(table.toString());
}


if(program.train){
  trainClassifier();
} else if(program.test){
  testClassifier().then(function(results){
    fs.writeFileSync('./results.json', JSON.stringify(results, null, 2));
  });
} else if (program.node){
  trainAndTestWithNatural();
} else if (program.results){
  reportAccuracy();
} else {
  getStatus();
}