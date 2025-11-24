import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_PARAMS, INITIAL_UNITS } from './constants';
import { Unit, GlobalParams, OptimizationResult } from './types';
import { optimizeSystem } from './services/optimizer';
import { KPICard } from './components/KPICard';
import { AllocationChart } from './components/AllocationChart';
import { ResultsTable } from './components/ResultsTable';
import { Zap, BarChart3, Settings, AlertTriangle, RefreshCw, Plus, Trash2, Globe, Mail, Phone, User, Info } from 'lucide-react';

// --- Translation Dictionary ---
type Language = 'en' | 'fa' | 'ar';

const translations = {
  en: {
    appTitle: "OptiPower Dispatch",
    recalculate: "Recalculate",
    constraints: "Constraints",
    totalDemand: "Total Demand (MW)",
    totalReserve: "Total Reserve (MW)",
    autoCalc: "Auto-calculate on change",
    generatorUnits: "Generator Units",
    addUnit: "Add Unit",
    pMax: "P Max",
    rMax: "R Max",
    mc: "MC ($)",
    cost: "Cost",
    optimal: "Optimal",
    infeasible: "Infeasible Solution",
    infeasibleDesc: "The solver could not find a valid allocation. The total demand plus reserves likely exceeds the available system capacity.",
    totalCost: "Total Cost",
    marketPrice: "Market Price",
    reservePrice: "Reserve Price",
    systemLoad: "System Load",
    allocationTitle: "Generation & Reserve Dispatch",
    detailedAlloc: "Detailed Allocation",
    unit: "Unit",
    energy: "Energy",
    reserve: "Reserve",
    capacity: "Unused Capacity",
    objFunc: "Objective Function Value",
    margEnergy: "Marginal Energy Price",
    margReserve: "Marginal Reserve Price",
    capacityLabel: "Capacity",
    maxReserveLabel: "Max Reserve",
    // Contact Info
    developerLabel: "Developer",
    developerName: "Mohammad Masoud Mohammadi",
    developerDesc: "PhD student in Electrical Engineering, Power Systems, Tarbiat Modares University",
    emailLabel: "Email",
    phoneLabel: "Contact number",
    // Intro
    introTitle: "Web application for real-time calculation and optimization of power and reservation pricing",
    introBody: "In this problem, assuming there are 4 power plant units (can be increased and decreased in the web app), the units announce their proposed prices to participate in the sale of their power and reservation, and according to the desired demand and reservation amount, the prices are optimized in real time and the share of each power plant in supplying demand will be determined.",
  },
  fa: {
    appTitle: "توزیع بهینه توان",
    recalculate: "محاسبه مجدد",
    constraints: "محدودیت‌های سیستم",
    totalDemand: "تقاضای کل (مگاوات)",
    totalReserve: "رزرو کل (مگاوات)",
    autoCalc: "محاسبه خودکار با تغییرات",
    generatorUnits: "واحدهای تولید",
    addUnit: "افزودن واحد",
    pMax: "توان ماکزیمم",
    rMax: "رزرو ماکزیمم",
    mc: "هزینه نهایی ($)",
    cost: "هزینه",
    optimal: "بهینه",
    infeasible: "مسئله غیرقابل حل",
    infeasibleDesc: "توزیع معتبری یافت نشد. مجموع تقاضا و رزرو احتمالاً از ظرفیت سیستم بیشتر است.",
    totalCost: "هزینه کل",
    marketPrice: "قیمت بازار",
    reservePrice: "قیمت رزرو",
    systemLoad: "بار سیستم",
    allocationTitle: "توزیع تولید و رزرو",
    detailedAlloc: "تخصیص دقیق",
    unit: "واحد",
    energy: "انرژی",
    reserve: "رزرو",
    capacity: "ظرفیت خالی",
    objFunc: "مقدار تابع هدف",
    margEnergy: "قیمت نهایی انرژی",
    margReserve: "قیمت نهایی رزرو",
    capacityLabel: "ظرفیت",
    maxReserveLabel: "حداکثر رزرو",
    // Contact Info
    developerLabel: "توسعه دهنده",
    developerName: "محمد مسعود محمدی",
    developerDesc: "دانشجوی دکتری مهندسی برق، سیستم‌های قدرت، دانشگاه تربیت مدرس",
    emailLabel: "ایمیل",
    phoneLabel: "شماره تماس",
    // Intro
    introTitle: "وب‌اپلیکیشن محاسبه و بهینه‌سازی بلادرنگ قیمت‌گذاری توان و رزرو",
    introBody: "در این مسئله، با فرض وجود ۴ واحد نیروگاهی (که در وب‌اپ قابل افزایش و کاهش است)، واحدها قیمت‌های پیشنهادی خود را برای مشارکت در فروش توان و رزرو اعلام می‌کنند و با توجه به مقدار تقاضا و رزرو مورد نیاز، قیمت‌ها به صورت بلادرنگ بهینه‌سازی شده و سهم هر نیروگاه در تأمین تقاضا مشخص می‌شود.",
  },
  ar: {
    appTitle: "توزيع الطاقة الأمثل",
    recalculate: "إعادة الحساب",
    constraints: "قيود النظام",
    totalDemand: "إجمالي الطلب (ميجاواط)",
    totalReserve: "إجمالي الاحتياطي (ميجاواط)",
    autoCalc: "حساب تلقائي عند التغيير",
    generatorUnits: "وحدات التوليد",
    addUnit: "إضافة وحدة",
    pMax: "القدرة القصوى",
    rMax: "الاحتياطي الأقصى",
    mc: "التكلفة الحدية ($)",
    cost: "التكلفة",
    optimal: "الأمثل",
    infeasible: "حل غير ممكن",
    infeasibleDesc: "لم يتمكن الحل من إيجاد توزيع صالح. إجمالي الطلب والاحتياطي يتجاوز سعة النظام.",
    totalCost: "التكلفة الإجمالية",
    marketPrice: "سعر السوق",
    reservePrice: "سعر الاحتياطي",
    systemLoad: "حمل النظام",
    allocationTitle: "توزيع التوليد والاحتياطي",
    detailedAlloc: "تخصيص مفصل",
    unit: "وحدة",
    energy: "طاقة",
    reserve: "احتياطي",
    capacity: "سعة غير مستخدمة",
    objFunc: "قيمة دالة الهدف",
    margEnergy: "السعر الحدي للطاقة",
    margReserve: "السعر الحدي للاحتياطي",
    capacityLabel: "سعة",
    maxReserveLabel: "أقصى احتياطي",
    // Contact Info
    developerLabel: "المطور",
    developerName: "محمد مسعود محمدي",
    developerDesc: "طالب دكتوراه في الهندسة الكهربائية، أنظمة الطاقة، جامعة تربية مدرس",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "رقم الاتصال",
    // Intro
    introTitle: "تطبيق ويب لحساب وتحسين تسعير الطاقة والاحتياطي في الوقت الفعلي",
    introBody: "في هذه المسألة، بافتراض وجود 4 وحدات توليد (يمكن زيادتها أو إنقاصها في التطبيق)، تعلن الوحدات عن أسعارها المقترحة للمشاركة في بيع الطاقة والاحتياطي. وبناءً على حجم الطلب والاحتياطي المطلوب، يتم تحسين الأسعار في الوقت الفعلي وتحديد حصة كل محطة في تلبية الطلب.",
  }
};

