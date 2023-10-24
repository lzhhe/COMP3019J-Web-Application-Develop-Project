import smCalendar from "./calendar.js";
import { isSameDate } from "./calendar.js";

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
        if (dateItem.selected) dateText.classList.add('sm-selected');

        dateElem.addEventListener('click', () => {
            // 移除所有日期的选中状态
            smCalendar.listDates.forEach(item => item.selected = false);
            // 设置当前日期为选中状态
            dateItem.selected = true;
            // 跳转到被点击的日期
            smCalendar.to_random(dateItem.date);
            // 重新渲染日期
            renderDates();
		    updateSmText();
        });

        dateElem.appendChild(dateText);
        dateContainer.appendChild(dateElem);
    });
    // console.log("renderDates function is called");
}

document.addEventListener("DOMContentLoaded", function () {
    // 初始化周
    const weekList = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
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
		// console.log("qqqqqq");
		smCalendar.preMonth();
        renderDates();
		updateSmText();
	});
	document.getElementById("smBtnR").addEventListener("click", function () {
		// console.log("qqqqqq");
		smCalendar.nextMonth();
        renderDates();
		updateSmText();
	});
	updateSmText();
    const today_text = computeTdText();
    document.getElementById("today_title").textContent = today_text;

});
