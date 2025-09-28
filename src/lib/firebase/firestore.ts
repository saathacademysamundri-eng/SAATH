
import { getFirestore, collection, writeBatch, getDocs, doc, getDoc, updateDoc, setDoc, query, where, limit, orderBy } from 'firebase/firestore';
import { app } from './config';
import { students as initialStudents, teachers, classes, Student, Teacher, Class, Subject } from '@/lib/data';

const db = getFirestore(app);

export async function getStudents(): Promise<Student[]> {
  const studentsCollection = collection(db, 'students');
  const q = query(studentsCollection, orderBy("id"));
  const studentsSnap = await getDocs(q);
  return studentsSnap.docs.map(doc => doc.data() as Student);
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

export async function addStudent(student: Student) {
    try {
        await setDoc(doc(db, 'students', student.id), student);
        return { success: true, message: "Student added successfully." };
    } catch (error) {
        console.error("Error adding student: ", error);
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


export async function getTeachers(): Promise<Teacher[]> {
    const teachersCollection = collection(db, 'teachers');
    const teachersSnap = await getDocs(teachersCollection);
    return teachersSnap.docs.map(doc => doc.data() as Teacher);
}

export async function getTeacher(id: string): Promise<Teacher | null> {
    const teacherDoc = await getDoc(doc(db, 'teachers', id));
    return teacherDoc.exists() ? teacherDoc.data() as Teacher : null;
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
      const docRef = doc(db, 'students', student.id);
      batch.set(docRef, student);
    });

    teachers.forEach(teacher => {
      const docRef = doc(db, 'teachers', teacher.id);
      batch.set(docRef, teacher);
    });

    classes.forEach(cls => {
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
