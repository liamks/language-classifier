var request = require('request');
var fs = require('fs');
var program = require('commander');
var removeMarkdown = require('remove-markdown');

var MAX_COMMENTS = 100;
var MAX_CHARACTERS = 1024; // imposed by watson
var DEFAULT_URL = 'https://www.reddit.com/r/science/comments/3d8wv3/ninetyfive_percent_of_women_who_have_had';

program
  .version('0.0.1')
  .option('-u, --url <s>', 'Specify a url')
  .option('-m, --max-comments <n>', 'Number of comments', parseInt)
  .parse(process.argv);


function pickRandomSubset(comments, maxComments){
  if(comments.length < maxComments){
    return comments;
  }

  var output = [];
  var index = 0;
  var comment;

  for (var i = 0; i < maxComments; i++) {
    index = Math.floor(Math.random() * comments.length);
    comment = comments.splice(index, 1);
    output.push(comment[0]);
  }

  return output;
}

function limitToXCharacters(text){
  if(text.length < MAX_CHARACTERS){
    return text;
  }

  var words = text.split(' ');
  var numChars = 0;
  var output = [];
  var i = 0;

  while(numChars + words[i].length < MAX_CHARACTERS){
    output.push(words[i]);
    numChars += words[i].length + 1; // +1 for each space
    i += 1; 
  }

  return output.join(' ');
}

function extractComments(comments){
  var output = [];
  var numDeleted = 0;

  function getComment(comment){
    var replies = comment.data.replies;

    if(typeof replies === 'object'){
      var comments = [];
      replies = replies.data.children;

      replies.forEach(function(reply){
        getComment(reply);
      });
    } 
      
    if(comment.data.body === '[deleted]'){
      numDeleted += 1;
      return;
    }

    if(comment.data.body === undefined){
      return;
    }

    var text = comment.data.body;
    text = removeMarkdown(text);
    text = text.replace(/[\n]+/g, ' ').replace('&gt;', ' ');
    text = limitToXCharacters(text);
    
    output.push({
      text: text,
      /* markdown: comment.data.body,
      score: comment.data.score,
      createdUTC: comment.data['created_utc'], */
      classes : []
    });
  };

  comments.forEach(function(comment){
    if(!comment.data){
      console.log(comment);
    }
    getComment(comment);
  });

  return output
}

var url;

if(program.url){
  url = program.url.replace(/\/$/, '');
} else {
  url = DEFAULT_URL;
}

url = url + '.json?limit=500';

request.get(url, function(err, a, body){
  if(err){
    console.log('Error: ', err);
  }

  body = JSON.parse(body);

  var comments = extractComments(body[1].data.children);
  comments = pickRandomSubset(comments, program.maxComments || MAX_COMMENTS);
  var output = {
    language : 'en',
    'training_data' : comments
  }

  fs.writeFileSync('comments.json', JSON.stringify(output, null, 2), 'utf8');
});