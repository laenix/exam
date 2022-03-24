var key = getCookie('key');
if (!key) {
    window.location.href = practiceSiteUrl + '/login.html';
}
/**获取地址参数 **/

var courseid = getQueryString('courseid'), teacherid = getQueryString('teacherid'), practiseid = getQueryString('practiseid'), coursename = getQueryString('coursename'),studentpractise_id = getQueryString('studentpractise_id'), studentpractisequestioncount = getQueryString('studentpractisequestioncount');
var pageindex = 1, questionCount, pagecount = 15, //当前页的题数
statenum = 0;
var chapterid, questiontypeid;
var ff = 0;
var newData = [], //当前页请求回的数据
swiper = null, //swiper对象, //swiper对象
state = false, produceData, practisetype = 0;
var clickNum = 0;
//点击的个数
var clickNumRight = 0;
//点击的正确个数
//收藏与标记与保存练习答案
var ismark=0, iscollect=0, studentpractiseid, wrongTotal = 0, rightTotal = 0;
var start, end;
var timelength = 0;

start = new Date();
var splitArrayDate=null;//下一页试题id
$(document).ready(function() {

    $("#coursename").text(decodeURI(decodeURI(coursename)));
    $.when(dataAjax('')).done(function(data) {
        

        pageInit(data);

    })
    chapterTopic();
    $('.swiper-button-next').click(function(){
        $('.swiperDisabled').show();
        $('.swiper-button-next').hide();
        setTimeout(function(){
        $('.swiperDisabled').hide();
        $('.swiper-button-next').show();
        },1000)
    })
    
      
});
var studentpractiseid;

//ajax获取数据
function dataAjax(nextids) {
    var defer = $.Deferred();

    $.ajax({
        url: ApiUrl + "/index.php?act=studentpracticeapi&op=getStudentPractiseQuestionList",
        type: 'post',
        data: {
            key: key,
            courseid: courseid,
            practiseid: practiseid,
            studentpractiseid:studentpractise_id,
            chapterid: chapterid,
            questiontypeid: questiontypeid,
            teacherid: teacherid,
            pagecount: pagecount,
            pageindex: pageindex,
            practisetype: practisetype,
            statenum: statenum,
            id:nextids,
            studentpractisequestioncount: studentpractisequestioncount

        },
        dataType: 'json',
        success: function(result) {
            defer.resolve(result);
            if(result.datas.split){
                splitArrayDate=result.datas.split;
            }
            studentpractiseid=result.datas.studentpractiseid;

        }
    });
    return defer;
}
if(localStorage.getItem("dosomethingStart")=='false'){
    startTime=Math.ceil(new Date().getTime()/1000);
}

function isNullOrEmpty(res) {
    if (res === '' || res == null || res == "null" || res == undefined || res == 'undefined') {
        return true;
    } else {
        return false;
    }
}

var getDuration = function(){
        var time = '',
            hours = 0,
            minutes = 0,
            seconds = 0,
            endTime = Math.ceil(new Date().getTime()/1000),
            duration = endTime - startTime;
        // hours = Math.floor(duration/3600); //停留小时数
        minutes = duration%3600/60; //停留分钟数
        // seconds = Math.floor(duration%3600%60); //停留秒数
        // time = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
        time = minutes

        return time;
    }; 
//监听触发操作
var changeID=getQueryString('a');
if(changeID!=localStorage.getItem("changeID")){
    localStorage.setItem("openp", true)
    localStorage.removeItem("dosomethingStart");
    localStorage.removeItem("duration");
}
localStorage.setItem("changeID",changeID);
// 次数

window.onbeforeunload = function(e){
    if(localStorage.getItem("dosomethingStart")=='false'){

        var duration = getDuration();
        localStorage.setItem("duration",duration);

        // 存储
        if(localStorage.getItem("openp")=='true'){
            $.ajax({
                url: ApiUrl + "/index.php?act=studentpracticeapi&op=addpractisecount",
                type: 'post',
                data: {
                    key: key,
                    studentpractiseid: studentpractiseid
                },
                dataType: 'json',
                success: function(result) {
                }
            })
        }
        $.ajax({
            url: ApiUrl + "/index.php?act=studentpracticeapi&op=addpractisetimelength",
            type: 'post',
            data: {
                key: key,
                timelength:duration,
                studentpractiseid: studentpractiseid
            },
            dataType: 'json',
            success: function(result) {
            }
        })
        localStorage.setItem("openp", false)
    }   
};

function pageInit(data) {
    //维护的默认json    
    produceData = data.datas.questionlist;

    newData = data.datas.questionlist;
    
    //题目列表
    questionCount = data.datas.questioncount;
    //题目总数
    studentpractiseid = data.datas.studentpractiseid;
    $("#swiper-total").text(questionCount);
    //后台传过来的总页数
    isShowWrongTip(newData);
    //暂无数据显示
    //初始化swiper
    // 默认进来判断第一个有没有标记和收藏
    ismarkAndIscollect(newData);

    swiper = new Swiper('.swiper-container',{
        // preventLinksPropagation: true,
        // preventClicksPropagation:true,   //阻止click冒泡。拖动Swiper时阻止click事件。
        grabCursor: true,
        //抓手
        // shortSwipes:false,
        preventClicks: false,
        initialSlide: 0,
        observer: true,
        //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true,
        //修改swiper的父元素时，自动初始化swiper
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        virtual: {
            slides: newData,
            renderSlide: function(slide, index) {
                return dataProcessing(slide, index);
                //处理slide
            }
        },
        on: {
            
            transitionEnd: function() {
                //回调函数，过渡结束时触发。
                start = new Date();
                $("script").remove();

                var activeindex = swiper.activeIndex;
                //当前页的索引
                produceData = swiper.virtual.slides; //123
                // console.log(newData)
                //swiper中的所有的slide
                if (produceData == "") {
                    return false;
                } else {
                    // 滑动收藏变色
                    if (produceData[activeindex].iscollect == 1) {
                        $('.p-collect').addClass('icon-shoucang font-color-yellow').removeClass('icon-wei-shoucang');
                        $('.collect-img').attr('src','images/collect-yellow.png');
                        iscollect=1;
                    } else {
                        $('.p-collect').addClass('icon-wei-shoucang').removeClass('icon-shoucang font-color-yellow');
                        $('.collect-img').attr('src','images/collect-gray.png');
                        iscollect=0;
                    }
                    // 滑动mark标记变色
                    if (produceData[activeindex].ismark == 1) {
                        $('.p-mark').addClass('icon-weizhi font-color-yellow').removeClass('icon-biaoji');
                        $('.mark-img').attr('src','images/mark-yellow.png');
                        ismark=1;
                    } else {
                        $('.p-mark').removeClass('icon-weizhi font-color-yellow').addClass('icon-biaoji');
                        $('.mark-img').attr('src','images/mark-gray.png');
                        ismark=0;

                    }
                }

                if (this.activeIndex != (pagecount * pageindex - 2))
                    return;
                //判断是否为当前页的最后一条数据，否的话，停止
                pageindex++;
                //增加页数
                if (practisetype == 0) {
                    statenum = $("#tab-no-practice-hidden").val();
                } else if (practisetype == 4) {
                    statenum = $("#tab-wrong-hidden").val();
                }
                $.when(dataAjax(splitArrayDate[pageindex-1])).done(function(data) {
                    getData(swiper, data);
                    //重新加载新的数据

                });
            }
        }
    });

}
//解压
function unzip(b64Data) {
    if (b64Data == '' || b64Data == null || b64Data.length==1) {
        return b64Data
    }
    ;var strData = atob(b64Data);
    // Convert binary string to character-number array
    var charData = strData.split('').map(function(x) {
        return x.charCodeAt(0);
    });
    // Turn number array into byte-array
    var binData = new Uint8Array(charData);
    // // unzip
    var data = pako.inflate(binData, {
        to: 'string'
    });
    return data;
}
//压缩
function zip(str) {
    if (str == '' || str == null) {
        return str
    }
    ;var binaryString = pako.gzip(str, {
        to: 'string'
    });
    return btoa(binaryString);
}

//请求数据并添加至slide中
function getData(swiper, data) {
    newData = data.datas.questionlist;
    //题目列表
    $.each(newData, function(idx, ele) {
        //逐条追加数据至slide中
        swiper.virtual.appendSlide(ele);
    })

}
//区分类型
function dataProcessing(data, index) {
    var self_qtn = data.questiontypenumber;

    if (data.questiontypenumber == 1) {
        //单选题

        return showRadio(data, index, self_qtn);

    } else if (data.questiontypenumber == 2) {
        //多选题

        return showCheckbox(data, index, self_qtn);

    } else if (data.questiontypenumber == 3) {
        //判断

        return showJudge(data, index, self_qtn);

    } else if (data.questiontypenumber == 4) {
        //填空题

        return gapFilling(data, index, self_qtn);

    } else if (data.questiontypenumber == 5 || data.questiontypenumber == 8) {
        //主观题

        return showSubjectiveItem(data, index, self_qtn);

    } else if (data.questiontypenumber == 6) {
        //共用题干题

        return sharedProblem(data, index, self_qtn);

    } else if (data.questiontypenumber == 7) {
        //共用选项题
        return showShareOptions(data, index, self_qtn);
    }
}

