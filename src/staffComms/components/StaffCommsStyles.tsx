import { C } from '../lib/theme';

// Scoped CSS for anything rendered inside a `.staff-comms-app` wrapper -
// shared by the Manage/Calendar/Outputs/Archive admin pages so it only
// needs to be mounted once (see Admin.jsx) rather than once per page.
export function StaffCommsStyles() {
  return (
    <style>{`
      .staff-comms-app, .staff-comms-app *, .staff-comms-app *::before, .staff-comms-app *::after { box-sizing: border-box; }
      @keyframes slideInToast { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .staff-comms-app input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
      .staff-comms-app select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2394A3B8' d='M5 7L0 2h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px !important; }
      .staff-comms-app textarea { font-family: inherit; }
      .staff-comms-app button { font-family: inherit; }
      .staff-comms-app ::-webkit-scrollbar { width: 5px; height: 5px; }
      .staff-comms-app ::-webkit-scrollbar-track { background: transparent; }
      .staff-comms-app ::-webkit-scrollbar-thumb { background: ${C.borderMed}; border-radius: 99px; }
      .staff-comms-app input:focus, .staff-comms-app select:focus, .staff-comms-app textarea:focus { outline: none; border-color: ${C.borderFocus} !important; box-shadow: 0 0 0 3px ${C.borderFocus}1A; }
    `}</style>
  );
}
