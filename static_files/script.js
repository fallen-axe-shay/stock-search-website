const API_URL = 'http://127.0.0.1:8080/'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

$('#search-icon').on('click', (event)=> {
    search(event);
    
});

$('#search-input').keypress(function (event) {
    if (event.which == 13) {
      search(event);
      return false;
    }
  });

function search(event) {
    let inputValue = $('#search-input').val().trim();
    $('#search-input').val(inputValue);
    if(inputValue) {
        $('.tooltip').hide();
        path = API_URL + 'data/get_details_finnhub?symbol=' + inputValue
        $.get(path, function(data, status){
            if(!Object.keys(data).length) {
                $('.error-content').show();
                $('.content').hide();
            } else {
                $('.error-content').hide();
                $('.content').show();
                $('.nav-bar > div').removeClass('active');
                $('.nav-bar > div.first-tab').addClass('active');
                $('.nav-bar').siblings().hide();
                $('.company-profile').show();
                console.log(data)
                setCompanyData(data);
                fetchNews(data['news']);
            }
          }).fail(function(xhr, status, error) {
                $('.error-content').show();
                $('.content').hide();
        });;
    } else {
        $('.tooltip').show();
        $('.error-content').hide();
        $('.content').hide();
    }
}

function fetchNews(data) {
    data = data.filter(obj => {
        return (obj.image!="" && obj.url!=""  && obj.headline!=""  && obj.datetime!="")
    });
    result = "";
    for(var i = 0; i<(Math.min(5, data.length)); i++) {
        result += `<div>
        <img src=${data[i]['image']}>
        <div>
          <span class="title">${data[i]['headline']}</span>
          <span class="date">${getReadableDate(data[i]['datetime'])}</span>
          <a class="link" href="${data[i]['url']}" target='_blank'>See Original Post</a>
        </div>
      </div>`;
    }
    $('.latest-news').html(result);
}

function getReadableDate(data) {
    date = new Date(0);
    date.setUTCSeconds(parseInt(data));
    readableDate = date.getDay() + " " +  MONTHS[parseInt(date.getMonth())] + ", " + date.getFullYear();
    return readableDate;
}

function setCompanyData(data) {
    $('.company-profile>img').attr('src', data['logo']);
    $('.company-profile>table tr:eq(0) > td:eq(1)').html(data['name']);
    $('.company-profile>table tr:eq(1) > td:eq(1)').html(data['ticker']);
    $('.company-profile>table tr:eq(2) > td:eq(1)').html(data['exchange']);
    $('.company-profile>table tr:eq(3) > td:eq(1)').html(data['ipo']);
    $('.company-profile>table tr:eq(4) > td:eq(1)').html(data['finnhubIndustry']);
    $('.stock-data>table tr:eq(0) > td:eq(1)').html(data['ticker']);
    $('.stock-data>table tr:eq(1) > td:eq(1)').html(getReadableDate(data['t']));
    $('.stock-data>table tr:eq(2) > td:eq(1)').html(data['pc']);
    $('.stock-data>table tr:eq(3) > td:eq(1)').html(data['o']);
    $('.stock-data>table tr:eq(4) > td:eq(1)').html(data['h']);
    $('.stock-data>table tr:eq(5) > td:eq(1)').html(data['l']);
    $('#change-param').html(data['d']);
    $('#change-percent-param').html(data['dp']);
    try {
        temp = parseFloat(data['d']);
        $('#change-param + img').show();
        if(temp<0) {
            $('#change-param + img').attr('src', "http://127.0.0.1:8080/resources/red_arrow");
        } else if (temp>0) {
            $('#change-param + img').attr('src', "http://127.0.0.1:8080/resources/green_arrow");
        } else {
            $('#change-param + img').hide();
        }
    } catch (e) {
        $('#change-param + img').hide();
    }
    try {
        temp = parseFloat(data['dp']);
        $('#change-percent-param + img').show();
        if(temp<0) {
            $('#change-percent-param + img').attr('src', "http://127.0.0.1:8080/resources/red_arrow");
        } else if (temp>0) {
            $('#change-percent-param + img').attr('src', "http://127.0.0.1:8080/resources/green_arrow");
        } else {
            $('#change-percent-param + img').hide();
        }
    } catch (e) {
        $('#change-param + img').hide();
    }
    recTrend = data['recommendation'].reduce((oldObj,newObj) => {
        oldTime = new Date(oldObj['period']).getTime();
        newTime = new Date(newObj['period']).getTime();
        return (oldTime>newTime) ? oldObj : newObj;
    });
    $('#strong-sell').html(recTrend['strongSell']);
    $('#sell').html(recTrend['sell']);
    $('#hold').html(recTrend['hold']);
    $('#buy').html(recTrend['buy']);
    $('#strong-buy').html(recTrend['strongBuy']);
}

$('#search-input').on('change', (event)=> {
    var curInput = event.target.value
    $('#search-input').val(curInput.trim());
});

$('#cancel-icon').on('click', (event)=> {
    $('#search-input').val('');
    $('.tooltip').hide();
    $('.error-content').hide();
    $('.content').hide();
});

$('.nav-bar > div').on('click', (event)=> {
    $('.nav-bar > div').removeClass('active');
    $(event.target).addClass('active');
    $('.nav-bar').siblings().hide();
    currentDiv = $(event.target).html();
    showHideHelper = {
        'Company': ()=> {
            $('.company-profile').show();
        },
        'Stock Summary': ()=> {
            $('.stock-data').show();
        },
        'Charts': ()=> {

        },
        'Latest News': ()=> {
            $('.latest-news').show();
        }
    }
    showHideHelper[currentDiv]();
});