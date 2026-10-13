// app.js
App({
  onLaunch() {
    // 第一次启动时，如果本地没有数据，则生成一些模拟数据，方便开箱即用
    const STORAGE_KEY = 'shengyin_records';
    const data = wx.getStorageSync(STORAGE_KEY);
    if (!data) {
      // 生成示例数据：今天与前两天各一张示例图片
      const records = {};
      const today = formatDate(new Date());
      const yesterday = formatDate(addDays(new Date(), -1));
      const before = formatDate(addDays(new Date(), -3));
      records[today] = [
        {
          id: 's-photo-1',
          type: 'photo',
          src: genSampleSVG('和小猫玩', '#ffdbe6'),
          createdAt: new Date().toISOString()
        }
      ];
      records[yesterday] = [
        {
          id: 's-photo-2',
          type: 'photo',
          src: genSampleSVG('校园沙沙', '#ffeef2'),
          createdAt: new Date().toISOString()
        }
      ];
      records[before] = [
        {
          id: 's-photo-3',
          type: 'photo',
          src: genSampleSVG('咖啡时刻', '#fff0f6'),
          createdAt: new Date().toISOString()
        }
      ];
      wx.setStorageSync(STORAGE_KEY, records);
    }
  }
});

// 辅助函数：格式化日期为 YYYY-MM-DD
function formatDate(d) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(d, offset) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + offset);
  return nd;
}
// 生成简单的 SVG data URI 用作示例图片（简笔、淡粉色风格）
function genSampleSVG(text, bg) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
    <rect width='100%' height='100%' fill='${bg}' rx='24' ry='24'/>
    <circle cx='100' cy='110' r='48' fill='#fff'/>
    <path d='M210 260 q60 -90 140 -40' stroke='#ff9fbf' stroke-width='6' fill='none' stroke-linecap='round'/>
    <text x='50%' y='86%' font-size='36' text-anchor='middle' fill='#8a5a6d' font-family='sans-serif'>${text}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
