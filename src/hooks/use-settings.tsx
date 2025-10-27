
'use client';

import { getSettings as getDBSettings, updateSettings as updateDBSettings } from '@/lib/firebase/firestore';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  academicSession: string;
  preloaderStyle: string;
  
  // WhatsApp settings
  ultraMsgEnabled: boolean;
  officialApiEnabled: boolean;
  ultraMsgApiUrl: string;
  ultraMsgToken: string;
  officialApiNumberId: string;
  officialApiToken: string;
  newAdmissionMsg: boolean;
  absentMsg: boolean;
  paymentReceiptMsg: boolean;
  newAdmissionTemplate: string;
  absentTemplate: string;
  paymentReceiptTemplate: string;

  // Website Content Settings
  heroTitle1: string;
  heroSubtitle1: string;
  heroButtonText1: string;
  heroTitle2: string;
  heroSubtitle2: string;
  heroButtonText2: string;
  
  heroTutor1Name: string;
  heroTutor1Experience: string;
  heroTutor1ImageUrl: string;
  heroTutor2Name: string;
  heroTutor2Experience: string;
  heroTutor2ImageUrl: string;
  heroMainTitle: string;
  heroMainSubtitle: string;
  heroMainButton1Text: string;
  heroMainButton2Text: string;

  servicesTitle: string;
  servicesSubtitle: string;
  service1Title: string;
  service1Description: string;
  service2Title: string;
  service2Description: string;
  service3Title: string;
  service3Description: string;

  benefitsTitle: string;
  benefitsSubtitle: string;
  benefitsImageUrl: string;
  benefit1Title: string;
  benefit1Description: string;
  benefit2Title: string;
  benefit2Description: string;
  benefit3Title: string;
  benefit3Description: string;

  optionsTitle: string;
  optionsSubtitle: string;
  option1Title: string;
  option1Description: string;
  option1Price: string;
  option1ImageUrl: string;
  option2Title: string;
  option2Description: string;
  option2Price: string;
  option2ImageUrl: string;
  option3Title: string;
  option3Description: string;
  option3Price: string;
  option3ImageUrl: string;

  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonialsImageUrl: string;
  testimonial1Quote: string;
  testimonial1Name: string;
  testimonial1Role: string;
  testimonial1AvatarUrl: string;
  testimonial2Quote: string;
  testimonial2Name: string;
  testimonial2Role: string;
  testimonial2AvatarUrl: string;

  faqTitle: string;
  faq1Question: string;
  faq1Answer: string;
  faq2Question: string;
  faq2Answer: string;
  faq3Question: string;
  faq3Answer: string;
  faq4Question: string;
  faq4Answer: string;
  faq5Question: string;
  faq5Answer: string;
  faq6Question: string;
  faq6Answer: string;

  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaImageUrl1: string;
  ctaImageUrl2: string;

  newsletterTitle: string;
  newsletterSubtitle: string;

  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTwitter: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isSettingsLoading: boolean;
}