//处理单选
function showRadio(data, index, self_qtn) {
    var letterArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "K", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var options = data.options;
    var analysishtml_svg = unzip(data.analysishtml_svg);
    var studentanswerhtml = unzip(data.studentanswerhtml);
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);
    var studentansweriswrong = data.iswrong;
    var i = 1;
    var showRadioArr = [index, options, analysishtml_svg, letterArr, studentanswerhtml, studentansweriswrong, self_qtn, i];
    var html = '';
    var bs = '';

    // if (data.questiontypename == "选择题" || data.questiontypename == "选择") {
    //     bs += '<b class="type">单选题</b>'
    // } else {
    bs += '<b class="type">' + data.questiontypename + '</b>'
    bs += '<span>' + questiontypedescription + '</span>'
    // }
    html += '<div class="swiper-slide practice_slide">'
    /*  html += '<iframe width="100%" height="100%"  id="iframePreview' + index + '"></iframe>'*/
    html += '<div class="practice_slide_content slide-con qtm" data-ismark="' + data.ismark + '" data-id="' + data.id + '" data-chapterid="' + data.chapterid + '" data-questionid="' + data.questionid + '" data-questiontypenumber="' + data.questiontypenumber + '">'
    html += '<div class="practice_slide_title clearfix">'
    html += bs
    html += '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>'
    html += '</div>'

    if (practisetype == 0 || practisetype == 2 || practisetype == 4) {
        html += showRadioPractice(showRadioArr);

    } else if (practisetype == 1 || practisetype == 3) {

        html += showRadioShow(showRadioArr);

    }
    html += '</div>'
    html += '</div>';

    return html;

}

//单选做题
function showRadioPractice(showRadioArr) {
    var index = showRadioArr[0];
    var options = showRadioArr[1];
    var analysishtml_svg = showRadioArr[2];
    var letterArr = showRadioArr[3];
    var self_qtn = showRadioArr[6];
    var i = showRadioArr[7];
    var html = '';
    var li_option = '';
    $.each(options, function(idx, ele) {
        //questionoptionhtml_svg
        var questionoptionhtml_svg = ele.questionoptionhtml_svg == '' ? ele.questionoptionhtml_svg : unzip(ele.questionoptionhtml_svg);
        li_option += '<li><div class="zxf-radio"><input onclick="singleClick(this)" type="radio"  name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + questionoptionhtml_svg + '</div></li>'
    })
    html += '<ul class="option_content">' + li_option + '</ul>'
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }
    html += '<div class="right_ans_mark font-color-blue"><i class="iconfont icon-zhengque"></i></div>'
    html += '<div class="practice_analysis">'
    html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
    html += '<div class="answer">正确答案：<span class="answer-text">B</span></div>'
    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">解析:</span>'
    html += ' <div class="desc">' + analysishtml_svg + '</div>'
    html += ' </div>'
    html += '</div>'
    return html;
}
//单选显示效果
function showRadioShow(showRadioArr) {
    var index = showRadioArr[0];
    var options = showRadioArr[1];
    var analysishtml_svg = showRadioArr[2];
    var letterArr = showRadioArr[3];
    var studentanswerhtml = showRadioArr[4];
    var iswrong = showRadioArr[5];
    var self_qtn = showRadioArr[6];
    var i = showRadioArr[7];
    var zimu_text;
    var html = '';
    var li_option = '';

    if (iswrong == 0) {
        $.each(options, function(idx, ele) {
            if (ele.istrue == 1) {
                li_option += '<li><div class="zxf-radio on_right"><input class="active"  checked type="radio" name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            } else {
                li_option += '<li><div class="zxf-radio"><input  type="radio" name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i ></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            }
        })
        html += '<ul class="option_content">' + li_option + '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        html += '<div class="right_ans_mark font-color-blue" style="display:block"><i class="iconfont icon-zhengque"></i></div>'
        return html;
    } else if (iswrong == 1) {

        $.each(options, function(idx, ele) {
            if (studentanswerhtml == letterArr[idx]) {
                li_option += '<li><div class="zxf-radio on_wrong"><input class="onactive" checked type="radio"  name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            } else {
                li_option += '<li><div class="zxf-radio "><input  type="radio" name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            }

            if (ele.istrue == 1) {
                zimu_text = letterArr[idx]
            }

        })
        html += '<ul class="option_content">' + li_option + '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        html += '<div class="practice_analysis" style="display:block">'
        html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
        html += '<div class="answer">正确答案：<span class="answer-text">' + zimu_text + '</span></div>'
        html += '<div class="analysis-content" style="overflow:hidden">'
        html += '<span class="txt">解析:</span>'
        html += ' <div class="desc">' + analysishtml_svg + '</div>'
        html += ' </div>'
        html += '</div>'
        return html;
    } else {

        $.each(options, function(idx, ele) {
            li_option += '<li><div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
        })
        html += '<ul class="option_content">' + li_option + '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        return html;
    }
}

function showCheckbox(data, index, self_qtn) {
    var letterArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "K", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var options = data.options;
    var analysishtml_svg = unzip(data.analysishtml_svg);
    var analysisiswrong = data.iswrong;
    var zhengque = unzip(data.studentanswerhtml) == '' ? '空' : unzip(data.studentanswerhtml);
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);
    var showCheckArr = [options, letterArr, analysishtml_svg, zhengque, analysisiswrong, self_qtn];
    var html = '';
    var bs = '';
    // if (data.questiontypename == "选择题" || data.questiontypename == "选择") {
    //     bs += '<b class="type">多选题</b>'
    // } else {
    bs += '<b class="type">' + data.questiontypename + '</b>'
    bs += '<span>' + questiontypedescription + '</span>'
    // }
    html += '<div class="swiper-slide practice_slide">'
    html += '<div class="practice_slide_content slide-con qtm" data-ismark="' + data.ismark + '" data-id="' + data.id + '" data-chapterid="' + data.chapterid + '" data-questionid="' + data.questionid + '" data-questiontypenumber="' + data.questiontypenumber + '">'
    html += '<div class="practice_slide_title clearfix">'
    html += bs
    html += '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>'
    html += '</div>'
    if (practisetype == 0 || practisetype == 2 || practisetype == 4) {
        html += showCheckboxPractice(showCheckArr);

    } else if (practisetype == 1 || practisetype == 3) {
        html += showCheckboxShow(showCheckArr);
    }
    html += '</div>'
    html += '</div>';
    return html;
}

//多选做题
function showCheckboxPractice(showCheckArr) {
    var options = showCheckArr[0];
    var letterArr = showCheckArr[1];
    var analysishtml_svg = showCheckArr[2];
    var self_qtn = showCheckArr[5];
    var html = '';
    var li_option = '';
    $.each(options, function(idx, ele) {
        li_option += '<li><div class="zxf-check"><input class="active" data-isright="' + ele.istrue + '" type="checkbox"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
    })
    html += '<ul class="option_content">' + li_option + '</ul>'
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }

    html += '<button  class="confirm-btn" onclick="confirmBtn(this)"><span>确定</span></button>'
    html += '<div class="right_ans_mark font-color-blue"><i class="iconfont icon-zhengque"></i></div>'
    html += '<div class="practice_analysis">'
    html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
    html += '<div class="answer">正确答案：<span class="answer-text">B</span></div>'
    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">解析:</span>'
    html += '<div class="desc">' + analysishtml_svg + '</div>'
    html += '</div>'
    html += '</div>'
    return html;

}

//多选显示效果
function showCheckboxShow(showCheckArr) {
    var options = showCheckArr[0];
    var letterArr = showCheckArr[1];
    var analysishtml_svg = showCheckArr[2];
    var zhengque = showCheckArr[3].toString();
    var iswrong = showCheckArr[4];
    var self_qtn = showCheckArr[5];
    var zimu_text = '';
    var html = '';
    var li_option = '';

    if (iswrong == 0) {
        $.each(options, function(idx, ele) {
            if (ele.istrue == 1) {
                li_option += '<li><div class="zxf-check on_right"><input onclick="no_click_check(this)" class="active" checked data-isright="' + ele.istrue + '" type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            } else {

                li_option += '<li><div class="zxf-check"><input onclick="no_click_check(this)" data-isright="' + ele.istrue + '" type="checkbox" id="checkboxlabel' + idx + '" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'

            }

        })
        html += '<ul class="option_content">' + li_option + '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        html += '<div class="right_ans_mark font-color-blue" style="display:block"><i class="iconfont icon-zhengque"></i></div>'
        return html;
    } else if (iswrong == 1) {
        $.each(options, function(idx, ele) {
            if (zhengque.indexOf(letterArr[idx]) == -1) {
                li_option += '<li><div class="zxf-check"><input onclick="no_click_check(this)" data-isright="' + ele.istrue + '" type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            } else {
                li_option += '<li><div class="zxf-check  on_wrong"><input onclick="no_click_check(this)" class="onactive" checked data-isright="' + ele.istrue + '" type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            }
            if (ele.istrue == 1) {
                zimu_text += letterArr[idx];
            }
        })
        html += '<ul class="option_content">' + li_option + '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }

        html += '<div class="practice_analysis" style="display:block">'
        html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
        html += '<div class="answer">正确答案：<span class="answer-text">' + zimu_text + '</span></div>'
        html += '<div class="analysis-content" style="overflow:hidden">'
        html += '<span class="txt">解析:</span>'
        html += '<div class="desc">' + analysishtml_svg + '</div>'
        html += '</div>'
        html += '</div>'
        return html;

    } else {
        $.each(options, function(idx, ele) {
            if (ele.istrue == 1) {
                li_option += '<li><div class="zxf-check"><input  data-isright="' + ele.istrue + '" type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'
            } else {

                li_option += '<li><div class="zxf-check"><input data-isright="' + ele.istrue + '" type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + unzip(ele.questionoptionhtml_svg) + '</div></li>'

            }

        })
        html += '<ul class="option_content">' + li_option + '</ul>'
        // if (self_qtn != 6) {
        //     //如果是公共题干题，则子题是没有收藏和标记
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        return html;
    }

}
//处理判断
function showJudge(data, index, self_qtn) {
    var answer = data.answer;
    var analysishtml_svg = unzip(data.analysishtml_svg);
    var studentanswerhtml = unzip(data.studentanswerhtml);
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);
    var studentansweriswrong = data.iswrong;
    var i = 1;
    var showJudgeArr = [index, answer, analysishtml_svg, studentanswerhtml, studentansweriswrong, self_qtn, i];
    var html = '';
    html += '<div class="swiper-slide practice_slide" >'
    html += '<div class="practice_slide_content slide-con qtm" data-answer="' + data.answer + '" data-ismark="' + data.ismark + '" data-id="' + data.id + '" data-chapterid="' + data.chapterid + '" data-questionid="' + data.questionid + '" data-questiontypenumber="' + data.questiontypenumber + '">'
    html += '<div class="practice_slide_title clearfix">'
    html += '<b class="type">' + data.questiontypename + '</b>'
    html += '<span>' + questiontypedescription + '</span>'
    html += '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>'
    html += '</div>'
    if (practisetype == 0 || practisetype == 2 || practisetype == 4) {

        html += showJudgePractice(showJudgeArr);

    } else if (practisetype == 1 || practisetype == 3) {

        html += showJudgeShow(showJudgeArr);

    }
    html += '</div>'
    html += '</div>';
    return html;
}

