import { Survey } from "./io";

export function gotoDetail(id: string|Survey) {
    document.location.href = `#/survey/${typeof id === "string" ? id : id._id}`;
}