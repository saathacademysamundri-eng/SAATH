

export type Activity = {
    id: string;
    type: 'new_admission' | 'fee_payment' | 'exam_created' | 'teacher_payout' | 'settings_updated' | 'student_deactivated' | 'student_reactivated' | 'teacher_deleted' | 'class_added' | 'class_updated' | 'database_seeded' | 'fee_reversal' | 'fee_updated' | 'expense_added' | 'expense_updated' | 'expense_deleted' | 'teacher_added' | 'teacher_updated' | 'attendance_marked' | 'exam_updated' | 'exam_deleted' | 'exam_results_saved' | 'student_deleted' | 'student_archived' | 'student_graduated' | 'fee_generated';
    message: string;
    date: Date;
    link?: string;
}

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
    fatherName: string;
    phone: string;
    college: string;
    address: string;
    gender: string;
    class: string;
    subjects: StudentSubject[];
    feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    totalFee: number; // This represents the outstanding balance
    monthlyFee: number; // This is the base fee charged each month
    status: 'active' | 'graduated' | 'archived'; 
};

export type Teacher = {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  address: string;
  email?: string;
  subjects: string[]; // Names of subjects
  imageUrl?: string;
};

export type Income = {
    id: string;
    receiptId?: string;
    studentName: string;
    studentId: string;
    amount: number;
    date: Date;
    isPaidOut?: boolean; // New field to track payout status
    payoutId?: string; // Reference to the payout record
}

export type TeacherPayout = {
    id: string;
    teacherId: string;
    teacherName: string;
    amount: number;
    payoutDate: Date;
    incomeIds: string[];
}

export type Expense = {
    id: string;
    description: string;
    amount: number;
    date: Date;
    source: 'manual' | 'payout';
    category?: string;
    payoutId?: string;
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

export type StudentResult = {
    studentId: string;
    studentName: string;
    marks: { [subjectName: string]: number | null };
}

export type Exam = {
    id: string;
    name: string;
    className: string;
    examType: 'Single Subject' | 'Full Test';
    subjects: string[];
    totalMarks: number;
    date: Date;
    results?: StudentResult[];
}


export const dashboardStats = [
    { title: 'Total Students', value: '1,250', change: '+15.2%', icon: 'Users' },
    { title: 'New Admissions', value: '82', change: '+20.1%', icon: 'UserPlus' },
    { title: 'Daily Fees Collected', value: '75,000 PKR', change: '-5.0%', icon: 'Wallet' },
    { title: 'Pending Fees', value: '120,000 PKR', change: '+2.3%', icon: 'Hourglass' },
];

export let students: Student[] = [
    { 
        id: 'S001', 
        name: 'Ahmed Hassan', 
        fatherName: 'Hassan Ali',
        phone: '03001112222',
        college: 'Govt College',
        address: 'House 1, Street 1, City',
        gender: 'male',
        class: '10th', 
        subjects: [
            { subject_name: 'Mathematics', teacher_id: 'T03', fee_share: 1500 },
            { subject_name: 'Physics', teacher_id: 'T01', fee_share: 1500 }
        ], 
        feeStatus: 'Paid', 
        totalFee: 0,
        monthlyFee: 3000,
        status: 'active',
    },
    { 
        id: 'S002', 
        name: 'Zainab Ali', 
        fatherName: 'Ali Raza',
        phone: '03002223333',
        college: 'KIPS College',
        address: 'House 2, Street 2, City',
        gender: 'female',
        class: '9th', 
        subjects: [
            { subject_name: 'Chemistry', teacher_id: 'T02', fee_share: 1250 },
            { subject_name: 'Biology', teacher_id: 'T05', fee_share: 1250 }
        ], 
        feeStatus: 'Pending', 
        totalFee: 2500,
        monthlyFee: 2500,
        status: 'active',
    },
    { 
        id: 'S003', 
        name: 'Bilal Khan', 
        fatherName: 'Khan Sahab',
        phone: '03003334444',
        college: 'Punjab College',
        address: 'House 3, Street 3, City',
        gender: 'male',
        class: '10th', 
        subjects: [
             { subject_name: 'English', teacher_id: 'T04', fee_share: 1000 },
             { subject_name: 'Computer Science', teacher_id: 'T03', fee_share: 1000 }
        ], 
        feeStatus: 'Partial', 
        totalFee: 1000,
        monthlyFee: 2000,
        status: 'active',
    },
    { 
        id: 'S004', 
        name: 'Ayesha Malik', 
        fatherName: 'Malik Ahmed',
        phone: '03004445555',
        college: 'Aspire College',
        address: 'House 4, Street 4, City',
        gender: 'female',
        class: '11th', 
        subjects: [
             { subject_name: 'Physics', teacher_id: 'T01', fee_share: 2000 },
             { subject_name: 'Chemistry', teacher_id: 'T02', fee_share: 2000 }
        ], 
        feeStatus: 'Paid', 
        totalFee: 0,
        monthlyFee: 4000,
        status: 'active',
    },
    { 
        id: 'S005', 
        name: 'Fahad Iqbal', 
        fatherName: 'Iqbal Ahmed',
        phone: '03005556666',
        college: 'Garrison College',
        address: 'House 5, Street 5, City',
        gender: 'male',
        class: '12th', 
        subjects: [
            { subject_name: 'Pre-Eng. Mathematics', teacher_id: 'T03', fee_share: 4500 }
        ], 
        feeStatus: 'Overdue', 
        totalFee: 4500,
        monthlyFee: 4500,
        status: 'active',
    },
    { 
        id: 'S006', 
        name: 'Sana Javed', 
        fatherName: 'Javed Iqbal',
        phone: '03006667777',
        college: 'Kinnaird College',
        address: 'House 6, Street 6, City',
        gender: 'female',
        class: '9th', 
        subjects: [
            { subject_name: 'Biology', teacher_id: 'T05', fee_share: 1250 },
            { subject_name: 'English', teacher_id: 'T04', fee_share: 1250 }
        ], 
        feeStatus: 'Paid', 
        totalFee: 0,
        monthlyFee: 2500,
        status: 'active',
    },
    { 
        id: 'S007', 
        name: 'Imran Syed', 
        fatherName: 'Syed Ali',
        phone: '03007778888',
        college: 'FC College',
        address: 'House 7, Street 7, City',
        gender: 'male',
        class: '10th', 
        subjects: [
            { subject_name: 'Computer Science', teacher_id: 'T03', fee_share: 1500 },
            { subject_name: 'Physics', teacher_id: 'T01', fee_share: 1500 }
        ], 
        feeStatus: 'Pending', 
        totalFee: 3000,
        monthlyFee: 3000,
        status: 'active',
    },
];

export const teachers: Teacher[] = [
    { id: 'T01', name: 'Dr. Arshad', fatherName: 'Arshad Father', phone: '03001234567', address: 'Address 1', subjects: ['Physics'] },
    { id: 'T02', name: 'Mrs. Samina', fatherName: 'Samina Father', phone: '03011234567', address: 'Address 2', subjects: ['Chemistry'] },
    { id: 'T03', name: 'Mr. Qasim', fatherName: 'Qasim Father', phone: '03021234567', address: 'Address 3', subjects: ['Mathematics', 'Computer Science', 'Pre-Eng. Mathematics'] },
    { id: 'T04', name: 'Ms. Farhat', fatherName: 'Farhat Father', phone: '03031234567', address: 'Address 4', subjects: ['English'] },
    { id: 'T05', name: 'Dr. Nida', fatherName: 'Nida Father', phone: '03041234567', address: 'Address 5', subjects: ['Biology', 'Pre-Med. Biology'] },
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
