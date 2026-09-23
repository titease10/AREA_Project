import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSession {
  private isActive: boolean;
  private userId: number | null;
  private userEmail: string | null;

  constructor() {
    this.isActive = false;
    this.userId = null;
    this.userEmail = null;
  }

  startSession(userId: number, userEmail: string) {
    this.isActive = true;
    this.userId = userId;
    this.userEmail = userEmail;
  }

  endSession() {
    this.isActive = false;
    this.userId = null;
    this.userEmail = null;
  }

  isSessionActive(): boolean {
    return this.isActive;
  }

  getSessionDetails() {
    if (!this.isActive) {
      return null;
    }
    return {
      userId: this.userId,
      userEmail: this.userEmail,
    };
  }
}
