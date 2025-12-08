const API_URL = "https://node-backend-ai-creact-objects-zoif.vercel.app";
const LOCAL_URL = "http://localhost:3001";

export enum ApiEndpoints {
  SCENE_PARSE = "scene-parse",
  CONTACT = "contact",
}

export async function sendNodeBackendRequest(
  userText: string,
  endpoint: ApiEndpoints,
  isLocal: boolean = false
) {
  const resp = await fetch(`${isLocal ? LOCAL_URL : API_URL}/api/${endpoint}`, {
    // 👈 важливо: повний бекенд URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: userText }),
  });

  if (!resp.ok) {
    throw new Error("server error");
    return "server error";
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

export async function sendSceneCommand(userText: string) {
  return sendNodeBackendRequest(userText, ApiEndpoints.SCENE_PARSE);
}

export async function sendContactRequest(
  payload: {
    name: string;
    email: string;
    message: string;
  },
  isLocal: boolean = false
) {
  return sendNodeBackendRequest(
    JSON.stringify(payload),
    ApiEndpoints.CONTACT,
    isLocal
  );
}
