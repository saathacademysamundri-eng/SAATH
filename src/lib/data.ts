export type DailyAttendanceSummary = {
    date: Date;
    students: {
        totalStudents: number;
        totalPresent: number;
        totalAbsent: number;
        classSummaries: {
            classId: string;
            className: string;
            totalStudents: number;
            presentCount: number;
            absentCount: number;
            absentStudents: { id: string; name: string }[];
        }[];
    };
    teachers: {
        totalTeachers: number;
        presentCount: number;
        absentCount: number;
        absentTeachers: { id: string; name: string }[];
    };
};

export type Activity = {
    id: string;
    type: 'new_admission' | 'fee_payment' | 'fee_discount' | 'exam_created' | 'teacher_payout' | 'settings_updated' | 'student_deactivated' | 'student_reactivated' | 'teacher_deleted' | 'class_added' | 'class_updated' | 'database_seeded' | 'fee_reversal' | 'fee_updated' | 'expense_added' | 'expense_updated' | 'expense_deleted' | 'teacher_added' | 'teacher_updated' | 'attendance_marked' | 'exam_updated' | 'exam_deleted' | 'exam_results_saved' | 'student_deleted' | 'student_archived' | 'student_graduated' | 'fee_generated' | 'student_updated' | 'discount_reversed';
    message: string;
    link?: string;
    date: Date;
}

export type Subject = {
    id: string;
    name: string;
};

export type Class = {
    id: string;
    name: string;
    subjects: Subject[];
    sections: string[];
};

export type StudentSubject = {
  subject_name: string;
  teacher_id: string;
  fee_share: number;
  assignedAt?: any; // Timestamp or Date
}

export type Student = {
    id: string;
    name: string;
    fatherName: string;
    phone: string;
    email?: string;
    college: string;
    address: string;
    gender: string;
    class: string;
    section?: string;
    subjects: StudentSubject[];
    feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    totalFee: number; // This represents the outstanding balance
    monthlyFee: number; // This is the base fee charged each month
    status: 'active' | 'graduated' | 'archived'; 
    imageUrl?: string;
    archivedAt?: Date;
};

export type Teacher = {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  address: string;
  email?: string;
  password?: string;
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
    forMonth?: string; // e.g., "2024-07"
    paidOutTo?: { [teacherId: string]: string }; // Tracks which teacher has been paid for this income via which payout
}

export type Discount = {
    id: string;
    studentId: string;
    studentName: string;
    phone: string;
    amount: number;
    date: Date;
    month: string; // e.g., "2025-07"
}

export type TeacherPayout = {
    id: string;
    teacherId: string;
    teacherName: string;
    amount: number;
    payoutDate: Date;
    incomeIds: string[];
}

export type Payout = {
    id: string;
    teacherId: string;
    teacherName: string;
    amount: number;
    payoutDate: Date;
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
    marks: { [subjectName: string]: number | null | string };
}

export type Exam = {
    id: string;
    name: string;
    className: string;
    teacherId: string;
    teacherName: string;
    examType: 'Single Subject' | 'Full Test' | 'Manual';
    subjects: string[];
    totalMarks: number;
    date: Date;
    status?: 'pending' | 'approved' | 'rejected';
    results?: StudentResult[];
    academicSession: string;
    submissionDeadline?: Date;
    scope?: 'class' | 'teacher_students';
    completionNotified?: boolean;
}

export type Notification = {
  id: string;
  userId: string;
  message: string;
  link?: string;
  read: boolean;
  timestamp: Date;
};

export const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";
