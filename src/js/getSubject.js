
const list = require('../list.json')
const pako = require('pako')
const fs = require('fs')

function unzip(b64Data) {
    if (b64Data == '' || b64Data == null || b64Data.length == 1) {
        return b64Data
    };
    var strData = atob(b64Data);
    var charData = strData.split('').map(function (x) {
        return x.charCodeAt(0);
    });
    var binData = new Uint8Array(charData);
    var data = pako.inflate(binData, {
        to: 'string'
    });
    return data;
}
const data = list.datas.questionlist
var html = ''
data.forEach((element, index) => {
    html += "<br>" + (index+1)
    html += unzip(element.subjecthtml_svg)
    if (element.questiontypename === "选择题") {
        element.options.forEach(i => {
            if (i.istrue === "1") {
                html += unzip(i.questionoptionhtml_svg).replace('</p>', ' ✅</p>')
            } else {
                html += unzip(i.questionoptionhtml_svg)
            }
        })
    } else {
        html += unzip(element.answerhtml_svg)
    }
});
fs.writeFile('./subject.md', html, err => {
    if (err) {
        console.error(err)
        return
    }
    console.log("文件写入成功")
})