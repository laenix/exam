'use strict'
var express = require('express')
var bodyParser = require('body-parser')
const axios = require('axios')
const FormData = require('form-data')

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', function (req, res) {
  let url = req.url
  let mydata = new FormData();
  mydata.append('number', req.body.number);
  axios({
    url: `https://api.cctrcloud.net${url}`,
    method: "post",
    data: mydata,
    headers: mydata.getHeaders()
  })
    .then(response => {
      if (response.data.code === 200) {
        res.send(response.data.datas.ID)
      }
    })
    .catch(error => {
      console.error(error)
    })
})

app.listen(9999)
