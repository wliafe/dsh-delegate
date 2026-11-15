window.__ModuleLoader__.load({
	id: "dsh-delegate",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		// client.js
		/** 设置侧边栏里的一节：工作目录和闲置天数。数据走宿主端自己的路由，不走平台配置表。 */
		const inject = ["slots"];
		const SECTION = "delegate";
		const PATH = "delegate/config";
		/** @param {import('@deepseek-ai/cordis').Context} ctx */
		function apply(ctx) {
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: SECTION,
				order: 40,
				label: () => "派活"
			}, () => (0, react.createElement)(DelegateSection))), "delegate: settings section");
		}
		function DelegateSection() {
			const [state, setState] = (0, react.useState)({ status: "loading" });
			(0, react.useEffect)(() => {
				let gone = false;
				fetch(PATH, { headers: { accept: "application/json" } }).then(async (response) => {
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					return response.json();
				}).then((value) => {
					if (!gone) setState({
						status: "ready",
						value
					});
				}).catch((error) => {
					if (!gone) setState({
						status: "error",
						message: error instanceof Error ? error.message : "读取失败。"
					});
				});
				return () => {
					gone = true;
				};
			}, []);
			if (state.status === "loading") return (0, react.createElement)("p", null, "配置加载中。");
			if (state.status === "error") return (0, react.createElement)("p", null, `读不到派活的配置：${state.message}`);
			return (0, react.createElement)(Editor, { value: state.value });
		}
		/** @param {{ value: { directories?: unknown, idleDays?: unknown } }} props */
		function Editor({ value }) {
			const saved = Array.isArray(value.directories) ? value.directories.filter((item) => typeof item === "string") : [];
			const savedDays = typeof value.idleDays === "number" ? value.idleDays : 14;
			const [text, setText] = (0, react.useState)(saved.join("\n"));
			const [days, setDays] = (0, react.useState)(String(savedDays));
			const [note, setNote] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			async function save() {
				const directories = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
				const idleDays = Number(days);
				if (!Number.isInteger(idleDays) || idleDays < 1) {
					setNote("闲置天数要是大于等于 1 的整数。");
					return;
				}
				setBusy(true);
				try {
					const response = await fetch(PATH, {
						method: "POST",
						headers: {
							"content-type": "application/json",
							accept: "application/json"
						},
						body: JSON.stringify({
							directories,
							idleDays
						})
					});
					const body = await response.json().catch(() => ({}));
					setNote(response.ok ? "已保存。" : typeof body.error === "string" ? body.error : "没保存成，刷新后再试。");
				} catch {
					setNote("没保存成，刷新后再试。");
				} finally {
					setBusy(false);
				}
			}
			return (0, react.createElement)("div", { style: {
				display: "flex",
				flexDirection: "column",
				gap: 8,
				maxWidth: 560
			} }, (0, react.createElement)("label", null, "工作目录，一行一个。空着表示全关。"), (0, react.createElement)("textarea", {
				value: text,
				rows: 6,
				disabled: busy,
				onChange: (event) => setText(event.target.value),
				style: { fontFamily: "inherit" }
			}), (0, react.createElement)("label", null, "闲置天数"), (0, react.createElement)("input", {
				value: days,
				disabled: busy,
				onChange: (event) => setDays(event.target.value)
			}), (0, react.createElement)("button", {
				type: "button",
				disabled: busy,
				onClick: () => {
					save();
				}
			}, "保存"), note === "" ? null : (0, react.createElement)("p", null, note));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map