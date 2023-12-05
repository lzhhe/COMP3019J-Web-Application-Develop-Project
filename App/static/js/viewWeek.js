import smCalendar, {renderDates, updateSmText} from "./base.js";
import {getDates} from "./tempJs/calendar.js";

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const DAY_MINUTE = 24 * 60;
const colorMap = {
    '1': 'var(--color-red)', '2': 'var(--todo1)',
    '3': 'var(--done1)', '4': 'var(--doing1)'
};

/*
创建week元素
 */
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

function toDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function toDate1(date) {
    // 格式化日期为 YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

function openModel(date, startTime, endTime) {
    $("#eventModal").show(); // 显示模态窗口
    $("#submitButton").show();
    $("#deleteButton").hide();
    $("#updateButton").hide();

    $('#eventModal').find('input[type=text], textarea').val('');
    $("#date").val(date);
    $("#startTime").val(startTime);
    $("#endTime").val(endTime);

    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });

}

function openEventModal1(data) {
    $("#submitButton").hide();
    $("#changeButton").hide();
    $("#updateButton").show();
    $("#deleteButton").show();
    $("#sdId").val(parseInt(data.id), 10);
    $("#eventTitle").val(data.title);
    $("#date").val(data.date);
    $("#startTime").val(data.startTime);
    $("#endTime").val(data.endTime);
    $("#content").val(data.content);
    $('.color').removeClass('active');
    $('.color[data-color="' + data.color + '"]').addClass('active');
    $("#eventModal").show();
    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });
}

function openEventModal2(data) {
    $("#submitButton").hide();
    if (data.target === data.username) {
        $("#changeButton").hide();
        $("#updateButton").show();
        $("#deleteButton").show();
    } else {
        $("#updateButton").hide();
        $("#deleteButton").hide();
        $("#changeButton").show().val(data.username);
    }
    $("#sdId").val(parseInt(data.id), 10);
    $("#eventTitle").val(data.title);
    $("#date").val(data.date);
    $("#endTime").val(data.endTime);
    $("#content").val(data.content);
    $('.color').removeClass('active');
    $('.color[data-color="' + data.color + '"]').addClass('active');
    $("#eventModal").show();
    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
        $('#startTime').prop('disabled', true).val('none');
    });
    $('#startTime').prop('disabled', false).val(''); // 或者设置为其他默认值
}

function getColor(colorCode) {
    return colorMap[colorCode] || colorMap[2];
}

function getIndex(colorCode) {
    return 15 - colorCode || 12;
}

function loadEventsForCurrentWeek() {
    const startOfWeek = viewWeek.startOfWeek(viewWeek.selectedDate);
    const endOfWeek = viewWeek.endOfWeek(viewWeek.selectedDate);

    $('.slots .schedule').remove(); // 仅移除所有具有 'schedule' 类的 div
    $('.slots .deadline').remove();

    schedulesData.forEach(schedule => {
        const scheduleDate = new Date(schedule.date);

        // 检查事件是否在当前选定的周内
        if ((scheduleDate >= startOfWeek && scheduleDate <= endOfWeek)) {
            createScheduleDiv(schedule);
        }
    });
    deadlinesData.forEach(deadline => {
        const deadlineDate = new Date(deadline.date);

        // 检查事件是否在当前选定的周内
        if ((deadlineDate >= startOfWeek && deadlineDate <= endOfWeek)) {
            createDeadlineDiv(deadline);
        }
    });
}


function createScheduleDiv(schedule) {
    const startTimeParts = schedule.startTime.split(':');
    const endTimeParts = schedule.endTime.split(':');
    const startHour = parseInt(startTimeParts[0]);
    const startMinutes = parseInt(startTimeParts[1]);
    const endHour = parseInt(endTimeParts[0]);
    const endMinutes = parseInt(endTimeParts[1]);
    const startTotalMinutes = startHour * 60 + startMinutes;
    const endTotalMinutes = endHour * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const dayElement = $(`.day[data-date='${schedule.date}']`);
    const scheduleDiv = $('<div></div>')
        .addClass('schedule')
        .css({
            'position': 'absolute',
            'top': `${startTotalMinutes * 0.5}px`, // 一小时对应30px
            'margin-left': '3%',
            'padding-left': '5%',
            'padding-right': '5%',
            'margin-right': '3%',
            'width': '94%',
            'border-radius': '6px',
            'height': `${durationMinutes * 0.5}px`, // 持续时间转换为高度
            'background-color': getColor(schedule.color), // 使用预定义的颜色
            'z-index': getIndex(schedule.color), // 设置z-index
            'cursor': 'pointer',
            'hover': ''
        })
        .data('schedule', schedule)
        .text(schedule.title) // 可以添加更多信息
        .click(function (e) {
            e.stopPropagation();
            openEventModal1($(this).data('schedule'));
        });

    dayElement.find('.slots').append(scheduleDiv);
}

