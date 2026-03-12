// js/exercises.js

export const EXERCISES = {

  "chin-tuck": {
    id: "chin-tuck",
    name: "Chin Tuck",
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
    name: "Neck Retraction",
    areas: ["neck"],
    duration: 25,
    image: "./assets/exercises/turtle.jpg",
    description: "Ritrai il collo come una tartaruga per decomprimere le vertebre cervicali.",
    steps: [
      "Siediti con la schiena neutra e gli occhi in avanti.",
      "Senza abbassare il mento, porta la testa indietro.",
      "Immagina di voler toccare il muro dietro di te con la nuca.",
      "Mantieni 5 secondi, poi rilascia.",
      "Ripeti lentamente."
    ]
  },

  "neck-release-left": {
    id: "neck-release-left",
    name: "Neck Release (Left)",
    areas: ["neck"],
    duration: 20,
    image: "./assets/exercises/side-neck-stretch.jpg",
    description: "Allunga delicatamente il collo verso sinistra per rilasciare tensioni.",
    steps: [
      "Siediti dritto e rilassa le spalle.",
      "Inclina la testa verso la spalla sinistra.",
      "Senti l'allungamento sul lato destro del collo.",
      "Mantieni 15-20 secondi senza forzare.",
      "Torna al centro lentamente."
    ]
  },

  "neck-release-right": {
    id: "neck-release-right",
    name: "Neck Release (Right)",
    areas: ["neck"],
    duration: 20,
    image: "./assets/exercises/side-neck-stretch.jpg",
    description: "Allunga delicatamente il collo verso destra per rilasciare tensioni.",
    steps: [
      "Siediti dritto e rilassa le spalle.",
      "Inclina la testa verso la spalla destra.",
      "Senti l'allungamento sul lato sinistro del collo.",
      "Mantieni 15-20 secondi senza forzare.",
      "Torna al centro lentamente."
    ]
  },

  "seated-twist": {
    id: "seated-twist",
    name: "Seated Spinal Twist",
    areas: ["back"],
    duration: 30,
    image: "./assets/exercises/twist.jpg",
    description: "Ruota dolcemente il busto per mobilizzare la colonna vertebrale.",
    steps: [
      "Siediti dritto con i piedi a terra.",
      "Ruota il busto verso destra, porta la mano sinistra fuori dalla coscia destra.",
      "Mantieni 10-15 secondi respirando profondamente.",
      "Torna al centro e ripeti dall'altro lato.",
      "Alterna per tutta la durata."
    ]
  },

  "forward-bend": {
    id: "forward-bend",
    name: "Seated Forward Bend",
    areas: ["back"],
    duration: 30,
    image: "./assets/exercises/forward_bend.jpg",
    description: "Piegati in avanti dalla sedia per allungare la schiena e rilassare la tensione.",
    steps: [
      "Siediti sul bordo della sedia con i piedi ben piantati.",
      "Lascia cadere lentamente il busto tra le ginocchia.",
      "Lascia pendere le braccia verso il pavimento.",
      "Respira profondamente e senti l'allungamento della schiena.",
      "Rimani 20-30 secondi, poi risali lentamente."
    ]
  },

  "hip-opener": {
    id: "hip-opener",
    name: "Seated Hip Opener",
    areas: ["back"],
    duration: 30,
    image: "./assets/exercises/hip-opener.jpg",
    description: "Apri i fianchi e rilassa la zona lombare da seduto.",
    steps: [
      "Siediti dritto sulla sedia.",
      "Incrocia la caviglia destra sul ginocchio sinistro.",
      "Mantieni la schiena dritta e spingi delicatamente il ginocchio destro verso il basso.",
      "Senti l'apertura nel fianco destro per 15 secondi.",
      "Cambia lato e ripeti."
    ]
  }

};

// ============ ROUTINE BUILDER ============

export function buildRoutine(postureName, prefs) {
  const areas = [];
  if (prefs.focusNeck) areas.push("neck");
  if (prefs.focusShoulders) areas.push("shoulders");
  if (prefs.focusBack) areas.push("back");

  if (areas.length === 0) {
    return {
      reason: "No focus areas selected.",
      exercises: []
    };
  }

  let reason = "General seated routine.";
  let pool = Object.values(EXERCISES);

  // Filtra per posture persistenti
  if (["SLOUCH", "LEANLEFT", "LEANRIGHT", "LEANBACK", "FIDGET"].includes(postureName)) {
    reason = `Detected persistent ${postureName.toLowerCase()} posture.`;
    
    if (postureName === "SLOUCH" || postureName === "LEANBACK") {
      pool = pool.filter((ex) => ex.areas.includes("back") || ex.areas.includes("neck"));
    } else if (postureName === "LEANLEFT" || postureName === "LEANRIGHT") {
      pool = pool.filter((ex) => ex.areas.includes("back"));
    } else if (postureName === "FIDGET") {
      pool = pool.filter((ex) => ex.areas.includes("neck"));
    }
  }

  // Filtra per aree selezionate
  pool = pool.filter((ex) => ex.areas.some((a) => areas.includes(a)));

  // Seleziona 3-5 esercizi casuali
  const count = Math.floor(Math.random() * 3) + 3;
  const selected = [];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    selected.push(shuffled[i]);
  }

  return {
    reason,
    exercises: selected
  };
}

export function totalRoutineSeconds(routine) {
  if (!routine || !routine.exercises) return 0;
  return routine.exercises.reduce((sum, ex) => sum + ex.duration, 0);
}
