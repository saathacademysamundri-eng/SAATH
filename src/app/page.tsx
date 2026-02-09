'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Trophy, 
  Award, 
  Star, 
  BookOpen, 
  ChalkboardTeacher, 
  ClipboardCheck, 
  Brain, 
  HandHoldingUsd, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  ChevronRight, 
  Globe, 
  School,
  LayoutDashboard,
  Wallet,
  Medal,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>('en');
  const [showIntro, setShowIntro] = useState(true);
  const [showLangModal, setShowLangModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Intro animation timeline
    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowLangModal(true);
    }, 2500);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const selectLanguage = (lang: 'en' | 'ur') => {
    setCurrentLang(lang);
    setShowLangModal(false);
  };

  const isUrdu = currentLang === 'ur';

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-[#1e40af] to-[#059669] flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        <div className="relative animate-in zoom-in-50 duration-1000">
          <div className="w-48 h-48 bg-white rounded-[2rem] shadow-2xl p-6 flex items-center justify-center animate-bounce duration-[2000ms]">
            <img src="https://i.postimg.cc/Dfq75Lxb/Saath-Academy-logo.png" alt="SAATH Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <h1 className="mt-8 text-white text-4xl md:text-5xl font-black text-center tracking-tight animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 fill-mode-forwards opacity-0">
          SAATH Academy Samundri
        </h1>
        <p className="mt-4 text-white/80 text-xl font-medium animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-700 fill-mode-forwards opacity-0">
          Excellence in Education
        </p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-white", isUrdu && "font-urdu")} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <Card className="w-full max-w-lg rounded-[2.5rem] border-4 border-[#1e40af] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1e40af] to-[#059669] text-white rounded-full flex items-center justify-center mb-6 text-3xl animate-pulse">
                <Globe />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {isUrdu ? 'اپنی زبان منتخب کریں' : 'Choose Your Language'}
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                {isUrdu ? 'جاری رکھنے کے لیے اپنی پسندیدہ زبان منتخب کریں' : 'Select your preferred language to continue'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Button 
                  onClick={() => selectLanguage('en')}
                  className="h-16 rounded-2xl border-4 border-slate-100 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xl transition-all hover:border-[#1e40af] hover:-translate-y-1"
                >
                  <span className="mr-3 text-2xl">🇬🇧</span> English
                </Button>
                <Button 
                  onClick={() => selectLanguage('ur')}
                  className="h-16 rounded-2xl border-4 border-slate-100 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xl transition-all hover:border-[#1e40af] hover:-translate-y-1"
                >
                  <span className={cn("text-2xl", isUrdu ? "ml-3" : "mr-3")}>🇵🇰</span> اردو
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-lg shadow-md py-3" : "bg-transparent py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="https://i.postimg.cc/Dfq75Lxb/Saath-Academy-logo.png" alt="Logo" className="h-12 w-12 rounded-xl shadow-lg" />
            <div>
              <span className="font-black text-2xl text-[#1e40af] block leading-none">SAATH Academy</span>
              <span className="text-[10px] uppercase tracking-widest font-black text-[#059669]">{isUrdu ? 'سمندری' : 'Samundri'}</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'About', 'Top Results', 'Memories', 'Courses', 'Contact'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-sm font-bold text-slate-700 hover:text-[#1e40af] transition-colors uppercase tracking-wider"
              >
                {item}
              </Link>
            ))}
            <Button asChild className="rounded-full bg-gradient-to-r from-[#1e40af] to-[#059669] text-white px-6 font-bold shadow-lg hover:shadow-[#1e40af]/30 transition-all hover:-translate-y-0.5">
              <Link href="/p/results">Student Portal</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-br from-blue-50 to-emerald-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <BookOpen size={400} className="text-[#1e40af]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <Badge className="bg-white text-[#1e40af] border-2 border-[#1e40af] py-2 px-6 rounded-full font-bold shadow-sm">
              <Star className="mr-2 h-4 w-4 fill-current" />
              {isUrdu ? 'سمندری کا بہترین تعلیمی ادارہ' : 'Best Educational Institute in Samundri'}
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
              {isUrdu ? 'تعلیم، تربیت اور کامیابی کا' : 'Together in Education,'} <span className="text-[#1e40af] underline decoration-[#059669]/30 decoration-8 underline-offset-8">{isUrdu ? 'ساتھ' : 'Success'}</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
              {isUrdu ? 'معیاری تعلیم، تجربہ کار اساتذہ، اور جدید تعلیمی طریقوں کے ساتھ طلباء کی کامیابی کا ہماری پہلی ترجیح۔ ہمارے ساتھ اپنے بچے کا مستقبل روشن بنائیں۔' : "Quality education with experienced teachers and modern teaching methods. Your child's success is our priority. Enroll today for a brighter future."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-[#1e40af] text-white font-black text-lg shadow-2xl shadow-blue-900/30 hover:scale-105 transition-transform">
                {isUrdu ? 'داخلہ جاری ہے' : 'Admissions Open'}
                <ArrowRight className={cn("ml-2 h-6 w-6", isUrdu && "rotate-180")} />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-4 border-[#1e40af] text-[#1e40af] font-black text-lg hover:bg-[#1e40af] hover:text-white transition-all">
                {isUrdu ? 'ہم سے رابطہ کریں' : 'Contact Us'}
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop" 
                alt="Students studying" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e40af]/60 to-transparent" />
              <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1e40af]">
                  <Users />
                </div>
                <div className="text-white">
                  <p className="font-black text-2xl leading-none">500+</p>
                  <p className="text-xs font-bold uppercase tracking-widest">{isUrdu ? 'طلباء' : 'Students'}</p>
                </div>
              </div>
            </div>
            {/* Achievement Badge */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#059669] rounded-full p-2 border-8 border-white shadow-2xl animate-spin-slow">
              <div className="w-full h-full rounded-full border-4 border-dashed border-white/30 flex items-center justify-center text-center p-4">
                <span className="text-white font-black text-sm uppercase tracking-tighter leading-tight">
                  {isUrdu ? '100% کامیابی' : '100% SUCCESS RATE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Board Toppers */}
      <section id="top-results" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <Badge className="bg-emerald-50 text-[#059669] border border-emerald-100 py-1 px-4 rounded-full font-bold">
              {isUrdu ? 'ہمارے بورڈ ٹاپرز' : 'Academic Excellence'}
            </Badge>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">
              {isUrdu ? 'اعلیٰ امتحانی نتائج' : 'Our Board Toppers'}
            </h2>
            <div className="w-24 h-2 bg-[#1e40af] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Muhammad Ahmad', pos: '1st - Matric', marks: '1080/1100', board: 'FSD Board 2024', icon: Trophy },
              { name: 'Fatima Zahra', pos: '2nd - Matric', marks: '1075/1100', board: 'FSD Board 2024', icon: Medal },
              { name: 'Ali Hassan', pos: '1st - FSc', marks: '1020/1100', board: 'FSD Board 2024', icon: Award },
              { name: 'Ayesha Khan', pos: '3rd - Matric', marks: '1068/1100', board: 'FSD Board 2024', icon: Star },
            ].map((topper, i) => (
              <Card key={i} className="border-4 border-slate-50 rounded-[2.5rem] p-8 text-center bg-white shadow-xl hover:-translate-y-4 transition-transform duration-500 group">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:rotate-12 transition-transform">
                  <topper.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{topper.name}</h3>
                <p className="text-[#1e40af] font-black text-lg mb-4">{topper.pos}</p>
                <div className="bg-slate-50 rounded-2xl py-4 mb-4">
                  <span className="text-3xl font-black text-[#059669]">{topper.marks}</span>
                </div>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{topper.board}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Gateway Section */}
      <section id="portal" className="py-24 bg-[#1e40af] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#059669] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-6 text-center lg:text-left">
              <h2 className="text-5xl font-black tracking-tight">{isUrdu ? 'طالب علم پورٹل' : 'Student Digital Hub'}</h2>
              <p className="text-xl text-white/80 font-medium">
                {isUrdu ? 'اپنے نتائج، فیس کی تفصیلات اور تعلیمی حاضری تک فوری رسائی حاصل کریں۔' : 'Access your exam results, fee ledger, and attendance records from anywhere, anytime.'}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Link href="/p/results" className="group">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] hover:bg-white hover:text-[#1e40af] transition-all duration-500 w-64 text-center">
                    <Award className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <span className="block font-black text-xl">{isUrdu ? 'نتائج دیکھیں' : 'Check Results'}</span>
                  </div>
                </Link>
                <Link href="/p/ledger" className="group">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] hover:bg-white hover:text-[#1e40af] transition-all duration-500 w-64 text-center">
                    <Wallet className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <span className="block font-black text-xl">{isUrdu ? 'فیس لیجر' : 'Fee Ledger'}</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/50">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#1e40af] font-black">S</div>
                      <div>
                        <p className="font-bold text-slate-900">Student Access</p>
                        <p className="text-xs text-slate-400 font-bold uppercase">Public Portal</p>
                      </div>
                    </div>
                    <Badge className="bg-[#059669] text-white py-1 px-3">Encrypted</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="h-12 w-full bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center px-4 text-slate-400 font-medium">Enter ED Number...</div>
                    <Button className="w-full h-14 rounded-xl bg-[#1e40af] text-white font-black text-lg">Secure Search</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-2xl p-4 text-center">
                      <p className="text-2xl font-black text-[#1e40af]">100%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Accurate Data</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                      <p className="text-2xl font-black text-[#059669]">24/7</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Live Access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">
              {isUrdu ? 'ہمارے کورسز' : 'Educational Programs'}
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              {isUrdu ? 'ہر عمر اور ہر جماعت کے لیے خصوصی پروگرام' : 'Specialized learning paths designed for academic success and professional growth.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Middle Classes', desc: 'Class 6 to 8 with individual attention.', icon: BookOpen },
              { title: 'Matric', desc: 'Science & Arts groups board preparation.', icon: GraduationCap },
              { title: 'Intermediate', desc: 'FSc, ICS, and FA comprehensive coaching.', icon: School },
              { title: 'Entry Test', desc: 'MDCAT & ECAT specialized crash courses.', icon: Award },
            ].map((course, i) => (
              <Card key={i} className="rounded-[2rem] p-8 bg-white border-0 shadow-xl shadow-slate-200/50 group hover:bg-[#1e40af] transition-all duration-500">
                <div className="w-16 h-16 bg-blue-50 text-[#1e40af] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <course.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-white">{course.title}</h3>
                <p className="text-slate-500 font-medium group-hover:text-white/70">{course.desc}</p>
                <div className="mt-6 pt-6 border-t group-hover:border-white/20">
                  <Button variant="link" className={cn("p-0 text-[#1e40af] font-black group-hover:text-white", isUrdu && "flex-row-reverse")}>
                    {isUrdu ? 'مزید معلومات' : 'Learn More'}
                    <ArrowRight className={cn("ml-2 h-4 w-4", isUrdu && "rotate-180")} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src="https://i.postimg.cc/Dfq75Lxb/Saath-Academy-logo.png" alt="Logo" className="h-12 w-12" />
                <span className="font-black text-2xl">SAATH Academy</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                Empowering the next generation through quality education and character building since 2014.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-black">{isUrdu ? 'فوری روابط' : 'Quick Links'}</h4>
              <ul className="space-y-4">
                {['Home', 'About Us', 'Courses', 'Student Portal', 'Staff Login'].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-[#059669]" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-black">{isUrdu ? 'رابطہ' : 'Contact Support'}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-slate-400">
                  <MapPin className="h-6 w-6 text-[#059669] flex-shrink-0" />
                  <span>Housing Colony 2, Samundri Faisalabad</span>
                </li>
                <li className="flex items-center gap-4 text-slate-400">
                  <Phone className="h-6 w-6 text-[#059669] flex-shrink-0" />
                  <span>03438775425</span>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-black">{isUrdu ? 'نیوز لیٹر' : 'Newsletter'}</h4>
              <p className="text-slate-400">Subscribe to get latest updates about admissions and results.</p>
              <div className="relative">
                <input className="w-full bg-slate-800 border-0 rounded-xl h-14 pl-4 pr-12 text-white focus:ring-2 focus:ring-[#1e40af]" placeholder="Email address..." />
                <button className="absolute right-2 top-2 w-10 h-10 bg-[#1e40af] rounded-lg flex items-center justify-center hover:bg-[#1e40af]/80 transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-12 text-center text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} SAATH Academy Samundri. Developed by SchoolUP.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
