
import { getFirestore, collection, writeBatch, getDocs, doc, getDoc, updateDoc, setDoc, query, where, limit, orderBy, addDoc, serverTimestamp, deleteDoc, runTransaction, increment, deleteField, startAt, endAt, Timestamp, getCountFromServer, getAggregateFromServer, sum, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { app, auth, firebaseConfig } from './config';
import { students as initialStudents, teachers as initialTeachers, classes as initialClasses, Student, Teacher, Class, Subject, Income, Expense, Report, Exam, StudentResult, TeacherPayout, Activity, Payout, DailyAttendanceSummary, ADMIN_UID, Discount } from '@/lib/data';
import type { Settings } from '@/hooks/use-settings';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format as formatDate } from 'date-fns';
import { sendWhatsappMessage } from '@/lib/whatsapp';
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';

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
    }
}

export async function createNotification(userId: string, message: string, link?: string) {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            message,
            link: link || null,
            read: false,
            timestamp: serverTimestamp(),
        });
    } catch (e) {
        console.error("Failed to create notification:", e);
    }
}

export async function getRecentActivities(count = 10): Promise<Activity[]> {
    try {
        const q = query(collection(db, 'activities'), orderBy('date', 'desc'), limit(count));
        const querySnapshot = await getDocs(q);
        const activities = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                type: data.type,
                message: data.message,
                link: data.link,
                date: data.date.toDate(),
            } as Activity;
        });
        return activities;
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
        const permissionError = new FirestorePermissionError({ path: 'activities', operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: 'Permission denied.' };
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

async function getCountSafe(collName: string, filters: { field: string, op: any, value: any }[] = []): Promise<number> {
    let q = query(collection(db, collName));
    filters.forEach(f => {
        q = query(q, where(f.field, f.op, f.value));
    });

    try {
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error: any) {
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            const eqFilters = filters.filter(f => f.op === '==');
            let qFallback = query(collection(db, collName));
            eqFilters.forEach(f => {
                qFallback = query(qFallback, where(f.field, f.op, f.value));
            });

            const snapshot = await getDocs(qFallback);
            const rangeFilters = filters.filter(f => f.op !== '==');
            
            let filteredDocs = snapshot.docs;
            rangeFilters.forEach(f => {
                filteredDocs = filteredDocs.filter(d => {
                    const data = d.data();
                    const val = data[f.field];
                    const fieldVal = val instanceof Timestamp ? val.toDate().getTime() : (val instanceof Date ? val.getTime() : val);
                    const compareVal = f.value instanceof Timestamp ? f.value.toDate().getTime() : (f.value instanceof Date ? f.value.getTime() : f.value);

                    if (f.op === '>=') return fieldVal >= compareVal;
                    if (f.op === '>') return fieldVal > compareVal;
                    if (f.op === '<=') return fieldVal <= compareVal;
                    if (f.op === '<') return fieldVal < compareVal;
                    return true;
                });
            });
            
            return filteredDocs.length;
        }
        console.error(`Count aggregation failed for ${collName}:`, error);
        return 0;
    }
}

async function getSumSafe(collName: string, fieldName: string, filters: { field: string, op: any, value: any }[] = []): Promise<number> {
    let q = query(collection(db, collName));
    filters.forEach(f => {
        q = query(q, where(f.field, f.op, f.value));
    });

    try {
        const agg = await getAggregateFromServer(q, { total: sum(fieldName) });
        return agg.data().total || 0;
    } catch (error: any) {
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            const eqFilters = filters.filter(f => f.op === '==');
            let qFallback = query(collection(db, collName));
            eqFilters.forEach(f => {
                qFallback = query(qFallback, where(f.field, f.op, f.value));
            });

            const snapshot = await getDocs(qFallback);
            const rangeFilters = filters.filter(f => f.op !== '==');
            
            let total = 0;
            snapshot.docs.forEach(d => {
                const data = d.data();
                let matches = true;
                
                for (const f of rangeFilters) {
                    const val = data[f.field];
                    const fieldVal = val instanceof Timestamp ? val.toDate().getTime() : (val instanceof Date ? val.getTime() : val);
                    const compareVal = f.value instanceof Timestamp ? f.value.toDate().getTime() : (f.value instanceof Date ? f.value.getTime() : f.value);

                    if (f.op === '>=' && !(fieldVal >= compareVal)) { matches = false; break; }
                    if (f.op === '>' && !(fieldVal > compareVal)) { matches = false; break; }
                    if (f.op === '<=' && !(fieldVal <= compareVal)) { matches = false; break; }
                    if (f.op === '<' && !(fieldVal < compareVal)) { matches = false; break; }
                }

                if (matches) {
                    total += (Number(data[fieldName]) || 0);
                }
            });
            
            return total;
        }
        console.error(`Sum aggregation failed for ${collName}:`, error);
        return 0;
    }
}

export async function getDashboardStats() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const thirtyDaysAgo = subDays(now, 30);

    const [totalStudents, newAdmissions, incomeThisMonth, expensesThisMonth, pendingDues] = await Promise.all([
        getCountSafe('students', [{ field: 'status', op: '==', value: 'active' }]),
        getCountSafe('activities', [
            { field: 'type', op: '==', value: 'new_admission' },
            { field: 'date', op: '>=', value: Timestamp.fromDate(thirtyDaysAgo) }
        ]),
        getSumSafe('income', 'amount', [{ field: 'date', op: '>=', value: Timestamp.fromDate(monthStart) }]),
        getSumSafe('expenses', 'amount', [{ field: 'date', op: '>=', value: Timestamp.fromDate(monthStart) }]),
        getSumSafe('students', 'totalFee', [{ field: 'status', op: '==', value: 'active' }, { field: 'totalFee', op: '>', value: 0 }])
    ]);

    return {
        totalStudents,
        newAdmissions,
        incomeThisMonth,
        expensesThisMonth,
        pendingDues
    };
}

