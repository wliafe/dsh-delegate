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
		const styles = {
			section: {
				display: "flex",
				flexDirection: "column",
				gap: 16,
				maxWidth: 760,
				color: "var(--dsw-alias-label-primary)"
			},
			header: {
				display: "flex",
				flexDirection: "column",
				gap: 4
			},
			title: {
				margin: 0,
				fontSize: 16,
				lineHeight: "24px",
				fontWeight: 500,
				color: "var(--dsw-alias-label-primary)"
			},
			subtitle: {
				margin: 0,
				fontSize: 13,
				lineHeight: "20px",
				color: "var(--dsw-alias-label-tertiary)"
			},
			card: {
				background: "var(--dsw-alias-bg-module-platform)",
				border: "0.5px solid var(--dsw-alias-border-l2)",
				borderRadius: "var(--dsw-radius-xl, 12px)",
				padding: "0 16px"
			},
			row: {
				padding: "16px 0",
				display: "flex",
				flexDirection: "column",
				gap: 12
			},
			rowSplit: {
				padding: "16px 0",
				borderTop: "0.5px solid var(--dsw-alias-border-l2)",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 16
			},
			rowText: {
				display: "flex",
				flexDirection: "column",
				gap: 4,
				minWidth: 0
			},
			label: {
				fontSize: 14,
				lineHeight: "20px",
				fontWeight: 500,
				color: "var(--dsw-alias-label-primary)"
			},
			description: {
				margin: 0,
				fontSize: 12,
				lineHeight: "18px",
				color: "var(--dsw-alias-label-secondary)"
			},
			dirList: {
				display: "flex",
				flexDirection: "column",
				gap: 8
			},
			dirRow: {
				display: "flex",
				alignItems: "center",
				gap: 8
			},
			input: {
				flex: 1,
				minWidth: 0,
				height: 34,
				padding: "0 10px",
				fontSize: 13,
				lineHeight: "20px",
				color: "var(--dsw-alias-label-primary)",
				background: "var(--dsw-alias-bg-layer-1)",
				border: "0.5px solid var(--dsw-alias-border-l3)",
				borderRadius: "var(--dsw-radius-md, 8px)",
				outline: "none",
				fontFamily: "inherit",
				boxSizing: "border-box"
			},
			daysWrap: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				flexShrink: 0
			},
			daysInput: {
				width: 84,
				height: 34,
				padding: "0 10px",
				fontSize: 13,
				lineHeight: "20px",
				textAlign: "right",
				color: "var(--dsw-alias-label-primary)",
				background: "var(--dsw-alias-bg-layer-1)",
				border: "0.5px solid var(--dsw-alias-border-l3)",
				borderRadius: "var(--dsw-radius-md, 8px)",
				outline: "none",
				fontFamily: "inherit",
				boxSizing: "border-box"
			},
			unit: {
				fontSize: 13,
				color: "var(--dsw-alias-label-secondary)"
			},
			emptyHint: {
				margin: 0,
				padding: "10px 12px",
				fontSize: 12,
				lineHeight: "18px",
				color: "var(--dsw-alias-label-tertiary)",
				background: "var(--dsw-alias-bg-layer-1)",
				border: "0.5px dashed var(--dsw-alias-border-l2)",
				borderRadius: "var(--dsw-radius-md, 8px)"
			},
			ghostBtn: {
				height: 34,
				padding: "0 12px",
				fontSize: 12,
				fontWeight: 500,
				color: "var(--dsw-alias-label-secondary)",
				background: "transparent",
				border: "0.5px solid var(--dsw-alias-border-l3)",
				borderRadius: "var(--dsw-radius-md, 8px)",
				cursor: "pointer",
				flexShrink: 0,
				fontFamily: "inherit"
			},
			addBtn: {
				alignSelf: "flex-start",
				height: 32,
				padding: "0 12px",
				fontSize: 12,
				fontWeight: 500,
				color: "var(--dsw-alias-label-primary)",
				background: "transparent",
				border: "0.5px solid var(--dsw-alias-border-l3)",
				borderRadius: "var(--dsw-radius-md, 8px)",
				cursor: "pointer",
				fontFamily: "inherit"
			},
			footer: {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 12,
				paddingTop: 4
			},
			primaryBtn: {
				height: 34,
				padding: "0 16px",
				fontSize: 13,
				fontWeight: 500,
				color: "#fff",
				background: "var(--dsw-alias-state-business-primary)",
				border: "none",
				borderRadius: "var(--dsw-radius-md, 8px)",
				cursor: "pointer",
				fontFamily: "inherit"
			},
			statusText: {
				margin: 0,
				fontSize: 12,
				lineHeight: "18px"
			},
			mutedCard: {
				padding: "16px",
				fontSize: 13,
				color: "var(--dsw-alias-label-tertiary)",
				background: "var(--dsw-alias-bg-module-platform)",
				border: "0.5px solid var(--dsw-alias-border-l2)",
				borderRadius: "var(--dsw-radius-xl, 12px)"
			}
		};
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
			if (state.status === "loading") return (0, react.createElement)("div", { style: styles.section }, (0, react.createElement)("div", { style: styles.mutedCard }, "配置加载中…"));
			if (state.status === "error") return (0, react.createElement)("div", { style: styles.section }, (0, react.createElement)("div", { style: {
				...styles.mutedCard,
				color: "var(--dsw-alias-state-error-primary)"
			} }, `读不到派活的配置：${state.message}`));
			return (0, react.createElement)(Editor, { value: state.value });
		}
		/** @param {{ value: { directories?: unknown, idleDays?: unknown } }} props */
		function Editor({ value }) {
			const saved = Array.isArray(value.directories) ? value.directories.filter((item) => typeof item === "string") : [];
			const savedDays = typeof value.idleDays === "number" ? value.idleDays : 14;
			const [dirs, setDirs] = (0, react.useState)(saved);
			const [days, setDays] = (0, react.useState)(String(savedDays));
			const [note, setNote] = (0, react.useState)({
				text: "",
				ok: false
			});
			const [busy, setBusy] = (0, react.useState)(false);
			function updateDir(index, nextValue) {
				setDirs((prev) => prev.map((item, i) => i === index ? nextValue : item));
				if (note.text) setNote({
					text: "",
					ok: false
				});
			}
			function removeDir(index) {
				setDirs((prev) => prev.filter((_, i) => i !== index));
				if (note.text) setNote({
					text: "",
					ok: false
				});
			}
			function addDir() {
				setDirs((prev) => [...prev, ""]);
				if (note.text) setNote({
					text: "",
					ok: false
				});
			}
			async function save() {
				const directories = dirs.map((line) => line.trim()).filter((line) => line.length > 0);
				const idleDays = Number(days);
				if (!Number.isInteger(idleDays) || idleDays < 1) {
					setNote({
						text: "闲置天数要是大于等于 1 的整数。",
						ok: false
					});
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
					if (response.ok) {
						setDirs(directories);
						setNote({
							text: "已保存。",
							ok: true
						});
					} else setNote({
						text: typeof body.error === "string" ? body.error : "没保存成，刷新后再试。",
						ok: false
					});
				} catch {
					setNote({
						text: "没保存成，刷新后再试。",
						ok: false
					});
				} finally {
					setBusy(false);
				}
			}
			return (0, react.createElement)("div", { style: styles.section }, (0, react.createElement)("div", { style: styles.header }, (0, react.createElement)("h2", { style: styles.title }, "派活"), (0, react.createElement)("p", { style: styles.subtitle }, "在命中的工作目录中，仅保留派活相关工具并自动清理闲置子会话。")), (0, react.createElement)("div", { style: styles.card }, (0, react.createElement)("div", { style: styles.row }, (0, react.createElement)("div", { style: styles.rowText }, (0, react.createElement)("span", { style: styles.label }, "工作目录"), (0, react.createElement)("p", { style: styles.description }, "会话目录等于其中一项或在其子目录下时生效；留空表示全部关闭。")), dirs.length === 0 ? (0, react.createElement)("p", { style: styles.emptyHint }, "暂无工作目录（当前为全部关闭）") : (0, react.createElement)("div", { style: styles.dirList }, ...dirs.map((dir, index) => (0, react.createElement)("div", {
				key: index,
				style: styles.dirRow
			}, (0, react.createElement)("input", {
				type: "text",
				value: dir,
				placeholder: "/path/to/workspace",
				disabled: busy,
				onChange: (event) => updateDir(index, event.target.value),
				style: styles.input
			}), (0, react.createElement)("button", {
				type: "button",
				disabled: busy,
				onClick: () => removeDir(index),
				style: {
					...styles.ghostBtn,
					opacity: busy ? .5 : 1
				}
			}, "移除")))), (0, react.createElement)("button", {
				type: "button",
				disabled: busy,
				onClick: addDir,
				style: {
					...styles.addBtn,
					opacity: busy ? .5 : 1
				}
			}, "+ 添加目录")), (0, react.createElement)("div", { style: styles.rowSplit }, (0, react.createElement)("div", { style: styles.rowText }, (0, react.createElement)("span", { style: styles.label }, "闲置天数"), (0, react.createElement)("p", { style: styles.description }, "子会话超过这么多天未被主会话发过消息，就从列表中移除。")), (0, react.createElement)("div", { style: styles.daysWrap }, (0, react.createElement)("input", {
				type: "number",
				min: 1,
				step: 1,
				value: days,
				disabled: busy,
				onChange: (event) => {
					setDays(event.target.value);
					if (note.text) setNote({
						text: "",
						ok: false
					});
				},
				style: styles.daysInput
			}), (0, react.createElement)("span", { style: styles.unit }, "天")))), (0, react.createElement)("div", { style: styles.footer }, (0, react.createElement)("p", { style: {
				...styles.statusText,
				color: note.text ? note.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" : "transparent"
			} }, note.text || " "), (0, react.createElement)("button", {
				type: "button",
				disabled: busy,
				onClick: () => {
					save();
				},
				style: {
					...styles.primaryBtn,
					opacity: busy ? .5 : 1,
					cursor: busy ? "not-allowed" : "pointer"
				}
			}, busy ? "保存中…" : "保存")));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map