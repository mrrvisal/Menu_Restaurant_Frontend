// One-off: extract the original MENU_TEMPLATES array from the built bundle
const fs = require("fs");
const path = require("path");

const bundle = path.join(
  __dirname,
  "../dist/assets/MenuStudioView-I2VQGHm3.js",
);
const s = fs.readFileSync(bundle, "utf8");

const start = s.indexOf("tt=[");
if (start < 0) throw new Error("marker tt=[ not found");

let i = start + 3; // at '['  ("t","t","=","[")
let depth = 0;
for (; i < s.length; i++) {
  const c = s[i];
  if (c === "[") depth++;
  else if (c === "]") {
    depth--;
    if (depth === 0) break;
  }
}
const lit = s.slice(start + 3, i + 1);
// `Le` is the minified alias for PHOTO_GRID_BLUE_TEMPLATE in the bundle —
// define it so the last array entry evaluates (its content is rebuilt
// separately from src/utils/photoGridBlue.mjs anyway).
const Le = {
  id: "photoGridBlue",
  nameKey: "ms_tpl_photo_grid_blue",
  descKey: "ms_tpl_photo_grid_blue_d",
  tag: "new",
  defaults: {
    columns: 3,
    fontScale: 1,
    margins: 1,
    showImages: true,
    showPrice: true,
    colors: {},
  },
};
const arr = eval(lit);

console.log("templates:", arr.length);
console.log(arr.map((t) => t.id).join(", "));
fs.writeFileSync("/tmp/old_templates.json", JSON.stringify(arr, null, 2));
console.log("written /tmp/old_templates.json");
