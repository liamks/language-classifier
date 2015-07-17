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