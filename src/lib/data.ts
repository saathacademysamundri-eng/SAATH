export type Subject = {
    id: string;
    name: string;
};

export type Class = {
    id: string;
    name: string;
    subjects: Subject[];
};

export type StudentSubject = {
  subject_name: string;
  teacher_id: string;
  fee_share: number;
}

export type Student = {
    id: string;
    name: string;
    class: string;
    subjects: StudentSubject[];
    feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    totalFee: number;
};

export type Teacher = {
  id: string;
  name: string;
  phone: string;
  subjects: string[]; // Names of subjects
};

export type Income = {
    id: string;
    studentName: string;
    studentId: string;
    amount: number;
    date: Date;
}

export type Expense = {
    id: string;
    description: string;
    amount: number;
    date: Date;
}

export type Report = {
    id: string;
    teacherId: string;
    teacherName: string;
    reportDate: Date;
    grossEarnings: number;
    teacherShare: number;
    academyShare: number;
    studentBreakdown: {
        studentName: string;
        studentId: string;
        studentClass: string;
        subjectName: string;
        feeShare: number;
    }[];
}


export const dashboardStats = [
    { title: 'Total Students', value: '1,250', change: '+15.2%', icon: 'Users' },
    { title: 'New Admissions', value: '82', change: '+20.1%', icon: 'UserPlus' },
    { title: 'Daily Fees Collected', value: '75,000 PKR', change: '-5.0%', icon: 'Wallet' },
    { title: 'Pending Fees', value: '120,000 PKR', change: '+2.3%', icon: 'Hourglass' },
];

export const recentActivities = [
    { name: 'Ali Khan', amount: '1000 PKR', status: 'Paid', date: '5 minutes ago' },
    { name: 'New admission: Sara Ahmed', amount: '', status: 'Admission', date: '10 minutes ago' },
    { name: 'Fatima Aslam', amount: '1000 PKR', status: 'Paid', date: '30 minutes ago' },
    { name: 'Test created: Physics', amount: '', status: 'Exam', date: '1 hour ago' },
    { name: 'Umar Farooq', amount: '500 PKR', status: 'Partial', date: '2 hours ago' },
];

export const feeCollectionData = [
    { month: 'Jan', collected: 400000, pending: 240000 },
    { month: 'Feb', collected: 300000, pending: 139800 },
    { month: 'Mar', collected: 500000, pending: 98000 },
    { month: 'Apr', collected: 478000, pending: 39080 },
    { month: 'May', collected: 689000, pending: 48000 },
    { month: 'Jun', collected: 539000, pending: 38000 },
];

export let students: Student[] = [
    { 
        id: 'S001', 
        name: 'Ahmed Hassan', 
        class: '10th', 
        subjects: [
            { subject_name: 'Mathematics', teacher_id: 'T03', fee_share: 1500 },
            { subject_name: 'Physics', teacher_id: 'T01', fee_share: 1500 }
        ], 
        feeStatus: 'Paid', 
        totalFee: 0 
    },
    { 
        id: 'S002', 
        name: 'Zainab Ali', 
        class: '9th', 
        subjects: [
            { subject_name: 'Chemistry', teacher_id: 'T02', fee_share: 1250 },
            { subject_name: 'Biology', teacher_id: 'T05', fee_share: 1250 }
        ], 
        feeStatus: 'Pending', 
        totalFee: 2500 
    },
    { 
        id: 'S003', 
        name: 'Bilal Khan', 
        class: '10th', 
        subjects: [
             { subject_name: 'English', teacher_id: 'T04', fee_share: 1000 },
             { subject_name: 'Computer Science', teacher_id: 'T03', fee_share: 1000 }
        ], 
        feeStatus: 'Partial', 
        totalFee: 1000 
    },
    { 
        id: 'S004', 
        name: 'Ayesha Malik', 
        class: '11th', 
        subjects: [
             { subject_name: 'Physics', teacher_id: 'T01', fee_share: 2000 },
             { subject_name: 'Chemistry', teacher_id: 'T02', fee_share: 2000 }
        ], 
        feeStatus: 'Paid', 
        totalFee: 0 
    },
    { 
        id: 'S005', 
        name: 'Fahad Iqbal', 
        class: '12th', 
        subjects: [
            { subject_name: 'Pre-Eng. Mathematics', teacher_id: 'T03', fee_share: 4500 }
        ], 
        feeStatus: 'Overdue', 
        totalFee: 4500 
    },
    { 
        id: 'S006', 
        name: 'Sana Javed', 
        class: '9th', 
        subjects: [
            { subject_name: 'Biology', teacher_id: 'T05', fee_share: 1250 },
            { subject_name: 'English', teacher_id: 'T04', fee_share: 1250 }
        ], 
        feeStatus: 'Paid', 
        totalFee: 0 
    },
    { 
        id: 'S007', 
        name: 'Imran Syed', 
        class: '10th', 
        subjects: [
            { subject_name: 'Computer Science', teacher_id: 'T03', fee_share: 1500 },
            { subject_name: 'Physics', teacher_id: 'T01', fee_share: 1500 }
        ], 
        feeStatus: 'Pending', 
        totalFee: 3000 
    },
];

