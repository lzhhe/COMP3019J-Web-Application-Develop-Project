export const MODE = {
    VIEW: 0,
    CREATE: 1,
    UPDATE: 2,
};
export class Event{
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.startDay = data.startDay;
        this.endDay = data.endDay;
        this.content = data.content;
        this.color = data.color;
    }
}