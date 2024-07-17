import os
import boto3

def handler(event, context):

    path = event['path']
    if path == '/':
        return {"statusCode": 404, "body": 'Not Found'}

    # Get the table name from the environment variable
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ.get('TABLE_NAME'))

    # Read the "VISIT COUNT" ket (or create it if it doesn't exist)
    response = table.get_item(Key={'key': 'visit_count'})
    if "Item" in response:
        visit_count = response['Item']['value']
    else:
        visit_count = 0

    # Increment the visit count
    
    new_visit_count = visit_count + 1
    table.put_item(Item={'key': 'visit_count', 'value': new_visit_count})

    version = os.environ.get('VERSION', '1.0')
    response_body = {
        "message": "Hello World",
        "version": version,
        "visitCount": new_visit_count
    }
    return {
        'statusCode': 200,
        'body': response_body
    }