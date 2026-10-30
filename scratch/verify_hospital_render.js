const fs = require('fs');

global.window = global;
global.window.location = { hostname: 'localhost', href: 'http://localhost:8000/#hospital/referrals' };
global.window.showToast = () => {};
let containerHtml = '';
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => {
    return {
      id,
      classList: { add: () => {}, remove: () => {} },
      innerHTML: '',
      set innerHTML(val) { containerHtml = val; },
      get innerHTML() { return containerHtml; },
      value: '',
      closest: () => null
    };
  },
  createElement: (tag) => ({ tagName: tag, setAttribute: () => {}, appendChild: () => {}, removeChild: () => {} }),
  body: { appendChild: () => {}, removeChild: () => {} }
};
global.escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

require('../js/config.js');
require('../js/store.js');
require('../js/components/hospitalDashboard.js');

global.setHospitalTab('referrals');
console.log('Container HTML length:', containerHtml.length);
console.log('Includes pill-tab active on referrals:', containerHtml.includes('pill-tab active'));
console.log('Includes referral-kpi-grid:', containerHtml.includes('referral-kpi-grid'));
console.log('Includes referral-pipeline-stepper:', containerHtml.includes('referral-pipeline-stepper'));
console.log('Includes referral-toolbar:', containerHtml.includes('referral-toolbar'));
console.log('Includes Referral Work Queue table:', containerHtml.includes('Referral Work Queue'));

