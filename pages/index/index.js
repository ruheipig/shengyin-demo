// pages/index/index.js
const STORAGE_KEY = 'shengyin_records';

Page({
  data: {
    year: 0,
    month: 0,
    calendarDays: [],
    recentList: []
  },

  onLoad() {
    const now = new Date();
    this.curYear = now.getFullYear();
    this.curMonth = now.getMonth();
    this.buildCalendar(this.curYear, this.curMonth);
    this.loadRecent();
  },

  buildCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeek = firstDay.getDay();

    const arr = [];
    for (let i = 0; i < startWeek; i++) {
      arr.push({ date: '', num: '', emoji: '' });
    }

    const records = wx.getStorageSync(STORAGE_KEY) || {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const dayNotes = records[dateStr] || [];
      let emoji = '○';
      if (dayNotes.length === 0) {
        emoji = '◯';
      } else {
        const hasAudio = dayNotes.some(n => n.type === 'audio');
        const hasPhoto = dayNotes.some(n => n.type === 'photo');
        if (hasAudio && hasPhoto) emoji = '★';
        else if (hasAudio) emoji = '🎵';
        else if (hasPhoto) emoji = '📷';
        else emoji = '●';
      }
      arr.push({ date: dateStr, num: d, emoji });
    }

    while (arr.length % 7 !== 0) arr.push({ date: '', num: '', emoji: '' });

    this.setData({
      year,
      month: month + 1,
      calendarDays: arr
    });
  },

  openDay(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;
    wx.navigateTo({
      url: `/pages/day/day?date=${date}`
    });
  },

  openToday() {
    const d = new Date();
    const ds = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    wx.navigateTo({ url: `/pages/day/day?date=${ds}` });
  },

  prevMonth() {
    this.curMonth--;
    if (this.curMonth < 0) {
      this.curYear--;
      this.curMonth = 11;
    }
    this.buildCalendar(this.curYear, this.curMonth);
  },

  nextMonth() {
    this.curMonth++;
    if (this.curMonth > 11) {
      this.curYear++;
      this.curMonth = 0;
    }
    this.buildCalendar(this.curYear, this.curMonth);
  },

  loadRecent() {
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const entries = Object.keys(records).map(k => ({ date: k, count: records[k].length }));
    entries.sort((a, b) => (a.date < b.date ? 1 : -1));
    this.setData({ recentList: entries.slice(0, 6) });
  },

  onShow() {
    this.buildCalendar(this.curYear, this.curMonth);
    this.loadRecent();
  }
});
