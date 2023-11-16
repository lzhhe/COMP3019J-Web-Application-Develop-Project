import {isSameDate, navCalendar} from "./tempJs/calendar.js";
/*
侧边栏日历
 */
const smCalendar = new navCalendar();
export default smCalendar;
/*
更新侧边栏时间文本
 */
export function updateSmText() { //
    document.getElementById("smText").textContent = computeSmText();
}
/*
计算侧边栏时间文本
 */
export function computeSmText() { //
    const selectedDate = smCalendar.selectedDate;
    const year = selectedDate.getFullYear();
    const month = `${selectedDate.getMonth() + 1}`.padStart(2, "0");
    return `${year}-${month}`;
}
/*
计算今天的日期文本
 */
export function computeTdText() { //
    const selectedDate = smCalendar.selectedDate;
    const year = selectedDate.getFullYear();
    const month = `${selectedDate.getMonth() + 1}`.padStart(2, "0");
    const date = `${selectedDate.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${date}`;
}
/*
展示侧边栏
 */
function showNav(x) { //
    x.classList.toggle("change");
    if (x.classList.contains("change")) {
        openNav();
    } else {
        closeNav();
    }
}

function openNav() {
    document.getElementById("leftNav").style.width = "20%";
    document.getElementById("main").style.marginLeft = "20%";
    document.getElementById("leftNav").style.opacity = "1"
}

