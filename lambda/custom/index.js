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
let maxPrice;
let cardMap = [];

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
         const city = this.event.request.intent.slots.city.value;
         let response = "";
         console.log(city)
         if(city !== 'Manchester') {
            response += 'No no no no, mate - you want Manchester. Trust me! '
         } else {
            response += 'Oi mate! '
         }
         this.response.speak(response + 'Here is a list of criteria you can choose from: Income, Employment, Education, Health, Crime, Services, Living Environment. Please pick two:').listen('Pick two ');
         this.emit(':responseReady');
    },

    'DisplayIntent': function () {
         const answer = this.event.request.intent.slots.propertydetails.value;
//         this.response.speak(answer)
//         this.emit(':responseReady')
         console.log(cardMap)
         console.log(answer)
         if (answer === "1st"){
         console.log("reached first")
         this.response.speak('You can see more details about the chosen listing in your Alexa App.').cardRenderer(cardMap[0].title, cardMap[0].content, {largeImageUrl: cardMap[0].image})
         this.emit(':responseReady')
         }
         else if (answer === "second"){

             this.response.speak('You can see more details about the chosen listing in your Alexa App.').cardRenderer(cardMap[1].title, cardMap[1].content, {largeImageUrl: cardMap[1].image})
             this.emit(':responseReady')
         }
         else if (answer === "3rd"){

             this.response.speak('You can see more details about the chosen listing in your Alexa App.').cardRenderer(cardMap[2].title, cardMap[2].content, {largeImageUrl: cardMap[2].image})
             this.emit(':responseReady')
         }
         else {
            this.emit('AMAZON.StopIntent');
         }
    },
     'ListingsIntent': function () {
        const answer = this.event.request.intent.slots.yesornoanswer.value;

        if (answer === "yes"){
            this.response.speak('What is the maximum price you are willing to pay per week?').listen('please');
            this.emit(':responseReady');
        }
        else{
            this.emit('AMAZON.StopIntent');
        }
     },
    'PriceIntent': function () {
     maxPrice = this.event.request.intent.slots.propertymaxprice.value;
     this.emit('DisplayListings');
    },
     'DisplayListings': function () {
         var options = {
                      host: '6a7e50f9.ngrok.io',
                      path: '/listings?postcode=' + encodeURIComponent(lastCheckedPostcode) + '&maximum_price=' + encodeURIComponent(maxPrice),
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
                      let answer = "";
                      for(var i=0;i<3;i++){
                          let ans = "Property "+(i+1);
                          if(response[i]["displayable_address"]){
                               ans += " is at address "+ response[i]["displayable_address"] + ". ";

                          }

                          if(response[i]["rental_prices"]["per_month"]){
                                ans += "The price per month is " + response[i]["rental_prices"]["per_month"] + ". ";
                           }

                          if(response[i]["furnished_state"]) {
                            ans += "This property is " + response[i]["furnished_state"].replace("_"," ") + ". ";
                          }
                          cardMap.push({title: response[i]["displayable_address"], content: response[i]["details_url"], image: response[i]["image_150_113_url"]})


                          answer += ans;

                      }

                      answer += "Which one would you like to save?"

                      this.response.speak(answer).listen('Insert one')
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
                     host: 'd9f0b7e4.ngrok.io',
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
             host: 'd9f0b7e4.ngrok.io',
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
