'use strict';
var Alexa = require("alexa-sdk");
var https = require('https');

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build


exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};


const criterias = {
    "income": "a",
    "Income": "a",
    "employment": "b",
    "Employment": "b",
    "education" : "c",
    "Education" : "c",
    "health" : "d",
    "Health" : "d",
    "crime" : "e",
    "Crime" : "e",
    "services" : "f",
    "Services" : "f",
    "living environment" : "g",
    "Living environment" : "g",
    "living Environment" : "g",
    "Living Environment" : "g"
}

let lastCheckedPostcode;

var handlers = {
    'LaunchRequest': function () {
        this.emit('SayHello');
    },
    'HelloWorldIntent': function () {
        this.emit('SayHello');
    },
    'MyNameIsIntent': function () {
        this.emit('SayHelloName');
    },
    'MoveIntent': function () {
         this.response.speak('Oi mate! Here is a list of criteria you can choose from: Income, Employment, Education, Health, Crime, Services, Living Environment. Please pick two:').listen('Pick two ');
         this.emit(':responseReady');
    },
     'ListingsIntent': function () {
        const answer = this.event.request.intent.slots.yesornoanswer.value;
        if (answer === "yes"){
            this.emit('DisplayListings');
        }
        else{
            this.emit('AMAZON.StopIntent');
        }

     },
     'DisplayListings': function () {
         var options = {
                      host: '6db87dbc.ngrok.io',
                      path: '/listings?postcode=' + encodeURIComponent(lastCheckedPostcode),
                      method: 'GET'
         };

         const req = https.request(options, (res) => {

              var d = '';

              res.on('data', function (chunk) {
                d += chunk;
              });

              res.on('end', () => {
                  const response = JSON.parse(d);

                  if (response) {
                      const answer = `First property is at address ${response[0]["displayable_address"]}. The price per month is ${response[0]["rental_prices"]["per_month"]}. This property is ${response[0]["furnished_state"].replace("_"," ")}.`
                      this.response.speak(answer).cardRenderer(response[0]["displayable_address"], response[0]["description"], {smallImageUrl: response[0]["image_150_113_url"]} );
                      this.emit(':responseReady');
                  } else {
                      this.response.speak('NO DATA CAME BACK');
                      this.emit(':responseReady');
                  }
              });


              res.on('error', (e) => {
                this.response.speak('ERROR CEFULEE!');
                this.emit(':responseReady');
              });
          });

          req.end();


     },
    'CriteriaIntent': function () {
        const criteria1 = criterias[this.event.request.intent.slots.criteriaone.value];
        const criteria2 = criterias[this.event.request.intent.slots.criteriatwo.value];


        var options = {
                     host: 'b00a7cbf.ngrok.io',
                     path: '/recommendations?comparisons[]=' + encodeURIComponent(criteria1 + " more " + criteria2),
                     method: 'GET'
        };

        const req = https.request(options, (res) => {

         var d = '';

         res.on('data', function (chunk) {
           d += chunk;
         });

         res.on('end', () => {
             const response = JSON.parse(d);

             if (response) {
                lastCheckedPostcode = response['Postcode'].substring(0, response['Postcode'].length-2)
                 const answer = `Given your criteria, the first recommended area is ${response['Postcode']} which has a total number of residents of ${response['Total # of Residents']}.
                 Second recommended area is ${response['Postcode2']} with a total number of residents of ${response['Total # of Residents2']}.
                 Would you like to see the most popular listings for ${lastCheckedPostcode}?`
                 this.response.speak(answer).listen('Yes or No');
                 this.emit(':responseReady');
             } else {
                 this.response.speak('NO DATA CAME BACK');
                 this.emit(':responseReady');
             }
         });


         res.on('error', (e) => {
           this.response.speak('ERROR CEFULEE!');
           this.emit(':responseReady');
         });
     });

     req.end();


    },
    'SayHello': function () {
        this.response.speak('Hello World!')
                     .listen('What can I help you with?');
        this.emit(':responseReady');
    },
    'SayHelloName': function () {
         const postcode = this.event.request.intent.slots.name.value;

         var options = {
             host: 'b00a7cbf.ngrok.io',
             path: '/get-postcode-data?postcode=' + encodeURIComponent(postcode),
             method: 'GET'
         };

         const req = https.request(options, (res) => {

             var d = '';

             res.on('data', function (chunk) {
               d += chunk;
             });

             res.on('end', () => {
                 const response = JSON.parse(d);

                 if (response) {
                     const answer = `Here is some information about ${response['Postcode']}. Region Name is ${response['Region Name']}. The minimum price in this area is ${response['Minimum Price']},
                     the maximum is ${response['Maximum Price']} with an average price of ${response['Average Price']}.`
                     this.response.speak(answer);
                     this.emit(':responseReady');
                 } else {
                     this.response.speak('NO DATA CAME BACK');
                     this.emit(':responseReady');
                 }
             });


             res.on('error', (e) => {
               this.response.speak('ERROR CEFULEE!');
               this.emit(':responseReady');
             });
         });

         req.end();
    },
//    'PostCodesInManc': function () {
//         const firstCriteria = this.event.request.intent.slots.firstCriteria.value;
//         const secondCriteria = this.event.request.intent.slots.secondCriteria.value;
//
//         var options = {
//             host: 'b00a7cbf.ngrok.io',
//             path: '/suggestions?comparisons[]=', //CONTINUA DE AICI, CA SA CONSTRUIESTI LINKUL CUM TREBUIE
//             method: 'GET'
//         };
//
//         const req = https.request(options, (res) => {
//
//             var d = '';
//
//             res.on('data', function (chunk) {
//               d += chunk;
//             });
//
//             res.on('end', () => {
//                 const response = JSON.parse(d);
//
//                 if (response) {
//                     this.response.speak('THERE IS AN ANSWER');
//                     this.emit(':responseReady');
//                 } else {
//                     this.response.speak('NO DATA CAME BACK');
//                     this.emit(':responseReady');
//                 }
//             });
//
//
//             res.on('error', (e) => {
//               this.response.speak('ERROR CEFULEE!');
//               this.emit(':responseReady');
//             });
//         });
//
//         req.end();
//    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'alexa, hello world' or 'alexa, ask hello world my" +
            " name is awesome Aaron'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};