//判断做题

function showJudgePractice(showJudgeArr) {
    var index = showJudgeArr[0];
    var answer = showJudgeArr[1];
    var analysishtml_svg = showJudgeArr[2];
    var self_qtn = showJudgeArr[5];
    var i = showJudgeArr[6];
    var html = '';
    html += '<ul class="option_content">'
    html += '<li>'
    html += '<div class="zxf-radio"><input onclick="panduan(event,this)" type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
    html += '<div class="txt">对</div>'
    html += '</li>'
    html += '<li>'
    html += '<div class="zxf-radio"><input onclick="panduan(event,this)" type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
    html += '<div class="txt">错</div>'
    html += '</li>'
    html += '</ul>'
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }

    html += '<div class="right_ans_mark font-color-blue"><i class="iconfont icon-zhengque"></i></div>'
    html += '<div class="practice_analysis">'
    html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
    html += '<div class="answer">正确答案：<span class="answer-text">B</span></div>'
    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">解析:</span>'
    html += '<div class="desc">' + analysishtml_svg + '</div>'
    html += '</div>'
    html += '</div>';
    return html;

}
//判断显示效果
function showJudgeShow(showJudgeArr) {
    var index = showJudgeArr[0];
    var answer = showJudgeArr[1];
    var analysishtml_svg = showJudgeArr[2];
    var studentanswerhtml = showJudgeArr[3];
    var studentansweriswrong = showJudgeArr[4];
    var self_qtn = showJudgeArr[5];
    var i = showJudgeArr[6];
    var html = '';

    if (studentansweriswrong == 0) {
        html += '<ul class="option_content">'
        if (answer == "对") {
            html += '<li>'
            html += '<div class="zxf-radio on_right"><input class="active" checked type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">对</div>'
            html += '</li>'
            html += '<li>'
            html += '<div class="zxf-radio"><input type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">错</div>'
            html += '</li>'

        } else {
            html += '<li>'
            html += '<div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">对</div>'
            html += '</li>'
            html += '<li>'
            html += '<div class="zxf-radio on_right"><input class="active" checked type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">错</div>'
            html += '</li>'
        }
        html += '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        html += '<div class="right_ans_mark font-color-blue" style="display:block"><i class="iconfont icon-zhengque"></i></div>'
        return html;

    } else if (studentansweriswrong == 1) {
        html += '<ul class="option_content">'
        if (answer == "对") {
            html += '<li>'
            html += '<div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">对</div>'
            html += '</li>'
            html += '<li>'
            html += '<div class="zxf-radio on_wrong"><input class="onactive" checked type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">错</div>'
            html += '</li>'

        } else {
            html += '<li>'
            html += '<div class="zxf-radio on_wrong"><input class="onactive" checked type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">对</div>'
            html += '</li>'
            html += '<li>'
            html += '<div class="zxf-radio"><input type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
            html += '<div class="txt">错</div>'
            html += '</li>'
        }
        html += '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        html += '<div class="practice_analysis" style="display:block">' + '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>' + '<div class="answer">正确答案：<span class="answer-text">' + answer + '</span></div>' + '<div class="analysis-content" style="overflow:hidden">' + '<span class="txt">解析:</span>' + '<div class="desc">' + analysishtml_svg + '</div>' + '</div>' + '</div>'
        return html;

    } else {
        html += '<ul class="option_content">'
        html += '<li>'
        html += '<div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
        html += '<div class="txt">对</div>'
        html += '</li>'
        html += '<li>'
        html += '<div class="zxf-radio"><input type="radio"  name="radio' + i + '' + index + '" /><i></i></div>'
        html += '<div class="txt">错</div>'
        html += '</li>'
        html += '</ul>'
        // if (self_qtn != 6) {
        //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
        // }
        return html;
    }

}

//处理填空题
function gapFilling(data, index, self_qtn) {
    var html = '';
    var options = data.options;
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);
    var li_option = '';
    $.each(options, function(idx, ele) {

        li_option += '<li><div class="txt">空'+(idx+1)+'：' + unzip(ele.questionoptionhtml_svg) + '</div></li>'

    })
    var analysishtml_svg = unzip(data.analysishtml_svg);
    var gapFillingArr = [li_option, analysishtml_svg];

    html += '<div class="swiper-slide practice_slide">'
    html += '<div class="practice_slide_content slide-con qtm" data-ismark="' + data.ismark + '" data-id="' + data.id + '" data-chapterid="' + data.chapterid + '" data-questionid="' + data.questionid + '" data-questiontypenumber="' + data.questiontypenumber + '" data-click-num="true">'
    html += '<div class="practice_slide_title clearfix">'
    html += '<b class="type">' + data.questiontypename + '</b>'
    html += '<span>' + questiontypedescription + '</span>'
    html += '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>'
    html += '</div>'
    if (practisetype == 0 || practisetype == 2 || practisetype == 4) {

        html += gapFillingPractice(gapFillingArr);

    } else if (practisetype == 1 || practisetype == 3) {

        html += gapFillingShow(gapFillingArr);

    }
    html += '</div>'
    html += '</div>';
    return html;
}
//填空练习
function gapFillingPractice(gapFillingArr) {
    var lis = gapFillingArr[0];

    var analysishtml_svg = gapFillingArr[1];
    var self_qtn = gapFillingArr[2];
    var html = '';
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }
    html += '<div class="show_answer" onclick="show_answer(event,this)" data-clickover="true">'
    html += '<a href="javascript:;" >显示答案</a>'
    html += '</div>'
    html += '<ul class="option_content no-p-l fill_option">' + lis + '</ul>'
    html += '<div class="practice_analysis">'

    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">解析:</span>'
    html += '<div class="desc">' + analysishtml_svg + '</div>'
    html += '</div>'
    html += '</div>'
    return html;

}
//填空展示
function gapFillingShow(gapFillingArr) {
    var lis = gapFillingArr[0];
    var analysishtml_svg = gapFillingArr[1];
    var self_qtn = gapFillingArr[2];
    var html = '';
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }
    html += '<ul class="option_content no-p-l">' + lis + '</ul>'
    html += '<div class="practice_analysis" style="display:block">'

    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">解析:</span>'
    html += '<div class="desc">' + analysishtml_svg + '</div>'
    html += '</div>'
    html += '</div>'
    return html;
}

//处理主观题
function showSubjectiveItem(data, index, self_qtn) {
    //默认是5
    var answerhtml_svg = unzip(data.answerhtml_svg);
    var analysishtml_svg = unzip(data.analysishtml_svg);
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);

    if(String(self_qtn) == '8'){//如果是实操题答案内容不一样
        answerhtml_svg = '';
        analysishtml_svg = unzip(data.scorestandardhtml);
        for(var i=0;i<data.scoredimensions.length;i++){
            answerhtml_svg += `
                <p fr-original-style="" style="margin: 0pt 0px; padding: 0px; font-size: 12pt; font-family: SimSun, sans-serif;">
                    ${i+1}, ${data.scoredimensions[i].name} ${data.scoredimensions[i].score}分
                </p>
            `;
        }
    }

    var showSubjectiveItemArr = [answerhtml_svg, analysishtml_svg, self_qtn];
    var html = '';

    html += '<div class="swiper-slide practice_slide">'
    html += '<div class="practice_slide_content slide-con qtm" data-ismark="' + data.ismark + '" data-id="' + data.id + '" data-chapterid="' + data.chapterid + '" data-questionid="' + data.questionid + '" data-questiontypenumber="' + data.questiontypenumber + '" data-click-num="true">'
    html += '<div class="practice_slide_title clearfix">'
    html += '<b class="type">' + data.questiontypename + '</b>'
    html += '<span>' + questiontypedescription + '</span>'
    html += '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>'
    html += '</div>'
    if (practisetype == 0 || practisetype == 2 || practisetype == 4) {

        html += showSubjectiveItemPractice(showSubjectiveItemArr);

    } else if (practisetype == 1 || practisetype == 3) {

        html += showSubjectiveItemShow(showSubjectiveItemArr);

    }

    html += '</div>'
    html += '</div>';
    return html;
}
//主观题练习
function showSubjectiveItemPractice(showSubjectiveItemArr) {

    var answerhtml_svg = showSubjectiveItemArr[0];
    var analysishtml_svg = showSubjectiveItemArr[1];
    var self_qtn = showSubjectiveItemArr[2];
    var html = '';
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }
    var right_answer = "正确答案";
    var analysis = "解析";
    if(self_qtn == 8){
        right_answer = "评分维度";
        analysis = "评分标准";
    }
    html += '<div class="show_answer" onclick="show_answer(event,this)" data-clickover="true">'
    html += '<a href="javascript:;" >显示答案</a>'
    html += '</div>'
    html += '<div class="practice_analysis">'
    html += '<div class="answer">'+ right_answer +'：<span class="answer-text">' + answerhtml_svg + '</span></div>'
    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">'+ analysis +':</span></br>'
    html += '<div class="desc">' + analysishtml_svg + '</div>'
    html += '</div>'
    html += '</div>'
    return html;

}
//主观题展示
function showSubjectiveItemShow(showSubjectiveItemArr) {
    var answerhtml_svg = showSubjectiveItemArr[0];
    var analysishtml_svg = showSubjectiveItemArr[1];
    var self_qtn = showSubjectiveItemArr[2];
    var html = '';
    // if (self_qtn != 6) {
    //     html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    // }
    var right_answer = "正确答案";
    var analysis = "解析";
    if(self_qtn == 8){
        right_answer = "评分维度";
        analysis = "评分标准";
    }
    html += '<div class="practice_analysis" style="display:block">'
    html += '<div class="answer">'+ right_answer +'<span class="answer-text">' + answerhtml_svg + '</span></div>'
    html += '<div class="analysis-content" style="overflow:hidden">'
    html += '<span class="txt">'+ analysis +':</span></br>'
    html += '<div class="desc">' + analysishtml_svg + '</div>'
    html += '</div>'
    html += '</div>'
    return html;

}

