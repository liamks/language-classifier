# Language Classifier Using IBM's Watson & NodeJS


## Getting Started

### 1. Download NodeJS

If you haven't already [download NodeJS](https://nodejs.org/)

### 2. Download this repo

This repo contains scripts for downloading comments from reddit - you'll need lots of comments to create your classifier.

### 3. Sign Up for IBM Bluemix

To use Watson you'll need to [register and create a Bluemix account](https://console.ng.bluemix.net/registration/).

### 4. Get your Watson - Langage Classifier - API keys

#### a. In Bluemix's dashboard click on the "User Sevices or APIs" rectangle.

![Use Service](/screen-shots/1-use-service.png)

#### b. Select the "Natural Language Classifier" service

![Add Service](/screen-shots/2-add-service.png)

#### c. Now create the credientials for using the classifier via the API

![Create Credential](/screen-shots/3-create-credentials.png)

#### d. View your credentials and copy them into `config-sample.js`*

![View Credentials](/screen-shots/4-view-credentials.png)

#### e. Finally, rename `config-sample.js` to `config.js`

## Getting lots of Reddit comments

In order for your classifier to automatically classify text into categories of your choosing, you'll first need to train it. Training involves first defining categories that you'd like each comment to be classified as. For instance, you could classify comments as "informative" or "non-informative". Likewise you could classify comments as "insulting" or "respective". You can come up with more than two categories, and they don't have to be polar opposites. Next you'll need as many samples as possible (you'll get 50). 40 of the comments you will manually classify into your categories, and the other 10 you will use to see how well your trained classifier can automatically classify text. If you have another source of text that you want to use, feel free! Let's get started!

## Install dependencies

Go into the the `lanuage-classifier` folder and run `npm install`.

## Download comments

If you're going to use text from another source (not reddit) skip this step. Find an article on the front-page of reddit. Ideally, it will have 500+ comments, with lots of variety. Once you've selected an article, click on the comments link and then copy the comments url. Next run:

```
node get-text.js -u COMMENTS_URL -m 50
```

Be sure to replace `COMMENTS_URL` with the actual url you found above. The `-m` flag tells `get-text.js` to only save 50 comments. To summarize the script will download 500 comments and randomly pick 50 comments to save into `comments.json`.

## Classify comments