function createDeadlineDiv(deadline) {
    const endTimeParts = deadline.endTime.split(':');
    const endHour = parseInt(endTimeParts[0]);
    const endMinutes = parseInt(endTimeParts[1]);
    const endTotalMinutes = endHour * 60 + endMinutes;
    const dayElement = $(`.day[data-date='${deadline.date}']`);
    const deadlineDiv = $('<div></div>')
        .addClass('deadline')
        .css({
            'position': 'absolute',
            'top': `${endTotalMinutes * 0.5}px`, // 一小时对应30px
            'margin-left': '3%',
            'padding-left': '5%',
            'padding-right': '5%',
            'margin-right': '3%',
            'width': '94%',
            'border-radius': '6px',
            'height': '4px', // 持续时间转换为高度
            'background-color': getColor(deadline.color), // 使用预定义的颜色
            'z-index': 2 * getIndex(deadline.color), // 设置z-index
            'cursor': 'pointer',
        })
        .data('deadline', deadline)
        .click(function (e) {
            e.stopPropagation();
            openEventModal2($(this).data('deadline'));
        });

    dayElement.find('.slots').append(deadlineDiv);
}

class WeekCalendar {
    constructor() {
        this.selectedDate = new Date();
        this.selectedDate.setHours(0, 0, 0, 0);
        this.weekList = [];
        this.initWeek();
        this.setupTimes();
        this.setupDays();
    }

    setupTimes() {
        const header = $("<div></div>").addClass("columnHeader");
        const slots = $("<div></div>").addClass("slots");
        for (let hour = 0; hour < 24; hour++) {
            $("<div></div>")
                .attr("data-hour", hour)
                .addClass("time")
                .text(`${hour}:00 - ${hour + 1}:00`)
                .appendTo(slots);
        }
        $(".col-1").append(header).append(slots);
    }

    setupDays() {
        const cal = this;
        $(".day").each(function () {
            const dayIndex = parseInt($(this).attr("data-dayIndex"));
            const date = cal.weekList[dayIndex].date;
            const formattedDate = toDate(date);
            const header = $("<div></div>").addClass("columnHeader").text(name);
            const slots = $("<div></div>").addClass("slots");
            $("<div></div>").addClass("dayDisplay").appendTo(header);
            for (let hour = 0; hour < 24; hour++) {
                $("<div></div>")
                    .attr("data-hour", hour)
                    .appendTo(slots)
                    .addClass("slot")
                    .click(() => cal.clickSlot(hour, dayIndex))
                    .hover(
                        () => cal.hoverOver(hour),
                        () => cal.hoverOut()
                    );
            }
            $(this).attr("data-date", formattedDate).append(header).append(slots);
        });
    }

    clickSlot(hour, dayIndex) {
        const date = toDate(this.weekList[dayIndex].date);
        const startTime = hour.toString().padStart(2, "0") + ":00";
        const endTime = hour < 23 ? (hour + 1).toString().padStart(2, "0") + ":00"
            : hour.toString().padStart(2, "0") + ":59";
        openModel(date, startTime, endTime);
    }


    hoverOver(hour) {
        $(`.time[data-hour=${hour}]`).addClass("currentTime");
    }

