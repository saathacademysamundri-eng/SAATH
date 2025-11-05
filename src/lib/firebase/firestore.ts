

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
    function isAdmin() {
      return request.auth.uid == "rSwt0U3gwxNrYzS2ky6P5TnYXtj2";
    }

    // Default deny all reads and writes, but allow admin full access.
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}

--- END OF RULES TO COPY ---

*/


import { getFirestore, collection, writeBatch, getDocs, doc, getDoc, updateDoc, setDoc, query, where, limit, orderBy, addDoc, serverTimestamp, deleteDoc, runTransaction, increment, deleteField, startAt, endAt, Timestamp } from 'firebase/firestore';
import { app } from './config';
import { students as initialStudents, teachers as initialTeachers, classes as initialClasses, Student, Teacher, Class, Subject, Income, Expense, Report, Exam, StudentResult, TeacherPayout, Activity } from '@/lib/data';
import type { Settings } from '@/hooks/use-settings';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

const db = getFirestore(app);

// Activity Log Functions
export async function logActivity(type: Activity['type'], message: string, link?: string) {
    try {
        await addDoc(collection(db, 'activities'), {
            type,
            message,
            link: link || null,
            date: serverTimestamp(),
        });
    } catch (e) {
        console.error("Failed to log activity:", e);
        // We don't throw an error here as this is a non-critical background task
    }
}

export async function getRecentActivities(): Promise<Activity[]> {
    try {
        const q = query(collection(db, 'activities'), orderBy('date', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate(),
            } as Activity;
        });
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        return [];
    }
}

export async function clearActivityHistory() {
    try {
        const activitiesCollection = collection(db, 'activities');
        const activitiesSnap = await getDocs(activitiesCollection);
        const batch = writeBatch(db);
        activitiesSnap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        await logActivity('settings_updated', 'Cleared all activity history logs.');
        return { success: true, message: 'Activity history cleared.' };
    } catch (serverError) {
        return { success: false, message: (serverError as Error).message };
    }
}


// Settings Functions
export async function getSettings(docId: 'details' | 'landing-page'): Promise<any> {
    const docRef = doc(db, 'settings', docId);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (err) {
        console.error(`Error fetching settings document ${docId}:`, err);
        return null;
    }
}

export async function updateSettings(docId: 'details' | 'landing-page', settings: Partial<Settings> | { sections: any }): Promise<{success: boolean, message?: string}> {
    const docRef = doc(db, 'settings', docId);
    try {
      await setDoc(docRef, settings, { merge: true });
      return { success: true };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: settings,
        });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function getStudents(): Promise<Student[]> {
  const studentsCollection = collection(db, 'students');
  const q = query(studentsCollection, where("isActive", "!=", false), orderBy("id"));
  const studentsSnap = await getDocs(q);
  return studentsSnap.docs.map(doc => doc.data() as Student);
}

export async function getInactiveStudents(): Promise<Student[]> {
  const studentsCollection = collection(db, 'students');
  const q = query(studentsCollection, where("isActive", "==", false), orderBy("id"));
  const studentsSnap = await getDocs(q);
  return studentsSnap.docs.map(doc => doc.data() as Student);
}


