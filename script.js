function place(img, x, y, h, w) {
    const n_img = document.createElement("img");
    n_img.setAttribute("src", img);
    n_img.setAttribute("alt", "a photo of james");
    n_img.setAttribute("style", `width:${w}px;height:${h}px;position:absolute;left:${x}px;top:${y+50}px`);
    const element = document.getElementById("james_box");
    element.appendChild(n_img);
}

function place2(img, x, y, h, w) {
    const n_img = document.createElement("img");
    n_img.setAttribute("src", img);
    n_img.setAttribute("alt", "a photo of james");
    n_img.setAttribute("style", `width:${w}px;height:${h}px;position:absolute;left:${x+50}px;top:${y+50}px`);
    const element = document.getElementById("james_box_2");
    element.appendChild(n_img);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function splitmix32(a) {
    return function() {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

function mod105(int) {
    if (int > 0) {
        return int%105
    }
    else {
        return 105 + (int%105)
    }
}

function buildCollage(rand) {
    const container = document.getElementById("james_box");

    container.innerHTML = "";

    const boxW = container.clientWidth;
    const boxH = container.clientHeight || 600;

    const holeW = boxW * 0.2;
    const holeH = boxH * 0.2;
    const holeX1 = (boxW - holeW) / 2;
    const holeY1 = (boxH - holeH) / 2;
    const holeX2 = holeX1 + holeW;
    const holeY2 = holeY1 + holeH;

    let left   = 0;
    let top    = 0;
    let right  = boxW;
    let bottom = boxH;

    let edge = 0; // 0=top,1=right,2=bottom,3=left
    let cursor = 0;

    function randRange(min, max) {
        return min + rand() * (max - min);
    }

    function overlapsHole(x, y, w, h) {
        return !(
            x + w < holeX1 ||
            x > holeX2 ||
            y + h < holeY1 ||
            y > holeY2
        );
    }

    let indices = [];
    for (let i = 0; i < 105; i++) indices.push(i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    indices.forEach(i => {
        const src = `james/${i}.jpg`;
        const img = new Image();
        img.src = src;

        img.onload = () => {
            const h = randRange(100, 200);
            const aspect = img.naturalWidth / img.naturalHeight;
            const w = h * aspect;

            let x, y;

            switch (edge) {
                case 0: // top edge left to right
                    x = left + cursor;
                    y = top;
                    cursor += w;
                    if (x + w >= right) {
                        edge = 1;
                        cursor = 0;
                        top += h;
                    }
                    break;

                case 1: // right edge top to bottom
                    x = right - w;
                    y = top + cursor;
                    cursor += h;
                    if (y + h >= bottom) {
                        edge = 2;
                        cursor = 0;
                        right -= w;
                    }
                    break;

                case 2: // bottom edge right to left
                    x = right - cursor - w;
                    y = bottom - h;
                    cursor += w;
                    if (x <= left) {
                        edge = 3;
                        cursor = 0;
                        bottom -= h;
                    }
                    break;

                case 3: // left edge bottom to top
                    x = left;
                    y = bottom - cursor - h;
                    cursor += h;
                    if (y <= top) {
                        edge = 0;
                        cursor = 0;
                        left += w;
                    }
                    break;
            }

            if (!(overlapsHole(x, y, w, h))) {
                place(src, x, y, h, w);
            }
        };
    });
}

document.getElementById("seed_btn").onclick = function() {
    const container = document.getElementById("james_box");
    const seed = cyrb128(document.getElementById("seed").value);
    const rand = splitmix32(seed[0]);

    container.innerHTML = "";

    const boxW = container.clientWidth;
    const boxH = container.clientHeight || 600;

    const holeW = boxW * 0.2;
    const holeH = boxH * 0.2;
    const holeX1 = (boxW - holeW) / 2;
    const holeY1 = (boxH - holeH) / 2;
    buildCollage(rand);
    place2("james/image.jpg", holeX1-100, holeY1-100, 300, 400);
}
