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
        this.weekNum = date.getDay();  // 周几0-6
        this.weekText = WEEK[this.weekNum];
        this.isToday = WeekItem.isSameDate(new Date(), date);  // 是否今天
        this.isWeekend = this.weekNum === 0 || this.weekNum === 6;  // 是否周末
    }

    static isSameDate(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }
}

/**
 * 转换成字符串样式放在form表单里。格式化日期为 YYYY-MM-DD
 * @param date
 * @returns {string}
 */
function toDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function toDate1(date) {
    // 格式化日期为 YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

/**
 * 打开form表单。会提前传入默认的时间和日期。此时是创建schedule或ddl的表单。
 * @param date
 * @param startTime
 * @param endTime
 */
function openModel(date, startTime, endTime) {
    $("#eventModal").show(); // 显示模态窗口
    $("#submitButton").show();  // 展示提交按钮
    $("#deleteButton").hide();  // 隐藏删除按钮
    $("#updateButton").hide();  // 隐藏更新按钮
    $("#changeButton").show().val('schedule').removeClass('fixed').addClass('button')
        .prop('disabled', false);  // 允许change按钮修改是schedule还是ddl
    $('#eventModal').find('input[type=text], textarea').val('');  // 默认title和content输入框是空
    $("#date").val(date).prop('disabled', false);  // 允许date修改并填入默认日期
    $("#startTime").val(startTime).prop('disabled', false);  // 允许开始时间修改并填入默认时间
    $("#endTime").val(endTime).prop('disabled', false);  // 允许结束时间修改并填入默认时间
    $("#eventTitle").prop('disabled', false);
    $("#content").prop('disabled', false);
    $(".color").prop('disabled', false);

    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });

}

/**
 * 打开schedule的细节。学生可以删除修改自己的schedule。对应的各种内容是数据库里面的，但是允许修改
 * @param data
 */
function openEventModal1(data) {
    $("#submitButton").hide();  // submit隐藏。update替代它
    $("#changeButton").hide();
    $("#updateButton").show();
    $("#deleteButton").show();
    $("#sdId").val(parseInt(data.id), 10);  // 设置为数据库中schedule的id
    $("#eventTitle").val(data.title).prop('disabled', false);
    $("#date").val(data.date).prop('disabled', false);
    $("#startTime").val(data.startTime.substring(0, 5)).prop('disabled', false);  // 必须加入substring，不然数据会出问题
    $("#endTime").val(data.endTime.substring(0, 5)).prop('disabled', false);
    $("#content").val(data.content).prop('disabled', false);
    $('.color').removeClass('active').prop('disabled', false);
    $('.color[data-color="' + data.color + '"]').addClass('active');
    $("#eventModal").show();
    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });
}

/**
 * 打开ddl的细节。如果是老师设置的ddl，学生只能查看不能修改。学生自己的可以修改删除
 * @param data
 */
function openEventModal2(data) {
    $("#submitButton").hide();
    console.log(data.target)
    console.log(data.username)
    if (data.target === data.username) {  // target表示作用人。如果不是自己的话就表示是老师设的
        $("#changeButton").hide();
        $("#updateButton").show();
        $("#deleteButton").show();
        $("#eventTitle").val(data.title).prop('disabled', false);
        $("#date").val(data.date).prop('disabled', false);
        $("#content").val(data.content).prop('disabled', false);
        $("#endTime").val(data.endTime.substring(0, 5)).prop('disabled', false);
        $('.color').removeClass('active').prop('disabled', false);
        $('.color[data-color="' + data.color + '"]').addClass('active');
    } else {
        $("#updateButton").hide();
        $("#deleteButton").hide();
        $("#changeButton").show().val(data.username).prop('disabled', true).removeClass('button').addClass('fixed');
        $("#eventTitle").val(data.title).prop('disabled', true);
        $("#date").val(data.date).prop('disabled', true);
        $("#content").val(data.content).prop('disabled', true);
        $("#endTime").val(data.endTime.substring(0, 5)).prop('disabled', true);
        $('.color').removeClass('active').prop('disabled', true);
        $('.color[data-color="' + data.color + '"]').addClass('active');
    }
    $('#startTime').prop('disabled', true).val(''); // 或者设置为其他默认值
    $("#sdId").val(parseInt(data.id), 10);
    $("#eventModal").show();
    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
        $('#startTime').prop('disabled', true).val('none');
    });
}

/**
 * 根据数据库中的属性设置时间的颜色
 * @param colorCode
 * @returns {*}
 */
function getColor(colorCode) {
    return colorMap[colorCode] || colorMap[2];
}

/**
 * 紧急程度，修改z-index
 * @param colorCode
 * @returns {number|number}
 */
function getIndex(colorCode) {
    return 15 - colorCode || 12;
}

/**
 * 得到当前周的起止时间，然后在schedulesData里找date在这里面的，再画
 */
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

