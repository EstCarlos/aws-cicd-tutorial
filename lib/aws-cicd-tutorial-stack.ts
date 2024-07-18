import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dotenv from "dotenv";
import { authContext } from "../cdk.context";
import { createCognitoWithGoogleAuth } from "./auth/cognito";

export class AwsCicdTutorialStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    dotenv.config();

    // Create a table to store some data
    const table = new dynamo.Table(this, "VisitorTimeTable", {
      partitionKey: {
        name: "key",
        type: dynamo.AttributeType.STRING,
      },
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
    });

    // Region
    const lambdaFunction = new lambda.Function(this, "LambdaFunction", {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset("lambda"),
      handler: "main.handler",
      environment: {
        VERSION: process.env.VERSION || "1.0.0",
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(lambdaFunction);

    const functionUrl = lambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    });
    // endregion
    new cdk.CfnOutput(this, "FunctionUrl", {
      value: functionUrl.url,
    });

    // Region Cognito
    const CDKContext: authContext = this.node.tryGetContext("auth");
    const appName = "app-with-google-auth";
    const auth = createCognitoWithGoogleAuth(this, {
      appName,
      google: CDKContext.google,
    });
    // endregion
  }
}