export const teachers: Teacher[] = [
    { id: 'T01', name: 'Dr. Arshad', phone: '03001234567', subjects: ['Physics'] },
    { id: 'T02', name: 'Mrs. Samina', phone: '03011234567', subjects: ['Chemistry'] },
    { id: 'T03', name: 'Mr. Qasim', phone: '03021234567', subjects: ['Mathematics', 'Computer Science', 'Pre-Eng. Mathematics'] },
    { id: 'T04', name: 'Ms. Farhat', phone: '03031234567', subjects: ['English'] },
    { id: 'T05', name: 'Dr. Nida', phone: '03041234567', subjects: ['Biology', 'Pre-Med. Biology'] },
];

export const classes: Class[] = [
    { 
        id: 'C01', 
        name: '9th Grade', 
        subjects: [
            { id: 'S01', name: 'Mathematics' },
            { id: 'S02', name: 'Physics' },
            { id: 'S03', name: 'Chemistry' },
            { id: 'S04', name: 'Biology' },
            { id: 'S05', name: 'Computer Science' },
            { id: 'S06', name: 'English' },
        ] 
    },
    { 
        id: 'C02', 
        name: '10th Grade', 
        subjects: [
            { id: 'S01', name: 'Mathematics' },
            { id: 'S02', name: 'Physics' },
            { id: 'S03', name: 'Chemistry' },
            { id: 'S04', name: 'Biology' },
            { id: 'S05', name: 'Computer Science' },
            { id: 'S06', name: 'English' },
        ] 
    },
    { 
        id: 'C03', 
        name: '11th Grade', 
        subjects: [
            { id: 'S07', name: 'Pre-Eng. Mathematics' },
            { id: 'S08', name: 'Pre-Med. Biology' },
            { id: 'S02', name: 'Physics' },
            { id: 'S03', name: 'Chemistry' },
            { id: 'S06', name: 'English' },
        ] 
    },
     { 
        id: 'C04', 
        name: '12th Grade', 
        subjects: [
            { id: 'S07', name: 'Pre-Eng. Mathematics' },
            { id: 'S08', name: 'Pre-Med. Biology' },
            { id: 'S02', name: 'Physics' },
            { id: 'S03', name: 'Chemistry' },
            { id: 'S06', name: 'English' },
        ] 
    },
];

// Assign teachers to subjects for simplicity in the UI
// In a real app, this would likely be more complex
export const subjectTeacherMap: { [subjectName: string]: string } = {
    'Mathematics': 'T03',
    'Physics': 'T01',
    'Chemistry': 'T02',
    'Biology': 'T05',
    'Computer Science': 'T03',
    'English': 'T04',
    'Pre-Eng. Mathematics': 'T03',
    'Pre-Med. Biology': 'T05'
};