function closeNav() {
    document.getElementById("leftNav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("leftNav").style.opacity = "0"
}
/*
渲染侧边栏日历的方法
 */
export function renderDates() {
    // 得到日期容器
    let frag = document.createDocumentFragment();
    const dateContainer = document.querySelector('.smDates');
    dateContainer.innerHTML = '';  // 清空现有的日期

    // 遍历每一个日期，对每一个dateItem都做下面的操作
    smCalendar.listDates.forEach(dateItem => {
        // 为每个日期创建一个小div
        const dateElem = document.createElement('div');
        dateElem.classList.add('sm-calendar-date');

        // 为日期的文本显示创建div
        const dateText = document.createElement('div');
        dateText.classList.add('sm-date-text');
        // 文本就是几号
        dateText.textContent = dateItem.day;

        // 设置类
        if (dateItem.today) dateText.classList.add('sm-today');
        if (dateItem.currentMonth) dateText.classList.add('sm-current');
        if (dateItem.preMonth) dateText.classList.add('sm-pre');
        if (dateItem.nextMonth) dateText.classList.add('sm-next');
        if (isSameDate(dateItem.date,smCalendar.selectedDate)) dateText.classList.add('sm-selected');
        dateText.addEventListener('click', function () {
            handleDateClick(dateItem.date);
        });
        dateElem.appendChild(dateText);
        frag.appendChild(dateElem);
    });
    dateContainer.appendChild(frag);
}
/*
会更新侧边栏日历的selectedDate，重新渲染日期，更新日期文本
 */
function handleDateClick(date) {
    // 更新 selectedDate
    smCalendar.to_random(date);
    // 重新渲染日期和星期的显示
    renderDates();
    updateSmText();
    console.log('month')
    // console.log(smCalendar.selectedDate,222)
}
/*
通过检查用户信息div的存在来判断用户是否登录
 */
function userLoggedIn() {
    return document.querySelector('.user-infor') !== null;
}
/*
得到用户的主题设置信息
 */
function fetchUserColorMode() {
    // 假设服务器端点 '/getUserColorMode' 返回用户的颜色模式
    return fetch('/getUserColorMode')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 假设服务器返回的是 { colorMode: 0 } 或 { colorMode: 1 }
            return data.colorMode === 0 ? 'light' : 'dark';
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById('changeMode');
    const html = document.documentElement;

    // 设置初始状态
    // const currentMode = localStorage.getItem('color-mode');
    // if (!userLoggedIn()) {
    //     if (currentMode) {
    //         html.setAttribute('color-mode', currentMode); // 设置HTML属性
    //         checkbox.checked = (currentMode === 'light'); // 更新checkbox状态
    //     } else {
    //         // 如果没有存储的值，默认使用light模式
    //         html.setAttribute('color-mode', 'light');
    //         checkbox.checked = true;
    //     }
    // } else {
    //     localStorage.removeItem('color-mode');
    //     checkbox.checked = (html.getAttribute('color-mode') === 'light');
    // }
    /*
    检查用户是否登录
     */
    if (userLoggedIn()) {
        // 用户已登录，从服务器获取明暗模式
        fetchUserColorMode().then(mode => {
            html.setAttribute('color-mode', mode); // 设置HTML的color-mode的属性
            checkbox.checked = (mode === 'light'); // 更新checkbox状态。因为开关情况和明暗互相影响
        });
    } else {
        // 用户未登录，使用localStorage
        const currentMode = localStorage.getItem('color-mode');
        if (currentMode) {
            html.setAttribute('color-mode', currentMode); // 设置HTML属性
            checkbox.checked = (currentMode === 'light'); // 更新checkbox状态
        } else {
            // 如果没有存储的值，默认使用light模式
            html.setAttribute('color-mode', 'light');
            checkbox.checked = true;
        }
    }

    /*
    监听亮暗转换
     */
    checkbox.addEventListener('change', function () {
        const mode = checkbox.checked ? 'light' : 'dark';
        html.setAttribute('color-mode', mode);
        // 如果是用户登录的情况，不仅需要改变明亮，还要把数据传到数据库
        if (userLoggedIn()) {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/updateColorMode');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({color: checkbox.checked ? 0 : 1}));
        } else {
            localStorage.setItem('color-mode', mode);
        }

    });
    /*
    得到当前的页面，来决定跳不跳过切换月的逻辑
     */
    const currentFilename = window.location.href.split('/').pop();
    /*
    header的往前的切换按钮
     */
    const btn_pre = document.getElementById("pre")
    /*
    header的往后的切换按钮
     */
    const btn_next = document.getElementById("next")
    /*
    退出
     */
    const logoutButton = document.getElementById("logout");
    /*
    在对应的页面会有对应的切换逻辑，非登陆页面可切换侧边栏，登陆页面就是登陆页面本身的切换逻辑
     */
    btn_pre.addEventListener("click", function () {
        if (currentFilename !== '' && currentFilename !== 'main') {
            console.log(currentFilename)
            return;
        }
        smCalendar.preMonth(); // 此时的选中时间已经变了
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });
    /*
    在对应的页面会有对应的切换逻辑，非登陆页面可切换侧边栏，登陆页面就是登陆页面本身的切换逻辑
     */
    btn_next.addEventListener("click", function () {
        if (currentFilename !== '' && currentFilename !== 'main') {
            console.log(currentFilename)
            return;
        }
        smCalendar.nextMonth();
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });

    // 初始化周。这是固定设置好的
    const weekList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekContainer = document.getElementById("smCDay");
    weekList.forEach(week => {
        const weekItem = document.createElement("div");
        weekItem.classList.add("smCDayItem");
        weekItem.textContent = week;
        weekContainer.appendChild(weekItem);
    });
    renderDates(); // 渲染
    updateSmText();
    document.getElementById("hamburger").addEventListener("click", function () {
        showNav(this);
    });

    document.getElementById("smBtnL").addEventListener("click", function () {
        smCalendar.preMonth(); // 此时的选中时间已经变了，所以传入的日子就是改变后的
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });
    document.getElementById("smBtnR").addEventListener("click", function () {
        smCalendar.nextMonth();
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });

    document.getElementById("to_today").addEventListener("click", function () {
        smCalendar.to_today();
        renderDates();
        updateSmText();
    });
    document.getElementById("today_title").textContent = computeTdText();
    // 获取changeView按钮
    let changeViewButton = document.getElementById('changeView');

    // 获取所有的changeText元素
    let changeTexts = document.querySelectorAll('.changeText');

    const changeViewRegion = document.getElementById("changeViewDrop");
    /* 当用户点击按钮时，
    在隐藏和显示下拉内容之间切换 */
    changeViewButton.addEventListener("click", function () {
        changeViewRegion.classList.toggle("showView");
    });

// 如果用户在下拉框外单击，则关闭下拉框
    window.onclick = function (event) {
        if (!event.target.matches('#changeView')) {
            const dropdowns = document.getElementsByClassName("changeViewDrop");
            let i;
            for (i = 0; i < dropdowns.length; i++) {
                let openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('showView')) {
                    openDropdown.classList.remove('showView');
                }
            }
        }
    }
    /// 为每个changeText元素添加点击事件
    changeTexts.forEach(function (textElement) {
        textElement.addEventListener('click', function () {
            changeViewButton.innerText = this.innerText;
            // 当用户选择一个选项时，保存选择到sessionStorage
            sessionStorage.setItem('selectedView', this.innerText);
        });
    });
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            sessionStorage.removeItem('selectedView');
        });
    }
    const selectedView = sessionStorage.getItem('selectedView');
    if (selectedView) {
        changeViewButton.innerText = selectedView;
    }


    const weatherContainer = document.querySelector('.weather-container');
    const weatherSearch = document.querySelector('.weather-search-box button');
    const weatherBox = document.querySelector('.weather-box');
    const weatherDetails = document.querySelector('.weather-details');
    const weatherError404 = document.querySelector('.weather-not-found');

    weatherSearch.addEventListener('click', () => {
        const APIKey = '185dbcc57e27f9315a49d3f1c762ebd7';
        const cityInput = document.querySelector('.weather-search-box input');
        const city = cityInput.value;

        if (city === '') return;

        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== '200') {
                    displayError();
                } else {
                    displayWeather(data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                displayError();
            });
    });

    function displayError() {
        weatherContainer.style.height = '400px';
        weatherBox.style.display = 'none';
        weatherDetails.style.display = 'none';
        weatherError404.style.display = 'block';
        weatherError404.classList.add('fadeIn');
    }

    function displayWeather(data) {
        weatherError404.style.display = 'none';
        weatherError404.classList.remove('fadeIn');

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const todaysForecasts = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt * 1000);
            return forecastDate >= todayStart && forecastDate < tomorrowStart;
        });

        // Determine the max and min temperatures for today
        let maxTemp = todaysForecasts.length > 0 ? todaysForecasts[0].main.temp_max : 0;
        let minTemp = todaysForecasts.length > 0 ? todaysForecasts[0].main.temp_min : 0;

        todaysForecasts.forEach(forecast => {
            if (forecast.main.temp_max > maxTemp) {
                maxTemp = forecast.main.temp_max;
            }
            if (forecast.main.temp_min < minTemp) {
                minTemp = forecast.main.temp_min;
            }
        });

        const image = document.querySelector('.weather-box img');
        const temperature = document.querySelector('.weather-box .weather-temperature');
        const description = document.querySelector('.weather-box .weather-description');
        const humidity = document.querySelector('.weather-details .weather-humidity span');
        const wind = document.querySelector('.weather-details .weather-wind span');
        const tempMin = document.querySelector('.weather-box .weather-temp-range .temp-min');
        const tempMax = document.querySelector('.weather-box .weather-temp-range .temp-max');

        const currentForecast = todaysForecasts[0];

        switch (currentForecast.weather[0].main) {
            case 'Clear':
                image.src = '../static/pic/images/clear.png';
                break;
            case 'Rain':
                image.src = '../static/pic/images/rain.png';
                break;
            case 'Snow':
                image.src = '../static/pic/images/snow.png';
                break;
            case 'Clouds':
                image.src = '../static/pic/images/cloud.png';
                break;
            case 'Haze':
                image.src = '../static/pic/images/mist.png';
                break;
            default:
                image.src = '';
        }

        temperature.innerHTML = `${parseInt(currentForecast.main.temp)}<span>°C</span>`;
        description.innerHTML = currentForecast.weather[0].description;
        humidity.innerHTML = `${currentForecast.main.humidity}%`;
        wind.innerHTML = `${parseInt(currentForecast.wind.speed)} Km/h`;
        tempMin.textContent = `${parseInt(minTemp)}°C`;
        tempMax.textContent = `${parseInt(maxTemp)}°C`;

        weatherBox.style.display = '';
        weatherDetails.style.display = '';
        weatherBox.classList.add('fadeIn');
        weatherDetails.classList.add('fadeIn');
        weatherContainer.style.height = 'auto';
    }


});

