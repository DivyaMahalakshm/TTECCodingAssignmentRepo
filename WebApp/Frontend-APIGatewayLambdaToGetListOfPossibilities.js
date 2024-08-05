import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler =async function(event)
{
    console.log('Event from APIGateway',event);
    const resource= '/getListOfVanityNumbers/{callerNumber}'
    const httpMethod ='GET'
    let gatewayResponse={};
    
    if(event.resource === resource && event.httpMethod===httpMethod)
    try{
      console.log('Inside If')

      // Input Params for to Get the Item from DB
      const getCommand = new GetCommand({
        TableName: process.env.storeVanityNumbersTable,
        Key: {
          PhoneNumber: event.pathParameters.callerNumber
        },
      });
      console.log('getCommandParams',getCommand);
        // Calling API to get the Item from DB by passing the getCommand
        const getItemresponse = await docClient.send(getCommand);
        console.log('getItemresponse',getItemresponse);
      
        if(getItemresponse.Item.VanityNumbers)
        {
            gatewayResponse= {
                statusCode: 200,
                headers: event.headers,
                body: JSON.stringify(getItemresponse.Item.VanityNumbers),
                isBase64Encoded: false
            };
            console.log(gatewayResponse);
            return gatewayResponse;
        }else
        {
          console.log('No Items Found in DB')
        }
        }catch(error){
          console.log('Error',error)
          gatewayResponse= {
                statusCode: 400,
                headers: event.headers,
                body: {error:'No Items Found in DB'},
                isBase64Encoded: false
            };
            console.log(gatewayResponse);
            return gatewayResponse
        }
}