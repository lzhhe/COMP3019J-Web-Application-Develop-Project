const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const DAY_MINUTE = 24 * 60;

class WeekItem {
    constructor(date) {
        this.date = date;
        this.day = date.getDate();
        this.weekNum = date.getDay();
        this.weekText = WEEK[this.weekNum];
        this.isToday = WeekItem.isSameDate(new Date(), date);
        this.isWeekend = this.weekNum === 0 || this.weekNum === 6;
    }

    static isSameDate(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }
}

class TimeLine {
    constructor(date, width, height) {
        this.top = height * 24 * ((date.getHours() * 60 + date.getMinutes()) / DAY_MINUTE);
        this.left = date.getDay() * width;
    }
}

class WeekCalendar {
    constructor() {
        this.selectedDate = new Date();
        this.selectedDate.setHours(0, 0, 0, 0);
        this.weekList = [];
        this.initWeek();
    }

    initWeek() {
        this.updateWeek(this.selectedDate);
    }

    updateWeek(date) {
        const startOfWeek = this.startOfWeek(date);
        this.weekList = Array.from({length: 7}, (_, i) => {
            const currentDate = new Date(startOfWeek.getTime() + i * DAY_MS);
            return new WeekItem(currentDate);
        });
    }

    moveWeekBy(days) {
        this.selectedDate.setDate(this.selectedDate.getDate() + days);
        this.updateWeek(this.selectedDate);
    }

    toPreviousWeek() {
        this.moveWeekBy(-7);
    }

    toNextWeek() {
        this.moveWeekBy(7);
    }

    toCurrentWeek() {
        this.selectedDate = new Date();
        this.selectedDate.setHours(0, 0, 0, 0);
        this.updateWeek(this.selectedDate);
    }

    setDate(date) {
        if (!this.inOneWeek(date, this.selectedDate)) {
            this.updateWeek(date);
        }
        this.selectedDate = date;
        this.selectedDate.setHours(0, 0, 0, 0);
    }


    startOfWeek(date) {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        start.setHours(0, 0, 0, 0);
        return start;
    }

    inOneWeek(date1, date2) {
        return this.startOfWeek(date1).getTime() === this.startOfWeek(date2).getTime();
    }
}

const viewWeek = new WeekCalendar();

function initTimeZone() {
    const timezoneDisplay = document.getElementById('timezoneDisplay');
    const offset = -new Date().getTimezoneOffset() / 60;
    const timezone = `GMT${offset >= 0 ? '+' : '-'}${Math.abs(offset)}`;
    timezoneDisplay.textContent = timezone;
}

function isPassed(date) {
    const today = new Date();
    return date.getTime() < today.getTime();
}

function updateWeekView() {
    const weekContainer = document.getElementById('weekContainer');
    weekContainer.innerHTML = '';  // 清空当前周的内容

    viewWeek.weekList.forEach(week => {
        const weekItem = document.createElement('div');
        weekItem.className = 'week-item';

        const weekItem1 = document.createElement('div');
        weekItem1.className = 'week-item-day';
        weekItem1.textContent = week.weekText; // 设置星期的文本内容
        const weekItem2 = document.createElement('div');
        weekItem2.className = 'week-item-date';
        weekItem2.textContent = week.day; // 设置日期的文本内容

        if (week.isToday) {
            weekItem.classList.add('is-today');
        } else if (isPassed(week.date)) {
            weekItem.classList.add('is-passed');
        } else if (week.isWeekend) {
            weekItem.classList.add('is-weekend');
        }
        if (week.date.toDateString() === viewWeek.selectedDate.toDateString()) weekItem.classList.add('is-selected');
        weekItem.addEventListener('click', function () {
            handleDateClick(week.date);
        });
        weekItem.appendChild(weekItem1);
        weekItem.appendChild(weekItem2);
        weekContainer.appendChild(weekItem);
        // console.log(week.date);
    });

}

function handleDateClick(date) {
    // 更新 selectedDate
    smCalendar.to_random(date);
    viewWeek.setDate(date);
    // 重新渲染日期和星期的显示
    renderDates();
    updateSmText();
    updateWeekView();
    // console.log(smCalendar.selectedDate,222)
}
document.addEventListener("DOMContentLoaded", function () {
    initTimeZone();
    updateWeekView();
    document.getElementById("pre").addEventListener("click", function () {
        viewWeek.toPreviousWeek();

        smCalendar.listDates = getDates(smCalendar.selectedDate);
        smCalendar.selectedDate = viewWeek.selectedDate;

        renderDates();
        updateSmText();
        updateWeekView();

        console.log(smCalendar.selectedDate);
        console.log(viewWeek.selectedDate, 1111);
    });
    document.getElementById("next").addEventListener("click", function () {
        viewWeek.toNextWeek();

        smCalendar.listDates = getDates(smCalendar.selectedDate);
        smCalendar.selectedDate = viewWeek.selectedDate;
        renderDates();
        updateSmText();
        updateWeekView();
        console.log(smCalendar.selectedDate);
        console.log(viewWeek.selectedDate, 1111);

    });
    document.getElementById("to_today").addEventListener("click", function () {
        smCalendar.to_today();
        viewWeek.toCurrentWeek();
        smCalendar.selectedDate = viewWeek.selectedDate;
        renderDates();
        updateSmText();
        updateWeekView();
    });
});
