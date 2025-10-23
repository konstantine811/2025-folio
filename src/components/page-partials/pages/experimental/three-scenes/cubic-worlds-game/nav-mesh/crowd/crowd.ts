// crowd.ts
import { NavMesh, Crowd } from "recast-navigation";

export function createCrowd(navMesh: NavMesh) {
  // maxAgents: скільки агентів плануєш; maxAgentRadius ≈ твій walkableRadius
  const crowd = new Crowd(navMesh, { maxAgents: 128, maxAgentRadius: 0.4 });

  // Базові параметри агента (підгін під твої BuildConfig)
  return { crowd };
}
