'use strict'
var express = require('express')
var bodyParser = require('body-parser')
const axios = require('axios')
const FormData = require('form-data')

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', function (req, res) {
  var url = req.url
  var method = req.method
  var obj = req.body
  var mydata = new FormData();
  Object.keys(obj).forEach(function (index) {
    mydata.append(index, obj[index])
  });
  axios({
    url: `https://api.cctrcloud.net${url}`,
    method: method,
    data: mydata,
    headers: mydata.getHeaders()
  })
    .then(response => {
      res.send(response.data)
    })
    .catch(error => {
      console.error(error)
    })
})

app.listen(9999)
