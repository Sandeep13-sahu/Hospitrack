const fs = require('fs');
const vm = require('vm');

let code = fs.readFileSync('js/components/doctorDashboard.js', 'utf8');

const mockStore = {
  data: { referrals: [] },
  createReferral: async function(payload) {
    console.log("mockStore.createReferral CALLED with:", payload.id);
    this.data.referrals.push(payload);
    return payload;
  }
};
const mockDocument = {
  getElementById: (id) => {
    return {
      id,
      value: id === 'refPatientId' ? 'PAT-303' : id === 'refDestHospital' ? 'HOSP-101' : id === 'refReason' ? 'Valid reason' : '',
      classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false },
      selectedOptions: [{ text: 'City General Hospital', getAttribute: ()=>'City General Hospital' }],
      querySelector: () => ({ textContent: '' })
    };
  },
  addEventListener: ()=>{},
  removeEventListener: ()=>{}
};
const mockWindow = {
  console,
  setTimeout,
  clearTimeout,
  document: mockDocument,
  hospitrackStore: mockStore,
  hospitrackAuth: { getCurrentUser: () => ({ id: 'DOC-201', role: 'DOCTOR' }) },
  showToast: (m) => console.log('TOAST:', m),
  closeGlobalModal: () => {},
  escapeHtml: s => s
};
mockWindow.window = mockWindow;

vm.runInContext(code, vm.createContext(mockWindow));

(async () => {
  console.log('calling handleReferralSubmit...');
  try {
    await mockWindow.handleReferralSubmit({ preventDefault: ()=>{} });
  } catch(e) {
    console.log('Caught error in invocation:', e);
  }
  console.log('done, referrals:', mockStore.data.referrals.length);
})();