//处理公共题干题
function sharedProblem(data, index, self_qtn) {
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);

    //  峰峰
    // html = '<div class="swiper-slide practice_slide">' + '<div class="practice_slide_content big-sharedProblem slide-con qtm" data-id="' + data.id + '" data-questiontypenumber="' + data.questiontypenumber + '" data-questionid="' + data.questionid + '" data-click-statu="true" data-shared-click="true">' + '<div class="practice_slide_title clearfix">' + ' <b class="type">' + data.questiontypename + '</b>' + '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>' + '</div>' + '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>' + sharedProblemPublic(data, index, self_qtn) + '</div>' + '</div>';
    html = '<div class="swiper-slide practice_slide">' + '<div class="practice_slide_content big-sharedProblem slide-con qtm" data-id="' + data.id + '" data-questiontypenumber="' + data.questiontypenumber + '" data-questionid="' + data.questionid + '" data-click-statu="true" data-shared-click="true">' + '<div class="practice_slide_title clearfix">' + ' <b class="type">' + data.questiontypename + '</b>' + '<span>' + questiontypedescription + '</span>' + '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>' + '</div>'  + sharedProblemPublic(data, index, self_qtn) + '</div>' + '</div>';

    return html;
}

function sharedProblemPublic(data, index, self_qtn) {
    var html = '';
    for (var i = 0; i < data.subquestions.length; i++) {
        var sonType = data.subquestions[i].questiontypenumber;
        var id = data.subquestions[i].id;
        var questionid = data.subquestions[i].questionid;
        var chapterid = data.subquestions[i].chapterid;
        var iswrong = data.subquestions[i].iswrong;
        var courseid = data.subquestions[i].courseid;
        var sonTypeName = data.subquestions[i].questiontypename;
        var sonTitle = unzip(data.subquestions[i].subjecthtml_svg);

        var sonAnalysishtml = unzip(data.subquestions[i].analysishtml_svg);
        var sonOptions = data.subquestions[i].options;
        var answer = data.subquestions[i].answer;
        var state = data.subquestions[i].state;
        var sonAnswerhtml = unzip(data.subquestions[i].answerhtml_svg);
        var sonStudentAnswerhtml = unzip(data.subquestions[i].studentanswerhtml);
        var lis = '';
        var letterArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "K", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        if (sonType == 1) {

            var showRadioArr = [index, sonOptions, sonAnalysishtml, letterArr, sonStudentAnswerhtml, iswrong, self_qtn, i];
            html += '<div class="practice_slide_content common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="practice_slide_title clearfix">'
            html += '<b class="type type_circle">' + (i + 1) + '</b>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {
                html += showRadioPractice(showRadioArr);

            } else if (practisetype == 1 || practisetype == 3) {

                html += showRadioShow(showRadioArr);

            }

            html += '</div>'

        } else if (sonType == 2) {

            var showCheckArr = [sonOptions, letterArr, sonAnalysishtml, sonStudentAnswerhtml, iswrong, self_qtn];
            html += '<div class="practice_slide_content common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="practice_slide_title clearfix">'
            html += '<b class="type type_circle">' + (i + 1) + '</b>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {
                html += showCheckboxPractice(showCheckArr);

            } else if (practisetype == 1 || practisetype == 3) {

                html += showCheckboxShow(showCheckArr);

            }

            html += '</div>'

        } else if (sonType == 3) {

            var showJudgeArr = [index, answer, sonAnalysishtml, sonStudentAnswerhtml, iswrong, self_qtn, i];
            html += '<div class="practice_slide_content common-slide slide-con" data-answer="' + answer + '" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="practice_slide_title clearfix">'
            html += '<b class="type type_circle">' + (i + 1) + '</b>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {

                html += showJudgePractice(showJudgeArr);

            } else if (practisetype == 1 || practisetype == 3) {

                html += showJudgeShow(showJudgeArr);

            }

            html += '</div>'

        } else if (sonType == 4) {
            var li_option = '';

            $.each(sonOptions, function(idx, ele) {

                li_option += '<li><div class="txt">空'+(idx+1)+'：' + unzip(ele.questionoptionhtml_svg) + '</div></li>'

            })
            var gapFillingArr = [li_option, sonAnalysishtml, self_qtn];
            html += '<div class="practice_slide_content common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="practice_slide_title clearfix">'
            html += '<b class="type type_circle">' + (i + 1) + '</b>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {

                html += gapFillingPractice(gapFillingArr);

            } else if (practisetype == 1 || practisetype == 3) {

                html += gapFillingShow(gapFillingArr);

            }

            html += '</div>'

        } else if (sonType == 5) {
            var showSubjectiveItemArr = [sonAnswerhtml, sonAnalysishtml, self_qtn];
            html += '<div class="practice_slide_content common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="practice_slide_title clearfix">'
            html += '<b class="type type_circle">' + (i + 1) + '</b>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {

                html += showSubjectiveItemPractice(showSubjectiveItemArr);

            } else if (practisetype == 1 || practisetype == 3) {

                html += showSubjectiveItemShow(showSubjectiveItemArr);

            }
            html += '</div>'
        }
    }
    return html;
}
//处理共用选项题（B型题）
function showShareOptions(data, index, self_qtn) {
    // data所有数据，index下标，self_qtn  --》类型数字（单选0、多选1、）

    var letterArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "K", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var options = data.options;
    var analysishtml_svg = unzip(data.analysishtml_svg);
    //题干
    var studentanswerhtml = unzip(data.studentanswerhtml);

    //题型描述
    var questiontypedescription = isNullOrEmpty(data.questiontypedescription) ? '' : unzip(data.questiontypedescription);

    // var showRadioArr = [index, options, analysishtml_svg, letterArr, studentanswerhtml, studentansweriswrong, self_qtn, i];

    var html = '';
    var bs = '';
    bs += '<b class="type">' + data.questiontypename + '</b>'
    bs += '<span>' + questiontypedescription + '</span>'
    html += '<div class="swiper-slide practice_slide">'
    html += '<div class="practice_slide_content big-sharedProblem slide-con qtm" data-ismark="' + data.ismark + '" data-id="' + data.id + '" data-chapterid="' + data.chapterid + '" data-questionid="' + data.questionid + '" data-questiontypenumber="' + data.questiontypenumber + '" data-click-statu="true" data-shared-click="true">'
    html += '<div class="practice_slide_title clearfix">'
    html += bs
    if(unzip(data.subjecthtml_svg) == null){
        html += '<span class="title">' + ' ' + '</span>'
    }else{
        html += '<span class="title">' + unzip(data.subjecthtml_svg) + '</span>'
    }
    html += '</div>'
    var li_option = '';
    $.each(options, function(idx, ele) {
        //questionoptionhtml_svg
        var questionoptionhtml_svg = ele.questionoptionhtml_svg == '' ? ele.questionoptionhtml_svg : unzip(ele.questionoptionhtml_svg);
        li_option += '<li data-guid="' + ele.guid + '">' + letterArr[idx] + '：' + questionoptionhtml_svg + '</li>'
    })
    html += '<ul class="b_content">' + li_option + '</ul>'//题干------》也就是a,b,c,d..固定的几个选项
    // html += '<div class="mark_collect"><i class="iconfont icon-wei-shoucang p-collect" onclick="collectClick(this)"></i><i class="iconfont icon-biaoji p-mark" onclick="markClick(this)"></i></div>'
    html += showSharePublic(data, index, self_qtn)//底下有单选题、多选题、等等
    html += '</div>'
    html += '</div>';
    return html;
}
//共用选项题（B型题）主要逻辑
function showSharePublic(data, index, self_qtn) {
    var html = '';
    for (var i = 0; i < data.subquestions.length; i++) {
        var sonType = data.subquestions[i].questiontypenumber;
        //子题型类型
        var id = data.subquestions[i].id;
        //子题型id
        var questionid = data.subquestions[i].questionid;
        var chapterid = data.subquestions[i].chapterid;
        var iswrong = data.subquestions[i].iswrong;
        //对错
        var courseid = data.subquestions[i].courseid;
        var sonTypeName = data.subquestions[i].questiontypename;
        var questiontypedescription =  isNullOrEmpty(data.subquestions[i].questiontypedescription) ? '' : unzip(data.subquestions[i].questiontypedescription);
        //子题类型的名称
        var sonTitle = unzip(data.subquestions[i].subjecthtml_svg);
        //子题的题目
        var sonOptions = data.subquestions[i].options;
        var sonAnalysishtml = unzip(data.subquestions[i].analysishtml_svg);
        //子题的解析   
        var answer = data.subquestions[i].answer;
        //答案---->guid    
        var state = data.subquestions[i].state;
        //状态0->未做   （保存答案的时候要传入）
        var sonAnswerhtml = unzip(data.subquestions[i].answerhtml_svg);
        // 跟answer是一样的，存储的是guid，自己判断正确答案；
        var sonStudentAnswerhtml = unzip(data.subquestions[i].studentanswerhtml);
        //学生选择的答案
        var lis = '';
        var letterArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "K", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        var answer_string = ''
          , istrue = 0;
        // 正确答案编译 A B C D 
        if (sonType == 1) {
            // console.log('单选')
            // var showRadioArr = [index, sonOptions, sonAnalysishtml, letterArr, sonStudentAnswerhtml, iswrong, self_qtn, i];
            html += '<div class="common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'

            html += '<div class="b_title">'
            html += '<b class="type type_circle">' + sonTypeName + '</b>'
            html += '<span>' + questiontypedescription + '</span>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {
                // html += showRadioPractice(showRadioArr);
                var b_option = '';
                $.each(data.options, function(idx, ele) {
                    // b_option +='<li><div class="zxf-radio"><input  type="radio"><i></i><span class="letterArr">'+ letterArr[idx] + '</span></div></li>'
                    if (ele.guid == answer) {
                        answer_string = letterArr[idx];
                        //判断单选（guid）正确答案
                        istrue = 1;
                    } else {
                        istrue = 0;
                    }
                    b_option += '<li><div class="zxf-radio"><input onclick="singleClick(this)" type="radio"  name="radio' + i + '' + index + '" data-isright="' + istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'
                })
                html += '<ul class="b_options">' + b_option + '</ul>'
                //解析----------------------->
                html += '<div class="right_ans_mark font-color-blue" ><i class="iconfont icon-zhengque"></i></div>'
                html += '<div class="practice_analysis" >'
                html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
                html += '<div class="answer">正确答案：<span class="answer-text">' + answer_string + '</span></div>'
                html += '<div class="analysis-content" style="overflow:hidden">'
                html += '<span class="txt">解析:</span>'
                html += ' <div class="desc">' + sonAnalysishtml + '</div>'
                html += ' </div>'
                html += '</div>'

            } else if (practisetype == 1 || practisetype == 3) {
                //得展示做了的样式，没做的样式，做错的样式，做对的样式
                // html += showRadioShow(showRadioArr);
                if (iswrong == 0) {
                    //做对了
                    var b_option = '';
                    $.each(data.options, function(idx, ele) {
                        // b_option +='<li><div class="zxf-radio"><input  type="radio"><i></i><span class="letterArr">'+ letterArr[idx] + '</span></div></li>'
                        if (ele.guid == answer) {
                            answer_string = letterArr[idx];
                            //判断单选（guid）正确答案
                            istrue = 1;
                            b_option += '<li><div class="zxf-radio"><input  class="active"  checked type="radio"  name="radio' + i + '' + index + '" data-isright="' + istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'

                        } else {
                            istrue = 0;
                            b_option += '<li><div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '" data-isright="' + istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'
                        }
                    })
                    html += '<ul class="b_options">' + b_option + '</ul>'
                    html += '<div class="right_ans_mark font-color-blue" style="display:block"><i class="iconfont icon-zhengque"></i></div>'

                } else if (iswrong == 1) {
                    // 做错了，让学生选择的答案高亮为红色；
                    var b_option = '';
                    $.each(data.options, function(idx, ele) {
                        if (ele.guid == answer) {
                            answer_string = letterArr[idx];
                            // 正确答案的显示
                        }
                        if (sonStudentAnswerhtml == letterArr[idx]) {

                            b_option += '<li><div class="zxf-radio on_wrong"><input  class="onactive"  checked type="radio"  name="radio' + i + '' + index + '" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'

                        } else {
                            b_option += '<li><div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'

                        }
                    })
                    html += '<ul class="b_options">' + b_option + '</ul>'

                    html += '<div class="practice_analysis" style="display:block">'
                    html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
                    html += '<div class="answer">正确答案：<span class="answer-text">' + answer_string + '</span></div>'
                    html += '<div class="analysis-content" style="overflow:hidden">'
                    html += '<span class="txt">解析:</span>'
                    html += ' <div class="desc">' + sonAnalysishtml + '</div>'
                    html += ' </div>'
                    html += '</div>'
                } else {
                    //啥都没选择
                    var b_option = '';

                    $.each(data.options, function(idx, ele) {
                        b_option += '<li><div class="zxf-radio"><input  type="radio"  name="radio' + i + '' + index + '" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'
                    })
                    html += '<ul class="b_options">' + b_option + '</ul>'
                }

            }
            html += '</div>'

        } else if (sonType == 2) {
            // console.log('多选')

            // var showCheckArr = [sonOptions, letterArr, sonAnalysishtml, sonStudentAnswerhtml, iswrong, self_qtn];
            // html += '<div class="practice_slide_content common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="common-slide slide-con" data-id="' + id + '" data-chapterid="' + chapterid + '" data-questionid="' + questionid + '">'
            html += '<div class="b_title">'
            html += '<b class="type type_circle">' + sonTypeName + '</b>'
            html += '<span>' + questiontypedescription + '</span>'
            html += '<span class="title">' + sonTitle + '</span>'
            html += '</div>'

            if (practisetype == 0 || practisetype == 2 || practisetype == 4) {
                var b_option = '';

                $.each(data.options, function(idx, ele) {
                    //questionoptionhtml_svg
                    // li_option += '<li><div class="zxf-radio"><input onclick="singleClick(this)" type="radio"  name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + questionoptionhtml_svg + '</div></li>'
                    if (answer.indexOf(ele.guid) > -1) {
                        answer_string += letterArr[idx];
                        //判断多选（guid）正确答案
                        istrue = 1;
                    } else {
                        istrue = 0;
                    }
                    b_option += '<li><div class="zxf-check"><input class="active" type="checkbox" data-isright="' + istrue + '"><i></i><span class="letterArr" >' + letterArr[idx] + '</span></div></li>'

                })
                html += '<ul class="b_options">' + b_option + '</ul>'
                html += '<button  class="confirm-btn" onclick="confirmBtn(this)"><span>确定</span></button>'
                //解析----------------------->
                html += '<div class="right_ans_mark font-color-blue"><i class="iconfont icon-zhengque"></i></div>'
                html += '<div class="practice_analysis">'
                html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
                html += '<div class="answer">正确答案：<span class="answer-text">' + answer_string + '</span></div>'
                html += '<div class="analysis-content" style="overflow:hidden">'
                html += '<span class="txt">解析:</span>'
                html += ' <div class="desc">' + sonAnalysishtml + '</div>'
                html += ' </div>'
                html += '</div>'

            } else if (practisetype == 1 || practisetype == 3) {
                // html += showCheckboxShow(showCheckArr);
                if (iswrong == 0) {
                    //多选做对了
                    var b_option = '';
                    $.each(data.options, function(idx, ele) {
                        //questionoptionhtml_svg
                        // li_option += '<li><div class="zxf-radio"><input onclick="singleClick(this)" type="radio"  name="radio' + i + '' + index + '" data-isright="' + ele.istrue + '"/><i></i><span class="letterArr">' + letterArr[idx] + '</span></div><div class="txt">' + questionoptionhtml_svg + '</div></li>'
                        if (answer.indexOf(ele.guid) > -1) {
                            answer_string += letterArr[idx];
                            //判断多选（guid）正确答案
                            istrue = 1;
                            b_option += '<li><div class="zxf-check"><input class="active" checked type="checkbox" data-isright="' + istrue + '"><i></i><span class="letterArr" >' + letterArr[idx] + '</span></div></li>'

                        } else {
                            istrue = 0;
                            b_option += '<li><div class="zxf-check"><input type="checkbox" data-isright="' + istrue + '"><i></i><span class="letterArr" >' + letterArr[idx] + '</span></div></li>'

                        }
                        // b_option +='<li><div class="zxf-check"><input class="active" type="checkbox" data-isright="' + istrue + '"><i></i><span class="letterArr" >'+ letterArr[idx] + '</span></div></li>'
                    })
                    html += '<ul class="b_options">' + b_option + '</ul>'
                    html += '<div class="right_ans_mark font-color-blue" style="display:block"><i class="iconfont icon-zhengque"></i></div>'

                } else if (iswrong == 1) {
                    var b_option = '';
                    $.each(data.options, function(idx, ele) {
                        // console.log(sonStudentAnswerhtml)
                        if (answer.indexOf(ele.guid) > -1) {
                            answer_string += letterArr[idx];
                            //判断多选（guid）正确答案
                        }

                        if (sonStudentAnswerhtml.indexOf(letterArr[idx]) == -1) {
                            b_option += '<li><div class="zxf-check"><input onclick="no_click_check(this)"  type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></li>'
                        } else {
                            b_option += '<li><div class="zxf-check  on_wrong"><input onclick="no_click_check(this)" class="onactive" checked  type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'
                        }

                    })
                    html += '<ul class="b_options">' + b_option + '</ul>'

                    html += '<div class="practice_analysis" style="display:block">'
                    html += '<div class="wrong_ans_mark font-red"><i class="iconfont icon-cuowu"></i>错误</div>'
                    html += '<div class="answer">正确答案：<span class="answer-text">' + answer_string + '</span></div>'
                    html += '<div class="analysis-content" style="overflow:hidden">'
                    html += '<span class="txt">解析:</span>'
                    html += ' <div class="desc">' + sonAnalysishtml + '</div>'
                    html += ' </div>'
                    html += '</div>'

                } else {
                    var b_option = '';

                    $.each(data.options, function(idx, ele) {
                        if (ele.istrue == 1) {
                            b_option += '<li><div class="zxf-check"><input  type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'
                        } else {

                            b_option += '<li><div class="zxf-check"><input type="checkbox" /><i></i><span class="letterArr">' + letterArr[idx] + '</span></div></li>'

                        }
                    })
                    html += '<ul class="b_options">' + b_option + '</ul>'
                }

            }
            html += '</div>'

        }
    }
    return html;
}

