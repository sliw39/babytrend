
declare var API_KEY:string;

export type SurveyType = "Change" | "Someil" | "Bain" | "Repas" | "Visite";
export interface Survey {
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
    const url = data._id ? "https://babytrend-0d4f.restdb.io/rest/survey/" + data._id : "https://babytrend-0d4f.restdb.io/rest/survey";
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
    return fetch("https://babytrend-0d4f.restdb.io/rest/survey/" + id, {
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
    let q: any = {};
    if (query.dateFrom) q.date = { $gte: query.dateFrom };
    if (query.dateTo) q.date = { $lte: query.dateTo };
    if (query.type) q.type = query.type;
    if (query.minWeight) q.weight = { $gte: query.minWeight };
    if (query.minHeight) q.height = { $gte: query.minHeight };
    if (query.minTemperature) q.temperature = { $gte: query.minTemperature };
    if (query.blurp) q.blurp = query.blurp;
    if (query.poop) q.poop = query.poop;
    if (query.pee) q.pee = query.pee;
    if (query.eat) q.eat = query.eat;
    return JSON.stringify(q);
}

export async function load(query: SurveyQuery, max?: number, skip = 0, sortBy: {key:string, order: 'asc'|'desc'}[] = [{key: "date", order: "desc"}]): Promise<Survey[]> {

    let additionnalQuery = "";
    if (typeof max === "number") {
        additionnalQuery = `&max=${max}&skip=${skip}`;
        if(sortBy.length > 0) {
            let firstSort = sortBy[0];
            additionnalQuery += `&sort=${firstSort.key}&dir=${firstSort.order === "asc" ? 1 : -1}`;
        } 
    }

    return fetch("https://babytrend-0d4f.restdb.io/rest/survey?q=" + buildQuery(query) + additionnalQuery, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json())
}

export async function count(query: SurveyQuery): Promise<number> {

    return fetch("https://babytrend-0d4f.restdb.io/rest/survey?totals=true&count=true&q=" + buildQuery(query), {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json()).then((res) => res.totals.count)
}


export async function get(surveyId: string): Promise<Survey> {
    return fetch("https://babytrend-0d4f.restdb.io/rest/survey/" + surveyId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": API_KEY,
        },
    }).then((res) => res.json())
}