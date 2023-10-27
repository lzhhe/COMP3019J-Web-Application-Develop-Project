// import smCalendar from "./calendar.js";
// import { isSameDate } from "./calendar.js";
// import smCalendar from "./calendar.js";
// import {isSameDate} from "./calendar.js";
// import {getDates} from "./calendar.js";
//
// import viewWeek from "./weekViewLog.js";
class DateItem {
    constructor(date) {
        this.date = date;
        this.day = date.getDate(); // 得到几号
        this.today = false;
        this.preMonth = false;
        this.nextMonth = false;
        this.currentMonth = false;
    }
}

const dayMs = 86400000;
const weekMs = 604800000;
const today = new Date();

/**
 * 通过 getYear() 和 getMonth() 获取当前年份和月份，然后创建一个新的日期对象，表示当前月份的第一天（日期设置为1）。
 * @param {*} date
 * @returns
 */
function getFirstDay(date) {
    // date为当前日期
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay;
}

/**
 * 获取当前年份和月份，然后创建一个新的日期对象，表示下个月份的第一天（月份+1）的前一天（日期设置为0）
 * 就是当前月的最后一天
 */
function getLastDay(date) {
    // date为当前日期
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay;
}

/**
 * year是当前年
 * 闰年的判定规则：年份能被4整除但不能被100整除，或者能被400整除
 * @returns
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 是否是同一天
 */
function isSameDate(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * 是否是同一月
 */
function isSameMonth(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    );
}

/**
 * 得到上一个月遗留的日期
 */
function getPrevMonthDays(date) {
    // date为当前日期
    const prevMonthDays = [];
    const currentFirstDate = getFirstDay(date); // 得到当前月份的第一天
    const currentFirstDateWeekDay = currentFirstDate.getDay(); // 星期几，0表示周日，123456为周123456
    const currentFirstDateTime = currentFirstDate.getTime();
    // 获取 currentFirstDate 对象的时间戳。基于1970.1.1，之前之后都可
    // 利用毫秒可以在不同时区显示正确的时间

    // 表示循环几次，这样就可以把前面的日期加进来了
    // 比如是周三的话，需要插入周日，周一，周二，正好三次
    for (let i = 0; i < currentFirstDateWeekDay; i++) {
        const prevMonthDay = new Date(
            currentFirstDateTime - dayMs * (currentFirstDateWeekDay - i)
        );
        // 这个表示往前一直推送，倒着推的
        const dateItem = new DateItem(prevMonthDay);
        dateItem.preMonth = true;
        prevMonthDays.push(dateItem);
    }
    return prevMonthDays;
}

/**
 * 得到下一个月补足的日期
 */
function getNextMonthDays(date, appendOrNot) {
    // date为当前日期
    const nextMonthDays = [];
    const currentLastDate = getLastDay(date); //
    const currentLastDateWeekDay = currentLastDate.getDay(); // 星期几，0表示周日，123456为周123456
    const currentLastDateTime = currentLastDate.getTime();
    for (let i = 0; i < (6 - currentLastDateWeekDay) + (appendOrNot ? 7 : 0); i++) {
        const nextMonthDay = new Date(currentLastDateTime + dayMs * (1 + i));
        const dateItem = new DateItem(nextMonthDay);
        dateItem.nextMonth = true;
        nextMonthDays.push(dateItem);
    }
    return nextMonthDays;
}

/**
 * 得到这一个月的所有日期
 */
function getCurrentMonthDays(date) {
    const currentDays = [];
    const firstDate = getFirstDay(date);
    const lastDate = getLastDay(date);
    const lastDateNumber = lastDate.getDate();
    for (let i = 1; i <= lastDateNumber; i++) {
        const currentDate = new Date(firstDate);
        currentDate.setDate(i);
        const dateItem = new DateItem(currentDate);
        dateItem.currentMonth = true;
        dateItem.today = isSameDate(today, currentDate);
        dateItem.selected = dateItem.today;
        currentDays.push(dateItem);
    }
    return currentDays;
}

/**
 * 得到日历需要的日期
 */
function getDates(date) {
    const preDates = getPrevMonthDays(date);
    const currentDates = getCurrentMonthDays(date);
    const length = preDates.length + currentDates.length;
    const nextDates = getNextMonthDays(date, (length <= 35 ? true : false));
    return preDates.concat(currentDates).concat(nextDates);
}

function getPreDate(date) {
    // 获取当年、当月、当日
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // 计算上个月的年月
    let prevY;
    let prevM;
    if (month === 0) {
        // 一月
        // 表示当前是第一个月，上一个月会是上一年的最后一个月
        prevY = year - 1;
        prevM = 11; // 12月
    } else {
        prevY = year;
        prevM = month - 1;
    }

    // 检查上个月的最后一天
    // 重大bug，月份必须加一，因为0是前一个月的最后一天，如果忘了加一，那么就相当于往前多跑一个月
    const preMonthLastDay = new Date(prevY, prevM + 1, 0).getDate();

    // 如果当天的日期大于上个月的总天数（例如5月31日，4月没有31号），则返回下个月的最后一天
    let preD = 0;
    if (day > preMonthLastDay) {
        preD = preMonthLastDay;
    } else {
        preD = day;
    }

    const new_date = new Date(prevY, prevM, preD);
    console.log(preMonthLastDay);
    console.log(preD, 11111);
    console.log(day, 222222);
    return new_date;
}

function getNextDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // 9
    const day = date.getDate();

    // 计算下个月的年月
    let nextY;
    let nextM;
    if (month === 11) {
        // 12月
        nextY = year + 1;
        nextM = 0; // 1月
    } else {
        nextY = year;
        nextM = month + 1; // 10
    }

    // 检查下个月的最后一天
    const nextMonthLastDay = new Date(nextY, nextM + 1, 0).getDate(); // 10

    // 如果当天的日期大于下个月的总天数（例如3月31日，4月没有31号），则返回下个月的最后一天
    let nextD = 0;
    if (day > nextMonthLastDay) {
        nextD = nextMonthLastDay;
    } else {
        nextD = day;
    }

    const new_date = new Date(nextY, nextM, nextD);
    console.log(nextMonthLastDay);
    console.log(nextD, 11111);
    console.log(day, 222222);
    // console.log(new_date);
    return new_date;
}


class navCalendar {
    constructor() {
        this.selectedDate = new Date(); // 选中的日子，默认是当天
        this.listDates = []; // 所有相关的日子们
        this.initDates();
    }

    initDates() {
        this.updateDates();
    }

    updateDates() {
        this.listDates = getDates(this.selectedDate);
    }

    nextMonth() {
        this.selectedDate = getNextDate(this.selectedDate);
        // console.log(this.selectedDate + "12121");
        this.updateDates();
    }

    preMonth() {
        this.selectedDate = getPreDate(this.selectedDate);
        this.updateDates();
    }

    to_today() {
        this.to_random(new Date()); // 跳转到今天
    }

    to_random(date) {
        const isDifferentMonth = !isSameMonth(this.selectedDate, date);
        this.selectedDate = date;
        if (isDifferentMonth) {
            this.updateDates();
        }
        // 如果是同一个月，则不需要再调用 updateDates() 函数
    }
}

// export default viewWeek;

const smCalendar = new navCalendar();


function updateSmText() { // 更新显示文本
    let smText = computeSmText();
    document.getElementById("smText").textContent = smText;
}

function computeSmText() { // 计算当前的日期文本
    const selectedDate = smCalendar.selectedDate;
    const year = selectedDate.getFullYear();
    const month = `${selectedDate.getMonth() + 1}`.padStart(2, "0");
    return `${year}-${month}`;
}

function computeTdText() { // 计算当前的日期文本
    const selectedDate = smCalendar.selectedDate;
    const year = selectedDate.getFullYear();
    const month = `${selectedDate.getMonth() + 1}`.padStart(2, "0");
    const date = `${selectedDate.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${date}`;
}

function showNav(x) { // 展示侧边栏
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

function renderDates() {
    // 得到日期容器
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
        if (isSameDate(dateItem.date, smCalendar.selectedDate)) dateText.classList.add('sm-selected');
        dateText.addEventListener('click', function () {
            handleDateClick(dateItem.date);
        });
        dateElem.appendChild(dateText);
        dateContainer.appendChild(dateElem);
    });
    // console.log("renderDates function is called");
}

function handleDateClick(date) {
    // 更新 selectedDate
    smCalendar.to_random(date);
    // 重新渲染日期和星期的显示
    renderDates();
    updateSmText();
    // console.log(smCalendar.selectedDate,222)
}


document.addEventListener("DOMContentLoaded", function () {
    const currentFilename = window.location.href.split('/').pop();
    const btn_pre = document.getElementById("pre")
    const btn_next = document.getElementById("next")
    btn_pre.addEventListener("click", function () {
        if (currentFilename !== '' && currentFilename !== 'main') {
            console.log(currentFilename)
            return;
        }
        smCalendar.preMonth(); // 此时的选中时间已经变了
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });
    btn_next.addEventListener("click", function () {
        if (currentFilename !== '' && currentFilename !== 'main') {
            return;
        }
        smCalendar.nextMonth();
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });

    // 初始化周
    const weekList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekContainer = document.getElementById("smCDay");
    weekList.forEach(week => {
        const weekItem = document.createElement("div");
        weekItem.classList.add("smCDayItem");
        weekItem.textContent = week;
        weekContainer.appendChild(weekItem);
    });
    renderDates();
    document.getElementById("hamburger").addEventListener("click", function () {
        showNav(this);
    });

    document.getElementById("smBtnL").addEventListener("click", function () {
        smCalendar.preMonth(); // 此时的选中时间已经变了
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
    updateSmText();
    const today_text = computeTdText();
    document.getElementById("today_title").textContent = today_text;
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
        if (!event.target.matches(changeViewButton)) {
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
    // 为每个changeText元素添加点击事件
    changeTexts.forEach(function (textElement) {
        textElement.addEventListener('click', function () {
            changeViewButton.innerText = this.innerText;
        });
    });

});

