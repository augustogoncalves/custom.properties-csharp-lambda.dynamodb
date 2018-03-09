/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Autodesk.Forge.Sample.Database
{
  public class ObjectCode
  {
    private const string TABLE_NAME = "OBJECT_CODE";
    private static AmazonDynamoDBClient client;
    private static DynamoDBContext DDBContext { get; set; }

    public ObjectCode()
    {
      if (client == null)
      {
        // DynamoDB client
        AmazonDynamoDBConfig clientConfig = new AmazonDynamoDBConfig();
        if (System.Diagnostics.Debugger.IsAttached) clientConfig.ServiceURL = "http://localhost:8000"; // localhost testing only
        client = new AmazonDynamoDBClient(clientConfig);

        // helps mapping DynamoDB documents into objects
        AWSConfigsDynamoDB.Context.TypeMappings[typeof(Model.ObjectCode)] = new Amazon.Util.TypeMapping(typeof(Model.ObjectCode), TABLE_NAME);
        DynamoDBContextConfig config = new DynamoDBContextConfig { Conversion = DynamoDBEntryConversion.V2 };
        DDBContext = new DynamoDBContext(client, config);
      }
    }

    public async Task<List<Model.ObjectCode>> List(string parentObjectCodeId)
    {
      try
      {
        List<ScanCondition> filter = new List<ScanCondition>() { new ScanCondition("ParentId", ScanOperator.Equal, parentObjectCodeId) };
        AsyncSearch<Model.ObjectCode> scan = DDBContext.ScanAsync<Model.ObjectCode>(filter);

        List<Model.ObjectCode> documentList = new List<Model.ObjectCode>();
        do
        {
          documentList.AddRange(await scan.GetNextSetAsync());
        } while (!scan.IsDone);

        return documentList;
      }
      catch (Exception ex)
      {
        Console.WriteLine("Error listing object codes: " + ex.Message);
      }
      return null;
    }

    public async Task<Model.ObjectCode> Get(string objectCodeId)
    {
      ListTablesResponse existingTables = await client.ListTablesAsync();
      if (!existingTables.TableNames.Contains(TABLE_NAME)) await SetupTable(client, TABLE_NAME, "ObjectCode");

      try
      {
        return await DDBContext.LoadAsync<Model.ObjectCode>(objectCodeId);
      }
      catch (Exception ex)
      {
        Console.WriteLine("Error loading object code: " + ex.Message);
      }
      return null;
    }

    public async Task<bool> Save(Model.ObjectCode objectCode)
    {
      ListTablesResponse existingTables = await client.ListTablesAsync();
      if (!existingTables.TableNames.Contains(TABLE_NAME)) await SetupTable(client, TABLE_NAME, "ObjectCode");

      try
      {
        await DDBContext.SaveAsync<Model.ObjectCode>(objectCode);
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine("Error saving object code: " + ex.Message);
        return false;
      }
    }

    #region SetupTable

    /// <summary>
    /// Create table if it doesn't exist. 
    /// Sample code from https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LowLevelDotNetTableOperationsExample.html
    /// </summary>
    /// <param name="client"></param>
    /// <param name="tabelName"></param>
    /// <param name="primaryKey"></param>
    /// <param name="sortKey"></param>
    /// <returns></returns>
    internal static async Task<string> SetupTable(AmazonDynamoDBClient client, string tabelName, string primaryKey, string sortKey = null)
    {
      Console.WriteLine("\n*** Creating table ***");
      var request = new CreateTableRequest
      {
        AttributeDefinitions = new List<AttributeDefinition>()
              {
                  new AttributeDefinition
                  {
                      AttributeName = primaryKey,
                      AttributeType = "S"
                  }
              },
        KeySchema = new List<KeySchemaElement>
              {
                  new KeySchemaElement
                  {
                      AttributeName =primaryKey,
                      KeyType = "HASH" //Partition key
                  }
              },
        ProvisionedThroughput = new ProvisionedThroughput
        {
          ReadCapacityUnits = 5,
          WriteCapacityUnits = 6
        },
        TableName = tabelName
      };

      if (!string.IsNullOrWhiteSpace(sortKey))
      {
        request.AttributeDefinitions.Add(new AttributeDefinition()
        {
          AttributeName = sortKey,
          AttributeType = "S"
        });
        request.KeySchema.Add(new KeySchemaElement()
        {
          AttributeName = sortKey,
          KeyType = "RANGE" // Sort Key
        });
      }
      try
      {
        var response = await client.CreateTableAsync(request);

        var tableDescription = response.TableDescription;
        Console.WriteLine("{1}: {0} \t ReadsPerSec: {2} \t WritesPerSec: {3}",
                  tableDescription.TableStatus,
                  tableDescription.TableName,
                  tableDescription.ProvisionedThroughput.ReadCapacityUnits,
                  tableDescription.ProvisionedThroughput.WriteCapacityUnits);

        string status = tableDescription.TableStatus;
        Console.WriteLine(tabelName + " - " + status);
      }
      catch (Exception e)
      {
        Console.WriteLine(e.Message);
      }
      return tabelName;
    }

    #endregion
  }
}
