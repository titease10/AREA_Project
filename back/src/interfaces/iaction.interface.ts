// Interface for actions that a service can perform
import { ExtraParam } from "./areaExtraParams.interface";
export interface IAction {
    name: string;
    description: string;
    performAction(payload: any): Promise<Boolean>;
    extraParams?: ExtraParam[]; // Optional field for additional parameters
}

