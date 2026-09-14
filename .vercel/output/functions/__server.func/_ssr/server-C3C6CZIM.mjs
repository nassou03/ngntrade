import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-C3C6CZIM.js
var analyzeChart = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("49e390d9bf5618ec9f7d49d5eae8ebb4c93820eb250625e8501a7cb25708cdc5"));
var askCopilot = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("bd89eb35a216569b66a0fbcc87e7bdddd9a91bb624a6db640ad2d17bd5b88994"));
//#endregion
export { askCopilot as n, analyzeChart as t };