export async function getClassDistribution() {
    const classes = await getClasses();
    const distribution = await Promise.all(classes.map(async (c) => {
        const count = await getCountSafe('students', [
            { field: 'status', op: '==', value: 'active' },
            { field: 'class', op: '==', value: c.name }
        ]);
        return { name: c.name, studentCount: count };
    }));
    return distribution;
}

export async function getStudentsPaged(pageSize: number = 20, lastVisible?: QueryDocumentSnapshot, classFilter?: string, searchTerm?: string): Promise<{ students: Student[], lastDoc: QueryDocumentSnapshot | null }> {
    const studentsCollection = collection(db, 'students');
    
    if (searchTerm) {
        const q = query(
            studentsCollection, 
            where('status', '==', 'active'), 
            limit(1000)
        );
        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(doc => ({ 
            ...doc.data(), 
            id: doc.id,
            archivedAt: doc.data().archivedAt?.toDate() 
        } as Student));
        
        const term = searchTerm.toLowerCase();
        results = results.filter(s => 
            s.name.toLowerCase().includes(term) || 
            s.id.toLowerCase().includes(term)
        );

        if (classFilter && classFilter !== 'all') {
            const classes = await getClasses();
            const cls = classes.find(c => c.id === classFilter);
            if (cls) {
                results = results.filter(s => s.class === cls.name);
            }
        }

        return { 
            students: results.slice(0, pageSize), 
            lastDoc: null 
        };
    }

    if (classFilter && classFilter !== 'all') {
        const classes = await getClasses();
        const selectedClass = classes.find(c => c.id === classFilter);
        if (selectedClass) {
            const q = query(
                studentsCollection, 
                where('class', '==', selectedClass.name), 
                limit(500)
            );
            const snapshot = await getDocs(q);
            const results = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id } as Student))
                .filter(s => s.status === 'active')
                .sort((a, b) => a.id.localeCompare(b.id));
            
            return { students: results, lastDoc: null };
        }
    }

    let q = query(
        studentsCollection, 
        where('status', '==', 'active'), 
        limit(pageSize)
    );

    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id, 
        archivedAt: doc.data().archivedAt?.toDate() 
    } as Student));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { students, lastDoc };
}

export async function getStudents(): Promise<Student[]> {
    const studentsCollection = collection(db, 'students');
    const q = query(studentsCollection, where('status', '==', 'active'), limit(2000));
    const studentsSnap = await getDocs(q);
    const allStudents = studentsSnap.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data,
            id: doc.id,
            archivedAt: data.archivedAt?.toDate() 
        } as Student;
    });
    return allStudents.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getAllStudents(): Promise<Student[]> {
    const studentsCollection = collection(db, 'students');
    const studentsSnap = await getDocs(query(studentsCollection, limit(5000)));
    return studentsSnap.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        archivedAt: doc.data().archivedAt?.toDate() 
    } as Student));
}

export async function getStudentsByTeacher(teacherId: string): Promise<Student[]> {
    try {
        const allActive = await getStudents();
        return allActive.filter(s => s.subjects && s.subjects.some(sub => sub.teacher_id === teacherId));
    } catch (e) {
        console.error("getStudentsByTeacher failed:", e);
        return [];
    }
}

export async function getAlumni(): Promise<Student[]> {
    const studentsCollection = collection(db, 'students');
    const q = query(studentsCollection, where('status', '==', 'graduated'), limit(100));
    const studentsSnap = await getDocs(q);
    const allStudents = studentsSnap.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data,
            id: doc.id,
            archivedAt: data.archivedAt?.toDate() 
        } as Student;
    });
    return allStudents.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getArchivedStudents(): Promise<Student[]> {
    const studentsCollection = collection(db, 'students');
    const q = query(studentsCollection, where('status', '==', 'archived'), limit(500));
    const studentsSnap = await getDocs(q);
    const allStudents = studentsSnap.docs.map(doc => {
        const data = doc.data();
        return { 
            ...data,
            id: doc.id,
            archivedAt: data.archivedAt?.toDate() 
        } as Student;
    });
    return allStudents.sort((a, b) => {
        if (a.archivedAt && b.archivedAt) {
            return b.archivedAt.getTime() - a.archivedAt.getTime();
        }
        return a.id.localeCompare(b.id);
    });
}

export async function getStudentsByClass(className: string): Promise<Student[]> {
    const q = query(collection(db, 'students'), where('class', '==', className), where("status", "==", "active"), limit(500));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Student);
}

export async function getStudent(id: string): Promise<Student | null> {
    const studentDocRef = doc(db, 'students', id);
    const studentDoc = await getDoc(studentDocRef);

    if (studentDoc.exists()) {
        const data = studentDoc.data();
        return { 
            ...data,
            id: studentDoc.id,
            archivedAt: data.archivedAt?.toDate() 
        } as Student;
    }
    
    return null;
}

