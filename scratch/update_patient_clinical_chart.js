const fs = require('fs');
const path = 'js/modules/PatientClinicalChart.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add vitals fields to interface
const targetInterface = `  allergies: string[]; // [] for NKDA, or e.g. ["Penicillin", "Sulfa Drugs"]
  medicalHistory?: string[]; // ["Mitral Valve Prolapse", "Mild Dyslipidemia"]
}`;
const replInterface = `  allergies: string[]; // [] for NKDA, or e.g. ["Penicillin", "Sulfa Drugs"]
  medicalHistory?: string[]; // ["Mitral Valve Prolapse", "Mild Dyslipidemia"]
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressure?: string;
  heartRate?: number;
  oxygenSaturation?: number;
  bodyTemperature?: number;
  rhythmNotes?: string;
  triageRecordedAt?: string;
  triageRecordedBy?: string;
}`;

content = content.replace(content.includes(targetInterface.replace(/\n/g, '\r\n')) ? targetInterface.replace(/\n/g, '\r\n') : targetInterface, replInterface);

// 2. Update the 4 widgets to use patient vitals or unmeasured state
const targetWidgets = `        {/* 4 Interactive Telemetry Metric Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Blood Pressure */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Blood Pressure</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Normal
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">120/80</span>
              <span className="text-xs text-slate-400 font-mono">mmHg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Systolic: 120 / Diastolic: 80</span>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Heart Rate</span>
              <HeartPulse className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">74</span>
              <span className="text-xs text-slate-400 font-mono">bpm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Resting Sinus Rhythm</span>
            </div>
          </div>

          {/* 3. Oxygen Saturation (SpO2) */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Oxygen Saturation</span>
              <Activity className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">99%</span>
              <span className="text-xs text-slate-400 font-mono">SpO2</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Room Air (Atmospheric)</span>
            </div>
          </div>

          {/* 4. Body Temperature */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Body Temperature</span>
              <Thermometer className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">98.6°</span>
              <span className="text-xs text-slate-400 font-mono">Fahrenheit</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Afebrile / Normal</span>
            </div>
          </div>
        </div>`;

const replWidgets = `        {/* 4 Interactive Telemetry Metric Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Blood Pressure */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Blood Pressure</span>
              <span className={\`px-1.5 py-0.5 text-[10px] font-bold rounded \${
                (patient.bloodPressure || patient.bloodPressureSystolic)
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }\`}>
                {(patient.bloodPressure || patient.bloodPressureSystolic) ? 'Recorded' : 'Awaiting Triage'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={\`text-2xl font-black tracking-tight \${
                (patient.bloodPressure || patient.bloodPressureSystolic) ? 'text-slate-900' : 'text-slate-400'
              }\`}>
                {patient.bloodPressure || (patient.bloodPressureSystolic ? \`\${patient.bloodPressureSystolic}/\${patient.bloodPressureDiastolic}\` : '— / —')}
              </span>
              <span className="text-xs text-slate-400 font-mono">mmHg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              {(patient.bloodPressure || patient.bloodPressureSystolic) ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Systolic: {patient.bloodPressureSystolic || '—'} / Diastolic: {patient.bloodPressureDiastolic || '—'}</span>
                </>
              ) : (
                <span>Unmeasured at intake</span>
              )}
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Heart Rate</span>
              <HeartPulse className={\`w-4 h-4 \${patient.heartRate ? 'text-rose-500' : 'text-slate-300'} group-hover:scale-110 transition-transform\`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={\`text-2xl font-black tracking-tight \${patient.heartRate ? 'text-slate-900' : 'text-slate-400'}\`}>
                {patient.heartRate != null ? patient.heartRate : '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">bpm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              {patient.heartRate != null ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>{patient.rhythmNotes || 'Resting Sinus Rhythm'}</span>
                </>
              ) : (
                <span>Unmeasured</span>
              )}
            </div>
          </div>

          {/* 3. Oxygen Saturation (SpO2) */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Oxygen Saturation</span>
              <Activity className={\`w-4 h-4 \${patient.oxygenSaturation ? 'text-teal-600' : 'text-slate-300'} group-hover:scale-110 transition-transform\`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={\`text-2xl font-black tracking-tight \${patient.oxygenSaturation ? 'text-slate-900' : 'text-slate-400'}\`}>
                {patient.oxygenSaturation != null ? \`\${patient.oxygenSaturation}%\` : '— %'}
              </span>
              <span className="text-xs text-slate-400 font-mono">SpO2</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              {patient.oxygenSaturation != null ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Room Air (Atmospheric)</span>
                </>
              ) : (
                <span>Unmeasured</span>
              )}
            </div>
          </div>

          {/* 4. Body Temperature */}
          <div className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Body Temperature</span>
              <Thermometer className={\`w-4 h-4 \${patient.bodyTemperature ? 'text-amber-500' : 'text-slate-300'} group-hover:scale-110 transition-transform\`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={\`text-2xl font-black tracking-tight \${patient.bodyTemperature ? 'text-slate-900' : 'text-slate-400'}\`}>
                {patient.bodyTemperature != null ? \`\${patient.bodyTemperature}°\` : '— °'}
              </span>
              <span className="text-xs text-slate-400 font-mono">Fahrenheit</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              {patient.bodyTemperature != null ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{patient.bodyTemperature >= 100.4 ? 'Febrile' : 'Afebrile / Normal'}</span>
                </>
              ) : (
                <span>Unmeasured</span>
              )}
            </div>
          </div>
        </div>`;

content = content.replace(content.includes(targetWidgets.replace(/\n/g, '\r\n')) ? targetWidgets.replace(/\n/g, '\r\n') : targetWidgets, replWidgets);

fs.writeFileSync(path, content, 'utf8');
console.log('PatientClinicalChart.tsx updated!');

