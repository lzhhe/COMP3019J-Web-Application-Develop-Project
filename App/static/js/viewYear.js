import {getDates, isSameDate, navCalendar} from "./tempJs/calendar.js";
import smCalendar, {renderDates, updateSmText} from "./base.js";
/*
年日历
 */
class YearCalendar {
    constructor(year) {
        this.year = year;
        this.monthCalendars = this.createMonthCalendars();
        this.selectedDate = new Date();
    }
/*
创建今年的十二个月，并默认每个月的selectedDate是第一天，这个其实没影响
 */
    createMonthCalendars() {
        let monthCalendars = [];
        for (let month = 0; month < 12; month++) {
            // 创建一个日期代表该年的每个月
            let date = new Date(this.year, month, 1);
            let monthCalendar = new navCalendar();
            monthCalendar.selectedDate = date;
            monthCalendar.updateDates();
            monthCalendars.push(monthCalendar);
        }
        return monthCalendars;
    }
/*
去上一年
 */
    goToPreviousYear() {
        this.year--;
        this.updateSelectedDateForNewYear();
        this.monthCalendars = this.createMonthCalendars();
        // 这里可以添加逻辑来更新年视图的 UI
    }
/*
去下一年
 */
    goToNextYear() {
        this.year++;
        this.updateSelectedDateForNewYear();
        this.monthCalendars = this.createMonthCalendars();
        // 这里可以添加逻辑来更新年视图的 UI
    }
/*
更新年的selectedDate
 */
    updateSelectedDateForNewYear() {
        if (this.selectedDate) {
            const newYear = this.year;
            const newMonth = this.selectedDate.getMonth();
            const newDay = Math.min(this.selectedDate.getDate(), new Date(newYear, newMonth + 1, 0).getDate());
            this.selectedDate = new Date(newYear, newMonth, newDay);
        }
    }

    toToday() {
        const today = new Date();
        this.year = today.getFullYear();
        this.selectedDate = today; // 如果您希望在切换到当前年时选中今天的日期
        this.monthCalendars = this.createMonthCalendars();
    }
}

let currentYear = new Date().getFullYear();
let yearCalendar = new YearCalendar(currentYear);
let monthList = [];
let monthDivList = [];

/*
更新当前年的文本
 */
function updateTimeContainer() {
    document.getElementById('time_container').textContent = computeTmText();
}

function computeTmText() {
    const year = yearCalendar.selectedDate.getFullYear();
    return `${year}`
}
/*
渲染年视图
 */
function renderYear() {
    const months = document.getElementById('months');
    const monthDivList = Array.from(document.querySelectorAll('.month'));

    const frag = document.createDocumentFragment();
    const today = new Date();
    const selectedDate = yearCalendar.selectedDate;

    for (let month = 0; month < 12; month++) {
        const calendar = yearCalendar.monthCalendars[month];
        const calendarDiv = monthDivList[month];
        const dateContainer = calendarDiv.querySelector('.month-dates');

        const dateElems = calendar.listDates.map(date => {
            const dateElem = document.createElement('div');
            dateElem.classList.add('specific-date');

            const dateText = document.createElement('div');
            dateText.classList.add('specific-date-text');
            dateText.textContent = date.day;

            if (date.today) dateText.classList.add('specific-today');
            if (date.preMonth) dateText.classList.add('specific-pre');
            if (date.nextMonth) dateText.classList.add('specific-next');
            if (isSameDate(date.date, selectedDate)) {
                dateText.classList.add('specific-selected');
                const formattedDate = date.date.toISOString().split('T')[0]; // e.g., "2023-11-14"
                dateText.setAttribute('data-date', formattedDate);
            }

            dateText.addEventListener('click', () => {
                handleDateClick(date.date);
            });

            dateElem.appendChild(dateText);
            return dateElem;
        });
        dateContainer.innerHTML = '';
        dateElems.forEach(elem => {
            frag.appendChild(elem);
        });
        dateContainer.appendChild(frag);
    }
    /*
    侧边栏的内容点击了也会影响主视图
     */
    const calendarDateDivs = document.querySelectorAll('.sm-calendar-date');
    calendarDateDivs.forEach(div => {
        div.addEventListener('click', function () {
            handleDateClick(smCalendar.selectedDate);
        });
    });
}

/*
更新年的selectedDate和侧边栏的selectedDate。年日历本身的十二个日历的数据一般不变，所以需要判断当前年的值来提前上一年还是下一年
 */
function handleDateClick(date) {
    const oldYear = yearCalendar.year;
    smCalendar.to_random(date);
    if (smCalendar.selectedDate.getFullYear() < oldYear) {
        yearCalendar.goToPreviousYear();
    } else if (smCalendar.selectedDate.getFullYear() > oldYear) {
        yearCalendar.goToNextYear();
    }
    yearCalendar.selectedDate = date;
    renderDates();
    renderYear();
    updateSmText();
    updateTimeContainer();
    console.log(smCalendar.selectedDate.getFullYear())
}

document.addEventListener("DOMContentLoaded", function () {
    renderYear();
    updateTimeContainer();


    const btn_pre = document.getElementById("pre")
    const btn_next = document.getElementById("next")

    /*
    因为跳过了base的逻辑，所以这里就是自身的逻辑。并不会重复，因为先跳到新年，然后判断年份情况，此时相当于同一年，所以不会再跳
     */
    btn_pre.addEventListener("click", function () {
        yearCalendar.goToPreviousYear();
        handleDateClick(yearCalendar.selectedDate);
        console.log(yearCalendar.selectedDate, 1111);
    });
    btn_next.addEventListener("click", function () {
        yearCalendar.goToNextYear();
        handleDateClick(yearCalendar.selectedDate);
        console.log(yearCalendar.selectedDate, 1111);
    });
    /*
    base里有改侧边栏的逻辑了，所以只更改year的selectedDate即可
     */
    document.getElementById("smBtnL").addEventListener("click", function () {
        yearCalendar.selectedDate = smCalendar.selectedDate;
        handleDateClick(yearCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });
    document.getElementById("smBtnR").addEventListener("click", function () {
        yearCalendar.selectedDate = smCalendar.selectedDate;
        handleDateClick(yearCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
    });

    document.getElementById("to_today").addEventListener("click", function () {
        smCalendar.to_today();
        yearCalendar.toToday();
        smCalendar.selectedDate = yearCalendar.selectedDate;
        handleDateClick(smCalendar.selectedDate);
    });
})