export async function getStudentsByClass(className: string): Promise<Student[]> {
    const q = query(collection(db, 'students'), where('class', '==', className), where("isActive", "!=", false));
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
    const docRef = doc(db, 'students', student.id);
    const studentWithActive = { ...student, isActive: true };
    try {
        await setDoc(docRef, studentWithActive);
        await logActivity('new_admission', `New admission: ${student.name} (ID: ${student.id}) in class ${student.class}.`, `/students/${student.id}`);
        return { success: true, message: "Student added successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'create', requestResourceData: studentWithActive });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function updateStudent(studentId: string, studentData: Partial<Omit<Student, 'id' | 'feeStatus' | 'totalFee'>>) {
    const docRef = doc(db, 'students', studentId);
    try {
        await updateDoc(docRef, studentData);
        await logActivity('student_updated', `Updated details for student ${studentData.name} (ID: ${studentId}).`, `/students/${studentId}`);
        return { success: true, message: "Student updated successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: studentData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function deactivateStudent(studentId: string) {
    const studentRef = doc(db, 'students', studentId);
    try {
        const studentDoc = await getDoc(studentRef);
        if (studentDoc.exists()) {
            await updateDoc(studentRef, { isActive: false });
            const student = studentDoc.data() as Student;
            await logActivity('student_deactivated', `Deactivated student: ${student.name} (ID: ${studentId}) and moved to Alumni.`);
            return { success: true, message: "Student moved to Alumni." };
        }
        return { success: false, message: "Student not found." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: studentRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function reactivateStudent(studentId: string) {
    const studentRef = doc(db, 'students', studentId);
    try {
        const studentDoc = await getDoc(studentRef);
        if (studentDoc.exists()) {
            await updateDoc(studentRef, { isActive: true });
            const student = studentDoc.data() as Student;
            await logActivity('student_reactivated', `Reactivated student: ${student.name} (ID: ${studentId}) from Alumni.`);
            return { success: true, message: "Student reactivated successfully." };
        }
        return { success: false, message: "Student not found." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: studentRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
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
    const docRef = doc(db, 'students', studentId);
    const studentData = { totalFee: newBalance, feeStatus: newStatus };
    try {
        await updateDoc(docRef, studentData);
        return { success: true, message: "Student fee status updated." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: studentData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
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
            
            const newTotalFee = student.totalFee + student.monthlyFee;
            const newStatus = student.totalFee > 0 ? 'Overdue' : 'Pending';

            batch.update(studentRef, {
                totalFee: newTotalFee,
                feeStatus: newStatus,
            });
        });

        await batch.commit();
        await logActivity('fee_generated', `Generated next month's fees for all students.`);
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
        const docRef = doc(db, 'teachers', newTeacherId);
        await setDoc(docRef, newTeacher);
        await logActivity('teacher_added', `Added new teacher: ${teacherData.name}.`, `/teachers/${newTeacherId}`);
        return { success: true, message: "Teacher added successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: `teachers/[auto-id]`, operation: 'create', requestResourceData: teacherData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function updateTeacher(teacherId: string, teacherData: Partial<Omit<Teacher, 'id'>>) {
    const docRef = doc(db, 'teachers', teacherId);
    try {
        await updateDoc(docRef, teacherData);
        await logActivity('teacher_updated', `Updated details for teacher ${teacherData.name}.`, `/teachers/${teacherId}`);
        return { success: true, message: "Teacher updated successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: teacherData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function deleteTeacher(teacherId: string) {
    const teacherRef = doc(db, "teachers", teacherId);
    try {
        const teacherDoc = await getDoc(teacherRef);
        if (teacherDoc.exists()) {
            const teacher = teacherDoc.data() as Teacher;
            await deleteDoc(teacherRef);
            await logActivity('teacher_deleted', `Deleted teacher: ${teacher.name} (ID: ${teacherId}).`);
            return { success: true, message: "Teacher deleted successfully." };
        }
        return { success: false, message: "Teacher not found." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: teacherRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
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
        const newClass = { id: newClassId, name: name, subjects: [] };
        const docRef = doc(db, 'classes', newClassId);
        await setDoc(docRef, { id: newClassId, name: name });
        await logActivity('class_added', `Created new class: ${name}.`);
        return { success: true, message: "Class created successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'classes/[auto-id]', operation: 'create', requestResourceData: { name } });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
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
        
        const oldSubjectsSnap = await getDocs(subjectsCollectionRef);
        oldSubjectsSnap.forEach(doc => batch.delete(doc.ref));

        subjects.forEach(subject => {
            const subjectRef = doc(subjectsCollectionRef, subject.id);
            batch.set(subjectRef, subject);
        });

        await batch.commit();
        await logActivity('class_updated', `Updated subjects for a class.`);
        return { success: true, message: "Class subjects updated successfully." };

    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: `classes/${classId}/subjects/[subjectId]`, operation: 'write', requestResourceData: subjects });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function seedDatabase() {
  try {
    const studentsCollection = collection(db, 'students');
    const teachersCollection = collection(db, 'teachers');
    const classesCollection = collection(db, 'classes');

    const studentsSnap = await getDocs(studentsCollection);
    if (!studentsSnap.empty) {
      return { success: true, message: 'Database has already been seeded.' };
    }

    const batch = writeBatch(db);
    initialStudents.forEach(s => batch.set(doc(db, 'students', s.id), s));
    initialTeachers.forEach(t => batch.set(doc(db, 'teachers', t.id), t));
    initialClasses.forEach(c => {
        const { subjects, ...classData } = c;
        batch.set(doc(db, 'classes', c.id), { id: c.id, name: c.name });
        subjects.forEach(sub => batch.set(doc(db, `classes/${c.id}/subjects`, sub.id), sub));
    });

    await batch.commit();
    await logActivity('database_seeded', `Database populated with initial data.`);
    return { success: true, message: 'Database seeded successfully!' };
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({ path: '[multiple]', operation: 'write', requestResourceData: { seeding: true } });
    errorEmitter.emit('permission-error', permissionError);
    return { success: false, message: `Error seeding database: ${(serverError as Error).message}` };
  }
}

// Income Functions
export async function addIncome(incomeData: Omit<Income, 'id' | 'date'>) {
    try {
        const receiptId = `RCPT-${Date.now()}`;
        const dataToSave = { ...incomeData, receiptId, date: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'income'), dataToSave);
        await logActivity('fee_payment', `Payment of ${incomeData.amount} PKR received from ${incomeData.studentName}.`, `/student-ledger?search=${incomeData.studentId}`);
        return { success: true, message: 'Income record added.', id: docRef.id, receiptId };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'income/[auto-id]', operation: 'create', requestResourceData: incomeData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
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
            date: data.date.toDate(),
        } as Income;
    });
}

export async function getIncomeByReceiptId(receiptId: string): Promise<Income | null> {
    const q = query(collection(db, "income"), where("receiptId", "==", receiptId), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
    } as Income;
}


export async function deleteIncomeRecord(incomeId: string) {
    const incomeRef = doc(db, 'income', incomeId);
    try {
        await runTransaction(db, async (transaction) => {
            const incomeDoc = await transaction.get(incomeRef);
            if (!incomeDoc.exists()) throw new Error("Income record not found.");
            const incomeData = incomeDoc.data() as Income;
            const studentRef = doc(db, 'students', incomeData.studentId);
            const studentDoc = await transaction.get(studentRef);

            if (studentDoc.exists()) {
                 const studentData = studentDoc.data() as Student;
                const newTotalFee = studentData.totalFee + incomeData.amount;
                const newFeeStatus: Student['feeStatus'] = newTotalFee > 0 ? 'Partial' : 'Paid';
                transaction.update(studentRef, { totalFee: newTotalFee, feeStatus: newFeeStatus });
            }
            transaction.delete(incomeRef);
            await logActivity('fee_reversal', `Reversed payment of ${incomeData.amount} for ${incomeData.studentName}.`);
        });

        return { success: true, message: 'Income record deleted and student balance updated.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: incomeRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function updateIncomeRecord(incomeId: string, newAmount: number) {
    const incomeRef = doc(db, 'income', incomeId);
    try {
        await runTransaction(db, async (transaction) => {
            const incomeDoc = await transaction.get(incomeRef);
            if (!incomeDoc.exists()) throw new Error("Income record not found.");

            const incomeData = incomeDoc.data() as Income;
            const amountDifference = incomeData.amount - newAmount;

            const studentRef = doc(db, 'students', incomeData.studentId);
            const studentDoc = await transaction.get(studentRef);

            if (studentDoc.exists()) {
                const studentData = studentDoc.data() as Student;
                const newTotalFee = studentData.totalFee + amountDifference;
                const newFeeStatus: Student['feeStatus'] = newTotalFee > 0 ? (newTotalFee < studentData.totalFee ? 'Partial' : 'Pending') : 'Paid';
                transaction.update(studentRef, { totalFee: newTotalFee, feeStatus: newFeeStatus });
            }
            transaction.update(incomeRef, { amount: newAmount });
            await logActivity('fee_updated', `Updated payment for ${incomeData.studentName} to ${newAmount}.`);
        });
        return { success: true, message: 'Income record updated and student balance adjusted.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: incomeRef.path, operation: 'update', requestResourceData: { amount: newAmount } });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}



// Expense Functions
export async function addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    try {
        const docRef = await addDoc(collection(db, 'expenses'), { ...expenseData, date: serverTimestamp() });
        await logActivity('expense_added', `Added new expense: ${expenseData.description} for ${expenseData.amount}.`);
        return { success: true, message: 'Expense record added.', id: docRef.id };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'expenses/[auto-id]', operation: 'create', requestResourceData: expenseData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date.toDate() } as Expense));
}

export async function updateExpense(expenseId: string, data: { description: string; amount: number, category: string }) {
    const docRef = doc(db, 'expenses', expenseId);
    try {
        await updateDoc(docRef, data);
        await logActivity('expense_updated', `Updated expense: ${data.description}.`);
        return { success: true };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function deleteExpense(expenseId: string) {
    const expenseRef = doc(db, 'expenses', expenseId);
    try {
        await runTransaction(db, async (transaction) => {
            const expenseDoc = await transaction.get(expenseRef);
            if (!expenseDoc.exists()) throw new Error("Expense record not found.");

            const expenseData = expenseDoc.data() as Expense;
            if (expenseData.source === 'payout' && expenseData.payoutId) {
                const payoutRef = doc(db, 'teacher_payouts', expenseData.payoutId);
                const payoutDoc = await transaction.get(payoutRef);
                if (payoutDoc.exists()) {
                    const payoutData = payoutDoc.data() as TeacherPayout;
                    for (const incomeId of payoutData.incomeIds) {
                        transaction.update(doc(db, 'income', incomeId), { isPaidOut: false, payoutId: deleteField() });
                    }
                    const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payoutRef.id), limit(1));
                    const reportSnap = await getDocs(reportQuery); 
                    if (!reportSnap.empty) transaction.delete(reportSnap.docs[0].ref);
                    transaction.delete(payoutRef);
                }
            }
            transaction.delete(expenseRef);
            await logActivity('expense_deleted', `Deleted expense: ${expenseData.description}.`);
        });
        return { success: true, message: "Expense deleted and any associated payout reversed." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: expenseRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

// Reports Functions
export async function addReport(reportData: Omit<Report, 'id' | 'reportDate'>) {
    try {
        const docRef = await addDoc(collection(db, 'reports'), { ...reportData, reportDate: serverTimestamp() });
        return { success: true, message: 'Report saved.', id: docRef.id };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'reports/[auto-id]', operation: 'create', requestResourceData: reportData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getReports(): Promise<Report[]> {
    const q = query(collection(db, "reports"), orderBy("reportDate", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), reportDate: doc.data().reportDate.toDate() } as Report));
}

// Teacher Payout Functions
export async function payoutTeacher(teacherId: string, teacherName: string, amount: number, incomeIds: string[], reportData: any) {
    try {
        const batch = writeBatch(db);
        const payoutTimestamp = serverTimestamp();
        const payoutRef = doc(collection(db, 'teacher_payouts'));
        batch.set(payoutRef, { teacherId, teacherName, amount, payoutDate: payoutTimestamp, incomeIds });

        incomeIds.forEach(id => batch.update(doc(db, 'income', id), { isPaidOut: true, payoutId: payoutRef.id }));

        const expenseRef = doc(collection(db, 'expenses'));
        batch.set(expenseRef, { description: `Payout to ${teacherName}`, amount, date: payoutTimestamp, source: 'payout', payoutId: payoutRef.id, category: 'Salaries' });

        if (reportData) {
            const reportRef = doc(collection(db, 'reports'));
            batch.set(reportRef, { ...reportData, teacherId, teacherName, payoutId: payoutRef.id, reportDate: payoutTimestamp });
        }
        
        await batch.commit();

        await logActivity('teacher_payout', `Paid ${amount.toLocaleString()} PKR to teacher ${teacherName}.`, `/teachers/${teacherId}`);
        return { success: true, message: `Successfully paid ${amount.toLocaleString()} PKR to ${teacherName}.` };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: '[multiple]', operation: 'write', requestResourceData: { teacherId, amount } });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getTeacherPayouts(teacherId: string): Promise<(TeacherPayout & { report?: Report, academyShare?: number })[]> {
    const q = query(collection(db, "teacher_payouts"), where("teacherId", "==", teacherId), orderBy("payoutDate", "desc"));
    const querySnapshot = await getDocs(q);
    const payouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), payoutDate: doc.data().payoutDate.toDate() } as TeacherPayout));

    const payoutsWithReports: (TeacherPayout & { report?: Report, academyShare?: number })[] = [];
    for (const payout of payouts) {
        const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payout.id), limit(1));
        const reportSnap = await getDocs(reportQuery);
        if (!reportSnap.empty) {
            const report = reportSnap.docs[0].data() as Report;
            payoutsWithReports.push({ ...payout, report, academyShare: report.grossEarnings * 0.3 });
        } else {
            payoutsWithReports.push(payout);
        }
    }
    return payoutsWithReports;
}

export async function getAllPayouts(): Promise<(TeacherPayout & { report?: Report, academyShare?: number })[]> {
    const q = query(collection(db, "teacher_payouts"), orderBy("payoutDate", "desc"));
    const querySnapshot = await getDocs(q);
    const payouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), payoutDate: doc.data().payoutDate.toDate() } as TeacherPayout));
    
    const payoutsWithReports: (TeacherPayout & { report?: Report, academyShare?: number })[] = [];
    for (const payout of payouts) {
        const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payout.id), limit(1));
        const reportSnap = await getDocs(reportQuery);
        if (!reportSnap.empty) {
            const report = reportSnap.docs[0].data() as Report;
            payoutsWithReports.push({ ...payout, report, academyShare: report.grossEarnings * 0.3 });
        } else {
            payoutsWithReports.push(payout);
        }
    }
    return payoutsWithReports;
}




// Attendance Functions
type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export async function saveAttendance(attendanceData: { classId: string; className: string; date: string; records: { [studentId: string]: AttendanceStatus } }) {
    const docRef = doc(db, 'attendance', `${attendanceData.date}_${attendanceData.classId}`);
    try {
        await setDoc(docRef, attendanceData, { merge: true });
        await logActivity('attendance_marked', `Marked attendance for class ${attendanceData.className}.`);
        return { success: true, message: 'Attendance saved successfully.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: attendanceData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getTodaysAttendanceSummary(): Promise<{ present: number, absent: number, classes: { [classId: string]: { present: number, absent: number } } }> {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const q = query(collection(db, 'attendance'), where('date', '==', todayStr));
        const querySnapshot = await getDocs(q);

        let totalPresent = 0;
        let totalAbsent = 0;
        const classSummary: { [classId: string]: { present: number, absent: number } } = {};

        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            const classId = data.classId;
            if (!classSummary[classId]) {
                classSummary[classId] = { present: 0, absent: 0 };
            }

            const records = data.records;
            for (const studentId in records) {
                if (records[studentId] === 'Present') {
                    totalPresent++;
                    classSummary[classId].present++;
                } else if (records[studentId] === 'Absent') {
                    totalAbsent++;
                    classSummary[classId].absent++;
                }
            }
        });

        return { present: totalPresent, absent: totalAbsent, classes: classSummary };
    } catch (error) {
        console.error("Error fetching today's attendance summary: ", error);
        return { present: 0, absent: 0, classes: {} };
    }
}


export async function getAttendanceForMonth(studentId: string, month: number, year: number): Promise<{ date: Date, status: AttendanceStatus }[]> {
    try {
        const studentData = await getStudent(studentId);
        if (!studentData) return [];

        const studentClass = await getClasses().then(classes => classes.find(c => c.name === studentData.class));
        if (!studentClass) return [];

        const studentAttendance: { date: Date, status: AttendanceStatus }[] = [];

        const q = query(collection(db, 'attendance'), where('classId', '==', studentClass.id));
        const querySnapshot = await getDocs(q);
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const recordDate = new Date(data.date);
            recordDate.setUTCHours(0,0,0,0);
            
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

        const q = query(collection(db, 'attendance'), where('classId', '==', classId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const recordDate = new Date(data.date);
            recordDate.setUTCHours(0,0,0,0);
            
            if (recordDate >= startDate && recordDate <= endDate) {
                const day = recordDate.getUTCDate();
                for (const studentId in data.records) {
                    if (!monthlyAttendance[studentId]) monthlyAttendance[studentId] = {};
                    monthlyAttendance[studentId][day] = data.records[studentId].charAt(0) as 'P' | 'A' | 'L';
                }
            }
        });
        return monthlyAttendance;
    } catch (error) {
        console.error("Error fetching class attendance:", error);
        return {};
    }
}

export async function saveTeacherAttendance(date: string, records: { [teacherId: string]: AttendanceStatus }) {
    const batch = writeBatch(db);
    
    for (const teacherId in records) {
        const status = records[teacherId];
        const attendanceId = `${date}_${teacherId}`;
        const docRef = doc(db, 'teacher_attendance', attendanceId);
        batch.set(docRef, { teacherId, date, status });
    }

    try {
        await batch.commit();
        await logActivity('attendance_marked', `Marked attendance for teachers.`);
        return { success: true, message: 'Teacher attendance saved.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'teacher_attendance/[auto-id]', operation: 'write', requestResourceData: records });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getTeacherAttendanceForMonth(teacherId: string, month: number, year: number): Promise<{ date: Date, status: AttendanceStatus }[]> {
    try {
        const monthStart = startOfMonth(new Date(year, month));
        const monthEnd = endOfMonth(new Date(year, month));

        const q = query(
            collection(db, 'teacher_attendance'),
            where('teacherId', '==', teacherId),
        );

        const querySnapshot = await getDocs(q);

        const teacherAttendance: { date: Date, status: AttendanceStatus }[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const recordDate = new Date(data.date + 'T00:00:00');
            if (recordDate >= monthStart && recordDate <= monthEnd) {
                teacherAttendance.push({
                    date: recordDate,
                    status: data.status,
                });
            }
        });

        return teacherAttendance;
    } catch (error) {
        console.error(`Error fetching teacher attendance for ${teacherId}:`, error);
        if (error instanceof Error && error.message.includes("The query requires an index")) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `teacher_attendance`,
                operation: 'list',
            }));
        }
        return [];
    }
}


