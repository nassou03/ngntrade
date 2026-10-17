import "../_runtime.mjs";
import { t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm text-foreground placeholder:text-subtle transition-[border-color,box-shadow] duration-quick ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-input bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-subtle transition-[border-color,box-shadow] duration-quick ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-muted-foreground", className),
		...props
	});
}
//#endregion
export { Label as n, Textarea as r, Input as t };
