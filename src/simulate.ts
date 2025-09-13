export function simulate(challenge) {
  // Simple deterministic formulas
  const latency = challenge.trafficProfile.rps * 0.001; // fake rule
  const availability = 0.999; // stub
  const cost = challenge.budget * 0.8; // stub

  return { latency, availability, cost, score: Math.round(Math.random()*100) };
}
