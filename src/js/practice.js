$(function () {
	function getAcquisitionCountdown(endDateStr) {
		// 结束时间
		var endDate = new Date(endDateStr.split('.')[0].replace(/\-/g, '/'))

		// 当前服务器时间
		var nowDate = new Date();
		// nowDate = new Date(now.replace(/-/g,"/"));
		// 相差的总秒数
		var totalSeconds = parseInt((endDate - nowDate) / 1000);
		// console.log(endDate,nowDate,totalSeconds)
		// 天数（转换成字符串类型，以防网不好的情况下，出现now）
		var day = totalSeconds / (60 * 60 * 24);
		var days = null;
		days = day.toString().split(".")[0];
		// 取模（余数）
		var modulo = totalSeconds % (60 * 60 * 24);
		// 小时数
		var hours = Math.floor(modulo / (60 * 60));
		modulo = modulo % (60 * 60);
		// 分钟
		var minutes = Math.floor(modulo / 60);
		// 秒
		var seconds = modulo % 60;
		// 输出到页面
		if (days != "0" && days > 0) {
			// return "剩余"+ days + "天" + hours + "时" + minutes + "分" + seconds + "秒";
			return days + "天" + "后结束";
		} else if (days == 0 && hours != 0 && hours > 0) {
			// return  "剩余"+ hours + "时"+ minutes + "分" + seconds + "秒";
			return hours + "时" + "后结束";
		} else if (hours == 0 && minutes != 0 && minutes > 0) {
			// return "剩余"+ minutes + "分" + seconds + "秒";
			return minutes + "分" + "后结束";
		} else if (minutes == 0 && seconds != 0 && seconds > 0) {
			return seconds + "秒" + "后结束";
		} else {
			return "已结束";
		}
	}
	function createDiv() {
		var div = document.createElement('div')
		data.forEach((element, index) => {
			div.innerHTML += `<div data-id="${index}" class="practice" style="border: 1px solid #5b9bd1;border-radius: 5px;margin-bottom: 10px;padding: 0 20px 15px;cursor:pointer;max-width:500px">
										<h4 id="name">${element.practicename}</h4>
										<span id="class">${element.lessonname}</span>
										<sapn id="time" style="margin-left: 10vw;">${getAcquisitionCountdown(element.finishtime)}</sapn>
								</div>`
		});
		document.body.appendChild(div)
	}
	function getPractice() {
		return $.ajax({
			url: baseUrl + '/mobile/index.php?act=studentpracticeapi&op=getPractiseCourseList',
			type: 'POST',
			data: {
				key: localStorage.getItem('key')
			}
		}).then(res => {
			data = res.datas
			createDiv()
			$('.practice').click(function () {
				var sub = data[$('.practice').index(this)]
				console.log(sub);
				$.ajax({
					url: baseUrl + '/mobile/index.php?act=studentpracticeapi&op=getStudentPractiseQuestionList',
					type: 'POST',
					data: {
						key: localStorage.getItem('key'),
						courseid: sub.courseid,
						practiseid: sub.practiseid,
						studentpractiseid: sub.id,
						teacherid: sub.teacherid,
						pagecount: sub.questioncount,
						pageindex: 1,
						practisetype: 0,
						statenum: 0,
						id: '',
						studentpractisequestioncount: sub.questioncount
					}
				}).then(res => {
					localStorage.setItem('list', JSON.stringify(res.datas.questionlist))
					location.href = './subject.html'
				})
			})
		})
	}
	const baseUrl = 'http://127.0.0.1:9999'
	var data = ''
	getPractice()

})