export async function addStudent(student: Omit<Student, 'id' | 'status'> & { id: string }) {
    const docRef = doc(db, 'students', student.id);
    
    const subjectsWithAssignment = student.subjects.map(s => ({
        ...s,
        assignedAt: Timestamp.now(),
    }));

    const teacherIds = [...new Set(student.subjects.map(s => s.teacher_id))];

    const studentWithStatus = { 
        ...student, 
        subjects: subjectsWithAssignment,
        teacherIds,
        status: 'active' as const 
    };

    try {
        await setDoc(docRef, studentWithStatus);
        await logActivity('new_admission', `New admission: ${student.name} (ID: ${student.id}) in class ${student.class}.`, `/students/${student.id}`);
        
        const settings = await getSettings('details');
        if (settings && settings.newAdmissionMsg && student.phone) {
            let messageBody = settings.newAdmissionTemplate || 'Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.';
            messageBody = messageBody.replace(/{student_name}/g, student.name);
            messageBody = messageBody.replace(/{academy_name}/g, settings.name || '');
            messageBody = messageBody.replace(/{student_id}/g, student.id);

            const apiUrl = settings.whatsappProvider === 'ultramsg' ? settings.ultraMsgApiUrl : settings.officialApiUrl;
            const token = settings.whatsappProvider === 'ultramsg' ? settings.ultraMsgToken : settings.officialApiToken;
            
            if (apiUrl && token) {
                await sendWhatsappMessage({
                    to: student.phone,
                    body: messageBody,
                    apiUrl: apiUrl,
                    token: token
                });
            }
        }
        
        return { success: true, message: "Student added successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'create', requestResourceData: studentWithStatus });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function updateStudent(studentId: string, studentData: Partial<Omit<Student, 'id' | 'feeStatus' | 'totalFee'>>) {
    const docRef = doc(db, 'students', studentId);
    try {
        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(docRef);
            if (!studentDoc.exists()) {
                throw new Error("Student not found");
            }

            const oldStudentData = studentDoc.data() as Student;
            const updateData: any = { ...studentData };

            if (studentData.subjects) {
                const oldSubjects = oldStudentData.subjects || [];
                updateData.subjects = studentData.subjects.map(newSub => {
                    const existing = oldSubjects.find(os => 
                        os.subject_name === newSub.subject_name && 
                        os.teacher_id === newSub.teacher_id
                    );
                    return {
                        ...newSub,
                        assignedAt: existing?.assignedAt || Timestamp.now()
                    };
                });
                updateData.teacherIds = [...new Set(studentData.subjects.map(s => s.teacher_id))];
            }

            if (studentData.monthlyFee !== undefined && studentData.monthlyFee !== oldStudentData.monthlyFee) {
                const feeDifference = studentData.monthlyFee - oldStudentData.monthlyFee;
                const updatedTotal = oldStudentData.totalFee + feeDifference;
                updateData.totalFee = updatedTotal;

                if (updatedTotal <= 0) {
                    updateData.feeStatus = 'Paid';
                } else if (updatedTotal < (studentData.monthlyFee || oldStudentData.monthlyFee)) {
                    updateData.feeStatus = 'Partial';
                } else {
                    updateData.feeStatus = 'Pending';
                }
            } else if (studentData.class && studentData.class !== oldStudentData.class) {
                await logActivity('student_updated', `Promoted student ${oldStudentData.name} (ID: ${studentId}) from ${oldStudentData.class} to ${studentData.class}.`, `/students/${studentId}`);
            }

            transaction.update(docRef, updateData);
        });
        if (!studentData.class) {
             await logActivity('student_updated', `Updated details for student ${studentData.name || ''} (ID: ${studentId}).`, `/students/${studentId}`);
        }
        return { success: true, message: "Student updated successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: studentData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function updateStudentStatus(studentId: string, status: 'active' | 'graduated' | 'archived') {
    const studentRef = doc(db, 'students', studentId);
    try {
        const studentDoc = await getDoc(studentRef);
        if (!studentDoc.exists()) {
            return { success: false, message: "Student not found." };
        }
        const student = studentDoc.data() as Student;

        const updateData: { status: string; archivedAt?: any } = { status };

        if (status === 'archived') {
            updateData.archivedAt = serverTimestamp();
        } else {
            updateData.archivedAt = deleteField();
        }

        await updateDoc(studentRef, updateData);
        
        if (status === 'graduated') {
            await logActivity('student_graduated', `Marked student as graduated: ${student.name} (ID: ${studentId}).`);
        } else if (status === 'archived') {
            await logActivity('student_archived', `Archived student: ${student.name} (ID: ${studentId}).`);
        } else if (status === 'active') {
            await logActivity('student_reactivated', `Reactivated student: ${student.name} (ID: ${studentId}).`);
        }
        
        return { success: true, message: `Student status updated to ${status}.` };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: studentRef.path,
            operation: 'update',
            requestResourceData: { status }
        });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function deleteStudentPermanently(studentId: string) {
    const studentRef = doc(db, 'students', studentId);
    try {
        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists()) {
                throw new Error("Student not found.");
            }

            const student = studentDoc.data() as Student;
            if (student.status !== 'archived') {
                throw new Error("Only archived students can be permanently deleted.");
            }

            const incomeQuery = query(collection(db, 'income'), where('studentId', '==', studentId));
            const incomeSnapshot = await getDocs(incomeQuery);
            incomeSnapshot.forEach(incomeDoc => {
                transaction.delete(incomeDoc.ref);
            });

            transaction.delete(studentRef);
            
            await logActivity('student_deleted', `Permanently deleted student record and all associated payments for ${student.name} (ID: ${studentId}).`);
        });

        return { success: true, message: 'Student record and all associated payments have been permanently deleted.' };

    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: studentRef.path, operation: 'delete' });
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

