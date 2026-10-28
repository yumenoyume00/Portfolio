import * as THREE from 'three';
import { renderPageBase } from '../pageRenderer.js?v=15';
import { getCachedPageImage, loadPageImage } from '../pageImages.js?v=15';
import { pageImageUrls } from '../figureFlow.js?v=15';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../pageLayout.js?v=15';
import { paintReaderOverlay } from '../reader/overlayPainter.js?v=15';
import { MAP_FRAGMENT, ROUGHNESS_FRAGMENT, OPAQUE_FRAGMENT, NORMAL_FRAGMENT, } from '../shaders.js?v=15';
import { MOBILE_VERTEX_DECLARATIONS, MOBILE_NORMAL_RECOMPUTE, MOBILE_DEPTH_VERTEX_POSITION, MOBILE_FRAGMENT_HEADER, MOBILE_SHADOW_INTENSITY, } from './mobileShader.js?v=15';
import { MOBILE_CAMERA_Z, MOBILE_LAYER_SCALE, MOBILE_SHEET_ASPECT, MOBILE_TUNING, bookOffset, buildCatchUp, buildRadiusSpacing, claimsHorizontalSwipe, commitTarget, computeSheetShape, dragProgress, flipEase, holdTiming, mobileFov, mobileFrameCenter, sheetRenderOrder, sheetVisible, } from './mobileModel.js?v=15';
const HALF_H = MOBILE_SHEET_ASPECT / 2;
/** 当前页前后保留纹理的页数（相对渲染深度再留的余量） */
const TEXTURE_BEHIND = 2;
const TEXTURE_AHEAD_EXTRA = 3;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
export class MobileMagazineEngine {
    container;
    pageContents;
    patternUrl;
    renderOptions;
    onPageChange;
    onProgress;
    onReady;
    scene = new THREE.Scene();
    book = new THREE.Group();
    camera;
    renderer;
    canvas;
    abort = new AbortController();
    resizeObserver;
    intersection;
    count;
    /** 已翻过的页数，同时也是当前可见页的序号 */
    current;
    sheets = [];
    animations = [];
    drag = null;
    pointerStart = null;
    hold = null;
    /** 跨多页跳转时逐张翻动的定时器 */
    chainTimer = null;
    touch = null;
    pageTextures = [];
    /** 阅读层（选区、划线、搜索、书签）直接绘进页面纹理 */
    pageReaderOverlays = {};
    /** 只为带阅读层的页缓存不含覆盖层的底图，其余页纹理直接用底图画布 */
    pageBases = {};
    pageCanvases = {};
    pointerInterceptor = null;
    patternTexture = null;
    placeholderTex;
    blackTex;
    catchUpMap;
    radii;
    needsRender = true;
    lastFrameTime = 0;
    isVisible = true;
    isReady = false;
    isDisposed = false;
    raycaster = new THREE.Raycaster();
    ndc = new THREE.Vector2();
    plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    hit = new THREE.Vector3();
    spine = new THREE.Vector3();
    constructor(options) {
        this.container = options.container;
        this.pageContents = [...options.pageContents];
        this.patternUrl = options.patternUrl;
        this.renderOptions = options.renderOptions ?? {};
        this.onPageChange = options.onPageChange;
        this.onProgress = options.onProgress;
        this.onReady = options.onReady;
        this.count = this.pageContents.length;
        this.current = clamp(Math.trunc(options.initialIndex ?? 0), 0, Math.max(this.count - 1, 0));
        this.catchUpMap = buildCatchUp(this.count);
        this.radii = buildRadiusSpacing(this.count);
        const c = mobileFrameCenter();
        this.camera = new THREE.PerspectiveCamera(mobileFov(), 2, 1.5, 4.5);
        this.camera.position.set(c.x, c.y, MOBILE_CAMERA_Z);
        this.camera.lookAt(c.x, c.y, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.needsUpdate = true;
        this.canvas = this.renderer.domElement;
        this.canvas.dataset.magazineLayer = '';
        this.canvas.style.cssText =
            `display:block;position:absolute;inset:0;width:100%;height:100%;transform:scale(${MOBILE_LAYER_SCALE});` +
                'transform-origin:50% 50%;touch-action:pan-y pinch-zoom;' +
                '-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;';
        this.container.appendChild(this.canvas);
        this.scene.add(this.book);
        this.addLights();
        const solid = (r, g, b) => {
            const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1);
            t.needsUpdate = true;
            return t;
        };
        this.blackTex = solid(0, 0, 0);
        this.placeholderTex = solid(252, 252, 249);
        this.placeholderTex.colorSpace = THREE.SRGBColorSpace;
        this.createSheets();
        this.bindEvents();
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);
        this.handleResize();
        this.intersection = new IntersectionObserver((entries) => {
            this.isVisible = entries[entries.length - 1].isIntersecting;
            this.updateLoop();
        }, { rootMargin: '50% 0px' });
        this.intersection.observe(this.container);
        this.loadPattern();
        this.syncTextures();
        this.isReady = true;
        this.onReady?.();
        if (typeof document !== 'undefined' && 'fonts' in document) {
            document.fonts.ready.then(() => {
                if (!this.isDisposed)
                    this.rebuildTextures();
            });
        }
        document.addEventListener('visibilitychange', this.updateLoop, { signal: this.abort.signal });
        this.updateLoop();
    }
    // ---------- 场景搭建 ----------
    addLights() {
        const lights = new THREE.Group();
        this.scene.add(lights);
        lights.add(new THREE.HemisphereLight('#ffffff', '#a1aeaf', 1.7));
        const sun = new THREE.DirectionalLight('#ffffff', 2);
        sun.position.set(0.689, -1.15, 2.15);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -1.1;
        sun.shadow.camera.right = 1.1;
        sun.shadow.camera.top = 0.8;
        sun.shadow.camera.bottom = -0.8;
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 10;
        sun.shadow.bias = -0.001;
        sun.shadow.intensity = MOBILE_SHADOW_INTENSITY;
        lights.add(sun);
        lights.add(sun.target);
    }
    createSheets() {
        const geometry = new THREE.PlaneGeometry(1, MOBILE_SHEET_ASPECT, 64, 88);
        for (let i = 0; i < this.count; i++) {
            const uniforms = {
                uLeafWidth: { value: 1 },
                uFrontWidth: { value: 1 }, uBackWidth: { value: 1 },
                uSurfaceRoughness: { value: new THREE.Vector2((i === 0 || i === this.pageContents.length - 1 ? 0.52 : 0.95), (i === 0 || i === this.pageContents.length - 1 ? 0.52 : 0.95)) },
                uPileLift: { value: new THREE.Vector3(1, 0, 0) },
                uPileReach: { value: new THREE.Vector2(1, 1) },
                uConeTaper: { value: 0 },
                uTailCurl: { value: new THREE.Vector4(1, 0, 1, 1) },
                uTailBend: { value: 0 },
                uCone: { value: new THREE.Vector3(0, 1, 0) },
                uFlipRotation: { value: new THREE.Vector2(1, 0) },
                uPatternTex: { value: this.blackTex },
                uBackMap: { value: this.placeholderTex },
            };
            const material = new THREE.MeshStandardMaterial({
                map: this.placeholderTex,
                side: THREE.DoubleSide,
                metalness: 0,
                roughness: 0.95,
            });
            material.onBeforeCompile = (shader) => {
                Object.assign(shader.uniforms, uniforms);
                shader.vertexShader = MOBILE_VERTEX_DECLARATIONS + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n{\n${MOBILE_NORMAL_RECOMPUTE}\nobjectNormal = surfaceNormal;\n}\n`);
                shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = _transformedSheetPosition;\nvGrainUv = uv;\n');
                shader.fragmentShader = MOBILE_FRAGMENT_HEADER + shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', NORMAL_FRAGMENT);
                shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', MAP_FRAGMENT);
                shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', ROUGHNESS_FRAGMENT);
                shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', OPAQUE_FRAGMENT);
            };
            const depthMaterial = new THREE.MeshDepthMaterial({
                depthPacking: THREE.RGBADepthPacking,
                side: THREE.DoubleSide,
            });
            depthMaterial.onBeforeCompile = (shader) => {
                Object.assign(shader.uniforms, uniforms);
                shader.vertexShader = MOBILE_VERTEX_DECLARATIONS + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `${MOBILE_DEPTH_VERTEX_POSITION}\nvec3 transformed = _transformedSheetPosition - vec3(SHADOW_OFFSET_X, 0., 0.);\n`);
            };
            const mesh = new THREE.Mesh(geometry, material);
            mesh.customDepthMaterial = depthMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.book.add(mesh);
            this.sheets.push({
                index: i,
                mesh,
                uniforms,
                flipProgress: i < this.current ? 1 : 0,
                grabX: 1,
                grabXTarget: 1,
                grabY: 0,
                grabYTarget: 0,
                wobble: { tiltDeg: 0, flipTime: 1 },
            });
        }
    }
    loadPattern() {
        const apply = (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            this.patternTexture = tex;
            for (const s of this.sheets)
                s.uniforms.uPatternTex.value = tex;
            this.renderer.initTexture(tex);
            this.needsRender = true;
        };
        if (this.patternUrl) {
            new THREE.TextureLoader().load(this.patternUrl, (tex) => (this.isDisposed ? tex.dispose() : apply(tex)), undefined, () => apply(this.proceduralPattern()));
        }
        else {
            apply(this.proceduralPattern());
        }
    }
    proceduralPattern() {
        const size = 384;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(size, size);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = 110 + Math.floor(Math.random() * 50);
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        return new THREE.CanvasTexture(canvas);
    }
    // ---------- 页面纹理（按当前页前后窗口懒生成） ----------
    textureWindow() {
        const lo = Math.max(0, this.current - TEXTURE_BEHIND);
        const hi = Math.min(this.count - 1, this.current + MOBILE_TUNING.onPile.renderDepth + TEXTURE_AHEAD_EXTRA);
        return [lo, hi];
    }
    buildTexture(pageIndex) {
        const page = this.pageContents[pageIndex];
        if (!page)
            return;
        this.loadImagesForPage(pageIndex, page);
        const tex = new THREE.CanvasTexture(this.composePage(pageIndex, renderPageBase(page, this.renderOptions)));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.renderer.initTexture(tex);
        this.pageTextures[pageIndex]?.dispose();
        this.pageTextures[pageIndex] = tex;
        const material = this.sheets[pageIndex]?.mesh.material;
        if (material) {
            material.map = tex;
            material.needsUpdate = true;
        }
        this.needsRender = true;
    }
    /** 异步加载页面用到的图片，就绪后若该页纹理仍在窗口内且仍引用同一地址则重建 */
    loadImagesForPage(pageIndex, page) {
        for (const url of pageImageUrls(page)) {
            if (getCachedPageImage(url))
                continue;
            void loadPageImage(url).then((image) => {
                if (!image || this.isDisposed || !this.pageTextures[pageIndex])
                    return;
                const current = this.pageContents[pageIndex];
                if (!current || !pageImageUrls(current).includes(url))
                    return;
                this.buildTexture(pageIndex);
            });
        }
    }
    /** 底图 + 阅读层 → 纹理画布；没有阅读层时直接用底图 */
    composePage(pageIndex, base) {
        const page = this.pageContents[pageIndex];
        const overlay = this.pageReaderOverlays[pageIndex];
        if (!page || !overlay) {
            delete this.pageBases[pageIndex];
            delete this.pageCanvases[pageIndex];
            return base;
        }
        this.pageBases[pageIndex] = base;
        let canvas = this.pageCanvases[pageIndex];
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = base.width;
            canvas.height = base.height;
            this.pageCanvases[pageIndex] = canvas;
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(base, 0, 0);
        paintReaderOverlay(ctx, page, pageIndex, overlay, this.renderOptions.accentColor ?? '#9B2D26');
        return canvas;
    }
    syncTextures() {
        const [lo, hi] = this.textureWindow();
        for (let i = lo; i <= hi; i++)
            if (!this.pageTextures[i])
                this.buildTexture(i);
        // 窗口外再留一段余量才释放，避免来回翻页时反复生成
        for (let i = 0; i < this.pageTextures.length; i++) {
            if (!this.pageTextures[i] || (i >= lo - 2 && i <= hi + 2))
                continue;
            this.pageTextures[i].dispose();
            this.pageTextures[i] = undefined;
            delete this.pageBases[i];
            delete this.pageCanvases[i];
            const material = this.sheets[i]?.mesh.material;
            if (material) {
                material.map = this.placeholderTex;
                material.needsUpdate = true;
            }
        }
        this.onProgress?.(Math.min(hi + 1, this.count), this.count);
    }
    rebuildTextures() {
        this.pageTextures.forEach((t, i) => t && this.buildTexture(i));
    }
    renderAllPageTextures(customOptions) {
        if (customOptions)
            this.renderOptions = { ...this.renderOptions, ...customOptions };
        this.rebuildTextures();
    }
    updatePageContent(pageIndex, newContent) {
        if (pageIndex < 0 || pageIndex >= this.count)
            return;
        this.pageContents[pageIndex] = newContent;
        if (this.pageTextures[pageIndex])
            this.buildTexture(pageIndex);
    }
    setAllPageContents(newContents) {
        this.pageContents = [...newContents];
        this.rebuildTextures();
    }
    // ---------- 对外状态 ----------
    getCurrentSheet() {
        return this.current;
    }
    getTotalSheets() {
        return this.count;
    }
    getContainer() {
        return this.container;
    }
    isFlipping() {
        return this.animations.length > 0 || this.drag !== null;
    }
    // ---------- 阅读器接口（ReaderEngineHost） ----------
    getHitArea() {
        return this.canvas;
    }
    isEditing() {
        return false;
    }
    setPointerInterceptor(fn) {
        this.pointerInterceptor = fn;
    }
    setPageReaderOverlay(pageIndex, overlay) {
        if (pageIndex < 0 || pageIndex >= this.count)
            return;
        if (overlay)
            this.pageReaderOverlays[pageIndex] = overlay;
        else
            delete this.pageReaderOverlays[pageIndex];
        const tex = this.pageTextures[pageIndex];
        const page = this.pageContents[pageIndex];
        if (!tex || !page)
            return;
        const base = this.pageBases[pageIndex] ?? renderPageBase(page, this.renderOptions);
        tex.image = this.composePage(pageIndex, base);
        tex.needsUpdate = true;
        this.needsRender = true;
    }
    getLeftPageIndex() {
        return null;
    }
    getRightPageIndex() {
        return this.current < this.count ? this.current : null;
    }
    /** 屏幕坐标 → 当前页的纹理像素坐标；翻页进行中纹理与屏幕不对应，返回 null */
    getCanvasCoordsFromClient(clientX, clientY) {
        const pageIndex = this.getRightPageIndex();
        if (pageIndex === null || this.isFlipping())
            return null;
        const rect = this.canvas.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom)
            return null;
        const pt = this.planePoint(clientX, clientY);
        if (!pt || pt.x < 0 || pt.x > 1 || pt.y < -HALF_H || pt.y > HALF_H)
            return null;
        return {
            pageIndex,
            side: 'right',
            canvasX: pt.x * CANVAS_WIDTH,
            canvasY: ((HALF_H - pt.y) / MOBILE_SHEET_ASPECT) * CANVAS_HEIGHT,
        };
    }
    /** 纹理像素坐标 → 屏幕坐标（把 IME 候选窗定位到光标处） */
    getClientCoordsFromCanvas(pageIndex, canvasX, canvasY) {
        if (pageIndex !== this.getRightPageIndex())
            return null;
        const v = new THREE.Vector3(canvasX / CANVAS_WIDTH + this.book.position.x, HALF_H - (canvasY / CANVAS_HEIGHT) * MOBILE_SHEET_ASPECT + this.book.position.y, this.book.position.z).project(this.camera);
        const rect = this.canvas.getBoundingClientRect();
        return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
    }
    notifyPageChange(instant = false) {
        // 翻过最后一张到回到首页之间 current 会短暂等于 count，此时仍报告最后一页
        const page = Math.min(this.current, Math.max(this.count - 1, 0));
        this.onPageChange?.(page, null, page + 1, instant);
    }
    // ---------- 翻页 ----------
    isAnimating(sheet) {
        return this.animations.some((a) => a.sheet === sheet);
    }
    randomWobble() {
        const w = MOBILE_TUNING.onWobble;
        const r = (a, b) => a + (b - a) * Math.random();
        return { tiltDeg: r(-w.tiltDeg, w.tiltDeg), flipTime: r(w.flipTimeMin, w.flipTimeMax) };
    }
    /** 把翻页方向和落点折算成当前页的变化 */
    turn(forward, target) {
        const delta = forward && target === 1 ? 1 : !forward && target === 0 ? -1 : 0;
        if (!delta)
            return;
        this.current += delta;
        this.syncTextures();
        this.needsRender = true;
        this.notifyPageChange();
    }
    startFlip(sheet, forward, target, flipTime) {
        this.turn(forward, target);
        const from = sheet.flipProgress;
        const duration = 1000 * flipTime * sheet.wobble.flipTime * Math.max(0.2, Math.abs(target - from));
        this.animations = this.animations.filter((a) => a.sheet !== sheet);
        this.animations.push({ sheet, from, to: target, startTime: performance.now(), duration });
        this.needsRender = true;
        this.updateLoop();
    }
    flipBy(forward) {
        const sheet = this.sheets[forward ? this.current : this.current - 1];
        if (!sheet)
            return;
        if (!this.isAnimating(sheet))
            sheet.wobble = this.randomWobble();
        this.setGrab(sheet, { x: 1, y: 0 }, true);
        this.startFlip(sheet, forward, forward ? 1 : 0, MOBILE_TUNING.onClick.flipTime);
    }
    flipNext() {
        this.flipBy(true);
    }
    flipPrev() {
        this.flipBy(false);
    }
    /** 相邻页翻一张；跨多页时按「按住连翻」的节奏逐张翻过去，越翻越快 */
    goToSheet(index) {
        const target = clamp(Math.trunc(index), 0, Math.max(this.count - 1, 0));
        this.cancelChain();
        if (target === this.current)
            return;
        if (Math.abs(target - this.current) === 1) {
            this.flipBy(target > this.current);
            return;
        }
        let count = 0;
        const step = () => {
            this.chainTimer = null;
            if (this.isDisposed || target === this.current)
                return;
            const forward = target > this.current;
            const sheet = this.sheets[forward ? this.current : this.current - 1];
            if (!sheet)
                return;
            if (!this.isAnimating(sheet))
                sheet.wobble = this.randomWobble();
            this.setGrab(sheet, { x: 1, y: 0 }, true);
            const timing = holdTiming(count++);
            this.startFlip(sheet, forward, forward ? 1 : 0, timing.flipTime);
            this.chainTimer = setTimeout(step, 1000 * timing.gap);
        };
        step();
    }
    cancelChain() {
        if (this.chainTimer) {
            clearTimeout(this.chainTimer);
            this.chainTimer = null;
        }
    }
    goToPage(pageIndex) {
        this.goToSheet(pageIndex);
    }
    /** 瞬间跳到第 n 页（从 0 起）：没有翻页动画、不触发翻页音，只绘制目标附近的页 */
    jumpToPage(pageIndex) {
        const target = clamp(Math.trunc(pageIndex), 0, Math.max(this.count - 1, 0));
        this.cancelChain();
        this.cancelHold();
        this.animations = [];
        this.drag = null;
        const changed = target !== this.current;
        this.current = target;
        for (const s of this.sheets)
            s.flipProgress = s.index < target ? 1 : 0;
        this.syncTextures();
        this.needsRender = true;
        this.updateLoop();
        if (changed)
            this.notifyPageChange(true);
    }
    /** 与桌面引擎同名：单页堆叠里“对开页序号”就是页序号 */
    jumpToSheet(index) {
        this.jumpToPage(index);
    }
    // ---------- 指针 / 触摸 ----------
    setGrab(sheet, pt, immediate) {
        if (!pt)
            return;
        sheet.grabXTarget = Math.min(Math.abs(pt.x), 1);
        sheet.grabYTarget = clamp(pt.y / HALF_H, -1, 1);
        if (immediate) {
            sheet.grabX = sheet.grabXTarget;
            sheet.grabY = sheet.grabYTarget;
        }
    }
    /** 屏幕点 → 书页平面上的点（相对书脊） */
    planePoint(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        this.ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -(2 * ((clientY - rect.top) / rect.height)) + 1);
        this.raycaster.setFromCamera(this.ndc, this.camera);
        this.plane.constant = -this.book.position.z;
        if (!this.raycaster.ray.intersectPlane(this.plane, this.hit))
            return null;
        return { x: this.hit.x - this.book.position.x, y: this.hit.y - this.book.position.y };
    }
    moved(e, slop = MOBILE_TUNING.onDrag.clickSlopPx) {
        if (!this.pointerStart)
            return false;
        const dx = e.clientX - this.pointerStart.x;
        const dy = e.clientY - this.pointerStart.y;
        return dx * dx + dy * dy > slop * slop;
    }
    cancelHold() {
        if (this.hold) {
            clearTimeout(this.hold.timer);
            this.hold = null;
        }
    }
    /** 按住后连翻：越翻越快 */
    fireHold = () => {
        const hold = this.hold;
        if (!hold)
            return;
        if (!hold.fired) {
            hold.fired = true;
            this.drag = null;
        }
        const sheet = this.sheets[hold.forward ? this.current : this.current - 1];
        if (!sheet)
            return this.cancelHold();
        if (!this.isAnimating(sheet))
            sheet.wobble = this.randomWobble();
        this.setGrab(sheet, this.planePoint(hold.x, hold.y), true);
        const timing = holdTiming(hold.count);
        this.startFlip(sheet, hold.forward, hold.forward ? 1 : 0, timing.flipTime);
        hold.count++;
        hold.timer = setTimeout(this.fireHold, 1000 * timing.gap);
    };
    onPointerDown = (e) => {
        if (e.button !== 0 || !this.isReady)
            return;
        this.cancelChain();
        // 触摸永远归翻页（滑动 / 点击 / 按住），阅读器只接管鼠标与触控笔
        if (e.pointerType !== 'touch' && this.pointerInterceptor?.(e))
            return;
        const rect = this.canvas.getBoundingClientRect();
        this.spine.copy(this.book.position).project(this.camera);
        const spineX = rect.left + (0.5 * this.spine.x + 0.5) * rect.width;
        const forward = e.clientX >= spineX;
        const sheet = this.sheets[forward ? this.current : this.current - 1];
        if (!sheet)
            return;
        if (!this.isAnimating(sheet))
            sheet.wobble = this.randomWobble();
        this.setGrab(sheet, this.planePoint(e.clientX, e.clientY), true);
        this.animations = this.animations.filter((a) => a.sheet !== sheet);
        this.pointerStart = { x: e.clientX, y: e.clientY };
        this.drag = {
            sheet,
            forward,
            base: sheet.flipProgress,
            progress: sheet.flipProgress,
            rectWidth: rect.width,
            speed: 0,
        };
        this.cancelHold();
        this.hold = {
            forward,
            x: e.clientX,
            y: e.clientY,
            count: 0,
            fired: false,
            timer: setTimeout(this.fireHold, 1000 * MOBILE_TUNING.onHold.startTime),
        };
        this.canvas.setPointerCapture(e.pointerId);
        this.needsRender = true;
        this.updateLoop();
    };
    onPointerMove = (e) => {
        if (this.hold && this.moved(e, this.hold.fired ? MOBILE_TUNING.onHold.moveSlopPx : undefined)) {
            this.cancelHold();
        }
        if (this.drag && this.pointerStart) {
            const d = this.drag;
            d.progress = dragProgress(d.base, e.clientX - this.pointerStart.x, d.rectWidth);
            this.setGrab(d.sheet, this.planePoint(e.clientX, e.clientY), false);
            this.needsRender = true;
        }
    };
    onPointerUp = (e) => {
        this.cancelHold();
        const drag = this.drag;
        if (!drag) {
            this.pointerStart = null;
            return;
        }
        const moved = this.moved(e);
        this.drag = null;
        this.pointerStart = null;
        try {
            this.canvas.releasePointerCapture(e.pointerId);
        }
        catch {
            /* 指针已释放 */
        }
        // 没怎么动：当作点击，按方向翻一页
        if (!moved && e.type !== 'pointercancel') {
            this.startFlip(drag.sheet, drag.forward, drag.forward ? 1 : 0, MOBILE_TUNING.onClick.flipTime);
            return;
        }
        const target = e.type === 'pointercancel' ? (drag.forward ? 0 : 1) : commitTarget(drag.forward, drag.progress, drag.base);
        this.turn(drag.forward, target);
        const d = MOBILE_TUNING.onDrag;
        const from = drag.sheet.flipProgress;
        const distance = Math.max(Math.abs(target - from), 0.001);
        const fall = d.fallTime * drag.sheet.wobble.flipTime * Math.pow(distance, d.fallTimeExponent);
        const velocity = target === 1 ? drag.speed : -drag.speed;
        const launch = clamp((velocity * fall) / distance, 0, 2);
        this.animations = this.animations.filter((a) => a.sheet !== drag.sheet);
        this.animations.push({
            sheet: drag.sheet,
            from,
            to: target,
            startTime: performance.now(),
            duration: 1000 * fall,
            launch,
        });
        this.needsRender = true;
    };
    bindEvents() {
        const { signal } = this.abort;
        this.canvas.addEventListener('pointerdown', this.onPointerDown, { signal });
        this.canvas.addEventListener('pointermove', this.onPointerMove, { signal });
        this.canvas.addEventListener('pointerup', this.onPointerUp, { signal });
        this.canvas.addEventListener('pointercancel', this.onPointerUp, { signal });
        // 触摸：横向滑动归翻页（阻止浏览器接管），纵向留给页面滚动
        this.canvas.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            this.touch = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, claimed: false } : null;
        }, { passive: true, signal });
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.touch || e.touches.length !== 1)
                return;
            if (this.touch.claimed) {
                if (e.cancelable)
                    e.preventDefault();
                return;
            }
            if (!e.cancelable) {
                this.touch = null;
                return;
            }
            const t = e.touches[0];
            if (claimsHorizontalSwipe(t.clientX - this.touch.x, t.clientY - this.touch.y)) {
                this.touch.claimed = true;
                e.preventDefault();
            }
        }, { passive: false, signal });
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.cancelHold();
            this.renderer.setAnimationLoop(null);
        }, { signal });
        this.canvas.addEventListener('webglcontextrestored', () => {
            this.needsRender = true;
            this.updateLoop();
        }, { signal });
    }
    // ---------- 渲染循环 ----------
    updateLoop = () => {
        const run = !this.isDisposed && this.isVisible && !document.hidden && !this.renderer.getContext().isContextLost();
        if (run) {
            this.lastFrameTime = 0;
            this.needsRender = true;
            this.renderer.setAnimationLoop(this.animate);
        }
        else {
            this.renderer.setAnimationLoop(null);
        }
    };
    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (!width || !height)
            return;
        this.camera.fov = mobileFov();
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        const maxPixels = 15e6;
        const scaleFactor = Math.sqrt(maxPixels / (width * height));
        this.renderer.setPixelRatio(Math.min(1.2 * (window.devicePixelRatio || 1), 4, scaleFactor));
        this.renderer.setSize(width, height, false);
        this.needsRender = true;
    }
    animate = (now) => {
        const t = performance.now();
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const a = this.animations[i];
            const r = clamp((t - a.startTime) / a.duration, 0, 1);
            a.sheet.flipProgress = a.from + (a.to - a.from) * flipEase(r, a.launch);
            if (t >= a.startTime + a.duration) {
                this.animations.splice(i, 1);
                this.needsRender = true;
            }
        }
        // 翻完最后一张：回到首页，杂志循环
        if (this.count && this.current >= this.count && !this.animations.length && !this.drag) {
            this.current = 0;
            for (const s of this.sheets)
                s.flipProgress = 0;
            this.syncTextures();
            this.needsRender = true;
            this.notifyPageChange();
        }
        const dt = this.lastFrameTime ? Math.min((now - this.lastFrameTime) / 1000, 0.1) : 1 / 60;
        this.lastFrameTime = now;
        if (this.drag) {
            const d = this.drag;
            const k = 1 - Math.pow(0.01, dt / MOBILE_TUNING.onDrag.progressSmoothTime);
            const delta = (d.progress - d.sheet.flipProgress) * k;
            d.sheet.flipProgress += delta;
            d.speed = dt > 0 ? delta / dt : 0;
        }
        let busy = this.animations.length > 0 || this.drag !== null;
        const grabK = 1 - Math.pow(0.001, dt / MOBILE_TUNING.onGrab.smoothTime);
        for (const s of this.sheets) {
            for (const axis of ['grabX', 'grabY']) {
                const diff = s[`${axis}Target`] - s[axis];
                if (Math.abs(diff) < 1e-4)
                    s[axis] = s[`${axis}Target`];
                else {
                    s[axis] += diff * grabK;
                    busy = true;
                }
            }
            if (!this.isAnimating(s) && this.drag?.sheet !== s) {
                const rest = s.index < this.current ? 1 : 0;
                if (s.flipProgress !== rest) {
                    s.flipProgress = rest;
                    this.needsRender = true;
                }
            }
        }
        if (!busy && !this.needsRender)
            return;
        this.applyShapes();
        this.renderer.shadowMap.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
        this.needsRender = false;
    };
    applyShapes() {
        let sum = 0;
        for (const s of this.sheets)
            sum += s.flipProgress;
        for (const s of this.sheets) {
            const shape = computeSheetShape({
                index: s.index,
                flipProgress: s.flipProgress,
                sumProgress: sum,
                count: this.count,
                grabX: s.grabX,
                grabY: s.grabY,
                wobbleTiltDeg: s.wobble.tiltDeg,
                catchUp: this.catchUpMap,
                radii: this.radii,
            });
            const u = s.uniforms;
            u.uPileLift.value.set(...shape.pileLift);
            u.uConeTaper.value = shape.coneTaper;
            u.uPileReach.value.set(...shape.pileReach);
            u.uCone.value.set(...shape.cone);
            u.uTailCurl.value.set(...shape.tailCurl);
            u.uTailBend.value = shape.tailBend;
            u.uFlipRotation.value.set(...shape.flipRotation);
            const busy = this.isAnimating(s) || this.drag?.sheet === s;
            s.mesh.visible = sheetVisible(s.index, this.current, sum, busy, this.count);
            s.mesh.renderOrder = sheetRenderOrder(s.index, this.current);
        }
        const offset = bookOffset(sum, this.count, this.catchUpMap);
        this.book.position.x = offset.x;
        this.book.position.z = offset.z;
    }
    // ---------- 销毁 ----------
    dispose() {
        this.isDisposed = true;
        this.cancelChain();
        this.cancelHold();
        this.abort.abort();
        this.resizeObserver.disconnect();
        this.intersection.disconnect();
        this.renderer.setAnimationLoop(null);
        const first = this.sheets[0];
        first?.mesh.geometry.dispose();
        for (const s of this.sheets) {
            s.mesh.material.dispose();
            s.mesh.customDepthMaterial?.dispose();
        }
        this.pageTextures.forEach((t) => t?.dispose());
        this.patternTexture?.dispose();
        this.placeholderTex.dispose();
        this.blackTex.dispose();
        this.renderer.dispose();
        this.canvas.remove();
    }
}