/**
 * 先找此时id等于修改的schedule的id，然后修改样式重画
 * @param updatedSchedule
 */
function updateLocalScheduleData(updatedSchedule) {
    const scheduleIndex = schedulesData.findIndex(schedule =>
        parseInt(schedule.id, 10) === updatedSchedule.id);
    if (scheduleIndex !== -1) {
        schedulesData[scheduleIndex] = updatedSchedule;
        console.log(11)
    } else {
        schedulesData.push(updatedSchedule); // 如果找不到事件，可能需要添加
    }
    loadEventsForCurrentWeek(); // 重新加载事件
}

function deleteLocalScheduleData(sid) {
    schedulesData = schedulesData.filter(schedule => parseInt(schedule.id, 10) !== parseInt(sid, 10));
    console.log(sid)
    console.log(sid.type)
    // 重新加载当前月份的事件以更新页面
    loadEventsForCurrentWeek();
}

function updateLocalDeadlineData(updatedDeadline) {
    const deadlineIndex = deadlinesData.findIndex(deadline =>
        parseInt(deadline.id, 10) === updatedDeadline.id);
    if (deadlineIndex !== -1) {
        deadlinesData[deadlineIndex] = updatedDeadline;
        console.log(11)
    } else {
        schedulesData.push(updatedDeadline); // 如果找不到事件，可能需要添加
    }
    loadEventsForCurrentWeek(); // 重新加载事件
}

