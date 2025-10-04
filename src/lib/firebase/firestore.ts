


/*
================================================================================
IMPORTANT: FIREBASE SECURITY RULES
================================================================================

Please copy and paste the following security rules into your Firebase project's
Firestore rules editor to ensure the application functions correctly.

1. Go to your Firebase Console.
2. Select your project.
3. Go to "Firestore Database" from the left menu.
4. Click on the "Rules" tab.
5. Replace the entire content of the rules editor with the rules below.
6. Click "Publish".

--- START OF RULES TO COPY ---

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow admin full access to everything.
    // Replace "YOUR_ADMIN_UID" with the actual UID of your admin user.
    function isAdmin() {
      return request.auth.uid == "jpmL48E3sLZj3k9d5pSgP2d13w13";
    }

    // Default deny all reads and writes
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users to read most collections
    match /students/{studentId} {
      allow read, write: if isAdmin();
      allow read: if request.auth != null;
    }
    match /teachers/{teacherId} {
      allow read, write: if isAdmin();
      allow read: if request.auth != null;
    }
     match /classes/{classId} {
      allow read, write: if isAdmin();
      allow read: if request.auth != null;
    }
    match /classes/{classId}/subjects/{subjectId} {
       allow read, write: if isAdmin();
       allow read: if request.auth != null;
    }
    match /income/{incomeId} {
       allow read, write: if isAdmin();
    }
     match /teacher_payouts/{payoutId} {
       allow read, write: if isAdmin();
    }
    match /expenses/{expenseId} {
       allow read, write: if isAdmin();
    }
     match /reports/{reportId} {
       allow read, write: if isAdmin();
    }
    match /settings/details {
       allow read, write: if isAdmin();
       allow read: if request.auth != null;
    }

    // Rules for new collections
    match /attendance/{attendanceId} {
      allow read, write: if isAdmin();
      allow read: if request.auth != null;
    }
    match /exams/{examId} {
      allow read, write: if isAdmin();
    }
  }
}

--- END OF RULES TO COPY ---

*/


import { getFirestore, collection, writeBatch, getDocs, doc, getDoc, updateDoc, setDoc, query, where, limit, orderBy, addDoc, serverTimestamp, deleteDoc, runTransaction, increment, deleteField, startAt, endAt } from 'firebase/firestore';
import { app } from './config';
import { students as initialStudents, teachers as initialTeachers, classes as initialClasses, Student, Teacher, Class, Subject, Income, Expense, Report, Exam, StudentResult, TeacherPayout } from '@/lib/data';
import type { Settings } from '@/hooks/use-settings';

const db = getFirestore(app);

// Settings Functions
export async function getSettings(): Promise<Settings | null> {
    const docRef = doc(db, 'settings', 'details');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Settings;
    }
    return null;
}

export async function updateSettings(settings: Partial<Settings>) {
    const docRef = doc(db, 'settings', 'details');
    await setDoc(docRef, settings, { merge: true });
}


export async function getStudents(): Promise<Student[]> {
  const studentsCollection = collection(db, 'students');
  const q = query(studentsCollection, orderBy("id"));
  const studentsSnap = await getDocs(q);
  return studentsSnap.docs.map(doc => doc.data() as Student);
}

export async function getStudentsByClass(className: string): Promise<Student[]> {
    const q = query(collection(db, 'students'), where('class', '==', className));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Student);
}

