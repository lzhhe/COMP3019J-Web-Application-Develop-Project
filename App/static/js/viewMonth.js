import {isSameDate, navCalendar} from "./tempJs/calendar.js";
import smCalendar, {handleDateClick} from "./base.js";

const calendar = new navCalendar();

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
        $(this).text(newText);
        $(this).removeClass('today pre next');
        if (calendar.listDates[index].today) {
            $(this).addClass('today');
        } else if (calendar.listDates[index].preMonth) {
            $(this).addClass('pre');
        } else if (calendar.listDates[index].nextMonth) {
            $(this).addClass('next');
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

    $("#eventDate").val(date);
    $("#eventStart").val("08:00");
    $("#eventEnd").val("09:00");

    $("#cancelButton").off("click").on("click", function () {
        $("#eventModal").hide(); // 隐藏模态窗口
    });

}


$(document).ready(function () {
    for (let i = 0; i < 42; i++) {
        // 创建外部的dayDiv
        let dayDiv = $('<div>', {
            'data-name': '',
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
        });
        dayDiv.append(datesDiv).append(eventsDiv);
        dayDiv.hover(
            hoverOver,
            hoverOut
        );
        (function(index){
            dayDiv.click(function() {
                clickSlot(index);
            });
        })(i);
        $('.monthDates').append(dayDiv);
    }
    $('#time_container').text(monthTitle());
    $('#pre').click(function () {
        calendar.preMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        smCalendar.preMonth();
        handleDateClick(smCalendar.selectedDate);
    });

    $('#next').click(function () {
        calendar.nextMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        handleDateClick(smCalendar.selectedDate);

    });
    $('#to_today').click(function () {
        calendar.to_today();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());

    });
    $('#smBtnL').click(function () {
        calendar.preMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
    });
    $('#smBtnR').click(function () {
        calendar.nextMonth();
        updateDayDivText(); // 调用函数来更新日历视图
        $('#time_container').text(monthTitle());
        handleDateClick(smCalendar.selectedDate);

    });

});
