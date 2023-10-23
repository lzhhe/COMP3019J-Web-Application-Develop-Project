export class DateItem {
	constructor(date) {
		this.date = date;
		this.day = date.getDate();
		this.today = false;
		this.preMonth = false;
		this.nextMonth = false;
		this.currentMonth = false;
	}
}

const dayMs = 86400000;
const weekMs = 604800000;

/**
 * 通过 getYear() 和 getMonth() 获取当前年份和月份，然后创建一个新的日期对象，表示当前月份的第一天（日期设置为1）。
 * @param {*} date
 * @returns
 */
export function getFirstDay(date) {
	// date为当前日期
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	return firstDay;
}

/**
 * 获取当前年份和月份，然后创建一个新的日期对象，表示下个月份的第一天（月份+1）的前一天（日期设置为0）
 * 就是当前月的最后一天
 */
export function getLastDay(date) {
	// date为当前日期
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	return lastDay;
}

/**
 * year是当前年
 * 闰年的判定规则：年份能被4整除但不能被100整除，或者能被400整除
 * @returns
 */
export function isLeapYear(year) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
/**
 * 是否是同一天
 */
export function isSameDate(date1, date2) {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}
/**
 * 是否是同一月
 */
export function isSameMonth(date1, date2) {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth()
	);
}

/**
 * 得到上一个月遗留的日期
 */
export function getPrevMonthDays(date) {
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
export function getNextMonthDays(date) {
	// date为当前日期
	const nextMonthDays = [];
	const currentLastDate = getLastDay(date); //
	const currentLastDateWeekDay = currentLastDate.getDay(); // 星期几，0表示周日，123456为周123456
	const currentLastDateTime = currentLastDate.getTime();
	for (let i = 0; i < 6 - currentLastDateWeekDay; i++) {
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
export function getCurrentMonthDays(date) {
	const currentDays = [];
	const firstDate = getFirstDay(date);
	const lastDate = getLastDay(date);
	const lastDateNumber = lastDate.getDate();

	const today = new Date();

	for (let i = 1; i <= lastDateNumber; i++) {
		const currentDate = new Date(firstDate);
		currentDate.setDate(i);

        const dateItem = new DateItem(currentDate);
		dateItem.currentMonth = true;
		dateItem.today = isSameDate(currentDate, today);
		currentDays.push(dateItem);
	}
	return currentDays;
}
/**
 * 得到日历需要的日期
 */
export function getDates(date) {
	const preDates = getPrevMonthDays(date);
	const nextDates = getNextMonthDays(date);
	const currentDates = getCurrentMonthDays(date);
	return preDates.concat(currentDates).concat(nextDates);
}

export function getPreDate(date) {
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
	const preMonthLastDay = new Date(prevY, prevM, 0).getDate();

	// 如果当天的日期大于上个月的总天数（例如5月31日，4月没有31号），则返回下个月的最后一天
	const preD = day > preMonthLastDay ? preMonthLastDay : day;

	const new_date = new Date(prevY, prevM, preD);
	const dateItem = new DateItem(date);

	return date;
}

export function getNextDate(date) {
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
	const nextMonthLastDay = new Date(nextY, nextM, 0).getDate(); // 10

	// 如果当天的日期大于下个月的总天数（例如3月31日，4月没有31号），则返回下个月的最后一天
	const nextD = day > nextMonthLastDay ? nextMonthLastDay : day;

	const new_date = new Date(nextY, nextM, nextD);
	const dateItem = new DateItem(date);

	return date;
}
