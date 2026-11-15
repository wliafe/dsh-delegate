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
		const TOOLS_PATH = "delegate/tools";
		/** 固定保留的 7 个工具：始终放行、在列表里勾选且禁用，仅用于展示全貌。 */
		const BASE_KEPT_TOOLS = [
			"list_agents",
			"send_message",
			"subagent",
			"schedule_create",
			"schedule_edit",
			"schedule_list",
			"schedule_view"
		];
		/**
		* 按工具名头部归类。MCP 工具（含 `__`）按前两段分组（`mcp__notion__notion-fetch` →
		* 组 `mcp__notion`、短名 `notion-fetch`）；其余按第一个下划线前的段分组；没有下划线的
		* 整个名字即一组。
		* @param {string} name 工具全名。
		* @returns {{ group: string, short: string }}
		*/
		function groupOf(name) {
			if (name.includes("__")) {
				const parts = name.split("__");
				return {
					group: parts.slice(0, 2).join("__"),
					short: parts.slice(2).join("__") || name
				};
			}
			if (name.includes("_")) return {
				group: name.split("_")[0],
				short: name
			};
			return {
				group: name,
				short: name
			};
		}
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
			rowTop: {
				padding: "16px 0",
				borderTop: "0.5px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: 8
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
			summary: {
				margin: 0,
				fontSize: 11,
				lineHeight: "16px",
				color: "var(--dsw-alias-label-secondary)"
			},
			searchWrap: {
				position: "relative",
				display: "flex",
				alignItems: "center"
			},
			searchIcon: {
				position: "absolute",
				left: 10,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "var(--dsw-alias-label-tertiary)",
				pointerEvents: "none"
			},
			searchInput: {
				flex: 1,
				minWidth: 0,
				height: 32,
				padding: "0 10px 0 32px",
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
			searchClear: {
				position: "absolute",
				right: 6,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: 22,
				height: 22,
				padding: 0,
				border: "none",
				background: "transparent",
				color: "var(--dsw-alias-label-tertiary)",
				cursor: "pointer",
				borderRadius: "var(--dsw-radius-md, 8px)"
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
			toolChip: {
				flex: 1,
				minWidth: 0,
				height: 34,
				display: "flex",
				alignItems: "center",
				padding: "0 10px",
				fontSize: 13,
				lineHeight: "20px",
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
				color: "var(--dsw-alias-label-primary)",
				background: "var(--dsw-alias-bg-layer-1)",
				border: "0.5px solid var(--dsw-alias-border-l2)",
				borderRadius: "var(--dsw-radius-md, 8px)",
				boxSizing: "border-box",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			toolList: {
				maxHeight: 280,
				overflowY: "auto",
				border: "0.5px solid var(--dsw-alias-border-l2)",
				borderRadius: "var(--dsw-radius-md, 8px)"
			},
			groupHeader: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				width: "100%",
				padding: "9px 12px",
				background: "transparent",
				border: "none",
				borderTop: "0.5px solid var(--dsw-alias-border-l2)",
				cursor: "pointer",
				textAlign: "left",
				fontFamily: "inherit"
			},
			chevron: {
				flexShrink: 0,
				width: 12,
				fontSize: 11,
				color: "var(--dsw-alias-label-tertiary)"
			},
			groupTitle: {
				flex: 1,
				minWidth: 0,
				fontSize: 13,
				lineHeight: "18px",
				fontWeight: 500,
				color: "var(--dsw-alias-label-primary)",
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			groupCount: {
				flexShrink: 0,
				fontSize: 12,
				color: "var(--dsw-alias-label-tertiary)"
			},
			toolRow: {
				display: "flex",
				alignItems: "flex-start",
				gap: 10,
				padding: "8px 12px",
				borderTop: "0.5px solid var(--dsw-alias-border-l2)"
			},
			toolRowMember: {
				display: "flex",
				alignItems: "flex-start",
				gap: 10,
				padding: "8px 12px 8px 32px",
				borderTop: "0.5px solid var(--dsw-alias-border-l2)"
			},
			toolRowMain: {
				display: "flex",
				flexDirection: "column",
				gap: 2,
				minWidth: 0,
				flex: 1
			},
			toolName: {
				fontSize: 13,
				lineHeight: "18px",
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
				color: "var(--dsw-alias-label-primary)",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			toolDesc: {
				margin: 0,
				fontSize: 12,
				lineHeight: "16px",
				color: "var(--dsw-alias-label-tertiary)",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			fixedTag: {
				flexShrink: 0,
				alignSelf: "center",
				padding: "0 6px",
				height: 18,
				lineHeight: "18px",
				fontSize: 11,
				color: "var(--dsw-alias-label-tertiary)",
				background: "var(--dsw-alias-border-l1, rgba(0,0,0,0.05))",
				borderRadius: 6
			},
			checkbox: {
				marginTop: 2,
				flexShrink: 0,
				width: 15,
				height: 15,
				accentColor: "var(--dsw-alias-state-business-primary)",
				cursor: "pointer"
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
			switchTrack: {
				position: "relative",
				width: 40,
				height: 22,
				borderRadius: 11,
				border: "none",
				padding: 0,
				flexShrink: 0,
				transition: "background .15s"
			},
			switchKnob: {
				position: "absolute",
				top: 2,
				width: 18,
				height: 18,
				borderRadius: "50%",
				background: "#fff",
				boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
				transition: "left .15s"
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
		/** @param {{ value: { directories?: unknown, idleDays?: unknown, skipScheduled?: unknown, keepTools?: unknown } }} props */
		function Editor({ value }) {
			const saved = Array.isArray(value.directories) ? value.directories.filter((item) => typeof item === "string") : [];
			const savedDays = typeof value.idleDays === "number" ? value.idleDays : 14;
			const savedSkip = typeof value.skipScheduled === "boolean" ? value.skipScheduled : true;
			const savedKeep = Array.isArray(value.keepTools) ? value.keepTools.filter((item) => typeof item === "string") : [];
			const [dirs, setDirs] = (0, react.useState)(saved);
			const [days, setDays] = (0, react.useState)(String(savedDays));
			const [skip, setSkip] = (0, react.useState)(savedSkip);
			const [extraTools, setExtraTools] = (0, react.useState)(savedKeep);
			const [search, setSearch] = (0, react.useState)("");
			const [searchFocus, setSearchFocus] = (0, react.useState)(false);
			const searchInputRef = (0, react.useRef)(null);
			const [overrides, setOverrides] = (0, react.useState)({});
			const [allTools, setAllTools] = (0, react.useState)({
				status: "loading",
				list: [],
				message: ""
			});
			const [note, setNote] = (0, react.useState)({
				text: "",
				ok: false
			});
			const [busy, setBusy] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let gone = false;
				fetch(TOOLS_PATH, { headers: { accept: "application/json" } }).then(async (response) => {
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					return response.json();
				}).then((body) => {
					if (gone) return;
					const list = Array.isArray(body.tools) ? body.tools.filter((tool) => tool && typeof tool.name === "string").map((tool) => ({
						name: tool.name,
						description: typeof tool.description === "string" ? tool.description : ""
					})) : [];
					setAllTools({
						status: "ready",
						list,
						message: ""
					});
				}).catch((error) => {
					if (!gone) setAllTools({
						status: "error",
						list: [],
						message: error instanceof Error ? error.message : "读取失败。"
					});
				});
				return () => {
					gone = true;
				};
			}, []);
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
			function toggleTool(name, checked) {
				setExtraTools((prev) => checked ? prev.includes(name) ? prev : [...prev, name] : prev.filter((item) => item !== name));
				if (note.text) setNote({
					text: "",
					ok: false
				});
			}
			async function save() {
				const directories = dirs.map((line) => line.trim()).filter((line) => line.length > 0);
				const keepTools = extraTools.map((name) => name.trim()).filter((name) => name.length > 0);
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
							idleDays,
							skipScheduled: skip,
							keepTools
						})
					});
					const body = await response.json().catch(() => ({}));
					if (response.ok) {
						setDirs(directories);
						setExtraTools(keepTools);
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
			const baseSet = new Set(BASE_KEPT_TOOLS);
			const extraSet = new Set(extraTools);
			const described = new Map(allTools.list.map((tool) => [tool.name, tool.description]));
			const fixedGroup = {
				key: "__fixed__",
				title: "固定保留",
				fixed: true,
				members: BASE_KEPT_TOOLS.map((name) => ({
					name,
					short: name,
					description: described.get(name) ?? "",
					fixed: true
				}))
			};
			const byGroup = /* @__PURE__ */ new Map();
			for (const tool of allTools.list) {
				if (baseSet.has(tool.name)) continue;
				const { group, short } = groupOf(tool.name);
				if (!byGroup.has(group)) byGroup.set(group, []);
				byGroup.get(group).push({
					name: tool.name,
					short,
					description: tool.description,
					fixed: false
				});
			}
			const prefixGroups = [...byGroup.entries()].map(([title, members]) => ({
				key: title,
				title,
				fixed: false,
				members: members.sort((a, b) => a.short.localeCompare(b.short) || a.name.localeCompare(b.name))
			})).sort((a, b) => b.members.length - a.members.length || a.title.localeCompare(b.title));
			const keptGroups = [];
			const mergedMembers = [];
			for (const group of prefixGroups) {
				const hasCheckedTool = group.members.some((member) => extraSet.has(member.name));
				if (group.members.length === 1 && !hasCheckedTool) mergedMembers.push({
					...group.members[0],
					display: group.members[0].name
				});
				else keptGroups.push(group);
			}
			const groups = [fixedGroup, ...keptGroups];
			if (mergedMembers.length > 0) {
				mergedMembers.sort((a, b) => a.name.localeCompare(b.name));
				groups.push({
					key: "__other__",
					title: "其他",
					fixed: false,
					members: mergedMembers
				});
			}
			const query = search.trim().toLowerCase();
			const shown = groups.map((group) => {
				if (query.length === 0) return {
					group,
					members: group.members
				};
				return {
					group,
					members: group.members.filter((member) => member.name.toLowerCase().includes(query) || member.short.toLowerCase().includes(query))
				};
			}).filter((item) => item.members.length > 0);
			const isOpen = (group, members) => {
				const defaultOpen = group.fixed || members.some((member) => member.fixed || extraSet.has(member.name));
				if (query.length > 0) return true;
				return group.key in overrides ? overrides[group.key] : defaultOpen;
			};
			const toggleGroup = (group, defaultOpen) => {
				if (query.length > 0) return;
				setOverrides((prev) => ({
					...prev,
					[group.key]: !(group.key in prev ? prev[group.key] : defaultOpen)
				}));
			};
			return (0, react.createElement)("div", { style: styles.section }, (0, react.createElement)("style", null, ".dsh-delegate-search-input::placeholder{color:var(--dsw-alias-label-tertiary);opacity:1;}"), (0, react.createElement)("div", { style: styles.header }, (0, react.createElement)("h2", { style: styles.title }, "派活"), (0, react.createElement)("p", { style: styles.subtitle }, "在命中的工作目录中，仅保留派活相关工具并自动清理闲置子会话。")), (0, react.createElement)("div", { style: styles.card }, (0, react.createElement)("div", { style: styles.row }, (0, react.createElement)("div", { style: styles.rowText }, (0, react.createElement)("span", { style: styles.label }, "工作目录"), (0, react.createElement)("p", { style: styles.description }, "会话目录等于其中一项或在其子目录下时生效；留空表示全部关闭。")), dirs.length === 0 ? (0, react.createElement)("p", { style: styles.emptyHint }, "暂无工作目录（当前为全部关闭）") : (0, react.createElement)("div", { style: styles.dirList }, ...dirs.map((dir, index) => (0, react.createElement)("div", {
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
			}), (0, react.createElement)("span", { style: styles.unit }, "天"))), (0, react.createElement)("div", { style: styles.rowSplit }, (0, react.createElement)("div", { style: styles.rowText }, (0, react.createElement)("span", { style: styles.label }, "定时任务不接管"), (0, react.createElement)("p", { style: styles.description }, "开启后，定时任务投递到的会话照常使用全部工具；关闭则与普通会话一样只能派活。")), (0, react.createElement)("button", {
				type: "button",
				role: "switch",
				"aria-checked": skip,
				"aria-label": "定时任务不接管",
				disabled: busy,
				onClick: () => {
					setSkip((prev) => !prev);
					if (note.text) setNote({
						text: "",
						ok: false
					});
				},
				style: {
					...styles.switchTrack,
					cursor: busy ? "not-allowed" : "pointer",
					opacity: busy ? .5 : 1,
					background: skip ? "var(--dsw-alias-state-business-primary)" : "var(--dsw-alias-border-l3)"
				}
			}, (0, react.createElement)("span", { style: {
				...styles.switchKnob,
				left: skip ? 20 : 2
			} }))), (0, react.createElement)("div", { style: styles.rowTop }, (0, react.createElement)("div", { style: styles.rowText }, (0, react.createElement)("span", { style: styles.label }, "额外保留的工具"), (0, react.createElement)("p", { style: styles.description }, "固定保留的 7 个工具已勾选并锁定；下面勾选其它工具即可加入 keepTools，取消即移除。")), (0, react.createElement)("p", { style: styles.summary }, `共 ${allTools.list.length} 个工具，${groups.length} 个组，已额外保留 ${extraTools.length} 个。`), (0, react.createElement)("div", { style: styles.searchWrap }, (0, react.createElement)("span", {
				style: styles.searchIcon,
				"aria-hidden": "true"
			}, (0, react.createElement)("svg", {
				width: 15,
				height: 15,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}, (0, react.createElement)("circle", {
				cx: 11,
				cy: 11,
				r: 7
			}), (0, react.createElement)("line", {
				x1: 21,
				y1: 21,
				x2: 16.65,
				y2: 16.65
			}))), (0, react.createElement)("input", {
				type: "text",
				className: "dsh-delegate-search-input",
				value: search,
				placeholder: "按名字搜索工具",
				disabled: busy,
				ref: searchInputRef,
				onChange: (event) => setSearch(event.target.value),
				onFocus: () => setSearchFocus(true),
				onBlur: () => setSearchFocus(false),
				style: {
					...styles.searchInput,
					borderColor: searchFocus ? "var(--dsw-alias-state-business-primary)" : "var(--dsw-alias-border-l3)",
					paddingRight: search.length > 0 ? 32 : 10
				}
			}), search.length > 0 ? (0, react.createElement)("button", {
				type: "button",
				"aria-label": "清除搜索",
				onClick: () => {
					setSearch("");
					if (searchInputRef.current && typeof searchInputRef.current.focus === "function") searchInputRef.current.focus();
				},
				style: styles.searchClear
			}, (0, react.createElement)("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round"
			}, (0, react.createElement)("line", {
				x1: 6,
				y1: 6,
				x2: 18,
				y2: 18
			}), (0, react.createElement)("line", {
				x1: 18,
				y1: 6,
				x2: 6,
				y2: 18
			}))) : null), allTools.status === "error" ? (0, react.createElement)("p", { style: {
				...styles.emptyHint,
				color: "var(--dsw-alias-state-error-primary)"
			} }, `读不到工具清单：${allTools.message}`) : allTools.status === "loading" ? (0, react.createElement)("p", { style: styles.emptyHint }, "工具清单加载中…") : shown.length === 0 ? (0, react.createElement)("p", { style: styles.emptyHint }, "没有匹配的工具。") : (0, react.createElement)("div", { style: styles.toolList }, ...shown.map(({ group, members }, groupIndex) => {
				const open = isOpen(group, members);
				const defaultOpen = group.fixed || members.some((member) => member.fixed || extraSet.has(member.name));
				return (0, react.createElement)("div", {
					key: group.key,
					style: {
						display: "flex",
						flexDirection: "column"
					}
				}, (0, react.createElement)("button", {
					type: "button",
					onClick: () => toggleGroup(group, defaultOpen),
					style: groupIndex === 0 ? {
						...styles.groupHeader,
						borderTop: "none"
					} : styles.groupHeader
				}, (0, react.createElement)("span", { style: styles.chevron }, open ? "▾" : "▸"), (0, react.createElement)("span", {
					style: styles.groupTitle,
					title: group.title
				}, group.title), (0, react.createElement)("span", { style: styles.groupCount }, query.length > 0 ? `匹配 ${members.length} 个` : `${members.length} 个`)), open ? (0, react.createElement)("div", { style: {
					display: "flex",
					flexDirection: "column"
				} }, ...members.map((member) => (0, react.createElement)("div", {
					key: member.name,
					style: styles.toolRowMember
				}, (0, react.createElement)("input", {
					type: "checkbox",
					checked: member.fixed || extraSet.has(member.name),
					disabled: busy || member.fixed,
					onChange: (event) => toggleTool(member.name, event.target.checked),
					"aria-label": member.name,
					style: styles.checkbox
				}), (0, react.createElement)("div", { style: styles.toolRowMain }, (0, react.createElement)("span", {
					style: styles.toolName,
					title: member.name
				}, member.display ?? member.short), member.description ? (0, react.createElement)("p", {
					style: styles.toolDesc,
					title: member.description
				}, member.description) : null), member.fixed ? (0, react.createElement)("span", { style: styles.fixedTag }, "固定保留") : null))) : null);
			})))), (0, react.createElement)("div", { style: styles.footer }, (0, react.createElement)("p", { style: {
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