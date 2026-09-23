// Interface for a service that can provide actions and reactions
import { IAction } from './iaction.interface';
import { IReaction } from './ireaction.interface';
import { IQuery } from './iQuerry.interface';

export interface IService {
  IAction: IAction[];
  IReaction: IReaction[];
  IQuery: IQuery[];
}
