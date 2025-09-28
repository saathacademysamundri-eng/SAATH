
import { getFirestore, collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { app } from './config';
import { students, teachers, classes } from '@/lib/data';

const db = getFirestore(app);

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

    students.forEach(student => {
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
        batch.set(docRef, classData);
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
