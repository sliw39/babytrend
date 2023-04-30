
declare var API_KEY:string;

// const baseUrl = "https://babytrend-0d4f.restdb.io/rest/survey";
const baseUrl = "http://192.168.1.200/api/survey";

export type SurveyType = "Change" | "Someil" | "Bain" | "Repas" | "Visite";
export const SurveyTypeList: SurveyType[] = ["Change", "Someil", "Bain", "Repas", "Visite"];
export interface Survey {
    _id?: string,
    date: number,
    type: SurveyType,
    weight?: number,
    height?: number,
    poop?: boolean,
    pee?: boolean,
    eat?: boolean,
    blurp?: boolean,
    temperature?: number,
    commentaire?: string,
  }

export async function save(data: Survey & {_id?: string}): Promise<Survey> {
    const url = data._id ? baseUrl  + "/" + data._id : baseUrl  + "";
    return fetch(url, {
        method: data._id ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
        body: JSON.stringify(data),
    }).then((res) => res.json())
}

export async function remove(id: string): Promise<Survey> {
    return fetch(baseUrl  + "/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json())
}


export interface SurveyQuery {
    dateFrom?: number,
    dateTo?: number,
    type?: "Change" | "Someil" | "Bain" | "Repas" | "Visite",
    minWeight?: number,
    minHeight?: number,
    minTemperature?: number,
    blurp?: boolean,
    poop?: boolean,
    pee?: boolean,
    eat?: boolean,
}

function buildQuery(query: SurveyQuery): string {
    return JSON.stringify(query);
}

export async function load(query: SurveyQuery = {}, max?: number, skip = 0, sortBy: {key:string, order: 'asc'|'desc'}[] = [{key: "date", order: "desc"}]): Promise<Survey[]> {

    let additionnalQuery = "";
    if (typeof max === "number") {
        additionnalQuery = `&max=${max}&skip=${skip}`;
        if(sortBy.length > 0) {
            additionnalQuery += `&sortBy=${JSON.stringify(sortBy)}`;
        } 
    }

    return fetch(baseUrl  + "?q=" + buildQuery(query) + additionnalQuery, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json())
}

export async function count(query: SurveyQuery = {}): Promise<number> {
    return fetch(baseUrl  + "?count=true&q=" + buildQuery(query), {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json()).then((res) => res.totals.count)
}


export async function get(surveyId: string): Promise<Survey> {
    return fetch(baseUrl  + "/" + surveyId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json())
}