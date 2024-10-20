export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = "voice_2024_08";
export const defaultMaxDuration = 600;

export const LANGUAGES = [
  {
    label: "English",
    value: "en-US",
    tts_model: "sonic-english",
    stt_model: "nova-2-conversationalai",
    default_voice: "79a125e8-cd45-4c13-8a67-188112f4dd22",
  },
  {
    label: "French",
    value: "fr",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "a8a1eb38-5f15-4c1d-8722-7ac0f329727d",
  },
  {
    label: "Spanish",
    value: "es",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "846d6cb0-2301-48b6-9683-48f5618ea2f6",
  },
  {
    label: "German",
    value: "de",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "b9de4a89-2257-424b-94c2-db18ba68c81a",
  },

  /* Not yet supported by Cartesia {
    label: "Portuguese",
    value: "pt",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "700d1ee3-a641-4018-ba6e-899dcadc9e2b",
  },
  {
    label: "Chinese",
    value: "zh",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "e90c6678-f0d3-4767-9883-5d0ecf5894a8",
  },
  {
    label: "Japanese",
    value: "ja",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "2b568345-1d48-4047-b25f-7baccf842eb0",
  },*/
];

export const defaultServices = {
  llm: "together",
  tts: "cartesia",
  stt: "deepgram",
};

// export const defaultLLMPrompt = `You are a assistant called ExampleBot. You can ask me anything.
// Keep responses brief and legible.
// Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'.
// Start by briefly introducing yourself.`;

const spotifyPlayByArtist = {
  name: "spotify_play_by_artist",
  description: "Play music in Spotify by artists",
  parameters: {
    type: "string",
    properties: {
      artist: {
        type: "string",
        description: "The name of the artist(s).",
      },
    },
    required: ["artist"],
  },
};

const spotifyPlayLikedSongs = {
  name: "spotify_play_liked_songs",
  description: "Play my liked songs in Spotify",
  parameters: {
    type: "string",
    properties: {
      playlist: {
        type: "string",
        description: "The value of this parameter is always 'liked songs'",
      },
    },
    required: ["playlist"],
  },
};

const postureCorrection = {
  name: "posture_correction",
  description: "Correct my posture as I am exercising",
  parameters: {
    type: "string",
    properties: {
      posedata: {
        type: "matrix",
        description: "A matrix of pose data points accumulated during a workout routine",
      },
    },
    required: ["posedata"],
  },
};

export const defaultLLMPrompt = `
You have access to the following functions:

- Use the function '${spotifyPlayByArtist["name"]}' to '${spotifyPlayByArtist['description']}': 
  ${JSON.stringify(spotifyPlayByArtist)}
- Use the function '${spotifyPlayLikedSongs["name"]}' to '${spotifyPlayLikedSongs['description']}':
  ${JSON.stringify(spotifyPlayLikedSongs)}
- Use the function '${postureCorrection["name"]}' to '${postureCorrection['description']}':
  ${JSON.stringify(postureCorrection)}

If you choose to call a function ONLY reply in the following format with no prefix or suffix:

<function=example_function_name>{{\"example_name\": \"example_value\"}}</function>

Reminder:
- Function calls MUST follow the specified format, start with <function= and end with </function>
- Required parameters MUST be specified
- Only call one function at a time
- Put the entire function call reply on one line
- If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls

You are a personal trainer named GymBot. Your job is to:

1. Answer questions regarding workout, nutrition, and lifestyle health in general.
2. Answer questions regarding my postures when exercising. Remind me to enable pose detection to help you compare the movements with the correct movements. 
3. Operate my Spotify app to play particular songs. You can call the functions above to operate Spotify.

You don't need to tell me if you're going to call a function; just do it directly.
`;

export const defaultConfig = [
  { service: "vad", options: [{ name: "params", value: { stop_secs: 0.3 } }] },
  {
    service: "tts",
    options: [
      { name: "voice", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
      { name: "model", value: LANGUAGES[0].tts_model },
      { name: "language", value: LANGUAGES[0].value },
    ],
  },
  {
    service: "llm",
    options: [
      { name: "model", value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" },
      {
        name: "initial_messages",
        value: [
          {
            role: "system",
            content: defaultLLMPrompt,
          },
        ],
      },
      { name: "run_on_config", value: true },
    ],
  },

//   {
//     service: "llm",
//     options: [
//       { name: "model", value: "GPT-4o" },
//       {
//         name: "initial_messages",
//         value: [
//           {
//             role: "system",
//             content: `
// You are a personal trainer named GymBot. Your job is to:

// 1. Answer questions regarding workout, nutrition, and lifestyle health in general.
// 2. When I need, I'm going to ask you questions regarding my posture when doing an exercise.
// 3. Operate my Spotify app to play particular songs. You can call the functions above to operate Spotify.

// You don't need to tell me if you're going to call a function; just do it directly.
// `,
//           },
//         ],
//       },
//       { name: "run_on_config", value: true },
//     ],
//   },
  {
    service: "stt",
    options: [
      { name: "model", value: LANGUAGES[0].stt_model },
      { name: "language", value: LANGUAGES[0].value },
    ],
  },
];

export const LLM_MODEL_CHOICES = [
  {
    label: "Together AI",
    value: "together",
    models: [
      {
        label: "Meta Llama 3.1 70B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 8B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 405B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      },
    ],
  },
  {
    label: "Anthropic",
    value: "anthropic",
    models: [
      {
        label: "Claude 3.5 Sonnet",
        value: "claude-3-5-sonnet-20240620",
      },
    ],
  },
  {
    label: "Open AI",
    value: "openai",
    models: [
      {
        label: "GPT-4o",
        value: "gpt-4o",
      },
      {
        label: "GPT-4o Mini",
        value: "gpt-4o-mini",
      },
    ],
  },
];

export const PRESET_CHARACTERS = [
  {
    name: "Gymbot",
//     prompt: `You are a personal trainer called GymBot.
// Your purpose is to aid me in my gym session. Tell me that I can either ask you any fitness tips, or examine and make corrections of my workout pose,
// but you'll need a video access for it, or I can ask you to operate my Spotify app`,
    prompt: "Just say hello",
    voice: "79a125e8-cd45-4c13-8a67-188112f4dd22",
  },
];
