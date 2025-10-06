
import { getAuth } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  private readonly user;

  constructor(context: SecurityRuleContext) {
    const authUser = getAuth().currentUser;
    const user = authUser
      ? {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          // You can add custom claims here if you have them
          // token: authUser.toJSON(),
        }
      : null;

    const message = `Firestore Permission Denied: Cannot ${context.operation} on path ${context.path}. User: ${user?.uid || 'unauthenticated'}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.user = user;
  }

  public getDebugString(): string {
    const debugInfo = {
      message: this.message,
      operation: this.context.operation,
      path: this.context.path,
      user: this.user,
      requestData: this.context.requestResourceData,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(debugInfo, null, 2);
  }
}
