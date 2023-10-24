from datetime import date, timedelta


class DateItem:
    def __init__(self, date_obj):
        self.date = date_obj
        self.day = date_obj.day
        self.today = False
        self.preMonth = False
        self.nextMonth = False
        self.currentMonth = False

today = date.today()
def get_first_day(date_obj):
    return date(date_obj.year, date_obj.month, 1)


def get_last_day(date_obj):
    # We can utilize timedelta for this task.
    # Adding a month and subtracting a day from the first of the next month will give us the last day of the current month.
    if date_obj.month == 12:
        return date(date_obj.year + 1, 1, 1) - timedelta(days=1) #一个时间间隔为1天的时长
    return date(date_obj.year, date_obj.month + 1, 1) - timedelta(days=1)


def is_leap_year(year):
    return (year % 4 == 0 and year % 100 != 0) or year % 400 == 0


def is_same_date(date1, date2):
    return date1.year == date2.year and date1.month == date2.month and date1.day == date2.day


def is_same_month(date1, date2):
    return date1.year == date2.year and date1.month == date2.month


def get_prev_month_days(date_obj):
    prev_month_days = []
    current_first_date = get_first_day(date_obj)
    current_first_date_week_day = current_first_date.weekday()  # Monday is 0, Sunday is 6
    for i in range(current_first_date_week_day):
        prev_month_day = current_first_date - timedelta(days=i + 1)
        date_item = DateItem(prev_month_day)
        date_item.preMonth = True
        prev_month_days.insert(0, date_item)  # insert at the beginning
    return prev_month_days


def get_next_month_days(date_obj, append_or_not):
    next_month_days = []
    current_last_date = get_last_day(date_obj)
    current_last_date_week_day = current_last_date.weekday()
    for i in range(6 - current_last_date_week_day + (7 if append_or_not else 0)):
        next_month_day = current_last_date + timedelta(days=i + 1)
        date_item = DateItem(next_month_day)
        date_item.nextMonth = True
        next_month_days.append(date_item)
    return next_month_days


def get_current_month_days(date_obj):
    current_days = []
    first_date = get_first_day(date_obj)
    last_date = get_last_day(date_obj)
    for i in range(last_date.day):
        current_date = date(first_date.year, first_date.month, i + 1)
        date_item = DateItem(current_date)
        date_item.currentMonth = True
        date_item.today = is_same_date(today, current_date)
        date_item.selected = date_item.today
        current_days.append(date_item)
    return current_days


def get_dates(date_obj):
    pre_dates = get_prev_month_days(date_obj)
    current_dates = get_current_month_days(date_obj)
    length = len(pre_dates) + len(current_dates)
    next_dates = get_next_month_days(date_obj, length <= 35)
    return pre_dates + current_dates + next_dates


def get_pre_date(date_obj):
    year = date_obj.year
    month = date_obj.month
    day = date_obj.day

    if month == 1:
        prevY = year - 1
        prevM = 12
    else:
        prevY = year
        prevM = month - 1

    pre_month_last_day = get_last_day(date(prevY, prevM, 1)).day

    if day > pre_month_last_day:
        preD = pre_month_last_day
    else:
        preD = day

    return date(prevY, prevM, preD)


def get_next_date(date_obj):
    year = date_obj.year
    month = date_obj.month
    day = date_obj.day

    if month == 12:
        nextY = year + 1
        nextM = 1
    else:
        nextY = year
        nextM = month + 1

    next_month_last_day = get_last_day(date(nextY, nextM, 1)).day

    if day > next_month_last_day:
        nextD = next_month_last_day
    else:
        nextD = day

    return date(nextY, nextM, nextD)


class NavCalendar:
    def __init__(self):
        self.selectedDate = date.today()
        self.listDates = []
        self.init_dates()

    def init_dates(self):
        self.update_dates()

    def update_dates(self):
        self.listDates = get_dates(self.selectedDate)

    def next_month(self):
        self.selectedDate = get_next_date(self.selectedDate)
        self.update_dates()

    def pre_month(self):
        self.selectedDate = get_pre_date(self.selectedDate)
        self.update_dates()

    def to_today(self):
        self.to_random(date.today())

    def to_random(self, date_obj):
        is_different_month = not is_same_month(self.selectedDate, date_obj)
        self.selectedDate = date_obj
        if is_different_month:
            self.update_dates()


sm_calendar = NavCalendar()