// --- Reusable Control Input Component ---
interface ControlInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  unitLabel?: string;
}

const ControlInput: React.FC<ControlInputProps> = ({ 
  label, value, onChange, min = 0, max = 1000, step = 1, className, unitLabel 
}) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
        {unitLabel && <span className="text-[10px] text-slate-400">{unitLabel}</span>}
      </div>
      <div className="relative">
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full p-2 bg-[#f1f5f9] border border-slate-200 rounded-lg text-sm font-medium text-slate-700 
                     focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
        />
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
      />
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [params, setParams] = useState<GlobalParams>(INITIAL_PARAMS);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isAutoCalc, setIsAutoCalc] = useState(true);

  const t = translations[lang];
  const isRTL = lang === 'fa' || lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const handleOptimize = useCallback(() => {
    const res = optimizeSystem(units, params.demandTotal, params.reserveTotal);
    setResult(res);
  }, [units, params]);

  useEffect(() => {
    if (isAutoCalc) {
      handleOptimize();
    }
  }, [isAutoCalc, handleOptimize]);

  const handleUnitChange = (id: number, field: keyof Unit, value: number) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const addUnit = () => {
    const newId = Math.max(...units.map(u => u.id), 0) + 1;
    setUnits([...units, { id: newId, name: `${t.unit} ${newId}`, pMax: 100, rMax: 50, mc: 10 }]);
  };

  const removeUnit = (id: number) => {
    if (units.length > 1) {
      setUnits(units.filter(u => u.id !== id));
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 ${isRTL ? 'font-[Tahoma]' : ''}`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
              <Zap size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {lang === 'en' ? (
                <>OptiPower <span className="text-blue-600 font-light">Dispatch</span></>
              ) : t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('fa')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'fa' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                فا
              </button>
              <button 
                onClick={() => setLang('ar')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'ar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ع
              </button>
            </div>

             <button 
              onClick={handleOptimize}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm active:transform active:scale-95"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">{t.recalculate}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Problem Explanation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 p-2 rounded-full hidden sm:block">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">{t.introTitle}</h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {t.introBody}
              </p>
            </div>
          </div>
        </div>

        {/* Contact / Developer Info Box */}
        <div className="bg-slate-800 text-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-700 rounded-full shrink-0 hidden sm:flex">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight mb-1">{t.developerLabel}: {t.developerName}</h3>
              <p className="text-slate-300 text-sm">{t.developerDesc}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px] text-sm text-slate-300 w-full md:w-auto bg-slate-700/50 md:bg-transparent p-4 md:p-0 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a href="mailto:mohammadi.mm@modares.ac.ir" className="hover:text-white transition-colors break-all">mohammadi.mm@modares.ac.ir</a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span dir="ltr">09120576557</span>
            </div>
          </div>
        </div>

        {/* Top Grid: Inputs & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Col: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Global Constraints Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Settings size={16} /> {t.constraints}
                </h2>
              </div>
              <div className="p-5 space-y-6">
                <ControlInput 
                  label={t.totalDemand}
                  value={params.demandTotal}
                  onChange={(val) => setParams({ ...params, demandTotal: val })}
                  max={2000}
                />
                <ControlInput 
                  label={t.totalReserve}
                  value={params.reserveTotal}
                  onChange={(val) => setParams({ ...params, reserveTotal: val })}
                  max={1000}
                />
                
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input 
                    type="checkbox" 
                    id="autoCalc" 
                    checked={isAutoCalc} 
                    onChange={(e) => setIsAutoCalc(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor="autoCalc" className="text-sm text-slate-500 cursor-pointer select-none">
                    {t.autoCalc}
                  </label>
                </div>
              </div>
            </div>

            {/* Units Input Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <BarChart3 size={16} /> {t.generatorUnits}
                </h2>
                <button onClick={addUnit} className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                  <Plus size={14} /> {t.addUnit}
                </button>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {units.map((unit) => (
                  <div key={unit.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all relative group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                           {unit.id}
                         </div>
                         <span className="text-sm font-bold text-slate-700">{unit.name}</span>
                      </div>
                      <button onClick={() => removeUnit(unit.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                       <ControlInput 
                         label={t.pMax}
                         value={unit.pMax}
                         onChange={(val) => handleUnitChange(unit.id, 'pMax', val)}
                         max={1000}
                         unitLabel="MW"
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <ControlInput 
                            label={t.rMax}
                            value={unit.rMax}
                            onChange={(val) => handleUnitChange(unit.id, 'rMax', val)}
                            max={500}
                            unitLabel="MW"
                          />
                          <ControlInput 
                            label={t.mc}
                            value={unit.mc}
                            onChange={(val) => handleUnitChange(unit.id, 'mc', val)}
                            max={200}
                            step={0.5}
                            unitLabel="$/MWh"
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Results */}
          <div className="lg:col-span-8 space-y-6">
            {result && result.status === 'Optimal' ? (
              <>
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard 
                    title={t.totalCost} 
                    value={`$${result.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                    color="blue"
                    subtext={t.objFunc}
                  />
                  <KPICard 
                    title={t.marketPrice} 
                    value={result.marketPrice.toFixed(2)} 
                    unit="$/MWh"
                    color="green"
                    subtext={t.margEnergy}
                  />
                  <KPICard 
                    title={t.reservePrice} 
                    value={result.reservePrice.toFixed(2)} 
                    unit="$/MWh"
                    color="purple"
                    subtext={t.margReserve}
                  />
                  <KPICard 
                    title={t.systemLoad} 
                    value={((result.totalGenP / Math.max(1, units.reduce((a,b) => a + b.pMax, 0))) * 100).toFixed(1)} 
                    unit="%"
                    color="amber"
                    subtext={`${result.totalGenP} MW / ${units.reduce((a,b) => a + b.pMax, 0)} MW`}
                  />
                </div>

                {/* Chart */}
                <AllocationChart 
                  allocations={result.allocations} 
                  units={units} 
                  labels={{
                    title: t.allocationTitle,
                    energy: t.energy,
                    reserve: t.reserve,
                    capacity: t.capacity
                  }}
                />

                {/* Table */}
                <ResultsTable 
                  allocations={result.allocations} 
                  units={units} 
                  labels={{
                    title: t.detailedAlloc,
                    unit: t.unit,
                    mc: t.mc,
                    pMax: t.pMax,
                    rMax: t.rMax,
                    energy: t.energy,
                    reserve: t.reserve,
                    cost: t.cost
                  }}
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-200 text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <AlertTriangle size={40} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">{t.infeasible}</h3>
                <p className="text-red-600 max-w-md">
                  {t.infeasibleDesc}
                </p>
                <div className="mt-6 flex gap-8 text-sm text-red-700 font-medium bg-red-100/50 px-6 py-3 rounded-lg">
                   <div>
                     <span className="block text-xs opacity-70 uppercase">{t.capacityLabel}</span>
                     {units.reduce((acc, u) => acc + u.pMax, 0)} MW
                   </div>
                   <div className="w-px bg-red-200"></div>
                   <div>
                     <span className="block text-xs opacity-70 uppercase">{t.maxReserveLabel}</span>
                     {units.reduce((acc, u) => acc + u.rMax, 0)} MW
                   </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;