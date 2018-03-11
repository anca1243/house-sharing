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
    "employment": "b",
    "education" : "c",
    "health" : "d",
    "crime" : "e",
    "services" : "f",
    "living environment" : "g"
}

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
        this.response.speak('Oi mate! Here is criteria:').listen('Pick two ');
        this.emit(':responseReady');
    },
     'ListingsIntent': function () {
        const answer = this.event.request.intent.slots.yesornoanswer.value;
        if (answer === "yes"){
            this.response.speak('Teapa n ai mai luat teapa');
            this.emit(':responseReady');
        }
        else{
            this.emit('AMAZON.StopIntent');
        }
         this.response.speak('Oi mate! Here is criteria:').listen('Pick two ');
         this.emit(':responseReady');
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
                 const answer = `Given your criteria, the first recommended area is ${response['Postcode']} which has a total number of residents of ${response['Total # of Residents']}.
                 Second recommended area is ${response['Postcode2']} with a total number of residents of ${response['Total # of Residents2']}.
                 Would you like to see the most popular listings for ${response['Postcode'].substring(0, response['Postcode'].length-2)}?`
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
