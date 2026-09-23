// Interface for reactions that a service can perform
import { ExtraParam } from "./areaExtraParams.interface";

export interface IReaction {
    name: string;
    description: string;
    performReaction(payload: any): Promise<void>;
    extraParams?: ExtraParam[]; // Optional field for additional parameters
}