//处理单选
function singleClick(li) {
    var $silde_con = $(li).parents(".slide-con")[0];
    //公用题干题会找到两个slide-con，
    var $_silde_con = $($silde_con);
    //切换成jquery对象
    var isright = $_silde_con.find("input:checked").attr("data-isright");
    var $true = $_silde_con.find("input[data-isright='1']").nextAll(".letterArr").text();
    var $checked = $_silde_con.find("input:checked").nextAll(".letterArr").text();
    //A,B,c,d
    var questiontypenumber = $(li).parents(".qtm").attr("data-questiontypenumber");
    //题型
    //共用题干题
    var big_sharedProblem = $(li).parents(".big-sharedProblem");
    var big_id = big_sharedProblem.attr("data-id");
    var $click_statu = big_sharedProblem.attr("data-click-statu");
    //让共工题干题错了加一
    var $common_slide_length = big_sharedProblem.find(".common-slide").size();
    var $common_slide = $(li).parents(".common-slide");

    $_silde_con.find("input").css("visibility", "hidden");
    //做题时间
    end = new Date();
    timelength = end.getTime() - start.getTime();
    timelength = timelength / 1000 / 60;

    //单选
    if (questiontypenumber == 1) {
        if (practisetype == 0) {

            $("#tab-no-practice-hidden").val(++clickNum);
        }

        if (practisetype == 4 && isright * 1) {
            $("#tab-wrong-hidden").val(++clickNumRight);
        }

        if (isright * 1) {
            $('#right').text(++rightTotal);
            //正确的num
            singleClickRightEffect($_silde_con, li);
            singleClickRightAnswer($checked, $_silde_con);
        } else {

            $('#wrong').text(++wrongTotal);
            //错误的num
            singleClickEffect($_silde_con, $true, li);
            singleClickWrongSaveAnswer($checked, $_silde_con);
        }
    }
    //公共题干题单选
    if (questiontypenumber == 6 || questiontypenumber == 7) {

        if (isright * 1) {
            //公共题干题正确数量
            rightGongNum($common_slide, big_sharedProblem, $click_statu, $common_slide_length);
            singleClickRightEffect($_silde_con, li);
            gongSingleClickRightAnswer($checked, $_silde_con, questiontypenumber, big_id);

        } else {
            if ($click_statu == "true") {
                big_sharedProblem.attr("data-click-statu", false);
                $('#wrong').text(++wrongTotal);
            }
            $common_slide.addClass("cuo_mark");
            //做错的标记
            singleClickEffect($_silde_con, $true, li);
            gongSingleClickWrongSaveAnswer($checked, $_silde_con, questiontypenumber, big_id);
        }

        if (isright * 1) {
            var iswrongnum = 0;
        } else {
            var iswrongnum = 1;
        }

        //做过的题量统计
        didTheTopic(iswrongnum, $_silde_con, $common_slide, big_sharedProblem, $common_slide_length, big_id, questiontypenumber);
    }

}

