import { SurveyType } from "./io";

export const SURVEY_TYPE_COLORS: {[key in SurveyType]: string} = {
    "Change": "rgb(161 110 57)",
    "Someil": "rgb(219 153 241)",
    "Bain": "rgb(91 195 255)",
    "Repas": "rgb(85 175 97)",
    "Visite": "rgb(245 83 121)",
    "Medicament": "rgb(54 162 235)", 
};

export const SURVEY_TYPE_ICONS: {[key in SurveyType]: string} = {
    "Change": "mdi-emoticon-poop-outline",
    "Someil": "mdi-sleep",
    "Bain": "mdi-shower-head",
    "Repas": "mdi-silverware-fork-knife",
    "Visite": "mdi-stethoscope",
    "Medicament": "mdi-pill",
};

export const EVENT_TYPE_ICONS: {[key in "eat" | "pee" | "poop" | "blurp" | "healthcare"]: string} = {
    "eat": "mdi-baby-bottle",
    "pee": "mdi-water",
    "poop": "mdi-emoticon-poop",
    "blurp": "mdi-emoticon-sick",
    "healthcare": "mdi-pill",
}

export const EVENT_TYPE_COLORS: {[key in "eat" | "pee" | "poop" | "blurp" | "healthcare"]: string} = {
    "eat": "rgb(75, 192, 192)",
    "pee": "rgb(255, 205, 86)",
    "poop": "rgb(153, 102, 0)",
    "blurp": "rgb(255, 99, 132)",
    "healthcare": "rgb(54, 162, 235)",
}