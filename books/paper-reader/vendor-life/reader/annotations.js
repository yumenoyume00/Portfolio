import { findRun, segmentsOf } from './readerDoc.js?v=15';
export const ANNOTATION_COLORS = ['#F2C94C', '#6FCF97', '#56A0E0', '#EB6F92'];
let seq = 0;
export const newId = () => `a${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export function createAnnotations(runs, a, b, style, makeGroupId = newId) {
    const groupId = makeGroupId();
    return segmentsOf(runs, a, b).map((s) => ({
        id: newId(),
        groupId,
        type: style.type,
        color: style.color,
        pageIndex: s.run.pageIndex,
        elementId: s.run.elementId,
        start: s.from,
        end: s.to,
        quote: s.run.text.slice(s.from, s.to),
        createdAt: Date.now(),
    }));
}
/** 把存储的锚点对回当前文本；对不上的丢弃（文本已被改没） */
export function resolveAnnotations(list, runs) {
    const out = [];
    for (const a of list) {
        const run = findRun(runs, a.pageIndex, a.elementId);
        if (!run)
            continue;
        if (run.text.slice(a.start, a.end) === a.quote) {
            out.push({ ...a, from: a.start, to: a.end });
            continue;
        }
        const i = run.text.indexOf(a.quote);
        if (i >= 0 && a.quote !== '')
            out.push({ ...a, from: i, to: i + a.quote.length });
    }
    return out;
}
export const removeGroup = (list, groupId) => list.filter((a) => a.groupId !== groupId);
export const updateGroup = (list, groupId, patch) => list.map((a) => (a.groupId === groupId ? { ...a, ...patch } : a));
/** 笔记只挂在组内第一条上 */
export const setGroupNote = (list, groupId, note) => {
    let done = false;
    return list.map((a) => {
        if (a.groupId !== groupId)
            return a;
        if (done)
            return { ...a, note: undefined };
        done = true;
        return { ...a, note: note || undefined };
    });
};
export class LocalStorageReaderStore {
    key;
    constructor(key = 'paper-mono-pager:reader:v1') {
        this.key = key;
    }
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw) {
                const p = JSON.parse(raw);
                return {
                    annotations: Array.isArray(p.annotations) ? p.annotations : [],
                    bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks.filter((n) => Number.isInteger(n)) : [],
                };
            }
        }
        catch {
            /* 存储不可用时按空处理 */
        }
        return { annotations: [], bookmarks: [] };
    }
    save(state) {
        try {
            localStorage.setItem(this.key, JSON.stringify(state));
        }
        catch {
            /* 配额/隐私模式：忽略 */
        }
    }
}
