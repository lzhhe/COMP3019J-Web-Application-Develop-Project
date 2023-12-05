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
    $("#submitButton").show();
    $("#deleteButton").hide();
    $("#updateButton").hide();

    $('#eventModal').find('input[type=text], textarea').val('');


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
            .css('background-color', getColor(event.color))
            .data('event', event) // 将事件数据附加到 div 上
            .click(function (e) {
                e.stopPropagation();
                openEventModal($(this).data('event'));
            });

        // 将事件 div 添加到对应的事件容器中
        eventContainer.append(eventDiv);
    }
}

function openEventModal(eventData) {
    // 填充模态窗口的字段
    $("#submitButton").hide();
    $("#updateButton").show();
    $("#deleteButton").show();
    $('#eventId').val(parseInt(eventData.id), 10);
    $('#eventTitle').val(eventData.title);
    $('#startDate').val(eventData.startDate);
    $('#endDate').val(eventData.endDate);
    $('#content').val(eventData.content);
    $('.color').removeClass('active');
    $('.color[data-color="' + eventData.color + '"]').addClass('active');
    $("#eventModal").show();
    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });
}

function updateLocalEventData(updatedEvent) {
    const eventIndex = eventsData.findIndex(event =>
        parseInt(event.id, 10) === updatedEvent.id);
    if (eventIndex !== -1) {
        eventsData[eventIndex] = updatedEvent;
        console.log(11)
    } else {
        eventsData.push(updatedEvent); // 如果找不到事件，可能需要添加
        console.log(updatedEvent.eid)
        console.log(eventIndex)
    }
    loadEventsForCurrentMonth(); // 重新加载事件
}

function deleteLocalEventData(eid) {
    eventsData = eventsData.filter(event => parseInt(event.id, 10) !== parseInt(eid, 10));
    console.log(eid)
    console.log(eid.type)
    // 重新加载当前月份的事件以更新页面
    loadEventsForCurrentMonth();
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
            dayDiv.click(function (e) {
                // e.stopPropagation();
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
        if (new Date(eventData.startDate) > new Date(eventData.endDate)) {
            alert('Start date must be less than or equal to end date');
            return; // 提前终止函数执行
        }
        // 发送数据到服务器
        $.ajax({
            url: addEventUrl, // 服务器端添加事件的路由
            type: 'POST',
            data: eventData,
            success: function (response) {
                eventsData.push(response);
                $('#eventModal').find('input[type=text], input[type=date], textarea').val('');
                $('.color').removeClass('active');
                createEventDiv(response);
                $('#eventModal').hide(); // 隐藏模态窗口
                console.log(eventsData)
            },
            error: function () {
                alert('Error adding event');
            }
        });
    });

    $('#updateButton').click(function (e) {
        e.preventDefault(); // 阻止表单默认提交
        const updatedEventData = {
            eid: parseInt($('#eventId').val(), 10), // 确保有一个字段来识别事件
            title: $('#eventTitle').val(),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            content: $('#content').val(),
            color: $('.color.active').data('color'),
        };
        if (new Date(updatedEventData.startDate) > new Date(updatedEventData.endDate)) {
            alert('Start date must be less than or equal to end date');
            return; // 提前终止函数执行
        }
        // 发送数据到服务器
        $.ajax({
            url: updateEventUrl, // 确保这是用于更新事件的正确 URL
            type: 'PUT', // 更新操作通常使用 PUT 或 PATCH 方法
            data: updatedEventData,
            success: function (response) {
                updateLocalEventData(response); // response是回调的内容，从路由得到的
                $('#eventModal').hide(); // 隐藏模态窗口
            },
            error: function () {
                alert('Error updating event');
            }
        });
    });

    $('#deleteButton').click(function (e) {
        e.preventDefault();
        const eid = parseInt($('#eventId').val(), 10);
        $.ajax({
            url: delEventUrl + "?eid=" + eid,  // 作为查询参数发送
            type: 'DELETE',
            success: function (response) {
                deleteLocalEventData(response)
                $('#eventModal').hide();
            },
            error: function () {
                alert('Error deleting event');
            }
        });
    });

});