export async function checkAndGenerateMonthlyFees() {
    try {
        const stateRef = doc(db, 'system_state', 'fee_management');
        const stateDoc = await getDoc(stateRef);
        const now = new Date();
        const currentMonth = formatDate(now, 'yyyy-MM');

        if (stateDoc.exists() && stateDoc.data().lastGeneratedMonth === currentMonth) {
            return { success: true, message: "Fees for the current month have already been generated." };
        }
        
        const studentsCollection = collection(db, 'students');
        const q = query(studentsCollection, where("status", "==", "active"));
        const studentsSnap = await getDocs(q);
        
        if (studentsSnap.empty) {
            await setDoc(stateRef, { lastGeneratedMonth: currentMonth });
            return { success: true, message: "No active students found." };
        }

        const batch = writeBatch(db);
        let count = 0;

        for (const studentDoc of studentsSnap.docs) {
            const student = studentDoc.data() as Student;
            const studentRef = studentDoc.ref;
            
            const updatedTotalFee = (student.totalFee || 0) + (student.monthlyFee || 0);
            
            let newStatus: Student['feeStatus'] = 'Pending';
            if (updatedTotalFee <= 0) {
                newStatus = 'Paid';
            } else if (updatedTotalFee > student.monthlyFee) {
                newStatus = 'Overdue';
            } else if (updatedTotalFee < student.monthlyFee) {
                newStatus = 'Partial';
            }

            batch.update(studentRef, {
                totalFee: updatedTotalFee,
                feeStatus: newStatus,
            });
            
            count++;
            if (count >= 400) break;
        }
        
        batch.set(stateRef, { lastGeneratedMonth: currentMonth });
        await batch.commit();

        await logActivity('fee_generated', `Automatically generated monthly fees for active students for ${formatDate(now, 'MMMM yyyy')}.`);

        return { success: true, message: "Monthly fees generated successfully." };

    } catch (error) {
        console.error("Error in automatic fee generation: ", error);
        return { success: false, message: (error as Error).message };
    }
}


export async function getTeachers(): Promise<Teacher[]> {
    const teachersCollection = collection(db, 'teachers');
    const teachersSnap = await getDocs(teachersCollection);
    const teachersData = teachersSnap.docs.map(doc => doc.data() as Teacher);
    return teachersData.sort((a,b) => a.id.localeCompare(b.id));
}

export async function getTeacher(id: string): Promise<Teacher | null> {
    const teacherDoc = await getDoc(doc(db, 'teachers', id));
    return teacherDoc.exists() ? teacherDoc.data() as Teacher : null;
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  const q = query(collection(db, "teachers"), where("email", "==", email), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  return querySnapshot.docs[0].data() as Teacher;
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
    const tempAppName = 'temp-auth-app-' + Date.now();
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
        if (!teacherData.email || !teacherData.password) {
            throw new Error("Email and password are required.");
        }
        
        const mainAuth = getAuth(app);
        const signInMethods = await fetchSignInMethodsForEmail(mainAuth, teacherData.email);
        if (signInMethods.length > 0) {
            throw new Error("A user with this email already exists.");
        }
        
        await createUserWithEmailAndPassword(tempAuth, teacherData.email, teacherData.password);
        
        const newTeacherId = await getNextTeacherId();
        const newTeacher: Teacher = { id: newTeacherId, ...teacherData };
        const docRef = doc(db, 'teachers', newTeacherId);
        await setDoc(docRef, newTeacher);
        
        await logActivity('teacher_added', `Added new teacher: ${teacherData.name}.`, `/teachers/${newTeacherId}`);
        
        await sendPasswordResetEmail(tempAuth, newTeacher.email);
        
        await deleteApp(tempApp);
        return { success: true, message: "Teacher added. A password setup email has been sent." };

    } catch (serverError: any) {
        let errorMessage = (serverError as Error).message;
        if (serverError.code === 'auth/weak-password') {
            errorMessage = 'The password is too weak. It must be at least 6 characters long.';
        } else if (serverError.code === 'auth/email-already-in-use') {
            errorMessage = 'A user with this email already exists.';
        }
        
        console.error("Error adding teacher:", serverError);
        await deleteApp(tempApp);
        return { success: false, message: errorMessage };
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

export async function syncTeacherAuthAccounts() {
    const tempAppName = 'temp-auth-app-' + Date.now();
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);
    
    let createdCount = 0;
    let skippedCount = 0;

    try {
        const teachers = await getTeachers();

        for (const teacher of teachers) {
            if (!teacher.email || !teacher.password) {
                skippedCount++;
                continue;
            }
            
            try {
                await createUserWithEmailAndPassword(tempAuth, teacher.email, teacher.password);
                createdCount++;
            } catch (authError: any) {
                if (authError.code === 'auth/email-already-in-use') {
                    skippedCount++;
                } else {
                    console.error(`Failed to create auth account for ${teacher.email}:`, authError.message);
                }
            }
        }
        
        await deleteApp(tempApp);
        
        if (createdCount > 0) {
            await logActivity('settings_updated', `Synced teacher login accounts: ${createdCount} new accounts created.`);
        }
        return { success: true, createdCount, updatedCount: 0, skippedCount };
    } catch (error) {
        console.error("Error during teacher sync process:", error);
        await deleteApp(tempApp);
        return { success: false, message: (error as Error).message, createdCount, updatedCount: 0, skippedCount };
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
        const docRef = doc(db, 'classes', newClassId);
        await setDoc(docRef, { id: newClassId, name: name, sections: [] });
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
        const classData = classDoc.data() as Omit<Class, 'subjects' | 'sections'> & { sections?: string[] };
        const subjectsCollection = collection(db, `classes/${classDoc.id}/subjects`);
        const subjectsSnap = await getDocs(subjectsCollection);
        const subjects = subjectsSnap.docs.map(subjectDoc => subjectDoc.data() as Subject);
        classesData.push({ ...classData, id: classDoc.id, name: classData.name, subjects, sections: classData.sections || [] });
    }
    return classesData;
}

export async function getAllSubjects(): Promise<Subject[]> {
    const classes = await getClasses();
    const allSubjectsMap = new Map<string, Subject>();
    classes.forEach(c => {
        c.subjects.forEach(s => {
            if (!allSubjectsMap.has(s.id)) {
                allSubjectsMap.set(s.id, s);
            }
        })
    })
    return Array.from(allSubjectsMap.values());
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

export async function updateClass(classId: string, classData: Partial<Pick<Class, 'name' | 'sections'>>) {
    const docRef = doc(db, 'classes', classId);
    try {
        await updateDoc(docRef, classData);
        await logActivity('class_updated', `Updated details for class ${classData.name || ''}.`);
        return { success: true, message: "Class updated successfully." };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: classData });
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
        batch.set(doc(db, 'classes', c.id), { id: c.id, name: c.name, sections: classData.sections || [] });
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
export async function addIncome(incomeData: Omit<Income, 'id' | 'date'> & { receiptId: string, forMonth?: string }) {
    try {
        const dataToSave = { ...incomeData, date: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'income'), dataToSave);
        await logActivity('fee_payment', `Payment of ${incomeData.amount} PKR received from ${incomeData.studentName}.`, `/student-ledger?search=${incomeData.studentId}`);
        return { success: true, message: 'Income record added.', id: docRef.id };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'income/[auto-id]', operation: 'create', requestResourceData: incomeData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getIncomePaged(pageSize: number = 20, lastVisible?: QueryDocumentSnapshot, startDate?: Date, endDate?: Date): Promise<{ income: Income[], lastDoc: QueryDocumentSnapshot | null }> {
    let q = query(collection(db, 'income'), orderBy('date', 'desc'), limit(pageSize));

    if (startDate && endDate) {
        q = query(collection(db, 'income'), where('date', '>=', Timestamp.fromDate(startDate)), where('date', '<=', Timestamp.fromDate(endDate)), orderBy('date', 'desc'), limit(pageSize));
    }

    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    const income = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, date: doc.data().date.toDate() } as Income));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { income, lastDoc };
}