const defaultSettings: Settings = {
  name: '', // Default to empty to allow fallback to 'My Academy'
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
  academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  preloaderStyle: 'style-1',
  ultraMsgEnabled: false,
  officialApiEnabled: false,
  ultraMsgApiUrl: '',
  ultraMsgToken: '',
  officialApiNumberId: '',
  officialApiToken: '',
  newAdmissionMsg: true,
  absentMsg: true,
  paymentReceiptMsg: true,
  newAdmissionTemplate: 'Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.',
  absentTemplate: 'Dear parent, your child {student_name} (Roll No: {student_id}) was absent today.',
  paymentReceiptTemplate: 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!',
  
  heroTitle1: 'Get The Best Education',
  heroSubtitle1: 'We have a team of professionals who are always ready to help you.',
  heroButtonText1: 'Get Started',
  heroTitle2: 'Boost Your Skills With Us',
  heroSubtitle2: 'Our certified tutors provide the best, experienced and certified tutors across a series of strings.',
  heroButtonText2: 'Our Courses',
  
  socialFacebook: '#',
  socialInstagram: '#',
  socialYoutube: '#',
  socialTwitter: '#',

  // New detailed content settings
  heroTutor1Name: "Anika Sarkar",
  heroTutor1Experience: "10+ Years Experience",
  heroTutor1ImageUrl: "https://images.unsplash.com/photo-1746513399803-e988cc54e812?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxmZW1hbGUlMjB0dXRvcnxlbnwwfHx8fDE3NjE1NDAyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  heroTutor2Name: "Abdullah Jiscal",
  heroTutor2Experience: "8+ Years Experience",
  heroTutor2ImageUrl: "https://images.unsplash.com/photo-1642439986788-825f9075691e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxtYWxlJTIwdHV0b3J8ZW58MHx8fHwxNzYxNTQwMjA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  heroMainTitle: "Achieve Your Goals with the Right Tutor",
  heroMainSubtitle: "Our certified tutors provide the best, experienced and certified tutors across a series of strings.",
  heroMainButton1Text: "Get Started",
  heroMainButton2Text: "Free Trial Class",

  servicesTitle: "Our Teaching Services",
  servicesSubtitle: "Our team of certified teachers are dedicated to help students achieve their goals.",
  service1Title: "12 years of experience",
  service1Description: "We have a huge experience in this field, we have a bunch of satisfied users. Our strategies for education are proven to be working.",
  service2Title: "Team of professionals",
  service2Description: "We have a team of professionals who are always ready to help you. Our team is a bunch of certified teachers.",
  service3Title: "Dedicated Work",
  service3Description: "We are dedicated to our work. We provide quality education. Our students are our first priority. We provide quality education.",

  benefitsTitle: "Explore the Benefits",
  benefitsSubtitle: "Our team of certified teachers are dedicated to help students achieve their goals and personal growth.",
  benefitsImageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmd8ZW58MHx8fHwxNzYxNDU1NTU2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  benefit1Title: "Accelerate Your Learning",
  benefit1Description: "Experience personalized instruction and achieve your academic goals faster.",
  benefit2Title: "Flexibility",
  benefit2Description: "Choose your own schedule and learn at a pace that suits you.",
  benefit3Title: "Practical Skills",
  benefit3Description: "Acquire practical skills that you can immediately apply in real-world situations.",

  optionsTitle: "Explore the Options",
  optionsSubtitle: "Our team of certified teachers are dedicated to help students achieve their goals and personal growth.",
  option1Title: "Group Classes",
  option1Description: "Join a dynamic learning environment and interact with peers.",
  option1Price: "25.00",
  option1ImageUrl: "https://images.unsplash.com/photo-1756314355692-56276a5b7bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxncm91cCUyMGNsYXNzfGVufDB8fHx8MTc2MTU0MDIwOXww&ixlib=rb-4.1.0&q=80&w=1080",
  option2Title: "Online Classes",
  option2Description: "Join a dynamic learning environment and interact with peers.",
  option2Price: "50.00",
  option2ImageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjbGFzc3xlbnwwfHx8fDE3NjE1NDAyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  option3Title: "Workshop Classes",
  option3Description: "Join a dynamic learning environment and interact with peers.",
  option3Price: "80.00",
  option3ImageUrl: "https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcHxlbnwwfHx8fDE3NjE1NDAyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080",

  testimonialsTitle: "What other Students are Saying!",
  testimonialsSubtitle: "Our team of certified teachers are dedicated to help students achieve their goals and personal growth.",
  testimonialsImageUrl: "https://images.unsplash.com/photo-1660794485891-26ef783fa993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzbWlsaW5nJTIwc3R1ZGVudHxlbnwwfHx8fDE3NjE0NjUyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  testimonial1Quote: "This learning platform has been a game-changer for my team. The courses are practical, and the instructors are top-notch. Highly recommended!",
  testimonial1Name: "Ronald Richards",
  testimonial1Role: "Business Owner",
  testimonial1AvatarUrl: "https://images.unsplash.com/photo-1640951613773-54706e06851d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cGVyc29uJTIwYXZhdGFyfGVufDB8fHx8MTc2MTQ2NzkzNXww&ixlib=rb-4.1.0&q=80&w=1080",
  testimonial2Quote: "I've taken several courses here, and the quality is consistently excellent. The platform is user-friendly, and I've learned so much.",
  testimonial2Name: "Robert Fox",
  testimonial2Role: "UI/UX Designer",
  testimonial2AvatarUrl: "https://images.unsplash.com/photo-1594616838951-c155f8d978a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYxNDY3OTM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  
  faqTitle: "General Question",
  faq1Question: "What types of courses are available?",
  faq1Answer: "We offer a wide range of courses, from performance-based skills to personal development and future-focused learning.",
  faq2Question: "How do I track my progress in a course?",
  faq2Answer: "You can track your progress through your student dashboard, which shows completed lessons, grades, and feedback from instructors.",
  faq3Question: "How do I sign up for courses?",
  faq3Answer: "You can sign up for courses directly through our website. Simply browse our course catalog and click the \"Enroll Now\" button on the course page.",
  faq4Question: "Can I get a certificate after completing a course?",
  faq4Answer: "Yes, upon successful completion of any course, you will receive a verifiable digital certificate to showcase your achievement.",
  faq5Question: "What types of payment do you accept?",
  faq5Answer: "We accept all major credit cards, as well as payments through PayPal and direct bank transfer.",
  faq6Question: "Can I access the platform on mobile?",
  faq6Answer: "Absolutely! Our platform is fully responsive and works seamlessly on desktops, tablets, and mobile devices for learning on the go.",

  ctaTitle: "Boost your skills with us! Enroll today and start learning confidently.",
  ctaSubtitle: "Our team of certified teachers are dedicated to help students achieve their goals and personal growth.",
  ctaButtonText: "Get Started",
  ctaImageUrl1: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZ3xlbnwwfHx8fDE3NjE0NzgyODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ctaImageUrl2: "https://images.unsplash.com/photo-1588338949401-8fd705bca823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3cml0aW5nJTIwbm90ZXN8ZW58MHx8fHwxNzYxNTEzMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",

  newsletterTitle: "Join Our Newsletter",
  newsletterSubtitle: "Subscribe to our newsletter to get the latest updates.",

  // Remove old feature values
  feature1Title: "",
  feature1Value: "",
  feature2Title: "",
  feature2Value: "",
  feature3Title: "",
  feature3Value: "",
};


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsSettingsLoading(true);
      try {
        const cachedSettings = localStorage.getItem('academySettings');
        let currentSettings = defaultSettings;
        if (cachedSettings) {
           currentSettings = { ...defaultSettings, ...JSON.parse(cachedSettings) };
           setSettingsState(currentSettings);
        }

        const dbSettings = await getDBSettings();
        if (dbSettings) {
          const mergedSettings = { ...defaultSettings, ...dbSettings };
          setSettingsState(mergedSettings);
          localStorage.setItem('academySettings', JSON.stringify(mergedSettings));
        } else {
          // If no settings in DB, let's try to save the default ones.
          await updateDBSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettingsState(defaultSettings);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettingsState(updatedSettings);
    await updateDBSettings(updatedSettings);
    localStorage.setItem('academySettings', JSON.stringify(updatedSettings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isSettingsLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
