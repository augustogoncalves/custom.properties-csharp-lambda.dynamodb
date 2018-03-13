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

using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Autodesk.Forge.Sample.Controllers
{
  [Produces("application/json")]
  [Route("api/ObjectCode")]
  public class ObjectCodeController : Controller
  {
    private Database.ObjectCode Database { get; set; }

    public ObjectCodeController()
    {
      Database = new Sample.Database.ObjectCode();
    }

    [HttpGet]
    public async Task<List<Model.Reference>> List()
    {
      string parentId = (base.Request.Query.ContainsKey("id") ? base.Request.Query["id"][0] : "root");
      if (parentId.Equals("#")) parentId = "root"; // jsTree
      List<Model.ObjectCode> objectCodes = await Database.List(parentId.ToUpper());

      // now we need to "transform" into a list if id/text pair
      List<Model.Reference> referenceList = new List<Model.Reference>();
      foreach (Model.ObjectCode objectCode in objectCodes)
        referenceList.Add(new Model.Reference { id = objectCode.CodeId.ToUpper(), text = objectCode.Name });

      return referenceList;
    }

    [HttpGet("{objectCodeId}")]
    public async Task<Model.ObjectCode> Get(string objectCodeId)
    {
      if (string.IsNullOrWhiteSpace(objectCodeId))
      {
        base.Response.StatusCode = (int)HttpStatusCode.NotFound;
        return null;
      }

      var objectCode = await Database.Get(objectCodeId);
      if (objectCode == null)
      {
        base.Response.StatusCode = (int)HttpStatusCode.NotFound;
      }
      return objectCode;
    }

    [HttpPost()]
    public async Task Create([FromBody]Model.ObjectCode objectCode)
    {
      if (string.IsNullOrWhiteSpace(objectCode.CodeId))
      {
        base.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        return;
      }

      base.Response.StatusCode = (await Database.Save(objectCode) ? (int)HttpStatusCode.OK : (int)HttpStatusCode.InternalServerError);
    }

    [HttpPut("{objectCodeId}")]
    public async Task Update(string objectCodeId, [FromBody]Model.ObjectCode objectCode)
    {
      if (string.IsNullOrWhiteSpace(objectCodeId))
      {
        base.Response.StatusCode = (int)HttpStatusCode.NotFound;
        return;
      }

      if (string.IsNullOrWhiteSpace(objectCode.CodeId) || !objectCodeId.ToUpper().Equals(objectCode.CodeId.ToUpper()))
      {
        base.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        return;
      }

      base.Response.StatusCode = (await Database.Save(objectCode) ? (int)HttpStatusCode.OK : (int)HttpStatusCode.InternalServerError);
    }
  }
}