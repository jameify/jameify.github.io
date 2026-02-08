from js import document, FileReader, Uint8Array, fetch, window, Blob
from pyscript import document
from pyodide.ffi import create_proxy
import pyodide_js
await pyodide_js.loadPackage('micropip')
import micropip
await micropip.install("opencv-python")

import base64
import cv2
import numpy as np
import asyncio

# -------------------------------
# Utilities
# -------------------------------

async def read_file_from_input(file):
    reader = FileReader.new()

    future = asyncio.get_event_loop().create_future()

    def onload(event):
        future.set_result(reader.result)

    reader.onload = create_proxy(onload)
    reader.readAsArrayBuffer(file)

    buffer = await future
    u8 = Uint8Array.new(buffer)
    data = np.frombuffer(bytes(u8.to_py()), dtype=np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


async def load_target_image():
    response = await fetch("target_img.jpeg")
    buffer = await response.arrayBuffer()
    u8 = Uint8Array.new(buffer)
    data = np.frombuffer(bytes(u8.to_py()), dtype=np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def show_image(img_bgr):
    # Encode image to PNG in Python
    ok, png = cv2.imencode(".png", img_bgr)
    if not ok:
        raise RuntimeError("PNG encoding failed")

    # Convert to JS Uint8Array
    u8 = Uint8Array.new(png.tobytes())

    # Create Blob (same as browser file object)
    blob = Blob.new([u8], {"type": "image/png"})

    # Create object URL
    url = window.URL.createObjectURL(blob)

    # Display / overwrite
    container = document.getElementById("output_upload")
    container.innerHTML = ""   # overwrite previous output

    img = document.createElement("img")
    img.src = url
    container.appendChild(img)


# -------------------------------
# Core algorithm
# -------------------------------

async def rearrange_pixels_with_motion(start_img, ref_img, steps=10):
    h, w = start_img.shape[:2]
    ref_img = cv2.resize(ref_img, (w, h), interpolation=cv2.INTER_AREA)

    start_lab = cv2.cvtColor(start_img, cv2.COLOR_BGR2LAB)
    ref_lab   = cv2.cvtColor(ref_img, cv2.COLOR_BGR2LAB)

    start_pixels = start_lab.reshape(-1, 3)
    ref_pixels   = ref_lab.reshape(-1, 3)

    start_idx = np.lexsort((start_pixels[:,2], start_pixels[:,1], start_pixels[:,0]))
    ref_idx   = np.lexsort((ref_pixels[:,2],   ref_pixels[:,1],   ref_pixels[:,0]))

    start_y, start_x = np.divmod(start_idx, w)
    end_y,   end_x   = np.divmod(ref_idx,   w)

    for step in range(steps + 1):
        t = step / steps

        cur_x = np.round((1 - t) * start_x + t * end_x).astype(np.int32)
        cur_y = np.round((1 - t) * start_y + t * end_y).astype(np.int32)

        cur_x = np.clip(cur_x, 0, w - 1)
        cur_y = np.clip(cur_y, 0, h - 1)

        frame = np.zeros_like(start_lab)
        frame[cur_y, cur_x] = start_pixels[start_idx]

        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_LAB2BGR)
        show_image(frame_bgr)
        print("hello world")
        await asyncio.sleep(0.05)  # animation pacing


# -------------------------------
# Button handler
# -------------------------------

async def run_clicked(event):
    file_input = document.getElementById("file-upload")

    if len(file_input.files) == 0:
        raise ValueError("No start image selected.")

    file_obj = file_input.files.item(0)
    start_img = await read_file_from_input(file_obj)
    ref_img   = await load_target_image()

    await rearrange_pixels_with_motion(start_img, ref_img, steps=15)


document.getElementById("run_btn").addEventListener(
    "click", create_proxy(lambda e: asyncio.ensure_future(run_clicked(e)))
)