export async function getIncome(): Promise<Income[]> {
    const q = query(collection(db, "income"), orderBy("date", "desc"), limit(5000));
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

export async function getRecentIncome(recordLimit: number = 500): Promise<Income[]> {
    const q = query(collection(db, "income"), orderBy("date", "desc"), limit(recordLimit));
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
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
        id: docSnap.id,
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
                const reversedNewTotal = studentData.totalFee + incomeData.amount;
                const newFeeStatus: Student['feeStatus'] = reversedNewTotal > 0 ? (reversedNewTotal < studentData.totalFee ? 'Partial' : 'Pending') : 'Paid';
                transaction.update(studentRef, { totalFee: reversedNewTotal, feeStatus: newFeeStatus });
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
                const adjustedTotal = studentData.totalFee + amountDifference;
                const newFeeStatus: Student['feeStatus'] = adjustedTotal > 0 ? (adjustedTotal < studentData.totalFee ? 'Partial' : 'Pending') : 'Paid';
                transaction.update(studentRef, { totalFee: adjustedTotal, feeStatus: newFeeStatus });
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

// Discount Functions
export async function applyFeeDiscount(studentId: string, amount: number) {
    const studentRef = doc(db, 'students', studentId);
    const discountRef = doc(collection(db, 'discounts'));
    
    try {
        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists()) throw new Error("Student not found");
            const studentData = studentDoc.data() as Student;

            const newTotalFee = Math.max(0, studentData.totalFee - amount);
            let newFeeStatus: Student['feeStatus'] = 'Partial';
            if (newTotalFee <= 0) {
                newFeeStatus = 'Paid';
            } else if (newTotalFee >= studentData.monthlyFee) {
                newFeeStatus = 'Overdue';
            }

            transaction.update(studentRef, { totalFee: newTotalFee, feeStatus: newFeeStatus });
            
            transaction.set(discountRef, {
                studentId,
                studentName: studentData.name,
                phone: studentData.phone || 'N/A',
                amount,
                date: serverTimestamp(),
                month: formatDate(new Date(), 'yyyy-MM')
            });
        });

        await logActivity('fee_discount', `Applied ${amount} PKR discount to ${studentId}.`);
        return { success: true, message: 'Discount applied successfully.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'discounts/[auto-id]', operation: 'create' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getDiscounts(): Promise<Discount[]> {
    const q = query(collection(db, "discounts"), orderBy("date", "desc"), limit(500));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        date: doc.data().date.toDate() 
    } as Discount));
}

