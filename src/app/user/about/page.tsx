import React from 'react';
import { ArrowRight, Globe, Mail } from 'lucide-react';

const AboutPage = () => {
  
  const conferenceInfo = [
    {
      id: 'icicyta',
      headerTitle: "ICICyTA: The International Conference on Information, Cybernetics, and Technology Advancement",
      headerColor: "bg-blue-200", // Warna Header Biru Muda
      rows: [
        { label: "Conference Title", value: "Conference Title: ICICyTA & ICoDSA 2025 The International Conference on Information, Cybernetics, and Technology Advancement (ICICyTA) and The International Conference on Data Science and Applications (ICoDSA)." },
        { label: "Date and Location", value: "Regular text: 23 November – 24 November 2025 (Pukul 08:00 WIB - 17:00 WIB setiap hari) | Hybrid Event: Fisik: Auditorium & Ballroom UTB Virtual: Platform Zoom (Link akan diumumkan di sesi masing-masing)" },
        { label: "Theme/Objective", value: "Synergy in Digital Era: Fostering Innovation in AI, Cybernetics, and Big Data Applications." }
      ]
    },
    {
      id: 'icodsa',
      headerTitle: "ICoDSA: The International Conference on Data Science and Applications",
      headerColor: "bg-[#D9F99D]",
      rows: [
        { label: "Conference Title", value: "The International Conference on Data Science and Applications (ICoDSA) 2025" },
        { label: "Date and Location", value: "Regular text: 23 November – 24 November 2025 (Pukul 08:00 WIB - 17:00 WIB setiap hari) | Hybrid Event: Fisik: Auditorium & Ballroom UTB Virtual: Platform Zoom (Link akan diumumkan di sesi masing-masing)" },
        { label: "Theme/Objective", value: "Synergy in Digital Era: Fostering Innovation in AI, Cybernetics, and Big Data Applications." }
      ]
    }
  ];

  // 2. Data Developer Team
  const developerTeam = [
    {
      id: 1,
      name: "Fatra Al Khawarizmi",
      role: "Front - End",
      desc: "Laborum quasi distinctio est et. Sequi omnis molestiae. Officia occaecati voluptatem accusantium.",
      color: "bg-[#DCE74A]", 
      imageSeed: "Fatra",
      gender: "male"
    },
    {
      id: 2,
      name: "Ananta Puti Maharani",
      role: "Design UI/UX",
      desc: "Laborum quasi distinctio est et. Sequi omnis molestiae. Officia occaecati voluptatem accusantium.",
      color: "bg-[#4AA3E7]",
      imageSeed: "Ananta",
      gender: "female"
    },
    {
      id: 3,
      name: "Muhammad Hendika Putra",
      role: "Back - End",
      desc: "Laborum quasi distinctio est et. Sequi omnis molestiae. Officia occaecati voluptatem accusantium.",
      color: "bg-[#E78B4A]",
      imageSeed: "Hendika",
      gender: "male"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-slate-800">
      <div className="max-w-11/12 mx-auto space-y-6">
        
        <section>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">General Conference Info</h1>
          
          <div className="space-y-10">
            {conferenceInfo.map((info) => (
              <div key={info.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                {/* Header Bar */}
                <div className={`${info.headerColor} px-6 py-3 border-b border-gray-200`}>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {info.headerTitle}
                  </p>
                </div>

                {/* Content Rows */}
                <div className="divide-y divide-gray-100">
                  {info.rows.map((row, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                        {row.label} <ArrowRight size={12} />
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION 2: DATA DEVELOPER --- */}
        <section>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Data Developer</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerTeam.map((dev) => (
              <div key={dev.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden min-h-[180px]">
                
                {/* Left Side: Image & Color Background */}
                <div className="w-[140px] relative flex-shrink-0">
                  {/* Colored Shape Background */}
                  <div className={`absolute top-0 left-0 w-full h-full ${dev.color} rounded-br-[80px]`}></div>
                  
                  {/* Avatar Image (Using Dicebear for illustration style) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-28 h-28">
                     <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.imageSeed}&clothing=blazerAndShirt&accessories=glasses`} 
                      alt={dev.name}
                      className="w-full h-full object-contain drop-shadow-md transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Role Badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-max">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-gray-200">
                      {dev.role}
                    </span>
                  </div>
                </div>

                {/* Right Side: Text Content */}
                <div className="flex-1 p-5 flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">
                    {dev.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                    {dev.desc}
                  </p>
                  
                  {/* Optional: Social Icons placeholder */}
                  <div className="flex gap-2 mt-3 opacity-40">
                    <Globe size={12} />
                    <Mail size={12} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;