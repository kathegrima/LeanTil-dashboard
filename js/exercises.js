// js/exercises.js

export const EXERCISES = {

  "chin-tuck": {
    id: "chin-tuck",
    name: "Chin tuck",
    areas: ["neck"],
    duration: 30,
    image: "./assets/exercises/turtle-chin-tuck.jpg",
    description: "Rientra il mento per allineare la cervicale e ridurre la tensione del collo.",
    steps: [
      "Siediti dritto con le spalle rilassate.",
      "Guarda avanti senza inclinare la testa.",
      "Porta delicatamente il mento indietro, come a creare un leggero doppio mento.",
      "Mantieni 3 secondi, poi rilascia lentamente.",
      "Ripeti per tutta la durata."
    ]
  },

  "neck-retraction": {
    id: "neck-retraction",
    name: "Neck retraction",
    areas: ["neck"],
    duration: 25,
    image: "./assets/exercises/turtle.jpg",
    description: "Ritrai il collo come una tartaruga per decomprimere le vertebre cervicali.",
    steps: [
      "Siediti con la schiena neutra e gli occhi in avanti.",
      "Senza abbassare il mento, porta la testa indietro orizzontalmente.",
      "Senti lo stiramento alla base del collo.",
      "Mantieni 2–3 secondi e torna alla posizione di partenza."
    ]
  },

  "neck-release-left": {
    id: "neck-release-left",
    name: "Neck release sinistra",
    areas: ["neck"],
    duration: 25,
    image: "./assets/exercises/side-neck-stretch.jpg",
    description: "Allunga il lato destro del collo inclinando la testa a sinistra.",
    steps: [
      "Siediti con la schiena neutra.",
      "Lascia scendere la spalla destra, tienila giù.",
      "Inclina lentamente l'orecchio sinistro verso la spalla sinistra.",
      "Mantieni senza ruotare il mento, respirando lentamente.",
      "Ripeti sull'altro lato."
    ]
  },

  "neck-release-right": {
    id: "neck-release-right",
    name: "Neck release destra",
    areas: ["neck"],
    duration: 25,
    image: "./assets/exercises/side-neck-stretch.jpg",
    description: "Allunga il lato sinistro del collo inclinando la testa a destra.",
    steps: [
      "Siediti con la schiena neutra.",
      "Lascia scendere la spalla sinistra, tienila giù.",
      "Inclina lentamente l'orecchio destro verso la spalla destra.",
      "Mantieni senza ruotare il mento, respirando lentamente.",
      "Ripeti sull'altro lato."
    ]
  },

  "seated-twist": {
    id: "seated-twist",
    name: "Seated spinal twist",
    areas: ["back", "neck"],
    duration: 35,
    image: "./assets/exercises/twist.jpg",
    description: "Rotazione del busto per mobilizzare la colonna e scaricare le tensioni.",
    steps: [
      "Siediti dritto con i piedi ben appoggiati a terra.",
      "Metti la mano destra sul ginocchio sinistro.",
      "Ruota lentamente il busto e la testa verso sinistra.",
      "Mantieni 3–4 respiri profondi.",
      "Torna al centro e ripeti sull'altro lato."
    ]
  },

  "forward-bend": {
    id: "forward-bend",
    name: "Forward bend",
    areas: ["back", "neck"],
    duration: 30,
    image: "./assets/exercises/forward_bend.jpg",
    description: "Piegamento in avanti per allungare la schiena e decomprimere il collo.",
    steps: [
      "Siediti sul bordo della sedia, piedi a terra larghezza fianchi.",
      "Espira e piegati lentamente in avanti, lasciando cadere le braccia.",
      "Lascia che la testa penda pesante verso il basso.",
      "Mantieni 4–5 respiri.",
      "Risali lentamente vertebra per vertebra."
    ]
  },

  "hip-opener": {
    id: "hip-opener",
    name: "Hip opener da sedia",
    areas: ["back"],
    duration: 30,
    image: "./assets/exercises/hip-opener.jpg",
    description: "Apertura dell'anca da seduto per ridurre la tensione lombare.",
    steps: [
      "Siediti dritto con i piedi appoggiati a terra.",
      "Porta la caviglia destra sopra il ginocchio sinistro a formare un '4'.",
      "Tieni la schiena dritta e inclinati leggermente in avanti.",
      "Senti lo stiramento nel gluteo e nell'anca destra.",
      "Mantieni 4–5 respiri e cambia lato."
    ]
  }

};

// Costruisce la routine in base a postura e preferenze
export function buildRoutine(postureName, prefs) {
  const allowNeck = !!prefs.focusNeck;
  const allowShoulders = !!prefs.focusShoulders; // attualmente usato come fallback
  const allowBack = !!prefs.focusBack;

  const pick = (ids) =>
    ids
      .map((id) => EXERCISES[id])
      .filter(Boolean)
      .filter((ex) => {
        if (ex.areas.includes("neck") && allowNeck) return true;
        if (ex.areas.includes("back") && allowBack) return true;
        // shoulders non ha esercizi dedicati ora, ma non blocca
        return false;
      });

  const n = (postureName || "").toUpperCase();

  // SLOUCH → collo in avanti, chin tuck + neck retraction
  if (n === "SLOUCH" || n.includes("SLOUCH")) {
    return {
      reason: "Sei rimasto in SLOUCH da troppo tempo.",
      exercises: pick(["chin-tuck", "neck-retraction", "forward-bend"])
    };
  }

  // Inclinato a sinistra → allunga il lato destro
  if (n === "LEANLEFT" || n.includes("SINISTRA") || n.includes("LEFT")) {
    return {
      reason: "Sei inclinato a sinistra da alcuni minuti.",
      exercises: pick(["neck-release-right", "chin-tuck", "seated-twist"])
    };
  }

  // Inclinato a destra → allunga il lato sinistro
  if (n === "LEANRIGHT" || n.includes("DESTRA") || n.includes("RIGHT")) {
    return {
      reason: "Sei inclinato a destra da alcuni minuti.",
      exercises: pick(["neck-release-left", "chin-tuck", "seated-twist"])
    };
  }

  // Appoggiato indietro → schiena e collo
  if (n === "LEANBACK" || n.includes("INDIETRO") || n.includes("BACK")) {
    return {
      reason: "Sei rimasto appoggiato indietro a lungo.",
      exercises: pick(["forward-bend", "neck-retraction", "hip-opener"])
    };
  }

  // FIDGET → micro-pausa veloce
  if (n === "FIDGET") {
    return {
      reason: "Stai cambiando spesso posizione: micro-pausa.",
      exercises: pick(["chin-tuck", "neck-release-left"])
    };
  }

  // Default: seduto da troppo tempo (timer trigger)
  return {
    reason: "Sei seduto da un po': pausa attiva breve.",
    exercises: pick(["chin-tuck", "seated-twist", "hip-opener"])
  };
}

// Durata totale della routine in secondi
export function totalRoutineSeconds(exercises) {
  if (!Array.isArray(exercises)) return 0;
  return exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
}
