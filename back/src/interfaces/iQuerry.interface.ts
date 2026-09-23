import { ExtraParam } from "./areaExtraParams.interface";
export interface IQuery {
    name: string;
    description: string;
    performQuery(payload: any): Promise<string>;
    extraParams?: ExtraParam[]; // Optional field for additional parameters
}