// Exam Functions
export async function createExam(examData: Omit<Exam, 'id' | 'date'>) {
    try {
        const dataToSave = { ...examData, date: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'exams'), dataToSave);
        await logActivity('exam_created', `New exam created: ${examData.name} for class ${examData.className}.`, `/exams/${docRef.id}`);
        return { success: true, message: 'Exam created successfully.', id: docRef.id };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'exams/[auto-id]', operation: 'create', requestResourceData: examData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function updateExam(examId: string, examData: Partial<Omit<Exam, 'id' | 'date' | 'results'>>) {
    const docRef = doc(db, 'exams', examId);
    try {
        await updateDoc(docRef, examData);
        await logActivity('exam_updated', `Updated exam: ${examData.name}.`);
        return { success: true, message: 'Exam updated successfully.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: examData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function deleteExam(examId: string) {
    const docRef = doc(db, 'exams', examId);
    try {
        const examDoc = await getDoc(docRef);
        if (examDoc.exists()) {
            const exam = examDoc.data() as Exam;
            await deleteDoc(docRef);
            await logActivity('exam_deleted', `Deleted exam: ${exam.name}.`);
            return { success: true, message: 'Exam deleted successfully.' };
        }
        return { success: false, message: 'Exam not found.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function getExams(): Promise<Exam[]> {
    const q = query(collection(db, "exams"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date.toDate() } as Exam));
}

export async function getExam(examId: string): Promise<Exam | null> {
    const docRef = doc(db, 'exams', examId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data, date: data.date.toDate() } as Exam;
    }
    return null;
}

export async function saveExamResults(examId: string, results: StudentResult[]) {
    const docRef = doc(db, 'exams', examId);
    try {
        await updateDoc(docRef, { results });
        await logActivity('exam_results_saved', `Saved results for an exam.`);
        return { success: true, message: 'Exam results saved successfully.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { results } });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getTodaysMessagesCount(): Promise<number> {
    try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const q = query(
            collection(db, 'message_logs'),
            where('timestamp', '>=', Timestamp.fromDate(todayStart)),
            where('timestamp', '<=', Timestamp.fromDate(todayEnd))
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error fetching today's message count: ", error);
        return 0;
    }
}
