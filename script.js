function place(img, x, y, h, w) {
    const n_img = document.createElement("img");
    n_img.setAttribute("src", img);
    n_img.setAttribute("alt", "a photo of james");
    n_img.setAttribute("style", `width:${w}px;height:${h}px;position:absolute;left:${x}px;top:${y}px`);
    const element = document.getElementById("james_box");
    element.appendChild(n_img);
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

document.getElementById("seed_btn").onclick = function() {
    const seed = cyrb128(document.getElementById("seed").value);
    const rand = splitmix32(seed[0]);

    let visited = [];

    for (let i=0;i<105;i++) {
        const i_val = Math.trunc(rand()*103)+1;
        let r_val = i_val;
        while (visited.includes(r_val)) {
            if (visited.length % 2 == 0) {
                r_val = mod105(r_val+1);
            }
            else {
                r_val = mod105(r_val-1);
            }
        }
        visited.push(r_val);
    }
    
}
