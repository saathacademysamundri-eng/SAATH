

'use client';

import { getSettings as getDBSettings, updateSettings as updateDBSettings } from '@/lib/firebase/firestore';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export type StyleProps = {
  textAlign?: 'left' | 'center' | 'right';
}

export type TextElement = {
  id: string;
  type: 'text';
  text: string;
  style?: StyleProps;
}

export type ImageElement = {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  style?: StyleProps;
}

export type Section = {
  id: string;
  name: string;
  elements: (TextElement | ImageElement)[];
}

export interface Settings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  academicSession: string;
  preloaderStyle: string;
  
  ultraMsgEnabled: boolean;
  ultraMsgApiUrl: string;
  ultraMsgToken: string;
  newAdmissionMsg: boolean;
  absentMsg: boolean;
  paymentReceiptMsg: boolean;
  newAdmissionTemplate: string;
  absentTemplate: string;
  paymentReceiptTemplate: string;

  landingPage: {
    sections: Section[];
  }
}

const defaultSettings: Settings = {
  name: 'My Academy',
  address: 'Housing Colony 2, Samundri Faisalabad',
  phone: '0333 9114333',
  logo: '/logo.png',
  academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  preloaderStyle: 'style-1',
  ultraMsgEnabled: false,
  ultraMsgApiUrl: '',
  ultraMsgToken: '',
  newAdmissionMsg: true,
  absentMsg: true,
  paymentReceiptMsg: true,
  newAdmissionTemplate: 'Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.',
  absentTemplate: 'Dear parent, your child {student_name} (Roll No: {student_id}) was absent today.',
  paymentReceiptTemplate: 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!',
  landingPage: {
    sections: [
      {
        id: 'header', name: 'Header',
        elements: [
          { id: 'headerLink1Text', type: 'text', text: 'Home' },
          { id: 'headerLink1Url', type: 'text', text: '#' },
          { id: 'headerLink2Text', type: 'text', text: 'About' },
          { id: 'headerLink2Url', type: 'text', text: '#' },
          { id: 'headerLink3Text', type: 'text', text: 'Gallery' },
          { id: 'headerLink3Url', type: 'text', text: '#' },
          { id: 'headerLink4Text', type: 'text', text: 'Results' },
          { id: 'headerLink4Url', type: 'text', text: '#' },
          { id: 'headerLink5Text', type: 'text', text: 'Teachers' },
          { id: 'headerLink5Url', type: 'text', text: '#' },
          { id: 'headerLink6Text', type: 'text', text: 'Notice Board' },
          { id: 'headerLink6Url', type: 'text', text: '#' },
          { id: 'headerLink7Text', type: 'text', text: 'Contact Us' },
          { id: 'headerLink7Url', type: 'text', text: '#' },
        ]
      },
      {
        id: 'hero', name: 'Hero Section',
        elements: [
          { id: 'heroMainTitle', type: 'text', text: 'Achieve Your Goals with the Right Tutor', style: { textAlign: 'left' } },
          { id: 'heroMainSubtitle', type: 'text', text: 'Our certified tutors provide the best, experienced and certified tutors across a series of strings.', style: { textAlign: 'left' } },
          { id: 'heroMainButton1Text', type: 'text', text: 'Get Started' },
          { id: 'heroMainButton2Text', type: 'text', text: 'Free Trial Class' },
          { id: 'heroTutor1Name', type: 'text', text: 'Anika Sarkar' },
          { id: 'heroTutor1Experience', type: 'text', text: '10+ Years Experience' },
          { id: 'heroTutor1ImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1746513399803-e988cc54e812?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxmZW1hbGUlMjB0dXRvcnxlbnwwfHx8fDE3NjE1NDAyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Female tutor' },
          { id: 'heroTutor2Name', type: 'text', text: 'Abdullah Jiscal' },
          { id: 'heroTutor2Experience', type: 'text', text: '8+ Years Experience' },
          { id: 'heroTutor2ImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1642439986788-825f9075691e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxtYWxlJTIwdHV0b3J8ZW58MHx8fHwxNzYxNTQwMjA5fDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Male tutor' },
        ],
      },
      {
        id: 'services', name: 'Teaching Services',
        elements: [
          { id: 'servicesTitle', type: 'text', text: 'Our Teaching Services', style: { textAlign: 'center' } },
          { id: 'servicesSubtitle', type: 'text', text: 'Our team of certified teachers are dedicated to help students achieve their goals.', style: { textAlign: 'center' } },
          { id: 'service1Title', type: 'text', text: '12 years of experience' },
          { id: 'service1Description', type: 'text', text: 'We have a huge experience in this field, we have a bunch of satisfied users. Our strategies for education are proven to be working.' },
          { id: 'service2Title', type: 'text', text: 'Team of professionals' },
          { id: 'service2Description', type: 'text', text: 'We have a team of professionals who are always ready to help you. Our team is a bunch of certified teachers.' },
          { id: 'service3Title', type: 'text', text: 'Dedicated Work' },
          { id: 'service3Description', type: 'text', text: 'We are dedicated to our work. We provide quality education. Our students are our first priority. We provide quality education.' },
        ]
      },
       {
        id: 'benefits', name: 'Benefits Section',
        elements: [
            { id: 'benefitsTitle', type: 'text', text: 'Explore the Benefits', style: { textAlign: 'left' } },
            { id: 'benefitsSubtitle', type: 'text', text: 'Our team of certified teachers are dedicated to help students achieve their goals and personal growth.', style: { textAlign: 'left' } },
            { id: 'benefitsImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmd8ZW58MHx8fHwxNzYxNDU1NTU2fDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Student learning' },
            { id: 'benefit1Title', type: 'text', text: 'Accelerate Your Learning' },
            { id: 'benefit1Description', type: 'text', text: 'Experience personalized instruction and achieve your academic goals faster.' },
            { id: 'benefit2Title', type: 'text', text: 'Flexibility' },
            { id: 'benefit2Description', type: 'text', text: 'Choose your own schedule and learn at a pace that suits you.' },
            { id: 'benefit3Title', type: 'text', text: 'Practical Skills' },
            { id: 'benefit3Description', type: 'text', text: 'Acquire practical skills that you can immediately apply in real-world situations.' },
        ]
      },
       {
        id: 'options', name: 'Course Options',
        elements: [
            { id: 'optionsTitle', type: 'text', text: 'Explore the Options', style: { textAlign: 'center' } },
            { id: 'optionsSubtitle', type: 'text', text: 'Our team of certified teachers are dedicated to help students achieve their goals and personal growth.', style: { textAlign: 'center' } },
            { id: 'option1Title', type: 'text', text: 'Group Classes' },
            { id: 'option1Description', type: 'text', text: 'Join a dynamic learning environment and interact with peers.' },
            { id: 'option1Price', type: 'text', text: '25.00' },
            { id: 'option1ImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1756314355692-56276a5b7bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxncm91cCUyMGNsYXNzfGVufDB8fHx8MTc2MTU0MDIwOXww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Group class' },
            { id: 'option2Title', type: 'text', text: 'Online Classes' },
            { id: 'option2Description', type: 'text', text: 'Join a dynamic learning environment and interact with peers.' },
            { id: 'option2Price', type: 'text', text: '50.00' },
            { id: 'option2ImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjbGFzc3xlbnwwfHx8fDE3NjE1NDAyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Online class' },
            { id: 'option3Title', type: 'text', text: 'Workshop Classes' },
            { id: 'option3Description', type: 'text', text: 'Join a dynamic learning environment and interact with peers.' },
            { id: 'option3Price', type: 'text', text: '80.00' },
            { id: 'option3ImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcHxlbnwwfHx8fDE3NjE1NDAyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Workshop class' },
        ]
      },
      {
        id: 'testimonials', name: 'Testimonials',
        elements: [
            { id: 'testimonialsTitle', type: 'text', text: 'What other Students are Saying!', style: { textAlign: 'left' } },
            { id: 'testimonialsSubtitle', type: 'text', text: 'Our team of certified teachers are dedicated to help students achieve their goals and personal growth.', style: { textAlign: 'left' } },
            { id: 'testimonialsImageUrl', type: 'image', src: 'https://images.unsplash.com/photo-1660794485891-26ef783fa993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzbWlsaW5nJTIwc3R1ZGVudHxlbnwwfHx8fDE3NjE0NjUyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Smiling student' },
            { id: 'testimonial1Quote', type: 'text', text: 'This learning platform has been a game-changer for my team. The courses are practical, and the instructors are top-notch. Highly recommended!' },
            { id: 'testimonial1Name', type: 'text', text: 'Ronald Richards' },
            { id: 'testimonial1Role', type: 'text', text: 'Business Owner' },
            { id: 'testimonial1AvatarUrl', type: 'image', src: 'https://images.unsplash.com/photo-1640951613773-54706e06851d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cGVyc29uJTIwYXZhdGFyfGVufDB8fHx8MTc2MTQ2NzkzNXww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Avatar' },
            { id: 'testimonial2Quote', type: 'text', text: 'I\'ve taken several courses here, and the quality is consistently excellent. The platform is user-friendly, and I\'ve learned so much.' },
            { id: 'testimonial2Name', type: 'text', text: 'Robert Fox' },
            { id: 'testimonial2Role', type: 'text', text: 'UI/UX Designer' },
            { id: 'testimonial2AvatarUrl', type: 'image', src: 'https://images.unsplash.com/photo-1594616838951-c155f8d978a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxwZXJzb24lMjBhdmF0YXJ8ZW58MHx8fHwxNzYxNDY3OTM1fDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Avatar' },
        ]
      },
       {
        id: 'faq', name: 'FAQ Section',
        elements: [
            { id: 'faqTitle', type: 'text', text: 'General Question', style: { textAlign: 'center' } },
            { id: 'faq1Question', type: 'text', text: 'What types of courses are available?' },
            { id: 'faq1Answer', type: 'text', text: 'We offer a wide range of courses, from performance-based skills to personal development and future-focused learning.' },
            { id: 'faq2Question', type: 'text', text: 'How do I track my progress in a course?' },
            { id: 'faq2Answer', type: 'text', text: 'You can track your progress through your student dashboard, which shows completed lessons, grades, and feedback from instructors.' },
            { id: 'faq3Question', type: 'text', text: 'How do I sign up for courses?' },
            { id: 'faq3Answer', type: 'text', text: 'You can sign up for courses directly through our website. Simply browse our course catalog and click the "Enroll Now" button on the course page.' },
            { id: 'faq4Question', type: 'text', text: 'Can I get a certificate after completing a course?' },
            { id: 'faq4Answer', type: 'text', text: 'Yes, upon successful completion of any course, you will receive a verifiable digital certificate to showcase your achievement.' },
            { id: 'faq5Question', type: 'text', text: 'What types of payment do you accept?' },
            { id: 'faq5Answer', type: 'text', text: 'We accept all major credit cards, as well as payments through PayPal and direct bank transfer.' },
            { id: 'faq6Question', type: 'text', text: 'Can I access the platform on mobile?' },
            { id: 'faq6Answer', type: 'text', text: 'Absolutely! Our platform is fully responsive and works seamlessly on desktops, tablets, and mobile devices for learning on the go.' },
        ]
      },
      {
        id: 'cta', name: 'Call to Action',
        elements: [
          { id: 'ctaTitle', type: 'text', text: 'Boost your skills with us! Enroll today and start learning confidently.', style: { textAlign: 'left' } },
          { id: 'ctaSubtitle', type: 'text', text: 'Our team of certified teachers are dedicated to help students achieve their goals and personal growth.', style: { textAlign: 'left' } },
          { id: 'ctaButtonText', type: 'text', text: 'Get Started' },
          { id: 'ctaImageUrl1', type: 'image', src: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZ3xlbnwwfHx8fDE3NjE0NzgyODN8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Online learning' },
          { id: 'ctaImageUrl2', type: 'image', src: 'https://images.unsplash.com/photo-1588338949401-8fd705bca823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3cml0aW5nJTIwbm90ZXN8ZW58MHx8fHwxNzYxNTEzMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Writing notes' },
        ]
      },
      {
        id: 'newsletter', name: 'Newsletter',
        elements: [
            { id: 'newsletterTitle', type: 'text', text: 'Join Our Newsletter', style: { textAlign: 'center' } },
            { id: 'newsletterSubtitle', type: 'text', text: 'Subscribe to our newsletter to get the latest updates.', style: { textAlign: 'center' } },
            { id: 'newsletterButton', type: 'text', text: 'Subscribe' },
        ]
      },
      {
        id: 'footer', name: 'Footer',
        elements: [
            { id: 'footerSocialFacebook', type: 'text', text: '#' },
            { id: 'footerSocialInstagram', type: 'text', text: '#' },
            { id: 'footerSocialYoutube', type: 'text', text: '#' },
            { id: 'footerSocialTwitter', type: 'text', text: '#' },
        ]
      }
    ]
  },
};


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    try {
      const detailsSnap = await getDBSettings('details');
      const landingPageSnap = await getDBSettings('landing-page');
      
      const dbSettings = { ...detailsSnap, landingPage: landingPageSnap };

      const mergedSettings = { 
          ...defaultSettings, 
          ...dbSettings,
          landingPage: {
            ...defaultSettings.landingPage,
            ...dbSettings.landingPage,
            sections: defaultSettings.landingPage.sections.map(defaultSection => {
              const dbSection = dbSettings.landingPage?.sections?.find((s: Section) => s.id === defaultSection.id);
              if (dbSection) {
                  return {
                      ...defaultSection,
                      ...dbSection,
                      elements: defaultSection.elements.map(defaultElement => {
                          const dbElement = dbSection.elements.find(el => el.id === defaultElement.id);
                          return dbElement ? { ...defaultElement, ...dbElement } : defaultElement;
                      })
                  }
              }
              return defaultSection;
            })
          }
        };

      setSettingsState(mergedSettings);

    } catch (error) {
      console.error("Failed to load settings:", error);
      setSettingsState(defaultSettings);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const { landingPage, ...otherSettings } = newSettings;
    const updatedSettings: Settings = { 
      ...settings, 
      ...otherSettings,
      landingPage: landingPage ? { sections: landingPage.sections } : settings.landingPage,
    };
    setSettingsState(updatedSettings);

    if (Object.keys(otherSettings).length > 0) {
        await updateDBSettings('details', otherSettings);
    }
    if (landingPage) {
        await updateDBSettings('landing-page', { sections: landingPage.sections });
    }

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

export const useLandingPageContent = () => {
    const [content, setContent] = useState<Settings['landingPage']>(defaultSettings.landingPage);
    const { settings, isSettingsLoading } = useSettings();

    useEffect(() => {
        if (!isSettingsLoading) {
            setContent(settings.landingPage);
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'settingsUpdate') {
                setContent(event.data.payload.landingPage);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);

    }, [isSettingsLoading, settings.landingPage]);

    const getSection = (id: string) => {
        return content.sections.find(s => s.id === id);
    }
    
    const getElement = (id: string): TextElement | ImageElement | undefined => {
        for (const section of content.sections) {
            const element = section.elements.find(el => el.id === id);
            if (element) return element;
        }
        return undefined;
    }

    return {
        sections: content.sections,
        getSection,
        getElement
    };
};
