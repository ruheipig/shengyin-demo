// pages/day/day.js
const STORAGE_KEY = 'shengyin_records';
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    date: '',
    notes: [],
    showSheet: false,
    recorderVisible: false,
    recording: false,
    recorded: false,
    tempAudioPath: ''
  },

  onLoad(options) {
    const date = options.date || this._todayStr();
    this.setData({ date });
    this.loadNotes(date);

    recorderManager.onStop((res) => {
      console.log('recorder stop', res);
      this.setData({
        recording: false,
        recorded: true,
        tempAudioPath: res.tempFilePath
      });
      wx.showToast({ title: '录音已停止，点击上传保存', icon: 'none' });
    });

    recorderManager.onStart(() => {
      console.log('recorder start');
    });

    recorderManager.onError((err) => {
      console.error('recorder error', err);
      wx.showToast({ title: '录音失败，请检查权限或在真机测试', icon: 'none' });
      this.setData({ recording: false });
    });
  },

  loadNotes(date) {
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const arr = records[date] || [];
    this.setData({ notes: arr });
  },

  onPullDownRefresh() {
    this.loadNotes(this.data.date);
    wx.stopPullDownRefresh();
  },

  openRecorderSheet() {
    this.setData({ showSheet: true });
  },

  closeSheet() {
    this.setData({ showSheet: false });
  },

  startRecordFlow() {
    this.setData({ showSheet: false, recorderVisible: true, recording: false, recorded: false, tempAudioPath: '' });
  },

  toggleRecording() {
    const { recording } = this.data;
    if (!recording) {
      const options = {
        duration: 1000 * 60 * 5,
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 128000,
        format: 'mp3',
        frameSize: 50
      };
      recorderManager.start(options);
      this.setData({ recording: true, recorded: false, tempAudioPath: '' });
    } else {
      recorderManager.stop();
    }
  },

  cancelRecord() {
    if (this.data.recording) {
      recorderManager.stop();
    }
    this.setData({ recorderVisible: false, recording: false, recorded: false, tempAudioPath: '' });
  },

  saveRecorded() {
    const { tempAudioPath, date } = this.data;
    if (!tempAudioPath) {
      wx.showToast({ title: '没有可上传的录音', icon: 'none' });
      return;
    }
    const id = 'audio-' + Date.now();
    const note = {
      id,
      type: 'audio',
      src: tempAudioPath,
      createdAt: new Date().toISOString()
    };
    this._appendNote(date, note);
    this.setData({ recorderVisible: false, recording: false, recorded: false, tempAudioPath: '' });
    wx.showToast({ title: '录音已保存', icon: 'success' });
    this.loadNotes(date);
  },

  startPhotoFlow() {
    this.setData({ showSheet: false });
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const filePath = res.tempFilePaths[0];
        const id = 'photo-' + Date.now();
        const note = {
          id,
          type: 'photo',
          src: filePath,
          createdAt: new Date().toISOString()
        };
        this._appendNote(this.data.date, note);
        wx.showToast({ title: '图片已保存', icon: 'success' });
        this.loadNotes(this.data.date);
      },
      fail: (err) => {
        console.error(err);
        wx.showToast({ title: '未选择图片', icon: 'none' });
      }
    });
  },

  _appendNote(date, note) {
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    if (!records[date]) records[date] = [];
    records[date].push(note);
    wx.setStorageSync(STORAGE_KEY, records);
  },

  playAudio(e) {
    const src = e.currentTarget.dataset.src;
    if (!src) {
      wx.showToast({ title: '无音频文件', icon: 'none' });
      return;
    }
    innerAudioContext.stop();
    innerAudioContext.src = src;
    innerAudioContext.play();
    innerAudioContext.onError(err => {
      console.error('play error', err);
      wx.showToast({ title: '播放失败（真机测试可能更稳定）', icon: 'none' });
    });
  },

  deleteNote(e) {
    const id = e.currentTarget.dataset.id;
    const date = this.data.date;
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const arr = records[date] || [];
    const idx = arr.findIndex(x => x.id === id);
    if (idx >= 0) {
      arr.splice(idx, 1);
      records[date] = arr;
      wx.setStorageSync(STORAGE_KEY, records);
      this.setData({ notes: arr });
      wx.showToast({ title: '删除成功', icon: 'success' });
    }
  },

  formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  },

  _todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  },

  onUnload() {
    innerAudioContext.stop();
  }
});