export async function deleteDiscount(discountId: string) {
    const discountRef = doc(db, 'discounts', discountId);
    try {
        await runTransaction(db, async (transaction) => {
            const discountDoc = await transaction.get(discountRef);
            if (!discountDoc.exists()) throw new Error("Discount record not found.");
            const discountData = discountDoc.data() as Discount;

            const studentRef = doc(db, 'students', discountData.studentId);
            const studentDoc = await transaction.get(studentRef);

            if (studentDoc.exists()) {
                const studentData = studentDoc.data() as Student;
                const reversedTotal = studentData.totalFee + discountData.amount;
                
                let newFeeStatus: Student['feeStatus'] = 'Partial';
                if (reversedTotal <= 0) {
                    newFeeStatus = 'Paid';
                } else if (reversedTotal >= studentData.monthlyFee) {
                    newFeeStatus = 'Overdue';
                }

                transaction.update(studentRef, { totalFee: reversedTotal, feeStatus: newFeeStatus });
            }
            transaction.delete(discountRef);
        });

        await logActivity('discount_reversed', `Reversed discount of ${discountId}.`);
        return { success: true, message: 'Discount successfully reversed.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'discounts', operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


// Expense Functions
export async function addExpense(expenseData: Omit<Expense, 'id' | 'date'>, expenseDate?: Date) {
    try {
        const dataToSave = { ...expenseData, date: expenseDate ? Timestamp.fromDate(expenseDate) : serverTimestamp() };
        const docRef = await addDoc(collection(db, 'expenses'), dataToSave);
        await logActivity('expense_added', `Added new expense: ${expenseData.description} for ${expenseData.amount}.`);
        return { success: true, message: 'Expense record added.', id: docRef.id };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'expenses/[auto-id]', operation: 'create', requestResourceData: expenseData });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"), limit(500));
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
                        const incomeRef = doc(db, 'income', incomeId);
                        transaction.update(incomeRef, { [`paidOutTo.${payoutData.teacherId}`]: deleteField() });
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
    const q = query(collection(db, "reports"), limit(100));
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), reportDate: doc.data().reportDate.toDate() } as Report));
    return reports.sort((a,b) => b.reportDate.getTime() - a.reportDate.getTime());
}

// Teacher Payout Functions
export async function payoutTeacher(teacherId: string, teacherName: string, amount: number, incomeIds: string[], reportData: any, earningsMonth: Date) {
    try {
        const batch = writeBatch(db);
        const payoutTimestamp = serverTimestamp();
        
        const payoutRef = doc(collection(db, 'teacher_payouts'));
        batch.set(payoutRef, { teacherId, teacherName, amount, payoutDate: payoutTimestamp, incomeIds });

        if (reportData && reportData.academyShare > 0) {
            const academyShareRef = doc(collection(db, 'academy_share'));
            batch.set(academyShareRef, {
                teacherId,
                teacherName,
                amount: reportData.academyShare,
                payoutDate: Timestamp.fromDate(earningsMonth),
                payoutId: payoutRef.id,
            });
        }

        incomeIds.forEach(id => {
            const incomeRef = doc(db, 'income', id);
            batch.update(incomeRef, { [`paidOutTo.${teacherId}`]: payoutRef.id });
        });

        const expenseDate = endOfMonth(earningsMonth);
        batch.set(doc(collection(db, 'expenses')), { 
            description: `Payout to ${teacherName} for ${formatDate(earningsMonth, 'MMMM yyyy')}`, 
            amount, 
            date: Timestamp.fromDate(expenseDate),
            source: 'payout', 
            payoutId: payoutRef.id, 
            category: 'Salaries' 
        });

        if (reportData) {
            const reportRef = doc(collection(db, 'reports'));
            batch.set(reportRef, { ...reportData, teacherId, teacherName, payoutId: payoutRef.id, reportDate: payoutTimestamp });
        }
        
        await batch.commit();

        await logActivity('teacher_payout', `Paid ${amount.toLocaleString()} PKR to teacher ${teacherName} for ${formatDate(earningsMonth, 'MMMM yyyy')}.`, `/teachers/${teacherId}`);
        return { success: true, message: `Successfully paid ${amount.toLocaleString()} PKR to ${teacherName}.` };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: '[multiple]', operation: 'write', requestResourceData: { teacherId, amount } });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function deletePayout(payoutId: string) {
    const payoutRef = doc(db, 'teacher_payouts', payoutId);
    try {
        await runTransaction(db, async (transaction) => {
            const payoutDoc = await transaction.get(payoutRef);
            if (!payoutDoc.exists()) throw new Error("Payout record not found.");

            const payoutData = payoutDoc.data() as TeacherPayout;

            for (const incomeId of payoutData.incomeIds) {
                const incomeRef = doc(db, 'income', incomeId);
                transaction.update(incomeRef, { [`paidOutTo.${payoutData.teacherId}`]: deleteField() });
            }

            const expenseQuery = query(collection(db, 'expenses'), where("payoutId", "==", payoutId), limit(1));
            const expenseSnap = await getDocs(expenseQuery);
            if (!expenseSnap.empty) {
                transaction.delete(expenseSnap.docs[0].ref);
            }
            
            const shareQuery = query(collection(db, 'academy_share'), where("payoutId", "==", payoutId), limit(1));
            const shareSnap = await getDocs(shareQuery);
            if (!shareSnap.empty) {
                transaction.delete(shareSnap.docs[0].ref);
            }

            const reportQuery = query(collection(db, "reports"), where("payoutId", "==", payoutId), limit(1));
            const reportSnap = await getDocs(reportQuery);
            if (!reportSnap.empty) {
                transaction.delete(reportSnap.docs[0].ref);
            }

            transaction.delete(payoutRef);

            await logActivity('teacher_payout', `Reversed payout of ${payoutData.amount} for ${payoutData.teacherName}.`);
        });

        return { success: true, message: 'Payout successfully reversed.' };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: `teacher_payouts/${payoutId}`, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}


export async function getTeacherPayouts(teacherId: string): Promise<(TeacherPayout & { report?: Report, academyShare?: number })[]> {
    const q = query(collection(db, "teacher_payouts"), where("teacherId", "==", teacherId), limit(100));
    const querySnapshot = await getDocs(q);
    let payouts = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), payoutDate: docSnap.data().payoutDate.toDate() } as TeacherPayout));

    payouts = payouts.sort((a, b) => b.payoutDate.getTime() - a.payoutDate.getTime());

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
    const q = query(collection(db, "teacher_payouts"), orderBy("payoutDate", "desc"), limit(200));
    const querySnapshot = await getDocs(q);
    const payouts = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), payoutDate: docSnap.data().payoutDate.toDate() } as TeacherPayout));
    
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

