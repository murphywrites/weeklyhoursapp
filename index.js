// test
const express = require('express');
const app = express()
const cors = require("cors");
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const { default: axios } = require('axios');
const axiosConfig = {}

app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req,res) => {

  console.log(req)
  
  let challenge = req.challenge

  const slackResponse = () => {
    var slack_payload = JSON.parse(req.body.payload)
    const values = slack_payload.state.values

    const submissionKey = Object.keys(values)[0]

    const submissionValue = values[submissionKey]["plain_text_input-action"].value

    const userID = slack_payload.user.id
    const rowIndex = slack_payload.actions[0].action_id
    const responseUrl = slack_payload.response_url

    console.log("Resp URL", responseUrl)


    const config ={
      headers: {
        "Authorization" : "Basic Qk9PTUlfVE9LRU4ubWlrZS5tdXJwaHlAcmpyZWxpYW5jZS5jb206ZGM4ODZiYjgtNTgyNi00MmM3LTg0MWYtYmU1Zjk1OGZjNWNj"
      }
    }

    const data = {
      "@type": "ExecutionRequest",
      "atomId": "5fdb501b-fd83-4568-ae3a-2ad8e2d6ecc7",
      "processId": "f54638ef-7620-4307-be7d-7152f77d9968",
      "DynamicProcessProperties": {
          "DynamicProcessProperty": [{
              "name":"userID",
              "value":userID
          }, {
            "name":"submittedHours",
            "value":submissionValue
        }, {
          "name":"rowIndex",
          "value":rowIndex
        }]
      },
      "ProcessProperties" : {
          "ProcessProperty" : [{
              "componentId": "",
              "ProcessPropertyValue" : [{
                  "key": "", 
                  "value": ""
              }]
          }]
      }
  }

    axios.post("https://api.boomi.com/api/rest/v1/gorjreliance-LQVVJD/ExecutionRequest", data, config).then(
      response => {
      return response.data
   })
   .then(data => {
      console.log("boomi api successful response",data)
   })
   .catch(error => {
      console.log("boomi api error response", error.response.data.error)
   })

   const respData = {
    "text": "Thanks, your response has been logged."
    }
    const respConfig = {
      headers: {
        "Content-type" : "application/json"
      }
    }

   axios.post(responseUrl, respData, respConfig ).then(res => {
     console.log("slack success response", res)
  }
   )
   .catch(err => {
     console.log("slack error response", err)
    
   }
   )


    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(`{"challenge":"qwetwlqkherkwjleqrh"`)
    
  }

  const challengeResponse = () => {
    console.log("running challenge response", JSON.parse(req.payload))
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(`{"challenge":"${challenge}"`)
  }


challenge !== "" ? challengeResponse() : slackResponse()
  
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