function deleteLocalDeadlineData(did) {
    deadlinesData = deadlinesData.filter(deadline => parseInt(deadline.id, 10) !== parseInt(did, 10));
    // console.log(sid)
    // console.log(sid.type)
    // 重新加载当前月份的事件以更新页面
    loadEventsForCurrentWeek();
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
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'font-family': 'Monospace',
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

/**
 * 周类
 */
class WeekCalendar {
    constructor() {
        this.selectedDate = new Date();  // 当前选中的日期
        this.selectedDate.setHours(0, 0, 0, 0);
        this.weekList = [];  // 当前周的所有日子
        this.initWeek();
        this.setupTimes();
        this.setupDays();
    }

    /**
     * 画最左边的时间窗格。在col-1里创建内部的时间格div
     */
    setupTimes() {
        const header = $("<div></div>").addClass("columnHeader");
        const slots = $("<div></div>").addClass("slots");
        for (let hour = 0; hour < 24; hour++) {
            $("<div></div>")
                .attr("data-hour", hour)
                .addClass("time")  // 每一个小格子都有一个类交time
                .text(`${hour}:00 - ${hour + 1}:00`)
                .appendTo(slots);
        }
        $(".col-1").append(header).append(slots);
    }

    /**
     * 初始化week视图内部的空格子.为每个day的竖列都创建对应的可点击的窗格
     */
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
                    .attr("data-hour", hour)  // 自定义属性，为了方便得到对应的时间
                    .appendTo(slots)
                    .addClass("slot")  // 每一个格子属于slot类，添加到slots内
                    .click(() => cal.clickSlot(hour, dayIndex))  // 格子点击之后调用对应的方法，把数据传进去
                    .hover(  // 修改样式，更清晰
                        () => cal.hoverOver(hour),
                        () => cal.hoverOut()
                    );
            }
            $(this).attr("data-date", formattedDate).append(header).append(slots);
        });
    }

    /**
     * 把对应的hour信息和对应的dayIndex传进去，得到对应的时间，利用索引得到当前week列表的日期
     * @param hour
     * @param dayIndex
     */
    clickSlot(hour, dayIndex) {
        const date = toDate(this.weekList[dayIndex].date);  // 就是week列表的第几日的date信息
        const startTime = hour.toString().padStart(2, "0") + ":00";  // 利用hour得到的是开始时间
        const endTime = hour < 23 ? (hour + 1).toString().padStart(2, "0") + ":00"
            : hour.toString().padStart(2, "0") + ":59";
        openModel(date, startTime, endTime);  // 此时先传入默认的时间
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

        // 发送数据到服务器
        $.ajax({
            url: updateScheduleUrl, // 确保这是用于更新事件的正确 URL
            type: 'PUT', // 更新操作通常使用 PUT 或 PATCH 方法
            data: updatedScheduleData,
            success: function (response) {
                // updateLocalScheduleData(response); // response是回调的内容，从路由得到的
                $('#eventModal').hide(); // 隐藏模态窗口
            },
            error: function () {
                alert('Error updating schedule');
            }
        });
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
    // 循环每个json数据，然后画出
    schedulesData.forEach(schedule => {
        createScheduleDiv(schedule)
    });
    deadlinesData.forEach(deadline => {
        createDeadlineDiv(deadline)
    });

    /**
     * 改变是否是schedule还是ddl
     */
    $('#changeButton').click(function () {
        if ($(this).val() === 'schedule') {
            $(this).val('deadline');
            $('#startTime').prop('disabled', true).val('none');
        } else {
            $(this).val('schedule');
            $('#startTime').prop('disabled', false).val('00:00'); // 或者设置为其他默认值
        }
    });
    /**
     * 设置颜色情况。添加css样式
     */
    $('.color').click(function () {
        $('.color').removeClass('active');
        $(this).addClass('active');
    });

    /**
     * 提交按钮的逻辑
     */
    $('#submitButton').click(function (e) {
        e.preventDefault();  // 防止默认提交。ajax必备

        // 传递json数据
        const scheduleData = {
            title: $('#eventTitle').val(),
            startTime: $('#startTime').val(),
            endTime: $('#endTime').val(),
            date: $('#date').val(),
            content: $('#content').val(),
            color: $('.color.active').data('color'),
        };
        console.log(scheduleData)
        // 不允许开始时间大于结束时间
        if (scheduleData.startTime !== '' &&
            new Date(scheduleData.date + ' ' + scheduleData.startTime) >= new Date(scheduleData.date + ' ' + scheduleData.endTime)) {
            alert('Error: Start time must be earlier than end time.');
            return; // 阻止代码继续执行
        }
        // 发送数据到服务器
        $.ajax({
            url: addScheduleUrl,
            type: 'POST',
            data: scheduleData,
            success: function (response) {  // response就是路由传回来的数据信息
                $('#eventModal').find('input[type=text], input[type=date], textarea').val('');
                $('.color').removeClass('active');
                if (response.hasOwnProperty('startTime')) {
                    schedulesData.push(response); // 把路由传过来的数据添加到对应的json数组，然后画出
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

    /**
     * 和submit同理
     */
    $('#updateButton').click(function (e) {
        e.preventDefault(); // 阻止表单默认提交

        const startTime = $('#startTime').val(); // 直接获取startTime的值
        const isDeadline = startTime === ''; // 判断startTime是否为空

        if (isDeadline) {
            const updatedDeadlineData = {
                did: parseInt($('#sdId').val(), 10), // 确保有一个字段来识别事件
                title: $('#eventTitle').val(),
                date: $('#date').val(),
                content: $('#content').val(),
                endTime: $('#endTime').val(),
                color: $('.color.active').data('color'),
            };
            $.ajax({
                url: updateDeadlineUrl, // 确保这是用于更新事件的正确 URL
                type: 'PUT', // 更新操作通常使用 PUT 或 PATCH 方法
                data: updatedDeadlineData,
                success: function (response) {
                    console.log(updatedDeadlineData)
                    updateLocalDeadlineData(response)

                    $('#eventModal').hide(); // 隐藏模态窗口
                },
                error: function () {
                    alert('Error updating deadline');
                }
            });


        } else {
            const updatedScheduleData = {
                sid: parseInt($('#sdId').val(), 10), // 确保有一个字段来识别事件
                title: $('#eventTitle').val(),
                date: $('#date').val(),
                content: $('#content').val(),
                startTime: startTime,
                endTime: $('#endTime').val(),
                color: $('.color.active').data('color'),
            };
            //console.log(updatedScheduleData)

            if (new Date(updatedScheduleData.date + ' ' + updatedScheduleData.startTime) >= new Date(updatedScheduleData.date + ' ' + updatedScheduleData.endTime)) {
                alert('Error: Start time must be earlier than end time.');
                return; // 阻止代码继续执行
            }
            $.ajax({
                url: updateScheduleUrl, // 确保这是用于更新事件的正确 URL
                type: 'PUT', // 更新操作通常使用 PUT 或 PATCH 方法
                data: updatedScheduleData,
                success: function (response) {
                    console.log(updatedScheduleData)
                    updateLocalScheduleData(response)
                    // updateLocalEventData(response); // response是回调的内容，从路由得到的
                    $('#eventModal').hide(); // 隐藏模态窗口
                },
                error: function () {
                    console.log(123)
                    alert('Error updating schedule');
                }
            });
        }


    });

    /**
     * 也是同理
     */
    $('#deleteButton').click(function (e) {
        e.preventDefault();

        const startTime = $('#startTime').val(); // 直接获取startTime的值
        const isDeadline = startTime === ''; // 判断startTime是否为空

        if (isDeadline) {
            const did = parseInt($('#sdId').val(), 10);
            $.ajax({
                url: delDeadlineUrl + "?did=" + did,  // 作为查询参数发送
                type: 'DELETE',
                success: function (response) {
                    deleteLocalDeadlineData(response)
                    $('#eventModal').hide();
                },
                error: function () {
                    alert('Error deleting event');
                }
            });
        } else {
            const sid = parseInt($('#sdId').val(), 10);
            $.ajax({
                url: delScheduleUrl + "?sid=" + sid,  // 作为查询参数发送
                type: 'DELETE',
                success: function (response) {
                    deleteLocalScheduleData(response)
                    $('#eventModal').hide();
                },
                error: function () {
                    alert('Error deleting event');
                }
            });
        }

    });
});


