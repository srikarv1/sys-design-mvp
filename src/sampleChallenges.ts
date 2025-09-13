export const sampleChallenges = [
  {
    id: 'c1',
    prompt: 'Design image sharing for 2M DAU',
    trafficProfile: { rps: 15000 },
    budget: 3000,
    mustHaves: ['CDN', 'Cache', 'Read Replicas', 'Queue'],
    antiPatterns: ['Single-AZ DB']
  },
  {
    id: 'c2',
    prompt: 'Design feed for 10M DAU',
    trafficProfile: { rps: 50000 },
    budget: 5000,
    mustHaves: ['Sharding', 'Cache'],
    antiPatterns: ['Cache-as-sole-storage']
  }
];
