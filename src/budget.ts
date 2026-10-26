import type { DayId, MondayPlan, SundayPlan } from "./data";

export type DayBudget = {
  hours: string;
  duration: string;
  min: number;
  max: number;
  breakdown: string[];
};

export function dayBudget(day: DayId, includeMuseum: boolean, mondayPlan: MondayPlan, sundayPlan: SundayPlan = "gozo"): DayBudget {
  if (day === "sat") return {
    hours: "09:00–20:30",
    duration: "11 h 30 min",
    min: 57 + (includeMuseum ? 5 : 0),
    max: 97 + (includeMuseum ? 5 : 0),
    breakdown: ["Ferris del puerto: ≈ 10 €", "Concatedral: 15 €", ...(includeMuseum ? ["Museo: 5 €"] : []), "Comida y cena: ≈ 32–72 €"],
  };
  if (day === "sun" && sundayPlan === "malta") return {
    hours: "08:00–21:00", duration: "13 h", min: 93, max: 145,
    breakdown: ["Ħaġar Qim y Mnajdra: 10 €", "Taxis compartidos: ≈ 45–65 € / persona", "Comida y cena: ≈ 38–70 €"],
  };
  if (day === "sun" && sundayPlan === "comino") return {
    hours: "08:00–21:30", duration: "13 h 30 min", min: 88, max: 135,
    breakdown: ["Ferry de Comino: ≈ 15 €", "Taxis compartidos: ≈ 45–70 € / persona", "Picnic y cena: ≈ 28–50 €"],
  };
  if (day === "sun") return {
    hours: "06:45–22:30",
    duration: "15 h 45 min",
    min: 80,
    max: 105,
    breakdown: ["Ferry rápido ida y vuelta: 17 €", "Ġgantija: 10 €", "Autobuses: ≈ 6–8 €", "Taxi Xlendi–Mġarr: ≈ 13–18 € por persona", "Comida y cena: ≈ 33–49 €"],
  };
  return mondayPlan === "popeye" ? {
    hours: "08:00–17:00",
    duration: "9 h hasta salir al aeropuerto",
    min: 70,
    max: 100,
    breakdown: ["Popeye Village: 15 €", "Comida: ≈ 15–28 €", "Taxis Sliema–Anchor Bay–Mellieħa–aeropuerto: ≈ 40–57 € por persona"],
  } : {
    hours: "09:00–17:00",
    duration: "8 h hasta salir al aeropuerto",
    min: 25,
    max: 45,
    breakdown: ["Comida: ≈ 6–16 €", "Taxis Sliema–Mdina y Rabat–aeropuerto: ≈ 19–29 € por persona"],
  };
}

export function tripBudget(includeMuseum: boolean, mondayPlan: MondayPlan) {
  const days: DayId[] = ["sat", "sun", "mon"];
  const estimates = days.map((day) => dayBudget(day, includeMuseum, mondayPlan));
  return {
    min: estimates.reduce((sum, item) => sum + item.min, 0),
    max: estimates.reduce((sum, item) => sum + item.max, 0),
    duration: mondayPlan === "popeye" ? "36 h 15 min de itinerario" : "35 h 15 min de itinerario",
  };
}