//单选正确出现的效果
function singleClickRightEffect($silde_con, li) {
    $(li).parent().addClass('on_right');
    $(li).addClass('active');
    $silde_con.find(".right_ans_mark").show();
}
//单选错误出现的效果
function singleClickEffect($silde_con, $true, li) {
    $silde_con.find(".practice_analysis").show();
    $(li).parent().addClass('on_wrong');
    $(li).addClass("onactive").removeClass("active");
    $silde_con.find(".answer-text").text($true);
}

//单选正确保存答案
function singleClickRightAnswer($checked, $silde) {
    //保存答案的参数
    var answer = $checked;
    var iswrong = 0;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);
}

//单选错误保存答案
function singleClickWrongSaveAnswer($checked, $silde) {
    var answer = $checked;
    var iswrong = 1;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);
}
//公共题干题单选正确保存答案
function gongSingleClickRightAnswer($checked, $silde, questiontypenumber, big_id) {
    //保存答案的参数
    var answer = $checked;
    var iswrong = 0;
    var state = 1;
    var id = $silde.attr("data-id");
    // var mainid= $silde.parent().attr('data-id');//共用题干题主题的id
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");
    var mainid = big_id;
    var typenumber = questiontypenumber;

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);

}

//公共题干题单选错误保存答案
function gongSingleClickWrongSaveAnswer($checked, $silde, questiontypenumber, big_id) {
    var answer = $checked;
    var iswrong = 1;
    var state = 1;
    var id = $silde.attr("data-id");
    // var mainid= $silde.parent().attr('data-id');//共用题干题主题的id
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");
    var mainid = big_id;
    var typenumber = questiontypenumber;

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);
}

//处理多选
function confirmBtn(btn) {
    // var $silde_con = $(btn).parents(".slide-con")[0];
    var $silde_con = $(btn).parents(".slide-con")[0];
    //公用题干题会找到两个slide-con，
    var $_silde_con = $($silde_con);
    //切换成jquery对象
    var go = true;
    var $true = $_silde_con.find("input[data-isright='1']");
    var $checked = $_silde_con.find("input:checked");

    var trueTi = [];
    var doneTi = [];
    var questiontypenumber = $(btn).parents(".qtm").attr("data-questiontypenumber");
    //题型
    var big_sharedProblem = $(btn).parents(".big-sharedProblem");
    var big_id = big_sharedProblem.attr("data-id");
    var $click_statu = big_sharedProblem.attr("data-click-statu");
    //让共工题干题错了加一
    var $common_slide_length = big_sharedProblem.find(".common-slide").size();
    var $common_slide = $(btn).parents(".common-slide");

    $_silde_con.find("input").css("visibility", "hidden");
    $_silde_con.find(".confirm-btn").hide();

    //做题时间
    end = new Date();
    timelength = end.getTime() - start.getTime();
    timelength = timelength / 1000 / 60;

    $.each($checked, function(idx, ele) {

        var doneAnswer = $(this).nextAll(".letterArr").text();
        doneTi.push(doneAnswer);
    })

    $.each($true, function(idx, ele) {

        var trueAnswer = $(this).nextAll(".letterArr").text();
        trueTi.push(trueAnswer);
    });

    if ($true.length == $checked.length) {
        $.each($checked, function(idx, ele) {
            var isright = $(ele).attr("data-isright") * 1;
            if (!isright) {
                go = false;
            }
        })
    } else {
        go = false;
    }

    if (questiontypenumber == 2) {
        if (practisetype == 0) {
            $("#tab-no-practice-hidden").val(++clickNum);
        }
        if (practisetype == 4 && go == true) {
            $("#tab-wrong-hidden").val(++clickNumRight);
        }
        if (go) {
            $('#right').text(++rightTotal);
            //正确的num
            confirmBtnRightEffect($_silde_con, $checked);
            confirmBtnRight(doneTi, $_silde_con);
        } else {
            $('#wrong').text(++wrongTotal);
            //错误的num
            confirmBtnWrongEffect($_silde_con, $checked, trueTi);
            confirmBtnWrongSaveAnswer($_silde_con, doneTi);
        }

    }
    if (questiontypenumber == 6 || questiontypenumber == 7) {
        if (go) {
            //公共题干题正确数量
            rightGongNum($common_slide, big_sharedProblem, $click_statu, $common_slide_length);
            confirmBtnRightEffect($_silde_con, $checked);
            gongConfirmBtnRight(doneTi, $_silde_con, questiontypenumber, big_id);
        } else {
            if ($click_statu == "true") {
                big_sharedProblem.attr("data-click-statu", false);
                $('#wrong').text(++wrongTotal);
            }
            $common_slide.addClass("cuo_mark");
            //做错的标记
            confirmBtnWrongEffect($_silde_con, $checked, trueTi);
            gongConfirmBtnWrongSaveAnswer($_silde_con, doneTi, questiontypenumber, big_id);
        }

        if (go) {
            var iswrongnum = 0;
        } else {
            var iswrongnum = 1;
        }

        //做过的题量统计 
        didTheTopic(iswrongnum, $_silde_con, $common_slide, big_sharedProblem, $common_slide_length, big_id, questiontypenumber);
    }

}

//多选正确的效果
function confirmBtnRightEffect($silde_con, $checked) {
    $.each($checked, function(idx, ele) {
        $(ele).parent().addClass('on_right');

    })
    $silde_con.find(".right_ans_mark").show();
}

//多选错误的效果
function confirmBtnWrongEffect($silde_con, $checked, trueTi) {
    $silde_con.find(".practice_analysis").show();
    $.each($checked, function(idx, ele) {
        $(ele).addClass("onactive").removeClass("active");
        $(ele).parent().addClass('on_wrong');

    })

    $silde_con.find(".answer-text").text(trueTi.toString());
}

//多选正确保存答案
function confirmBtnRight(doneTi, $silde) {
    //保存答案的参数
    var answer = doneTi.toString();
    var iswrong = 0;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);

}
//多选错误保存答案
function confirmBtnWrongSaveAnswer($silde, doneTi) {
    //保存答案的参数
    var answer = doneTi.toString();
    var iswrong = 1;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);

}

//公共题干题多选正确保存答案
function gongConfirmBtnRight(doneTi, $silde, questiontypenumber, big_id) {
    //保存答案的参数
    var answer = doneTi.toString();
    var iswrong = 0;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");
    var mainid = big_id;
    var typenumber = questiontypenumber;

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);

}

//公共题干题多选错误保存答案
function gongConfirmBtnWrongSaveAnswer($silde, doneTi, questiontypenumber, big_id) {
    //保存答案的参数
    var answer = doneTi.toString();
    var iswrong = 1;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");
    var mainid = big_id;
    var typenumber = questiontypenumber;

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);

}

//不让多选点击已练和收藏中的多选
function no_click_check(multipleInput) {
    $(multipleInput).prop("checked", true);
}