export async function getAcademyShare(): Promise<Payout[]> {
    const q = query(collection(db, "academy_share"), limit(500));
    const querySnapshot = await getDocs(q);
    const shares = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            payoutDate: data.payoutDate.toDate(),
        } as Payout;
    });
    return shares.sort((a, b) => b.payoutDate.getTime() - a.payoutDate.getTime());
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

        const q = query(collection(db, 'attendance'), where('classId', '==', studentClass.id), limit(31));
        const querySnapshot = await getDocs(q);
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
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
    const monthlyAttendanceMap: { [studentId: string]: { [day: number]: 'P' | 'A' | 'L' } } = {};
    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const q = query(collection(db, 'attendance'), where('classId', '==', classId), limit(31));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            const recordDate = new Date(data.date);
            recordDate.setUTCHours(0,0,0,0);
            
            if (recordDate >= startDate && recordDate <= endDate) {
                const day = recordDate.getUTCDate();
                for (const studentId in data.records) {
                    if (!monthlyAttendanceMap[studentId]) monthlyAttendanceMap[studentId] = {};
                    monthlyAttendanceMap[studentId][day] = data.records[studentId].charAt(0) as 'P' | 'A' | 'L';
                }
            }
        });
        return monthlyAttendanceMap;
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
            limit(31)
        );
        const querySnapshot = await getDocs(q);

        const teacherAttendance: { date: Date, status: AttendanceStatus }[] = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            const recordDate = new Date(data.date + 'T00:00:00');
            if (recordDate >= monthStart && recordDate <= monthEnd) {
                teacherAttendance.push({
                    date: recordDate,
                    status: data.status,
                });
            }
        });
        
        return teacherAttendance;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: `teacher_attendance`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        return [];
    }
}

export async function getAllTeacherAttendanceForMonth(month: number, year: number): Promise<{ teacherId: string, date: Date, status: AttendanceStatus }[]> {
    try {
        const monthStartStr = formatDate(startOfMonth(new Date(year, month)), 'yyyy-MM-dd');
        const monthEndStr = formatDate(endOfMonth(new Date(year, month)), 'yyyy-MM-dd');

        const q = query(
            collection(db, 'teacher_attendance'),
            where('date', '>=', monthStartStr),
            where('date', '<=', monthEndStr),
            limit(1000)
        );
        const querySnapshot = await getDocs(q);

        const attendance: { teacherId: string, date: Date, status: AttendanceStatus }[] = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            attendance.push({
                teacherId: data.teacherId,
                date: new Date(data.date + 'T00:00:00'),
                status: data.status,
            });
        });
        
        return attendance;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: `teacher_attendance`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        return [];
    }
}


// Exam Functions
export async function createExam(examData: Omit<Exam, 'id' | 'date'>) {
    try {
        const dataToSave = { ...examData, date: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'exams'), dataToSave);
        
        if (examData.status === 'pending') {
            await createNotification(ADMIN_UID, `New exam request from ${examData.teacherName}: "${examData.name}".`, `/exams?tab=pending`);
        } else if (examData.status === 'approved') {
            await createNotification(examData.teacherId, `A new exam has been assigned to you: "${examData.name}".`, `/teacher/exams/${docRef.id}`);
        }

        const logMessage = examData.status === 'pending'
            ? `New exam request submitted: ${examData.name} for class ${examData.className}.`
            : `New exam created: ${examData.name} for class ${examData.className}.`;
        
        await logActivity('exam_created', logMessage, `/exams`);
        return { success: true, message: 'Exam created successfully.', id: docRef.id };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({ path: 'exams/[auto-id]', operation: 'create', requestResourceData: { name: examData.name } });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, message: (serverError as Error).message };
    }
}

export async function updateExamStatus(examId: string, status: 'approved' | 'rejected') {
    const docRef = doc(db, 'exams', examId);
    try {
        await updateDoc(docRef, { status });
        const examDoc = await getDoc(docRef);
        if (examDoc.exists()) {
             const exam = examDoc.data() as Exam;
             if (status === 'approved') {
                await createNotification(exam.teacherId, `Your exam request "${exam.name}" has been approved.`, `/teacher/exams/${examId}`);
             } else if (status === 'rejected') {
                await createNotification(exam.teacherId, `Your exam request "${exam.name}" was rejected.`, `/teacher/exams`);
             }
             await logActivity('exam_updated', `Exam "${exam.name}" was ${status}.`);
        }
        return { success: true, message: 'Exam status updated.' };
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { status } });
            errorEmitter.emit('permission-error', permissionError);
        }
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
    const q = query(collection(db, "exams"), orderBy("date", "desc"), limit(500));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date.toDate(),
            submissionDeadline: data.submissionDeadline?.toDate(),
        } as Exam;
    });
}

