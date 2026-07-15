/* ============================================================
   Astra Procurement Hub — data layer
   Semua konten dipisah dari markup agar mudah diisi & nanti
   gampang disambung ke SharePoint List / Firebase.
   ============================================================ */

/* ---------------- SECURITY: segmen SIGAP ---------------- */
const SECURITY_SEGMENTS = [
  {id:"sales", name:"Sales Operation", desc:"Showroom, workshop & body paint, area parkir",
   icon:'<path d="M3 13l2-5a2 2 0 012-1.4h10A2 2 0 0124 8l2 5"/><path d="M5 13h14v5H5z"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/>',
   labour:{people:"12 Orang", system:"Sistem fokus pada pengelolaan manpower", device:"—", ext:"—", price:"Rp 108 Juta", unit:"~/bulan"},
   job:{people:"8 Orang", system:"Sistem Online Patrol, dilengkapi Monitoring by CMS Sigap & Response by tim Sigap", device:"8 CCTV, 3 Access Control, include maintenance", ext:"Treatment external relation based on social mapping", price:"Rp 84,6 Juta", unit:"~/bulan"}},
  {id:"manuf", name:"Manufacturing", desc:"Kawasan pabrik & area produksi",
   icon:'<path d="M3 21V9l6 4V9l6 4V9l6 4v8z"/><path d="M3 21h18"/>',
   labour:{people:"40 Orang", system:"Sistem fokus pada pengelolaan manpower", device:"—", ext:"—", price:"Rp 360 Juta", unit:"~/bulan"},
   job:{people:"32 Orang", system:"Access Control, Monitoring CCTV & Patrol, Response by SG", device:"40 CCTV, 16 Access Control, CMS include maintenance", ext:"Treatment external relation based on social mapping", price:"Rp 357 Juta", unit:"~/bulan"}},
  {id:"fin", name:"Financial Services", desc:"Kantor cabang & layanan keuangan",
   icon:'<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9l9-6 9 6"/><path d="M8 13v3M12 13v3M16 13v3"/>',
   labour:{people:"4 Orang", system:"Sistem fokus pada pengelolaan manpower", device:"—", ext:"—", price:"Rp 36 Juta", unit:"~/bulan"},
   job:{people:"2 Orang (Non Shift)", system:"Monitoring CCTV by CMS Sigap & Response by Sigap Team", device:"6 CCTV, 6 Security, Alarm 2 Access Control, include maintenance", ext:"Treatment external relation based on social mapping", price:"Rp 25,5 Juta", unit:"~/bulan"}},
  {id:"office", name:"Office Building", desc:"Gedung perkantoran & high-rise",
   icon:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
   labour:{people:"16 Orang", system:"Sistem fokus pada pengelolaan manpower", device:"—", ext:"—", price:"Rp 144 Juta", unit:"~/bulan"},
   job:{people:"8 Orang", system:"Akses Control, Sistem CMS, Monitoring CCTV & Response by SG", device:"30 CCTV, 12 Access Control, include maintenance", ext:"Treatment external relation based on social mapping", price:"Rp 106,4 Juta", unit:"~/bulan"}},
  {id:"land", name:"Vacant Land", desc:"Lahan kosong & aset tidak terbangun",
   icon:'<path d="M3 20h18"/><path d="M5 20V10l4-3 4 3v10"/><path d="M13 20v-6l4-3 4 3v6"/>',
   labour:{people:"4 Orang", system:"Sistem fokus pada pengelolaan manpower", device:"—", ext:"—", price:"Rp 36 Juta", unit:"~/bulan"},
   job:{people:"1 Orang (Non Shift)", system:"Sistem Online Patrol & Offline Patrol 2x kedatangan malam hari dan weekend, dilengkapi Monitoring & Response", device:"8 Perimeter CCTV, include maintenance", ext:"Treatment external relation based on social mapping", price:"Rp 19 Juta", unit:"~/bulan"}}
];

/* ---------------- TRAVEL: vendor referensi HO 2025 ---------------- */
const TRAVEL_VENDORS = [
  {name:"Bayu Buana", sub:"BCD Travel", addr:"Jl. Ir. H. Juanda III No. 31N, Jakarta 10120", phone:"(021) 3952 4800", term:30, color:"#0a3d7a", logo:"BB",
   mark:'<span class="wm" style="color:#0a3d7a">BAYU<small style="color:#c0392b">BUANA</small></span>'},
  {name:"Astrindo", sub:"Travel Management", addr:"Jl. Teluk Betung No. 40, Jakarta 10230", phone:"(021) 390 7576", term:30, color:"#1B7A4B", logo:"AS"},
  {name:"Travel 10", sub:"Corporate Travel", addr:"Jl. Raya Perjuangan No. 9E, Kebon Jeruk, Jakarta Barat 11530", phone:"(021) 5367 1881", term:14, color:"#0a6fc4", logo:"10"},
  {name:"Antavaya", sub:"Travel & Tours", addr:"Jl. Batu Tulis Raya No. 38, Jakarta 10120", phone:"(021) 2922 7999", term:30, color:"#E8631A", logo:"AV",
   mark:'<span class="wm" style="color:#E8631A">ANTA<small style="color:#5a5a5a">VAYA</small></span>'},
  {name:"Gading Cakrawala", sub:"Travel", addr:"Kokan Permata Kelapa Gading, Jl. Boulevard Bukit Gading Raya", phone:"0899 008 0080", term:30, color:"#03396b", logo:"GC"},
  {name:"Traveloka", sub:"Campus North Tower", addr:"Jl. Grand Boulevard, BSD Green Office Park, Tangerang 15345", phone:"(021) 3012 2088", term:30, color:"#1B9DEC", logo:"TR",
   mark:'<span class="wm" style="color:#1B9DEC;text-transform:lowercase;font-size:12px">traveloka</span>'},
  {name:"Aero Travel", sub:"Travel Services", addr:"Jl. Prof. Dr. Soepomo No. 45, Tebet Barat, Jakarta Selatan", phone:"0813 2464 1414", term:30, color:"#2f7d52", logo:"AE"},
  {name:"Dwidaya", sub:"Dwidaya Tour", addr:"Jl. Hayam Wuruk No. 121, Jakarta Barat 11180", phone:"(021) 7766 6222", term:30, color:"#E94E1B", logo:"DW",
   mark:'<span class="wm" style="color:#E94E1B;text-transform:lowercase;font-size:11px">dwidaya<small style="color:#1a4a78">TOUR</small></span>'},
  {name:"Tiket.com", sub:"Online Travel", addr:"Wisma Barito Pacific II Lt. 8, Jl. Letjen S. Parman Kav. 60, Slipi, Jakarta Barat", phone:"0857 16842088", term:30, color:"#0064D2", logo:"TK",
   mark:'<span class="wm" style="color:#0064D2;text-transform:lowercase;font-size:11px">tiket<small style="color:#E94E1B;font-size:8px;letter-spacing:0">.com</small></span>'}
];

/* ---------------- Expose ---------------- */
window.HubData = { SECURITY_SEGMENTS, TRAVEL_VENDORS };
