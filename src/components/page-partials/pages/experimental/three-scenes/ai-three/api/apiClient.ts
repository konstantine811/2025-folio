const API_URL = "https://node-backend-ai-creact-objects-zoif.vercel.app";
// const LOCAL_URL = "http://localhost:3001";

export async function sendSceneCommand(userText: string) {
  const resp = await fetch(`${API_URL}/api/scene-parse`, {
    // 👈 важливо: повний бекенд URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: userText }),
  });

  if (!resp.ok) {
    throw new Error("server error");
  }

  const data = await resp.json();
  // data або {action:"none"} або щось типу:
  // {
  //   action:"create",
  //   type:"sphere",
  //   color:"#ff0000",
  //   radius:2,
  //   size:[0,0,0],
  //   position:[10,5,0]
  // }
  return data;
}
