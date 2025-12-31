import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface GeneratedObject {
  name: string;
  type: "cube" | "sphere" | "cylinder" | "plane" | "cone" | "torus";
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  material: {
    color: string;
    opacity: number;
    metalness: number;
    roughness: number;
  };
}

export interface GeneratedScene {
  name: string;
  objects: GeneratedObject[];
  lighting: {
    type: "pointLight" | "directionalLight" | "spotLight" | "ambientLight";
    position: { x: number; y: number; z: number };
    color: string;
    intensity: number;
  }[];
  cameraPosition?: { x: number; y: number; z: number };
}

export interface MaterialSuggestion {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  description: string;
}

export interface AnimationSuggestion {
  type: "bounce" | "rotate" | "float" | "pulse" | "swing" | "orbit";
  duration: number;
  keyframes: {
    frame: number;
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  }[];
  description: string;
}

const SYSTEM_PROMPT = `You are a 3D scene generation AI assistant. You help users create 3D scenes by generating structured JSON data for objects, materials, animations, and lighting.

Available primitive types: cube, sphere, cylinder, plane, cone, torus
Available light types: pointLight, directionalLight, spotLight, ambientLight

Always respond with valid JSON matching the requested schema. Be creative but practical.
Colors should be hex codes like "#ff5500".
Positions use a Y-up coordinate system where Y=0 is ground level.
Scale values should be reasonable (typically 0.5 to 5).
Rotations are in radians.`;

export async function generateSceneFromPrompt(prompt: string): Promise<GeneratedScene> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate a 3D scene based on this description: "${prompt}"

Return a JSON object with this structure:
{
  "name": "Scene name",
  "objects": [
    {
      "name": "Object name",
      "type": "cube|sphere|cylinder|plane|cone|torus",
      "position": {"x": 0, "y": 0, "z": 0},
      "rotation": {"x": 0, "y": 0, "z": 0},
      "scale": {"x": 1, "y": 1, "z": 1},
      "material": {
        "color": "#hexcolor",
        "opacity": 1,
        "metalness": 0,
        "roughness": 0.5
      }
    }
  ],
  "lighting": [
    {
      "type": "pointLight|directionalLight|spotLight|ambientLight",
      "position": {"x": 0, "y": 5, "z": 0},
      "color": "#ffffff",
      "intensity": 1
    }
  ],
  "cameraPosition": {"x": 5, "y": 3, "z": 5}
}

Create 3-10 objects that form a coherent scene. Include appropriate lighting.`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content) as GeneratedScene;
}

export async function suggestMaterials(objectDescription: string): Promise<MaterialSuggestion[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Suggest 5 different materials for this 3D object: "${objectDescription}"

Return a JSON object with this structure:
{
  "materials": [
    {
      "name": "Material name",
      "color": "#hexcolor",
      "metalness": 0-1,
      "roughness": 0-1,
      "opacity": 0-1,
      "description": "Brief description of the look"
    }
  ]
}

Include diverse options: metallic, matte, transparent, colorful, realistic.`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content || '{"materials":[]}';
  const result = JSON.parse(content);
  return result.materials || [];
}

export async function suggestAnimations(
  objectType: string,
  context: string
): Promise<AnimationSuggestion[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Suggest 4 animations for a ${objectType} object in this context: "${context}"

Return a JSON object with this structure:
{
  "animations": [
    {
      "type": "bounce|rotate|float|pulse|swing|orbit",
      "duration": 60,
      "keyframes": [
        {"frame": 0, "position": {"x": 0, "y": 0, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0}, "scale": {"x": 1, "y": 1, "z": 1}},
        {"frame": 30, "position": {"x": 0, "y": 1, "z": 0}},
        {"frame": 60, "position": {"x": 0, "y": 0, "z": 0}}
      ],
      "description": "Animation description"
    }
  ]
}

Duration is in frames (at 24fps). Create keyframes that loop smoothly.`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content || '{"animations":[]}';
  const result = JSON.parse(content);
  return result.animations || [];
}

export async function enhanceScene(
  currentScene: { objects: string[]; lighting: string[] },
  enhancement: string
): Promise<GeneratedScene> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Current scene has these objects: ${currentScene.objects.join(", ")}
And these lights: ${currentScene.lighting.join(", ")}

Enhancement requested: "${enhancement}"

Generate additional objects and lighting to enhance this scene. Return the same JSON structure as before but only include NEW objects/lights to add.`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content) as GeneratedScene;
}

export async function chatWithAssistant(
  messages: { role: "user" | "assistant"; content: string }[],
  sceneContext?: string
): Promise<string> {
  const systemMessage = sceneContext
    ? `${SYSTEM_PROMPT}\n\nCurrent scene context:\n${sceneContext}`
    : SYSTEM_PROMPT;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      ...messages,
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "I couldn't process that request.";
}

export async function generateTexturePrompt(description: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert at creating prompts for AI image generators to create seamless textures and materials for 3D objects.",
      },
      {
        role: "user",
        content: `Create a detailed prompt for generating a seamless, tileable texture based on: "${description}"

The prompt should specify:
- The texture type and pattern
- Color palette
- Surface details
- That it should be seamless/tileable
- Professional 3D game/CGI quality

Return just the prompt text, no explanation.`,
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || description;
}
