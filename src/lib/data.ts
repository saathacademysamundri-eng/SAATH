export const dashboardStats = [
    { title: 'Total Students', value: '1,250', change: '+15.2%', icon: 'Users' },
    { title: 'New Admissions', value: '82', change: '+20.1%', icon: 'UserPlus' },
    { title: 'Daily Fees Collected', value: '75,000 PKR', change: '-5.0%', icon: 'Wallet' },
    { title: 'Pending Fees', value: '120,000 PKR', change: '+2.3%', icon: 'Hourglass' },
];

export const recentActivities = [
    { name: 'Ali Khan', amount: '1000 PKR', status: 'Paid', date: '5 minutes ago', image: 'https://picsum.photos/seed/1/40/40' },
    { name: 'New admission: Sara Ahmed', amount: '', status: 'Admission', date: '10 minutes ago', image: 'https://picsum.photos/seed/2/40/40' },
    { name: 'Fatima Aslam', amount: '1000 PKR', status: 'Paid', date: '30 minutes ago', image: 'https://picsum.photos/seed/3/40/40' },
    { name: 'Test created: Physics', amount: '', status: 'Exam', date: '1 hour ago', image: 'https://picsum.photos/seed/4/40/40' },
    { name: 'Umar Farooq', amount: '500 PKR', status: 'Partial', date: '2 hours ago', image: 'https://picsum.photos/seed/5/40/40' },
];

export const feeCollectionData = [
    { month: 'Jan', collected: 400000, pending: 240000 },
    { month: 'Feb', collected: 300000, pending: 139800 },
    { month: 'Mar', collected: 500000, pending: 98000 },
    { month: 'Apr', collected: 478000, pending: 39080 },
    { month: 'May', collected: 689000, pending: 48000 },
    { month: 'Jun', collected: 539000, pending: 38000 },
];

export const students = [
    { id: 'S001', name: 'Ahmed Hassan', class: '10th', subjects: 'Math, Physics', feeStatus: 'Paid', avatar: 'https://picsum.photos/seed/101/40/40' },
    { id: 'S002', name: 'Zainab Ali', class: '9th', subjects: 'Chemistry, Biology', feeStatus: 'Pending', avatar: 'https://picsum.photos/seed/102/40/40' },
    { id: 'S003', name: 'Bilal Khan', class: '10th', subjects: 'English, CS', feeStatus: 'Partial', avatar: 'https://picsum.photos/seed/103/40/40' },
    { id: 'S004', name: 'Ayesha Malik', class: '11th', subjects: 'Physics, Chemistry', feeStatus: 'Paid', avatar: 'https://picsum.photos/seed/104/40/40' },
    { id: 'S005', name: 'Fahad Iqbal', class: '12th', subjects: 'Math, F.Math', feeStatus: 'Overdue', avatar: 'https://picsum.photos/seed/105/40/40' },
    { id: 'S006', name: 'Sana Javed', class: '9th', subjects: 'Biology, English', feeStatus: 'Paid', avatar: 'https://picsum.photos/seed/106/40/40' },
    { id: 'S007', name: 'Imran Syed', class: '10th', subjects: 'CS, Physics', feeStatus: 'Pending', avatar: 'https://picsum.photos/seed/107/40/40' },
];

export const teachers = [
    { id: 'T01', name: 'Dr. Arshad', subject: 'Physics', experience: '10 Years', earnings: '120,000 PKR', avatar: 'https://picsum.photos/seed/201/40/40' },
    { id: 'T02', name: 'Mrs. Samina', subject: 'Chemistry', experience: '8 Years', earnings: '95,000 PKR', avatar: 'https://picsum.photos/seed/202/40/40' },
    { id: 'T03', name: 'Mr. Qasim', subject: 'Mathematics', experience: '12 Years', earnings: '150,000 PKR', avatar: 'https://picsum.photos/seed/203/40/40' },
    { id: 'T04', name: 'Ms. Farhat', subject: 'English', experience: '5 Years', earnings: '70,000 PKR', avatar: 'https://picsum.photos/seed/204/40/40' },
    { id: 'T05', name: 'Dr. Nida', subject: 'Biology', experience: '7 Years', earnings: '88,000 PKR', avatar: 'https://picsum.photos/seed/205/40/40' },
];

export const classes = [
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