    hoverOut() {
        $(".time").removeClass("currentTime");
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
        $(".day").each((index, element) => {
            const date = this.weekList[index].date;
            const formattedDate = toDate(date);
            $(element).attr("data-date", formattedDate);
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

    function

    endOfWeek(date) {
        const end = new Date(date);
        end.setDate(date.getDate() + (6 - date.getDay()));
        end.setHours(23, 59, 59, 999);
        return end;
    }

    inOneWeek(date1, date2) {
        return this.startOfWeek(date1).getTime() === this.startOfWeek(date2).getTime();
    }
}


const viewWeek = new WeekCalendar();

function initTimeZone() {
    const timezoneDisplay = document.getElementById('timezoneDisplay');
    const offset = -new Date().getTimezoneOffset() / 60;
    timezoneDisplay.textContent = `GMT${offset >= 0 ? '+' : '-'}${Math.abs(offset)}`;
}

function isPassed(date) {
    const today = new Date();
    return date.getTime() < today.getTime();
}

function updateTimeContainer() {
    document.getElementById('time_container').textContent = computeTmText();
}

function computeTmText() {
    const selectedDate = viewWeek.selectedDate;
    const startOfWeek = viewWeek.startOfWeek(selectedDate);
    const endOfWeek = viewWeek.endOfWeek(selectedDate);
    const year1 = startOfWeek.getFullYear();
    const year2 = endOfWeek.getFullYear();
    const month1 = `${startOfWeek.getMonth() + 1}`.padStart(2, '0');
    const month2 = `${endOfWeek.getMonth() + 1}`.padStart(2, '0');
    if (year1 === year2 && month1 === month2) {
        return `${year1}-${month1}`
    } else if (year1 === year2 && month1 !== month2) {
        return `${year1}-${month1}--${month2}`
    } else {
        return `${year1}-${month1}--${year2}-${month2}`
    }
}

function updateWeekView() {
    let frag = document.createDocumentFragment();
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
        }
        if (week.isWeekend) {
            weekItem.classList.add('is-weekend');
        }
        if (week.date.toDateString() === viewWeek.selectedDate.toDateString()) weekItem.classList.add('is-selected');
        weekItem.addEventListener('click', function () {
            handleDateClick(week.date);
        });
        weekItem.appendChild(weekItem1);
        weekItem.appendChild(weekItem2);
        frag.appendChild(weekItem);
        // console.log(week.date);
    });
    weekContainer.appendChild(frag);
    const calendarDateDivs = document.querySelectorAll('.sm-calendar-date');
    calendarDateDivs.forEach(div => {
        div.addEventListener('click', function () {
            handleDateClick(smCalendar.selectedDate);
            loadEventsForCurrentWeek();

        });
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
    updateTimeContainer();
    console.log('week')
}

document.addEventListener("DOMContentLoaded", function (qualifiedName, value) {

    initTimeZone();
    updateWeekView();
    updateTimeContainer();
    const btn_pre = document.getElementById("pre")
    const btn_next = document.getElementById("next")


    btn_pre.addEventListener("click", function () {
        viewWeek.toPreviousWeek();

        smCalendar.listDates = getDates(smCalendar.selectedDate);
        smCalendar.selectedDate = viewWeek.selectedDate;
        handleDateClick(viewWeek.selectedDate);
        console.log(viewWeek.selectedDate, 1111);
        loadEventsForCurrentWeek();
    });
    btn_next.addEventListener("click", function () {
        viewWeek.toNextWeek();

        smCalendar.listDates = getDates(smCalendar.selectedDate);
        smCalendar.selectedDate = viewWeek.selectedDate;
        handleDateClick(smCalendar.selectedDate);
        loadEventsForCurrentWeek();

    });

    document.getElementById("smBtnL").addEventListener("click", function () {
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
        loadEventsForCurrentWeek();

    });
    document.getElementById("smBtnR").addEventListener("click", function () {
        handleDateClick(smCalendar.selectedDate);
        console.log(smCalendar.selectedDate);
        loadEventsForCurrentWeek();
    });


    document.getElementById("to_today").addEventListener("click", function () {
        smCalendar.to_today();
        viewWeek.toCurrentWeek();
        smCalendar.selectedDate = viewWeek.selectedDate;
        handleDateClick(smCalendar.selectedDate);
        loadEventsForCurrentWeek();
    });

});


$(document).ready(function () {
    schedulesData.forEach(schedule => {
        createScheduleDiv(schedule)
    });
    deadlinesData.forEach(deadline => {
        createDeadlineDiv(deadline)
    });

    $('#changeButton').click(function () {
        if ($(this).val() === 'schedule') {
            $(this).val('deadline');
            $('#startTime').prop('disabled', true).val('none');
        } else {
            $(this).val('schedule');
            $('#startTime').prop('disabled', false).val(''); // 或者设置为其他默认值
        }
    });
    $('.color').click(function () {
        $('.color').removeClass('active');
        $(this).addClass('active');
    });

    $('#submitButton').click(function (e) {
        e.preventDefault();
        const scheduleData = {
            title: $('#eventTitle').val(),
            startTime: $('#startTime').val(),
            endTime: $('#endTime').val(),
            date: $('#date').val(),
            content: $('#content').val(),
            color: $('.color.active').data('color'),
        };

        // 发送数据到服务器
        $.ajax({
            url: addScheduleUrl,
            type: 'POST',
            data: scheduleData,
            success: function (response) {
                $('#eventModal').find('input[type=text], input[type=date], textarea').val('');
                $('.color').removeClass('active');
                if (response.hasOwnProperty('startTime')) {
                    schedulesData.push(response);
                    createScheduleDiv(response);
                } else {
                    deadlinesData.push(response);
                    createDeadlineDiv(response);
                }
                $('#eventModal').hide();
            },
            error: function () {
                alert('Error adding event');
            }
        });
    });

    $('#deleteButton').click(function () {

    });
});


