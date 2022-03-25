const baseUrl = 'http://127.0.0.1:9999'
$(function () {
  function getschoolId() {
    return $.ajax({
      url: baseUrl + '/mobile/index.php?act=login&op=getschoolData',
      type: 'POST',
      data: {
        number: $('#school').val()
      }
    }).then(res => res.datas.ID)
  }
  async function login() {
    $.ajax({
      url: baseUrl + '/mobile/index.php?act=login',
      type: 'POST',
      data: {
        username: $('#sno').val(),
        password: encrypt($.trim($('#password').val())),
        schoolid: await getschoolId(),
        client: 'web'
      }
    }).then(response => {
      localStorage.setItem('key', response.datas.key)
      location.href = './practice.html'
    })
  }
  $('#btn').click(function () {
    login()
  })
})