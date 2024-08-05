// a. Create a Lambda that converts phone numbers to vanity numbers and save the best 5 resulting vanity numbers and the caller's number in a DynamoDB table.
//b.Create an Amazon Connect contact flow that looks at the caller's phone number and says the 3 vanity possibilities that come back from the Lambda function.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand,GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
console.log(event)
const digitToLetters = {
    '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
    '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ'
};

// Function to generate all possible vanity numbers for a given phone number
const generateVanityNumbers = (phoneNumber) => {
    let vanityNumbers = [];
    let cleanPhoneNumber = phoneNumber.replace(/[^2-9]/g, ''); // Remove 1s, 0s, and non-digits

    // Recursive function to generate combinations
    const backtrack = (combination, nextDigits) => {
        if (nextDigits.length === 0) {
            vanityNumbers.push(combination);
        } else {
            let digit = nextDigits[0];
            let letters = digitToLetters[digit];
            for (let letter of letters) {
                backtrack(combination + letter, nextDigits.slice(1));
            }
        }
    };

    backtrack('', cleanPhoneNumber);
    return vanityNumbers;
};

const scoreVanityNumber = (vanityNumber) => {
    //we can score the Vanity number, for now the scoring is random
    return Math.random(); // Placeholder
};

// Function to get the top 5 vanity numbers
const getTopVanityNumbers = (phoneNumber) => {
    const allVanityNumbers = generateVanityNumbers(phoneNumber);
    return allVanityNumbers.map(number => ({ number, score: scoreVanityNumber(number) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(v => v.number);
};

// Example usage
const phoneNumber = event.Details.Parameters.customerNumber; // Replace with your actual phone number from the contact flow event
const top5VanityNumbers = getTopVanityNumbers(phoneNumber);
console.log('Top 5 vanity numbers:', top5VanityNumbers);
// Final response to be send to the contact flow when this lambda function is called.
const FinalResponse= await putItem(event,phoneNumber,top5VanityNumbers);
console.log('FinalResponse',FinalResponse)
return FinalResponse;

};
const putItem  = async function (event,number,listOf5VanityNumbers){
    let possibilities={};
    console.log('Inside Function')
    // Input Params for to put the Item into DB
    const putItemcommand = new PutCommand({
    TableName: process.env.storeVanityNumbersTable,
    Item: {
       'PhoneNumber':number ,
       'VanityNumbers': listOf5VanityNumbers
    },
  });
  console.log('Params',command)
  try{
  // Calling API for to put the Item into DB by passing the putItemcommand
  const putDataResponse = await docClient.send(putItemcommand);
  console.log('putDataResponse', putDataResponse);

  if(putDataResponse.$metadata.httpStatusCode === 200)
  {
    // Input Params for to Get the Item from DB
    const getCommand = new GetCommand({
    TableName: process.env.storeVanityNumbersTable,
    Key: {
      PhoneNumber: event.Details.Parameters.customerNumber
    },
  });
  console.log('getCommandParams',getCommand);
  try{
  // Calling API to get the Item from DB by passing the getCommand
  const getItemresponse = await docClient.send(getCommand);
  console.log('getItemresponse',getItemresponse);

  if(getItemresponse.Item.VanityNumbers)
  {
  const listofThreeVanityPossibilities=[];
  for(let i=0;i<getItemresponse.Item.VanityNumbers.length-2;i++)
  {
     listofThreeVanityPossibilities.push(getItemresponse.Item.VanityNumbers[i]); 
  }
  console.log('listofThreeVanityPossibilities',listofThreeVanityPossibilities)
  possibilities={
       TopFiveVanityPossibilities: getItemresponse.Item.VanityNumbers,
       listOfThreeVanityPossibilities: listofThreeVanityPossibilities,
       Message: `<speak>Following are the three vanity possibilities I found for your phone number. First one is <break time="2s"/>
    <say-as interpret-as="spell-out">${getItemresponse.Item.VanityNumbers[0]}</say-as>
second one is <break time="2s"/> <say-as interpret-as="spell-out">${getItemresponse.Item.VanityNumbers[1]}</say-as> and the third one is <break time="2s"/> <say-as interpret-as="spell-out">${getItemresponse.Item.VanityNumbers[2]}</say-as></speak>`
  };
  return possibilities;
  }else
  {
       return {error: 'No Vanity numbers found for the given phone number'}
  }
  }catch(error){
      console.log('Error in Getting the Item',error)
  }
  }else
  {
      return {error: 'No Item present in DB'}
  }
      
  }catch(error){
       console.error('Error in Inserting the Item', error);
  }
};