//处理判斷題
function panduan(event, li) {

    // var $silde_con = $(event.target).parents(".slide-con");
    var $silde_con = $(event.target).parents(".slide-con")[0];
    //公用题干题会找到两个slide-con，
    var $_silde_con = $($silde_con);

    var $checked_text = $_silde_con.find("input:checked").parent().next(".txt").text();
    var $true_text = $_silde_con.attr("data-answer");
    var questiontypenumber = $(li).parents(".qtm").attr("data-questiontypenumber");
    //题型
    var big_sharedProblem = $(li).parents(".big-sharedProblem");
    var big_id = big_sharedProblem.attr("data-id");
    var $click_statu = big_sharedProblem.attr("data-click-statu");
    //让共工题干题错了加一
    var $common_slide_length = big_sharedProblem.find(".common-slide").size();
    var $common_slide = $(li).parents(".common-slide");

    $_silde_con.find("input").css("visibility", "hidden");
    //做题时间
    end = new Date();
    timelength = end.getTime() - start.getTime();
    timelength = timelength / 1000 / 60;

    if (questiontypenumber == 3) {
        if (practisetype == 0) {
            $("#tab-no-practice-hidden").val(++clickNum);
        }
        if (practisetype == 4 && $checked_text == $true_text) {
            $("#tab-wrong-hidden").val(++clickNumRight);
        }
        if ($checked_text == $true_text) {

            $('#right').text(++rightTotal);
            //正确的num
            panduanRightEffect(li, $_silde_con);
            panduanRightSaveAnswer($checked_text, $_silde_con);
        } else {

            $('#wrong').text(++wrongTotal);
            //错误的num
            panduanWrongEffect($_silde_con, $true_text, li);
            panduanWrongSaveAnswer($_silde_con, $checked_text);
        }

    }
    if (questiontypenumber == 6) {
        if ($checked_text == $true_text) {
            //公共题干题正确数量
            rightGongNum($common_slide, big_sharedProblem, $click_statu, $common_slide_length);
            panduanRightEffect(li, $_silde_con);
            gongPanduanRightSaveAnswer($checked_text, $_silde_con, questiontypenumber, big_id);
        } else {
            if ($click_statu == "true") {
                big_sharedProblem.attr("data-click-statu", false);
                $('#wrong').text(++wrongTotal);
            }

            $common_slide.addClass("cuo_mark");
            //做错的标记
            panduanWrongEffect($_silde_con, $true_text, li);
            gongPanduanWrongSaveAnswer($_silde_con, $checked_text, questiontypenumber, big_id);
        }
        if ($checked_text == $true_text) {
            var iswrongnum = 0;
        } else {
            var iswrongnum = 1;
        }

        //做过的题量统计
        didTheTopic(iswrongnum, $_silde_con, $common_slide, big_sharedProblem, $common_slide_length, big_id, questiontypenumber);
    }
}
//判断题做对的效果
function panduanRightEffect(li, $silde_con) {
    $(li).parent().addClass('on_right');
    $(li).addClass('active');
    $silde_con.find(".right_ans_mark").show();
}
//判断题出错的效果
function panduanWrongEffect($silde_con, $true_text, li) {
    $silde_con.find(".practice_analysis").show();
    $(li).parent().addClass('on_wrong');
    $(li).addClass("onactive").removeClass("active");
    $silde_con.find(".answer-text").text($true_text);
}
//判断题做对保存答案
function panduanRightSaveAnswer($checked_text, $silde) {
    //保存答案的参数
    var answer = $checked_text;
    var iswrong = 0;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);
}
//判断题做错保存答案
function panduanWrongSaveAnswer($silde, $checked_text) {
    //保存答案的参数
    var answer = $checked_text;
    var iswrong = 1;
    var state = 1;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);
}

//公共题干题判断题做对保存答案
function gongPanduanRightSaveAnswer($checked_text, $silde, questiontypenumber, big_id) {
    //保存答案的参数
    var answer = $checked_text;
    var iswrong = 0;
    var state = 0;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");
    var mainid = big_id;
    var typenumber = questiontypenumber;

    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);
}

//公共题干题判断题做錯保存答案
function gongPanduanWrongSaveAnswer($silde, $checked_text, questiontypenumber, big_id) {
    //保存答案的参数
    var answer = $checked_text;
    var iswrong = 1;
    var state = 0;
    var id = $silde.attr("data-id");
    var chapterid = $silde.attr("data-chapterid");
    var questionid = $silde.attr("data-questionid");
    var mainid = big_id;
    var typenumber = questiontypenumber;
    savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);
}

//填空主观显示答案
function show_answer(event, txt) {
    // var $silde_con = $(event.target).parents(".slide-con");

    var $silde_con = $(event.target).parents(".slide-con")[0];
    //公用题干题会找到两个slide-con，
    var $_silde_con = $($silde_con);

    var show_txt = $(txt).text();
    var questiontypenumber = $(txt).parents(".qtm").attr("data-questiontypenumber");
    //题型
    var big_sharedProblem = $(txt).parents(".big-sharedProblem");
    var big_id = big_sharedProblem.attr("data-id");
    var $click_statu = big_sharedProblem.attr("data-click-statu");
    //让共工题干题错了加一
    var $common_slide_length = big_sharedProblem.find(".common-slide").size();
    var $common_slide = $(txt).parents(".common-slide");
    var click_num = $_silde_con.attr("data-click-num");
    //做题时间
    end = new Date();
    timelength = end.getTime() - start.getTime();
    timelength = timelength / 1000 / 60;

    if (show_txt == "显示答案") {
        $_silde_con.find(".practice_analysis").show();
        $_silde_con.find(".fill_option").show();
        $(txt).children().text("收起答案");
    } else {
        $_silde_con.find(".practice_analysis").hide();
        $_silde_con.find(".fill_option").hide();
        $(txt).children().text("显示答案");
    }

    if (questiontypenumber == 4 || questiontypenumber == 5 || questiontypenumber == 8) {
        //填空主观中的未练
        var answer;
        var iswrong;
        var state = 1;
        var id = $_silde_con.attr("data-id");
        var chapterid = $_silde_con.attr("data-chapterid");
        var questionid = $_silde_con.attr("data-questionid");

        if (click_num == "true") {
            if (practisetype == 0) {
                //
                $("#tab-no-practice-hidden").val(++clickNum);
            }
            //保存答案
            savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid);
            $_silde_con.attr("data-click-num", false);
        }

    }
    if (questiontypenumber == 6) {
        //做过的题量统计
        var answer;
        var iswrong;
        var state = 0;
        var id = $_silde_con.attr("data-id");
        var chapterid = $_silde_con.attr("data-chapterid");
        var questionid = $_silde_con.attr("data-questionid");
        var mainid = big_id;
        var typenumber = questiontypenumber;
        if ($(txt).attr('data-clickOver') == 'true') {
            savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid);
            $(txt).attr('data-clickOver', 'false');
            var iswrongnum = '';
            didTheTopic(iswrongnum, $_silde_con, $common_slide, big_sharedProblem, $common_slide_length, big_id, questiontypenumber);
            //公共题干题正确数量
            rightGongNum($common_slide, big_sharedProblem, $click_statu, $common_slide_length);
        }

    }
}
//tab切换
$(".practice_nav_link").on("click", ".practice_nav_item", function() {

    chapterid = '';
    questiontypeid = '';
    wrongTotal = 0;
    rightTotal = 0;
    clickNumRight = 0;
    clickNum = 0;
    //切换tab时候要把下拉章节和下拉体型值要清空
    $("#topic").val('');
    $("#chapter").val('');

    $('#chapter').selectpicker('refresh'); 
    $('#topic').selectpicker('refresh'); 
    $("#chapter").siblings('button').find(".filter-option").text('请选择章节')
    $("#topic").siblings('button').find(".filter-option").text('请选择题型')
    
    var chapter_text = $("#chapter").siblings('button').find(".filter-option").text();
    var topic_text = $("#topic").next().find(".am-selected-status").text();
    if (chapter_text != "请选择章节") {
        $("#chapter").next().find(".am-selected-status").text("请选择章节");
    }
    if (chapter_text != "请选择题型") {
        $("#topic").next().find(".am-selected-status").text("请选择题型")
    }

    $(".am-selected-list>li").each(function() {
        $(this).removeClass("am-checked")

    })
    practisetype = $(this).index();

    if (practisetype == 0) {
        $('#btnSearch>img').attr('src','images/menu.png')
    } else if (practisetype == 1) {
        $('#btnSearch>img').attr('src','images/yilian.png')
    } else if (practisetype == 2) {
        $('#btnSearch>img').attr('src','images/biaoji.png')
    } else if (practisetype == 3) {
        $('#btnSearch>img').attr('src','images/shoucang.png')
    } else {
        $('#btnSearch>img').attr('src','images/cuowu.png')
    }

    //获取索引 0 1 2 3
    if (practisetype == 2 || practisetype == 3 || practisetype == 4) {
        $(".right_wrong_num").css("visibility", "hidden");
    } else {
        $(".right_wrong_num").css("visibility", "visible");
    }
    if ($(this).hasClass('active')) {
        return;
    } else {
        $(this).addClass("active").siblings().removeClass("active");
    }
    tabClearSlide();
});

function tabClearSlide() {
    swiper.virtual.cache = [];
    //清除cache内的虚拟slide
    swiper.virtual.slides = [];
    //移除所有slide
    swiper.removeAllSlides();
    //移除页面上的slide
    $("#tab-no-practice-hidden").val("0");
    $("#tab-wrong-hidden").val("0");
    statenum = 0;
    pageindex = 1;
    
    $.when(dataAjax('')).done(function(data) {
        //重新获取新数据
        var firstData = data.datas.questionlist;
        //题目列表
        var curectcount = data.datas.curectcount;
        //正確总数
        var errorcount = data.datas.errorcount;
        //错误总数
        var questionCount = data.datas.questioncount;
        //题目总数
        if(!isShowWrongTip(firstData)){
            return false;
        }
        // console.log('1/0')

        $("#swiper-total").text(questionCount);
        //后台传过来的总页数
        if (practisetype == 1) {
            $("#right").text(curectcount);
            $("#wrong").text(errorcount);
        } else {
            $("#right").text(0);
            $("#wrong").text(0);
        }
        getData(swiper, data);
        swiper.slideTo(0);
        swiper.updateSlides();
        //重新更新数据
        ismarkAndIscollect(firstData);
        //判断第一个有没有标记和收藏
    });

}