export async function getStudent(id: string): Promise<Student | null> {
    const studentDocRef = doc(db, 'students', id);
    const studentDoc = await getDoc(studentDocRef);
    if (studentDoc.exists()) {
        return studentDoc.data() as Student;
    }
    
    // Fallback search by case-insensitive id
    const q = query(collection(db, "students"), where("id", "==", id.toUpperCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Student;
    }
    return null;
}

export async function addStudent(student: Omit<Student, 'id'> & { id: string }) {
    try {
        await setDoc(doc(db, 'students', student.id), student);
        return { success: true, message: "Student added successfully." };
    } catch (error) {
        console.error("Error adding student: ", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function updateStudent(studentId: string, studentData: Partial<Omit<Student, 'id' | 'feeStatus' | 'totalFee'>>) {
    try {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, studentData);
        return { success: true, message: "Student updated successfully." };
    } catch (error) {
        console.error("Error updating student: ", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteStudent(studentId: string) {
    try {
        const studentRef = doc(db, 'students', studentId);
        await deleteDoc(studentRef);
        return { success: true, message: "Student deleted successfully." };
    } catch (error) {
        console.error("Error deleting student: ", error);
        return { success: false, message: (error as Error).message };
    }
}


export async function getNextStudentId(): Promise<string> {
    const q = query(collection(db, "students"), orderBy("id", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return "S001";
    }
    const lastId = querySnapshot.docs[0].id;
    const lastNumber = parseInt(lastId.substring(1));
    const newNumber = lastNumber + 1;
    return `S${newNumber.toString().padStart(3, '0')}`;
}

export async function updateStudentFeeStatus(studentId: string, newBalance: number, newStatus: Student['feeStatus']) {
    try {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, {
            totalFee: newBalance,
            feeStatus: newStatus
        });
        return { success: true, message: "Student fee status updated." };
    } catch (error) {
         console.error("Error updating student fee status: ", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function resetMonthlyFees() {
    try {
        const studentsCollection = collection(db, 'students');
        const studentsSnap = await getDocs(studentsCollection);
        const batch = writeBatch(db);

        studentsSnap.forEach(studentDoc => {
            const student = studentDoc.data() as Student;
            const studentRef = studentDoc.ref;
            
            // Add monthly fee to current balance
            const newTotalFee = student.totalFee + student.monthlyFee;

            // Set status to Overdue if they already had a balance, otherwise Pending
            const newStatus = student.totalFee > 0 ? 'Overdue' : 'Pending';

            batch.update(studentRef, {
                totalFee: newTotalFee,
                feeStatus: newStatus,
            });
        });

        await batch.commit();
        return { success: true, message: "Next month's fees have been generated for all students." };
    } catch (error) {
        console.error("Error resetting monthly fees: ", error);
        return { success: false, message: (error as Error).message };
    }
}


export async function getTeachers(): Promise<Teacher[]> {
    const teachersCollection = collection(db, 'teachers');
    const q = query(teachersCollection, orderBy("id"));
    const teachersSnap = await getDocs(q);
    return teachersSnap.docs.map(doc => doc.data() as Teacher);
}

export async function getTeacher(id: string): Promise<Teacher | null> {
    const teacherDoc = await getDoc(doc(db, 'teachers', id));
    return teacherDoc.exists() ? teacherDoc.data() as Teacher : null;
}

export async function getNextTeacherId(): Promise<string> {
    const q = query(collection(db, "teachers"), orderBy("id", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return "T01";
    }
    const lastId = querySnapshot.docs[0].id;
    const lastNumber = parseInt(lastId.substring(1));
    const newNumber = lastNumber + 1;
    return `T${newNumber.toString().padStart(2, '0')}`;
}

export async function addTeacher(teacherData: Omit<Teacher, 'id'>) {
    try {
        const newTeacherId = await getNextTeacherId();
        const newTeacher: Teacher = {
            id: newTeacherId,
            ...teacherData
        };
        await setDoc(doc(db, 'teachers', newTeacherId), newTeacher);
        return { success: true, message: "Teacher added successfully." };
    } catch (error) {
        console.error("Error adding teacher: ", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function updateTeacher(teacherId: string, teacherData: Partial<Omit<Teacher, 'id'>>) {
    try {
        const teacherRef = doc(db, 'teachers', teacherId);
        await updateDoc(teacherRef, teacherData);
        return { success: true, message: "Teacher updated successfully." };
    } catch (error) {
        console.error("Error updating teacher: ", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteTeacher(teacherId: string) {
    try {
        await deleteDoc(doc(db, "teachers", teacherId));
        return { success: true, message: "Teacher deleted successfully." };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

async function getNextClassId(): Promise<string> {
    const q = query(collection(db, "classes"), orderBy("id", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return "C01";
    }
    const lastId = querySnapshot.docs[0].id;
    const lastNumber = parseInt(lastId.substring(1));
    const newNumber = lastNumber + 1;
    return `C${newNumber.toString().padStart(2, '0')}`;
}

export async function addClass(name: string) {
    try {
        const newClassId = await getNextClassId();
        const newClass = {
            id: newClassId,
            name: name,
            subjects: []
        };
        await setDoc(doc(db, 'classes', newClassId), newClass);
        return { success: true, message: "Class created successfully." };
    } catch (error) {
        console.error("Error adding class: ", error);
        return { success: false, message: (error as Error).message };
    }
}


export async function getClasses(): Promise<Class[]> {
    const classesCollection = collection(db, 'classes');
    const classesSnap = await getDocs(classesCollection);
    const classesData: Class[] = [];

    for (const classDoc of classesSnap.docs) {
        const classData = classDoc.data() as Omit<Class, 'subjects'>;
        const subjectsCollection = collection(db, `classes/${classDoc.id}/subjects`);
        const subjectsSnap = await getDocs(subjectsCollection);
        const subjects = subjectsSnap.docs.map(subjectDoc => subjectDoc.data() as Subject);
        classesData.push({ ...classData, id: classDoc.id, name: classData.name, subjects });
    }
    return classesData;
}

export async function getAllSubjects(): Promise<Subject[]> {
    const classes = await getClasses();
    const allSubjects = new Map<string, Subject>();
    classes.forEach(c => {
        c.subjects.forEach(s => {
            if (!allSubjects.has(s.id)) {
                allSubjects.set(s.id, s);
            }
        })
    })
    return Array.from(allSubjects.values());
}


export async function updateClassSubjects(classId: string, subjects: Subject[]) {
    try {
        const batch = writeBatch(db);
        const subjectsCollectionRef = collection(db, `classes/${classId}/subjects`);
        
        // Delete old subjects
        const oldSubjectsSnap = await getDocs(subjectsCollectionRef);
        oldSubjectsSnap.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new subjects
        subjects.forEach(subject => {
            const subjectRef = doc(subjectsCollectionRef, subject.id);
            batch.set(subjectRef, subject);
        });

        await batch.commit();
        return { success: true, message: "Class subjects updated successfully." };

    } catch (error) {
        console.error("Error updating class subjects: ", error);
        return { success: false, message: (error as Error).message };
    }
}


export async function seedDatabase() {
  try {
    const studentsCollection = collection(db, 'students');
    const teachersCollection = collection(db, 'teachers');
    const classesCollection = collection(db, 'classes');

    // Check if collections are empty before seeding
    const studentsSnap = await getDocs(studentsCollection);
    const teachersSnap = await getDocs(teachersCollection);
    const classesSnap = await getDocs(classesCollection);

    if (!studentsSnap.empty || !teachersSnap.empty || !classesSnap.empty) {
      console.log('Database already seeded.');
      return { success: true, message: 'Database has already been seeded.' };
    }

    const batch = writeBatch(db);

    initialStudents.forEach(student => {
      const { ...studentData } = student;
      const docRef = doc(db, 'students', student.id);
      batch.set(docRef, studentData);
    });

    initialTeachers.forEach(teacher => {
      const docRef = doc(db, 'teachers', teacher.id);
      batch.set(docRef, teacher);
    });

    initialClasses.forEach(cls => {
        const docRef = doc(db, 'classes', cls.id);
        const { subjects, ...classData } = cls;
        batch.set(docRef, { name: cls.name, id: cls.id });
        subjects.forEach(subject => {
            const subjectRef = doc(db, `classes/${cls.id}/subjects`, subject.id);
            batch.set(subjectRef, subject);
        });
    });

    await batch.commit();
    console.log('Database seeded successfully!');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding database: ${errorMessage}` };
  }
}

// Income Functions
export async function addIncome(incomeData: Omit<Income, 'id' | 'date'>) {
    try {
        const docRef = await addDoc(collection(db, 'income'), {
            ...incomeData,
            date: serverTimestamp()
        });
        return { success: true, message: 'Income record added.', id: docRef.id };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function getIncome(): Promise<Income[]> {
    const q = query(collection(db, "income"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamp to JS Date
            date: data.date.toDate(),
        } as Income;
    });
}

export async function deleteIncomeRecord(incomeId: string) {
    try {
        await runTransaction(db, async (transaction) => {
            const incomeRef = doc(db, 'income', incomeId);
            const incomeDoc = await transaction.get(incomeRef);

            if (!incomeDoc.exists()) {
                throw new Error("Income record not found.");
            }

            const incomeData = incomeDoc.data() as Income;
            const studentRef = doc(db, 'students', incomeData.studentId);
            const studentDoc = await transaction.get(studentRef);

            if (studentDoc.exists()) {
                 const studentData = studentDoc.data() as Student;
                
                // Add the income amount back to the student's totalFee (dues)
                const newTotalFee = studentData.totalFee + incomeData.amount;
                
                // Update student's fee status
                const newFeeStatus: Student['feeStatus'] = newTotalFee > 0 ? 'Partial' : 'Paid';

                transaction.update(studentRef, {
                    totalFee: newTotalFee,
                    feeStatus: newFeeStatus
                });
            }
            
            // Now, delete the income record itself
            transaction.delete(incomeRef);
        });

        return { success: true, message: 'Income record deleted and student balance updated.' };
    } catch (error) {
        console.error("Error deleting income record: ", error);
        return { success: false, message: (error as Error).message };
    }
}


export async function updateIncomeRecord(incomeId: string, newAmount: number) {
    try {
        await runTransaction(db, async (transaction) => {
            const incomeRef = doc(db, 'income', incomeId);
            const incomeDoc = await transaction.get(incomeRef);

            if (!incomeDoc.exists()) {
                throw new Error("Income record not found.");
            }

            const incomeData = incomeDoc.data() as Income;
            const oldAmount = incomeData.amount;
            const amountDifference = oldAmount - newAmount;

            const studentRef = doc(db, 'students', incomeData.studentId);
            const studentDoc = await transaction.get(studentRef);

            if (studentDoc.exists()) {
                const studentData = studentDoc.data() as Student;
                const newTotalFee = studentData.totalFee + amountDifference;
                const newFeeStatus: Student['feeStatus'] = newTotalFee > 0 ? (newTotalFee < studentData.totalFee ? 'Partial' : 'Pending') : 'Paid';

                transaction.update(studentRef, {
                    totalFee: newTotalFee,
                    feeStatus: newFeeStatus
                });
            }

            transaction.update(incomeRef, { amount: newAmount });
        });

        return { success: true, message: 'Income record updated and student balance adjusted.' };
    } catch (error) {
        console.error("Error updating income record: ", error);
        return { success: false, message: (error as Error).message };
    }
}



// Expense Functions
export async function addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    try {
        const docRef = await addDoc(collection(db, 'expenses'), {
            ...expenseData,
            date: serverTimestamp()
        });
        return { success: true, message: 'Expense record added.', id: docRef.id };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Expense;
    });
}

export async function updateExpense(expenseId: string, data: { description: string; amount: number, category: string }) {
    try {
        const expenseRef = doc(db, 'expenses', expenseId);
        await updateDoc(expenseRef, data);
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteExpense(expenseId: string) {
    try {
        await runTransaction(db, async (transaction) => {
            const expenseRef = doc(db, 'expenses', expenseId);
            const expenseDoc = await transaction.get(expenseRef);

            if (!expenseDoc.exists()) {
                throw new Error("Expense record not found.");
            }

            const expenseData = expenseDoc.data() as Expense;

            // If it's a payout, reverse the associated records
            if (expenseData.source === 'payout' && expenseData.payoutId) {
                const payoutRef = doc(db, 'teacher_payouts', expenseData.payoutId);
                const payoutDoc = await transaction.get(payoutRef);

                if (payoutDoc.exists()) {
                    const payoutData = payoutDoc.data() as TeacherPayout;

                    // Revert each income record by marking it as not paid out
                    for (const incomeId of payoutData.incomeIds) {
                        const incomeRef = doc(db, 'income', incomeId);
                        transaction.update(incomeRef, {
                            isPaidOut: false,
                            payoutId: deleteField(),
                        });
                    }

                    // Delete the report associated with the payout
                    const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payoutRef.id), limit(1));
                    const reportSnap = await getDocs(reportQuery); // Needs to be outside transaction or passed in
                    if (!reportSnap.empty) {
                        transaction.delete(reportSnap.docs[0].ref);
                    }
                    
                    // Delete the payout record
                    transaction.delete(payoutRef);
                }
            }

            // Finally, delete the expense record
            transaction.delete(expenseRef);
        });

        return { success: true, message: "Expense deleted. If it was a payout, the transaction has been reversed." };

    } catch (error) {
        console.error("Error deleting expense:", error);
        return { success: false, message: (error as Error).message };
    }
}

// Reports Functions
export async function addReport(reportData: Omit<Report, 'id' | 'reportDate'>) {
    try {
        const docRef = await addDoc(collection(db, 'reports'), {
            ...reportData,
            reportDate: serverTimestamp()
        });
        return { success: true, message: 'Report saved.', id: docRef.id };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function getReports(): Promise<Report[]> {
    const q = query(collection(db, "reports"), orderBy("reportDate", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            reportDate: data.reportDate.toDate(),
        } as Report;
    });
}

// Teacher Payout Functions
export async function payoutTeacher(teacherId: string, teacherName: string, amount: number, incomeIds: string[], reportData: any) {
    try {
        const batch = writeBatch(db);
        const payoutTimestamp = serverTimestamp();

        // 1. Create a new payout record
        const payoutRef = doc(collection(db, 'teacher_payouts'));
        batch.set(payoutRef, {
            teacherId,
            teacherName,
            amount,
            payoutDate: payoutTimestamp,
            incomeIds,
        });

        // 2. Mark all contributing income records as paid out
        incomeIds.forEach(incomeId => {
            const incomeRef = doc(db, 'income', incomeId);
            batch.update(incomeRef, {
                isPaidOut: true,
                payoutId: payoutRef.id
            });
        });

        // 3. Add the payout as an expense
        const expenseRef = doc(collection(db, 'expenses'));
        batch.set(expenseRef, {
            description: `Payout to ${teacherName}`,
            amount: amount,
            date: payoutTimestamp,
            source: 'payout',
            payoutId: payoutRef.id,
            category: 'Salaries',
        });

        // 4. Save the report snapshot
        if (reportData) {
            const reportRef = doc(collection(db, 'reports'));
             batch.set(reportRef, {
                ...reportData,
                teacherId,
                teacherName,
                payoutId: payoutRef.id,
                reportDate: payoutTimestamp,
            });
        }

        await batch.commit();
        return { success: true, message: `Successfully paid ${amount.toLocaleString()} PKR to ${teacherName}.` };
    } catch (error) {
        console.error("Error processing teacher payout: ", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function getTeacherPayouts(teacherId: string): Promise<(TeacherPayout & { report?: Report, academyShare?: number })[]> {
    const q = query(
        collection(db, "teacher_payouts"), 
        where("teacherId", "==", teacherId)
    );
    const querySnapshot = await getDocs(q);
    const payouts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            payoutDate: data.payoutDate.toDate(),
        } as TeacherPayout;
    });
    
    // Sort manually on the client
    const sortedPayouts = payouts.sort((a, b) => b.payoutDate.getTime() - a.payoutDate.getTime());

    // Fetch associated reports
    const payoutsWithReports: (TeacherPayout & { report?: Report, academyShare?: number })[] = [];
    for (const payout of sortedPayouts) {
        const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payout.id), limit(1));
        const reportSnap = await getDocs(reportQuery);
        if (!reportSnap.empty) {
            const report = reportSnap.docs[0].data() as Report;
            const academyShare = report.grossEarnings ? report.grossEarnings * 0.3 : 0;
            payoutsWithReports.push({ ...payout, report, academyShare });
        } else {
            payoutsWithReports.push(payout);
        }
    }
    
    return payoutsWithReports;
}

export async function getAllPayouts(): Promise<(TeacherPayout & { report?: Report, academyShare?: number })[]> {
    const q = query(
        collection(db, "teacher_payouts"), 
        orderBy("payoutDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    const payouts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            payoutDate: data.payoutDate.toDate(),
        } as TeacherPayout;
    });

    const payoutsWithReports: (TeacherPayout & { report?: Report, academyShare?: number })[] = [];
    for (const payout of payouts) {
        const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payout.id), limit(1));
        const reportSnap = await getDocs(reportQuery);
        if (!reportSnap.empty) {
            const report = reportSnap.docs[0].data() as Report;
            const academyShare = report.grossEarnings ? report.grossEarnings * 0.3 : 0;
            payoutsWithReports.push({ ...payout, report, academyShare });
        } else {
            payoutsWithReports.push(payout);
        }
    }
    
    return payoutsWithReports;
}




// Attendance Functions
type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export async function saveAttendance(attendanceData: { classId: string; className: string; date: string; records: { [studentId: string]: AttendanceStatus } }) {
    try {
        const docId = `${attendanceData.date}_${attendanceData.classId}`;
        const docRef = doc(db, 'attendance', docId);
        await setDoc(docRef, attendanceData, { merge: true });
        return { success: true, message: 'Attendance saved successfully.' };
    } catch (error) {
        console.error('Error saving attendance:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function getAttendanceForMonth(studentId: string, month: number, year: number): Promise<{ date: Date, status: AttendanceStatus }[]> {
    try {
        const studentData = await getStudent(studentId);
        if (!studentData) return [];

        const studentClass = await getClasses().then(classes => classes.find(c => c.name === studentData.class));
        if (!studentClass) return [];

        const studentAttendance: { date: Date, status: AttendanceStatus }[] = [];

        const q = query(
            collection(db, 'attendance'),
            where('classId', '==', studentClass.id)
        );
        const querySnapshot = await getDocs(q);
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Firestore date might be a string if it's from the old data, or a Timestamp.
            // Be robust.
            const recordDate = new Date(data.date);
            recordDate.setUTCHours(0,0,0,0); // Use UTC to avoid timezone shifts
            
            if (recordDate >= startDate && recordDate <= endDate) {
                if (data.records && data.records[studentId]) {
                    studentAttendance.push({
                        date: recordDate,
                        status: data.records[studentId],
                    });
                }
            }
        });
        
        return studentAttendance;
    } catch (error) {
        console.error("Error fetching attendance for month: ", error);
        return [];
    }
}

export async function getAttendanceForClassInMonth(classId: string, month: number, year: number) {
    const monthlyAttendance: { [studentId: string]: { [day: number]: 'P' | 'A' | 'L' } } = {};
    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const q = query(
            collection(db, 'attendance'),
            where('classId', '==', classId)
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const recordDate = new Date(data.date);
            recordDate.setUTCHours(0,0,0,0);
            
            if (recordDate >= startDate && recordDate <= endDate) {
                const day = recordDate.getUTCDate();
                for (const studentId in data.records) {
                    if (!monthlyAttendance[studentId]) {
                        monthlyAttendance[studentId] = {};
                    }
                    const status = data.records[studentId];
                    monthlyAttendance[studentId][day] = status.charAt(0) as 'P' | 'A' | 'L';
                }
            }
        });
        return monthlyAttendance;
    } catch (error) {
        console.error("Error fetching class attendance:", error);
        return {};
    }
}


// Exam Functions
export async function createExam(examData: Omit<Exam, 'id' | 'date'>) {
    try {
        const docRef = await addDoc(collection(db, 'exams'), {
            ...examData,
            date: serverTimestamp()
        });
        return { success: true, message: 'Exam created successfully.', id: docRef.id };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function updateExam(examId: string, examData: Partial<Omit<Exam, 'id' | 'date' | 'results'>>) {
    try {
        const docRef = doc(db, 'exams', examId);
        await updateDoc(docRef, examData);
        return { success: true, message: 'Exam updated successfully.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteExam(examId: string) {
    try {
        const docRef = doc(db, 'exams', examId);
        await deleteDoc(docRef);
        return { success: true, message: 'Exam deleted successfully.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}


export async function getExams(): Promise<Exam[]> {
    const q = query(collection(db, "exams"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Exam;
    });
}

export async function getExam(examId: string): Promise<Exam | null> {
    const docRef = doc(db, 'exams', examId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date.toDate(),
        } as Exam;
    }
    return null;
}

export async function saveExamResults(examId: string, results: StudentResult[]) {
    try {
        const docRef = doc(db, 'exams', examId);
        await updateDoc(docRef, { results });
        return { success: true, message: 'Exam results saved successfully.' };
    } catch (error) {
        console.error('Error saving exam results:', error);
        return { success: false, message: (error as Error).message };
    }
}