export async function getExamsByTeacher(teacherId: string): Promise<Exam[]> {
    try {
        const q = query(
            collection(db, 'exams'), 
            where("teacherId", "==", teacherId),
            limit(200)
        );
        const querySnapshot = await getDocs(q);
        const examsList = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                date: data.date.toDate(),
                submissionDeadline: data.submissionDeadline?.toDate(),
            } as Exam;
        });
        return examsList.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: 'exams',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        return [];
    }
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
            submissionDeadline: data.submissionDeadline?.toDate(),
        } as Exam;
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
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { results_count: results.length } });
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
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching today's message count: ", error);
        return 0;
    }
}

export async function getDetailedDailyAttendance(): Promise<DailyAttendanceSummary | null> {
    try {
        const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
        
        const [allClasses, allStudents, allTeachers] = await Promise.all([
            getClasses(),
            getStudents(),
            getTeachers()
        ]);
        
        const qStudents = query(collection(db, 'attendance'), where('date', '==', todayStr));
        const studentAttendanceSnap = await getDocs(qStudents);

        const qTeachers = query(collection(db, 'teacher_attendance'), where('date', '==', todayStr));
        const teacherAttendanceSnap = await getDocs(qTeachers);

        const studentSummary: DailyAttendanceSummary['students'] = {
            totalStudents: allStudents.length,
            totalPresent: 0,
            totalAbsent: 0,
            classSummaries: [],
        };

        const attendanceByClassMap: { [classId: string]: { records: { [studentId: string]: AttendanceStatus } } } = {};
        studentAttendanceSnap.forEach(docSnap => {
            const data = docSnap.data();
            attendanceByClassMap[data.classId] = { records: data.records };
        });

        studentSummary.classSummaries = allClasses.map(cls => {
            const studentsInClassList = allStudents.filter(s => s.class === cls.name);
            const classAttendance = attendanceByClassMap[cls.id];
            let presentCount = 0;
            const absentStudentsList: { id: string; name: string }[] = [];

            studentsInClassList.forEach(student => {
                const status = classAttendance?.records[student.id];
                if (status === 'Present') {
                    presentCount++;
                } else if (status === 'Absent' || status === 'Leave' || !status) {
                    absentStudentsList.push({ id: student.id, name: student.name });
                }
            });

            studentSummary.totalPresent += presentCount;
            studentSummary.totalAbsent += absentStudentsList.length;

            return {
                classId: cls.id,
                className: cls.name,
                totalStudents: studentsInClassList.length,
                presentCount: presentCount,
                absentCount: absentStudentsList.length,
                absentStudents: absentStudentsList,
            };
        });

        const teacherSummaryData: DailyAttendanceSummary['teachers'] = {
            totalTeachers: allTeachers.length,
            presentCount: 0,
            absentCount: 0,
            absentTeachers: [],
        };
        
        const presentTeacherIdsSet = new Set<string>();
        teacherAttendanceSnap.forEach(docSnap => {
            const data = docSnap.data();
            if (data.status === 'Present') {
                presentTeacherIdsSet.add(data.teacherId);
            }
        });
        
        teacherSummaryData.presentCount = presentTeacherIdsSet.size;
        teacherSummaryData.absentTeachers = allTeachers
            .filter(t => !presentTeacherIdsSet.has(t.id))
            .map(t => ({ id: t.id, name: t.name }));
        teacherSummaryData.absentCount = teacherSummaryData.absentTeachers.length;

        return {
            date: new Date(),
            students: studentSummary,
            teachers: teacherSummaryData,
        };

    } catch (error) {
        console.error("Error generating detailed daily attendance:", error);
        return null;
    }
}

export async function getStudentExams(studentId: string, className: string): Promise<Exam[]> {
    try {
        const q = query(
            collection(db, 'exams'),
            where('className', '==', className),
            where('status', '==', 'approved'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        const exams = snapshot.docs.map(doc => ({ 
            ...doc.data(), 
            id: doc.id, 
            date: doc.data().date.toDate(),
            submissionDeadline: doc.data().submissionDeadline?.toDate() 
        } as Exam));
        
        return exams
            .filter(exam => exam.results?.some(r => r.studentId === studentId))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (e) {
        console.error("Failed to fetch student exams:", e);
        return [];
    }
}

export async function getStudentIncomeHistory(studentId: string): Promise<Income[]> {
    try {
        const q = query(
            collection(db, 'income'),
            where('studentId', '==', studentId),
            orderBy('date', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ 
            ...doc.data(), 
            id: doc.id, 
            date: doc.data().date.toDate() 
        } as Income));
    } catch (e: any) {
        if (e.code === 'failed-precondition' || e.message?.includes('index')) {
            try {
                const qFallback = query(
                    collection(db, 'income'),
                    where('studentId', '==', studentId),
                    limit(100)
                );
                const snapshot = await getDocs(qFallback);
                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { 
                        ...data, 
                        id: doc.id, 
                        date: data.date.toDate() 
                    } as Income;
                }).sort((a, b) => b.date.getTime() - a.date.getTime());
            } catch (fallbackError) {
                console.error("Fallback income history fetch failed:", fallbackError);
                return [];
            }
        }
        console.error("Failed to fetch student income history:", e);
        return [];
    }
}