function isShowWrongTip(res) {
    //是否显示暂无数据
    if (res == "" || res == null) {

        $("#no-data-tip").show();
        $('.siwper-no').show().css('display','inline-block');
        $('#swiper-total').html('0')

        return false;
    } else {
        $("#no-data-tip").hide();
        $('.siwper-no').hide();

        return true;

    }
}

    
//获取章节题型
function chapterTopic() {
    $.ajax({
        url: ApiUrl + "/index.php?act=studentpracticeapi&op=getChapterListAndQuestionTypeList",
        type: 'post',
        data: {
            key: key,
            courseid: courseid,
            practiseid: practiseid
        },
        dataType: 'json',
        success: function(result) {
            var htmlchapter = '';
            var htmltopic = '';
            var datas = result.datas.chapterList;
            var quesiondatas = result.datas.questionTypeList;
            // 章节
            if (datas != null) {
                for (var i = 0; i < datas.length; i++) {
                    var data = datas[i];
                    htmlchapter += '<option value="' + data.id + '">' + data.name + '</option>';
                }
            }

            $('#chapter').html(htmlchapter);
            $('#chapter').selectpicker('refresh');

            // 题型
            if (quesiondatas != null) {
                for (var i = 0; i < quesiondatas.length; i++) {
                    var data = quesiondatas[i];
                    htmltopic += '<option value="' + data.id + '">' + data.cname + '</option>';
                }
            }
            $('#topic').html(htmltopic);
            $('#topic').selectpicker('refresh');

            var selected_list_h = $(".am-dropdown-content").height();
            if (selected_list_h > 400) {
                $(".am-dropdown-content").css({
                    "height": "400px",
                    "overflow": "auto"
                });
            }
            
        }

    })
}
$("#btnSearch").on("click", function() {
    $('.practice_nav_link').fadeToggle()
    $('.practice_ziding').hide();

    if ($("#chapter").val() != null) {
        $("#chapter").siblings('button').find(".filter-option").text('查看已选择章节')
    }else{
        $("#chapter").siblings('button').find(".filter-option").text('请选择章节')
    }
    if ($("#topic").val() != null) {
            $("#topic").siblings('button').find(".filter-option").text('查看已选择题型')
    }else{
        $("#topic").siblings('button').find(".filter-option").text('请选择题型')
    }

})
$(".practice_types").on("click", function(e) {
    $('.practice_ziding').fadeToggle("slow", "linear"); 
    $('.practice_nav_link').hide();
})

//搜索
$("#search").on("click", function() {
    clickNumRight = 0;
    clickNum = 0;
    questiontypeid = '';
    wrongTotal = 0;
    rightTotal = 0;

    if ($("#chapter").val() != null && $("#topic").val() == null) {
        chapterid = $("#chapter").val().join();
        questiontypeid = '';
    } else if ($("#chapter").val() == null && $("#topic").val() != null) {

        questiontypeid = $("#topic").val().join();
        chapterid = '';
    } else if ($("#chapter").val() != null && $("#topic").val() != null) {
        chapterid = $("#chapter").val().join();
        questiontypeid = $("#topic").val().join();

    } else if ($("#chapter").val() == null && $("#topic").val() == null) {
        chapterid = '';
        questiontypeid = '';
    }


    tabClearSlide();

    $('.practice_ziding').fadeToggle("slow", "linear");

})

function collectClick(oneself) {

    var $silde_con = $(oneself).parents(".practice_block").siblings('.practice_index').find('.swiper-slide-active .slide-con');
    var index_ = $(oneself).parents(".practice_block").siblings('.practice_index').find('.swiper-slide-active').attr("data-swiper-slide-index");
    
    if ($(oneself).hasClass('icon-shoucang')) {
        $(oneself).removeClass('icon-shoucang font-color-yellow').addClass('icon-wei-shoucang');
        $('.collect-img').attr('src','images/collect-gray.png');
        if (produceData != undefined) {
            produceData[index_].iscollect = 0;

        }
        iscollect = 0;
        id = $silde_con.attr("data-id");
        collectIs();
    } else {
        $(oneself).removeClass('icon-wei-shoucang').addClass('icon-shoucang font-color-yellow');
        $('.collect-img').attr('src','images/collect-yellow.png');
        if (produceData != undefined) {
            produceData[index_].iscollect = 1;
        }
        iscollect = 1;
        id = $silde_con.attr("data-id");
        collectIs();
    }
}

function markClick(oneself) {
    // var $silde_con = $(oneself).parents(".slide-con");
    // var index_ = $(oneself).parents(".swiper-slide-active").attr("data-swiper-slide-index");
    var $silde_con = $(oneself).parents(".practice_block").siblings('.practice_index').find('.swiper-slide-active .slide-con');
    var index_ = $(oneself).parents(".practice_block").siblings('.practice_index').find('.swiper-slide-active').attr("data-swiper-slide-index");

    if ($(oneself).hasClass('icon-weizhi')) {
        $(oneself).removeClass('icon-weizhi font-color-yellow').addClass('icon-biaoji');
        $('.mark-img').attr('src','images/mark-gray.png');
        if (produceData != undefined) {
            produceData[index_].ismark = 0;
        }

        ismark = 0;
        id = $silde_con.attr("data-id");
        markIs();
    } else {

        $(oneself).removeClass('icon-biaoji').addClass('icon-weizhi font-color-yellow');
        $('.mark-img').attr('src','images/mark-yellow.png');
        if (produceData != undefined) {
            produceData[index_].ismark = 1;
        }

        ismark = 1;
        id = $silde_con.attr("data-id");
        markIs();
    }
}

//标记
function markIs() {
    $.ajax({
        url: ApiUrl + "/index.php?act=studentpracticeapi&op=savePractiseMark",
        type: 'post',
        data: {
            key: key,
            ismark: ismark,
            id: id,
            studentpractiseid:studentpractise_id    

        },
        dataType: 'json',
        success: function(result) {
        }
    })
}
//收藏
function collectIs() {
    $.ajax({
        url: ApiUrl + "/index.php?act=studentpracticeapi&op=savePractiseCollect",
        type: 'post',
        data: {
            key: key,
            iscollect: iscollect,
            id: id,
            studentpractiseid:studentpractise_id    

        },
        dataType: 'json',
        success: function(result) {
        }
    })
}

//判断第一个有没有标记和收藏
function ismarkAndIscollect(mSnewData) {
    if (mSnewData == null || mSnewData == "") {
        return;
    } else {
        if (mSnewData[0].ismark == 1) {
            $('.p-mark').removeClass('icon-biaoji').addClass('icon-weizhi font-color-yellow');
            $('.mark-img').attr('src','images/mark-yellow.png');
            ismark=1
        } else {
            $('.p-mark').removeClass('icon-weizhi font-color-yellow').addClass('icon-biaoji');
            $('.mark-img').attr('src','images/mark-gray.png');
            ismark=0
        }
        // 默认进来判断第一个有没有收藏
        if (mSnewData[0].iscollect == 1) {
            iscollect=1;
            $('.p-collect').removeClass('icon-wei-shoucang').addClass('icon-shoucang font-color-yellow');
            $('.collect-img').attr('src','images/collect-yellow.png');
        } else {
            iscollect=0;
            $('.p-collect').removeClass('icon-shoucang font-color-yellow').addClass('icon-wei-shoucang');
            $('.collect-img').attr('src','images/collect-gray.png');
        }
    };

}


//公共题干题正确数量
function rightGongNum($silde, $swiper_slide, $click_statu, $common_slide_length) {
    $silde.addClass("a");
    var l = $swiper_slide.find(".a").length;
    if ($click_statu == "true" && l == $common_slide_length) {
        $('#right').text(++rightTotal);
    }
}

function didTheTopic(iswrongnum, _self, $common_slide, big_sharedProblem, $common_slide_length, big_id, questiontypenumber) {
    $common_slide.addClass("did");

    var didNum = big_sharedProblem.find(".did").length;
    var cuoNum = big_sharedProblem.find(".cuo_mark").length;
    var mainquestionwrong;

    if (didNum == $common_slide_length) {

        if (cuoNum > 0) {
            mainquestionwrong = 1;
        } else {
            mainquestionwrong = 0;
        }
        var answer;
        var iswrong = iswrongnum;
        var state = 1;
        var id;
        var chapterid = _self.attr("data-chapterid");
        var questionid;
        var mainid = big_id;
        var typenumber = questiontypenumber;
        var mainquestionstate = 1;
        setTimeout(function(){
            savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid, mainquestionstate, mainquestionwrong);
        },1000);

        tab_no_practice_add(big_sharedProblem);
    }
}
function isundefined(sth){
    if(sth==undefined||sth=="undefined"){
        sth=''
    }
    return sth;  
}
var  dosomethingStart=true; //做题开始的开关

//保存学生练习答案
function savePractiseAnswer(answer, iswrong, id, chapterid, state, questionid, typenumber, mainid, mainquestionstate, mainquestionwrong) {
    if(dosomethingStart){
       //开始计时
       if(localStorage.getItem("dosomethingStart")==null){
            startTime=Math.ceil(new Date().getTime()/1000)
       }
       localStorage.setItem("dosomethingStart",false);
    }
    dosomethingStart=false;  
    $('.loading').show();
    var answers = zip(answer);
    $.ajax({
        url: ApiUrl + "/index.php?act=studentpracticeapi&op=savePractiseAnswer",
        type: 'post',
        async:'false',
        data: {
            key: key,
            answer: isundefined(answers),
            iswrong: isundefined(iswrong),
            id: isundefined(id),
            iscollect:iscollect,
            ismark:ismark,
            timelength: 0,
            chapterid: chapterid,
            courseid: courseid,
            state: state,//共用题干题-》子题的状态；非共用-》该题的状态
            questionid: isundefined(questionid),
            studentpractiseid: isundefined(studentpractiseid),
            typenumber: isundefined(typenumber),
            mainid: isundefined(mainid),
            mainquestionstate: isundefined(mainquestionstate),//主题的状态---》1
            mainquestionwrong:isundefined(mainquestionwrong)//主题的正确错误
        },
        dataType: 'json',
        success: function(result) {
            $('.loading').hide();
        }
    })
}

//未练公共题干题做过的题统计加一
function tab_no_practice_add(big_sharedProblem) {
    if (big_sharedProblem.attr("data-shared-click") == "true") {
        $("#tab-no-practice-hidden").val(++clickNum);
        big_sharedProblem.attr("data-shared-click", false);

    }
}


// export default unzip

modules.export=unzip