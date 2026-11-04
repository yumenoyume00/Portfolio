/** 阅读态指针手势仲裁：这次按下归阅读器（选字）还是引擎（翻页）。纯函数，便于测试。 */
/** 书页外侧边缘保留给拖拽翻页的比例 */
export const FLIP_EDGE_RATIO = 0.06;
export function arbitrate(c) {
    if (!c.enabled)
        return 'engine';
    if (c.button === 2)
        return 'reader';
    if (c.button !== 0)
        return 'engine';
    const edge = c.canvasWidth * FLIP_EDGE_RATIO;
    const inFlipEdge = c.side === 'right' ? c.canvasX > c.canvasWidth - edge : c.canvasX < edge;
    if (inFlipEdge)
        return 'engine';
    return c.onText || c.onAnnotation ? 'reader' : 'engine';
}
/** 连击计数：同位置、间隔短则累加 */
export function nextClickCount(prev, now, windowMs = 450, slopPx = 6) {
    if (!prev)
        return 1;
    const near = Math.hypot(now.x - prev.x, now.y - prev.y) <= slopPx;
    if (near && now.time - prev.time <= windowMs)
        return Math.min(prev.count + 1, 3);
    return 1;
}
