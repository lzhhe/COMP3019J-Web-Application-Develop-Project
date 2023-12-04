import {isSameDate, navCalendar} from "./tempJs/calendar.js";
import smCalendar, {handleDateClick} from "./base.js";

const calendar = new navCalendar();
const colorMap = {
    '1': 'var(--color-red)', '2': 'var(--todo1)',
    '3': 'var(--done1)', '4': 'var(--doing1)'
};


function hoverOver() {
    $(this).addClass("currentTime"); // 使用 $(this) 来引用当前悬停的元素
}

function hoverOut() {
    $(this).removeClass("currentTime"); // 使用 $(this) 来引用当前悬停的元素
}

function monthTitle() {
    const year = calendar.selectedDate.getFullYear();
    const month = calendar.selectedDate.getMonth() + 1;
    return `${year}-${month}`;
}

function updateDayDivText() {
    $('.dates').each(function (index) {
        let newText = calendar.listDates[index].day;
        let newDate = toDate(calendar.listDates[index].date);

        $(this).text(newText); // 更新日期文本
        $(this).removeClass('today pre next'); // 更新类
        if (calendar.listDates[index].today) {
            $(this).addClass('today');
        } else if (calendar.listDates[index].preMonth) {
            $(this).addClass('pre');
        } else if (calendar.listDates[index].nextMonth) {
            $(this).addClass('next');
        }

        // 更新事件容器的 data-name 属性
        $(this).siblings('.events').attr('data-name', newDate);
    });
}


function loadEventsForCurrentMonth() {
    const currentYear = calendar.selectedDate.getFullYear();
    const currentMonth = calendar.selectedDate.getMonth() + 1; // JavaScript 中月份是从 0 开始的

    $('.events').empty(); // 清空所有事件容器

    eventsData.forEach(event => {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);

        // 检查事件是否在当前月份
        if (eventStartDate.getMonth() + 1 === currentMonth && eventStartDate.getFullYear() === currentYear ||
            eventEndDate.getMonth() + 1 === currentMonth && eventEndDate.getFullYear() === currentYear) {
            createEventDiv(event);
        }
    });
}


function clickSlot(dayIndex) {
    const date = toDate(calendar.listDates[dayIndex].date);
    openModel(date);
}

function toDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function openModel(date) {
    $("#eventModal").show(); // 显示模态窗口
    $("#deleteButton").hide();
    $("#startDate").val(date);
    $("#endDate").val(date);
    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });

}

function createEventDiv(event) {
    // 解析事件的开始日期和结束日期
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    // 遍历从开始日期到结束日期的每一天
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = toDate1(date);

        // 找到日历中对应日期的事件容器
        const eventContainer = $(`.events[data-name="${dateString}"]`);
        if (eventContainer.length === 0) {
            continue; // 如果找不到对应日期的容器，跳过当前日期
        }

        // 创建事件 div
        const eventDiv = $('<div></div>')
            .addClass('event')
            .text(event.title)
            .css('background-color', getColor(event.color));

        // 将事件 div 添加到对应的事件容器中
        eventContainer.append(eventDiv);
    }
}

function toDate1(date) {
    // 格式化日期为 YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

function getColor(colorCode) {
    return colorMap[colorCode] || colorMap[2];
}

$(document).ready(function () {
    for (let i = 0; i < 42; i++) {
        // 创建外部的dayDiv
        let dayDiv = $('<div>', {
            'data-dayIndex': i,
            'class': 'day',
        });
        let datesClass = 'dates';
        if (calendar.listDates[i].today) {
            datesClass += ' ' + 'today';
        } else if (calendar.listDates[i].preMonth) {
            datesClass += ' ' + 'pre';
        } else if (calendar.listDates[i].nextMonth) {
            datesClass += ' ' + 'next';
        }
        let datesDiv = $('<div>', {
            'class': datesClass,
            'text': calendar.listDates[i].day,
        });
        let eventsDiv = $('<div>', {
            'class': 'events',
            'data-name': toDate(calendar.listDates[i].date)
        });
        dayDiv.append(datesDiv).append(eventsDiv);
        dayDiv.hover(
            hoverOver,
            hoverOut
        );
        (function (index) {
            dayDiv.click(function () {
                clickSlot(index);
            });
        })(i);
        $('.monthDates').append(dayDiv);
    }
    eventsData.forEach(event => {
        createEventDiv(event);
    });
    console.log(eventsData[0]);
    $('#time_container').text(monthTitle());
    $('#pre').click(function () {
        calendar.preMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        smCalendar.preMonth();
        handleDateClick(smCalendar.selectedDate);
        loadEventsForCurrentMonth();
    });

    $('#next').click(function () {
        calendar.nextMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        handleDateClick(smCalendar.selectedDate);
        loadEventsForCurrentMonth();

    });
    $('#to_today').click(function () {
        calendar.to_today();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        loadEventsForCurrentMonth();

    });
    $('#smBtnL').click(function () {
        calendar.preMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        loadEventsForCurrentMonth();
    });
    $('#smBtnR').click(function () {
        calendar.nextMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        handleDateClick(smCalendar.selectedDate);
        loadEventsForCurrentMonth();

    });

    $('.color').click(function () {
        $('.color').removeClass('active');
        $(this).addClass('active');
    });


    $('#submitButton').click(function (e) {
        e.preventDefault(); // 阻止表单默认提交

        const eventData = {
            title: $('#eventTitle').val(),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            content: $('#content').val(),
            color: $('.color.active').data('color'),
        };

        // 发送数据到服务器
        $.ajax({
            url: addEventUrl, // 服务器端添加事件的路由
            type: 'POST',
            data: eventData,
            success: function (response) {
                eventsData.push(response);
                createEventDiv(eventData);
                $('#eventModal').hide(); // 隐藏模态窗口
            },
            error: function () {
                alert('Error adding event');
            }
        });
    });

    $('#deleteButton').click(function () {

    });

});
