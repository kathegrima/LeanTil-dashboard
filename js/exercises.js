// js/exercises.js

// Libreria esercizi da sedia (focus collo/spalle/schiena)
export const EXERCISES = {
  "chin-tuck": {
    id: "chin-tuck",
    name: "Chin tuck",
    areas: ["neck"],
    duration: 30, // secondi
    image: "./assets/exercises/chin-tuck.svg",
    description: "Rientra leggermente il mento mantenendo lo sguardo in avanti.",
    steps: [
      "Siediti dritto con le spalle rilassate.",
      "Guarda avanti, senza inclinare la testa.",
      "Porta delicatamente il mento indietro, come per creare un leggero doppio mento.",
      "Mantieni 3 secondi e rilascia.",
      "Ripeti lentamente per tutta la durata."
    ]
  },
  "neck-release-left": {
    id: "neck-release-left",
    name: "Neck release sinistra",
    areas: ["neck"],
    duration: 25,
    image: "./assets/exercises/neck-release-left.svg",
    description: "Allunga il lato destro del collo inclinando la testa a sinistra.",
    steps: [
      "Siediti con la schiena neutra.",
      "Lascia scendere la spalla destra.",
      "Inclina lentamente l’orecchio verso la spalla sinistra.",
      "Mantieni senza ruotare il mento, respirando lentamente."
    ]
  },
  "neck-release-right": {
    id: "neck-release-right",
    name: "Neck release destra",
    areas: ["neck"],
    duration: 25,
    image: "./assets/exercises/neck-release-right.svg",
    description: "Allunga il lato sinistro del collo inclinando la testa a destra.",
    steps: [
      "Siediti con la schiena neutra.",
      "Lascia scendere la spalla sinistra.",
      "Inclina lentamente l’orecchio verso la spalla destra.",
      "Mantieni senza ruotare il mento, respirando lentamente."
    ]
  },
  "levator-left": {
    id: "levator-left",
    name: "Levator stretch sinistra",
    areas: ["neck", "shoulders"],
    duration: 25,
    image: "./assets/exercises/levator-left.svg",
    description: "Allungamento diagonale del collo verso la spalla sinistra.",
    steps: [
      "Ruota leggermente il viso verso l’ascella sinistra.",
      "Abbassa il mento in diagonale verso il basso.",
      "Mantieni la spalla destra rilassata.",
      "Respira lentamente e non forzare l’ampiezza."
    ]
  },
  "levator-right": {
    id: "levator-right",
    name: "Levator stretch destra",
    areas: ["neck", "shoulders"],
    duration: 25,
    image: "./assets/exercises/levator-right.svg",
    description: "Allungamento diagonale del collo verso la spalla destra.",
    steps: [
      "Ruota leggermente il viso verso l’ascella destra.",
      "Abbassa il mento in diagonale verso il basso.",
      "Mantieni la spalla sinistra rilassata.",
      "Respira lentamente e non forzare l’ampiezza."
    ]
  },
  "shoulder-rolls": {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    areas: ["shoulders", "neck"],
    duration: 30,
    image: "./assets/exercises/shoulder-rolls.svg",
    description: "Rotazioni lente delle spalle per sciogliere la tensione.",
    steps: [
      "Siediti diritto, con le braccia rilassate lungo i fianchi.",
      "Solleva leggermente le spalle verso le orecchie.",
      "Ruotale indietro in un cerchio ampio e lento.",
      "Continua il movimento in modo fluido per tutta la durata."
    ]
  },
  "shoulder-blade-squeeze": {
    id: "shoulder-blade-squeeze",
    name: "Scapole indietro",
    areas: ["shoulders", "back"],
    duration: 30,
    image: "./assets/exercises/shoulder-blade-squeeze.svg",
    description: "Stringi dolcemente le scapole per aprire il torace.",
    steps: [
      "Siediti alto sul bacino, piedi appoggiati a terra.",
      "Porta le scapole indietro e leggermente in basso, come per avvicinarle.",
      "Mantieni 3–5 secondi, poi rilascia.",
      "Ripeti in modo controllato per tutta la durata."
    ]
  },
  "chair-cat-cow": {
    id: "chair-cat-cow",
    name: "Chair cat-cow",
    areas: ["back", "neck"],
    duration: 35,
    image: "./assets/exercises/chair-cat-cow.svg",
    description: "Mobilità dolce di schiena e collo restando seduto.",
    steps: [
      "Metti le mani sulle cosce, piedi ben appoggiati.",
      "Inspira, apri il petto e guarda leggermente in alto (cow).",
      "Espira, arrotonda la schiena e lascia scendere il mento verso il petto (cat).",
      "Alterna lentamente questi due movimenti."
    ]
  }
};

// Costruisce una routine in base alla postura e alle preferenze
export function buildRoutine(postureName, prefs) {
  const allowNeck = !!prefs.focusNeck;
  const allowShoulders = !!prefs.focusShoulders;
  const allowBack = !!prefs.focusBack;

  const filterByPrefs = (ids) =>
    ids
      .map((id) => EXERCISES[id])
      .filter(Boolean)
      .filter((ex) => {
        if (ex.areas.includes("neck") && allowNeck) return true;
        if (ex.areas.includes("shoulders") && allowShoulders) return true;
        if (ex.areas.includes("back") && allowBack) return true;
        return false;
      });

  const normalized = (postureName || "").toUpperCase();

  if (normalized === "SLOUCH" || normalized.includes("SLOUCH")) {
    return {
      reason: "Stai rimanendo in SLOUCH da troppo tempo.",
      exercises: filterByPrefs(["chin-tuck", "shoulder-blade-squeeze"])
    };
  }

  if (normalized === "LEANLEFT" || normalized.includes("SINISTRA") || normalized.includes("LEFT")) {
    return {
      reason: "Sei inclinato a sinistra da alcuni minuti.",
      exercises: filterByPrefs(["neck-release-right", "levator-right", "shoulder-rolls"])
    };
  }

  if (normalized === "LEANRIGHT" || normalized.includes("DESTRA") || normalized.includes("RIGHT")) {
    return {
      reason: "Sei inclinato a destra da alcuni minuti.",
      exercises: filterByPrefs(["neck-release-left", "levator-left", "shoulder-rolls"])
    };
  }

  if (normalized === "LEANBACK" || normalized.includes("INDIETRO") || normalized.includes("BACK")) {
    return {
      reason: "Stai restando appoggiato indietro a lungo.",
      exercises: filterByPrefs(["chair-cat-cow", "chin-tuck"])
    };
  }

  if (normalized === "FIDGET") {
    return {
      reason: "Stai cambiando spesso posizione: facciamo una micro-pausa.",
      exercises: filterByPrefs(["shoulder-rolls", "chin-tuck"])
    };
  }

  return {
    reason: "Sei seduto da un po’: facciamo una pausa attiva breve.",
    exercises: filterByPrefs(["chin-tuck", "shoulder-rolls", "chair-cat-cow"])
  };
}

// Calcola la durata totale di una routine
export function totalRoutineSeconds(exercises) {
  if (!Array.isArray(exercises)) return 0;
  return exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
}
