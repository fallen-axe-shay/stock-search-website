const API_URL = 'https://my-csci-homework-project.wl.r.appspot.com/'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

let chart, inputValue;

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
    $('.error-content').hide();
    $('.content').hide();
    inputValue = $('#search-input').val().trim().toUpperCase();
    $('#search-input').val(inputValue);
    if(inputValue) {
        document.querySelector( "#search-input" ).setCustomValidity( "" );

        let path = API_URL + 'data/get_details_finnhub?symbol=' + inputValue;
        $.ajax({
            type : "GET",
            url  : path,
            async: true,
            success: (response) => {
                if(!Object.keys(response).length) {
                    $('.error-content').show();
                    $('.content').hide();
                } else {
                    $('.error-content').hide();
                    $('.content').show();
                    $('.nav-bar > div').removeClass('active');
                    $('.nav-bar > div.first-tab').addClass('active');
                    $('.nav-bar').siblings().hide();
                    $('.company-profile').show();
                    setCompanyData(response);
                }
            },
            error: (error) => {
                $('.error-content').show();
                $('.content').hide();
            }
        });

        path = API_URL + 'data/get_additional_details_finnhub?symbol=' + inputValue;
        $.ajax({
            type : "GET",
            url  : path,
            async: true,
            success: (response) => {
                if(response['recommendation'].length) {
                    setStockData(response);
                }
            },
            error: (error) => {
                $('.error-content').show();
                $('.content').hide();
            }
        });

        path = API_URL + 'data/get_news_finnhub?symbol=' + inputValue;
        $.ajax({
            type : "GET",
            url  : path,
            async: true,
            success: (response) => {
                if(response['news'].length) {
                    fetchNews(response['news']);
                }
            },
            error: (error) => {
                $('.error-content').show();
                $('.content').hide();
            }
        });

        path = API_URL + 'data/get_stocks_finnhub?symbol=' + inputValue;
        $.ajax({
            type : "GET",
            url  : path,
            async: true,
            success: (response) => {
                if(response['stock-time-series']!=={}) {
                    displayChart(response['stock-time-series']);
                }
            },
            error: (error) => {
                $('.error-content').show();
                $('.content').hide();
            }
        });
        
    } else {
        document.querySelector( "#search-input" ).setCustomValidity( "Please fill out this field" );
        document.querySelector( "#search-input" ).reportValidity();
        $('.error-content').hide();
        $('.content').hide();
    }
}

function displayChart(data) {
    var volumeData = [];
    var closePriceData = [];
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    for(var i = 0; i<data['t'].length; i++) {
        time = parseInt(data['t'][i]) * 1000;
        volumeData.push([time, parseInt(data['v'][i])]);
        closePriceData.push([time, parseFloat(data['c'][i])]);
    }
    chart = Highcharts.stockChart('chart-content', {
        chart: {
            height: '400px',
            zoomType: 'x'
        },
        scrollbar :{
            enabled: true
        },
        navigator : {
            enabled: true
        },
        title: {
            text: `Stock Price ${inputValue.toUpperCase()} ${today}`,
            align: 'center'
        },
        subtitle: {
            useHTML: true,
            text: '<a target=_blank href="https://finnhub.io/">Source: Finnhub</a>',
            style: {
                'font-size': '15px'
            }
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: [{
            title: {
                text: 'Stock Price',
            },
            opposite: false
        }, {
            title: {
                text: 'Volume',
            },
            opposite: true
        }],
        rangeSelector: {
            enabled: true,
            allButtonsEnabled: true,
            inputEnabled: true,
            buttons: [{
                type: 'day',
                count: 7,
                text: '7d'
            }, {
                type: 'day',
                count: 15,
                text: '15d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            },
            {
                type: 'month',
                count: 3,
                text: '3m'
            },
            {
                type: 'month',
                count: 6,
                text: '6m'
            }],
            selected: 0
        },
        plotOptions: {
            series: {
                pointWidth: 3
            }
        },
        series: [
            {
                type: 'area',
                yAxis: 0,
                name: 'Stock Price',
                data: closePriceData,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                } 
            },
            {
                yAxis: 1,
                type: 'column',
                name: 'Volume',
                data: volumeData 
            }
        ]
   });
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

function setStockData(data) {
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
            $('#change-param + img').attr('src', "https://my-csci-homework-project.wl.r.appspot.com/resources/red_arrow");
        } else if (temp>0) {
            $('#change-param + img').attr('src', "https://my-csci-homework-project.wl.r.appspot.com/resources/green_arrow");
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
            $('#change-percent-param + img').attr('src', "https://my-csci-homework-project.wl.r.appspot.com/resources/red_arrow");
        } else if (temp>0) {
            $('#change-percent-param + img').attr('src', "https://my-csci-homework-project.wl.r.appspot.com/resources/green_arrow");
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

function setCompanyData(data) {
    data['logo'] ? $('.company-profile>img').show() : $('.company-profile>img').hide();
    $('.company-profile>img').attr('src', data['logo']);
    $('.company-profile>table tr:eq(0) > td:eq(1)').html(data['name']);
    $('.company-profile>table tr:eq(1) > td:eq(1)').html(data['ticker']);
    $('.company-profile>table tr:eq(2) > td:eq(1)').html(data['exchange']);
    $('.company-profile>table tr:eq(3) > td:eq(1)').html(data['ipo']);
    $('.company-profile>table tr:eq(4) > td:eq(1)').html(data['finnhubIndustry']);
}

$('#search-input').on('change', (event)=> {
    var curInput = event.target.value
    $('#search-input').val(curInput.trim());
});

$('#search-input').on('keypress', (event)=> {
    document.querySelector( "#search-input" ).setCustomValidity( "" );
});

$('#cancel-icon').on('click', (event)=> {
    document.querySelector( "#search-input" ).setCustomValidity( "" );
    $('#search-input').val('');
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
            $('#chart-content').show();
        },
        'Latest News': ()=> {
            $('.latest-news').show();
        }
    }
    showHideHelper[currentDiv]();
});