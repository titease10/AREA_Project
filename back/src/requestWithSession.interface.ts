import { Request } from 'express';
import { Session, SessionData } from 'express-session';

export interface RequestWithSession extends Request {
  session: Session & Partial<SessionData> & { redirectUri?: string };
}