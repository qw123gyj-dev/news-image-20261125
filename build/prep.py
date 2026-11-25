"""Crop the AI photos for the 25 November front page.

Display slots in page.html (1024x1024 canvas):
  lead  968 x 100   Shanghai skyline at dusk (Chen Jining probe)
  row2  470 x  80   Brooklyn federal courthouse, cargo ship at sea
  row3  229 x  48   Riyadh tower, medal on a desk, server room,
                    Palais de Justice steps
Each crop is saved at 2x display width so the print stays sharp.
Sources are 1920x1280 PNG files generated for this entry.
The crop takes the vertical middle band of each photo, which is
where the subject sits in every shot.
"""
from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def middle_band(src, aspect, out, width):
    """Crop a full-width band of the given aspect from the middle."""
    im = Image.open(os.path.join(HERE, src)).convert("RGB")
    sw, sh = im.size
    h = round(sw / aspect)
    y0 = max(0, (sh - h) // 2)
    crop = im.crop((0, y0, sw, y0 + h))
    crop = crop.resize((width, round(width * h / sw)), Image.LANCZOS)
    crop.save(os.path.join(HERE, out))
    print(out, crop.size)


# Lead: 968x100 display, aspect 9.68, saved 1936 wide.
middle_band(
    "media-generation-chen-0-5e11a456-6ede-4148-b4dd-634f6217b183.png",
    968 / 100,
    "chen-wide.png",
    1936,
)

# Row 2: aspect 470/80 = 5.875, saved 940 wide.
for src, out in [
    (
        "media-generation-huawei-0-a30e1265-a694-498f-9b71-05033232f350.png",
        "huawei-wide.png",
    ),
    (
        "media-generation-sparta-0-2883e3db-6dc2-4a61-8e6f-2aa243c9e64c.png",
        "sparta-wide.png",
    ),
]:
    middle_band(src, 470 / 80, out, 940)

# Row 3: aspect 229/48 = 4.77, saved 458 wide.
for src, out in [
    (
        "media-generation-riyadh-0-a4bfae4b-026c-4753-a415-949beb4eb005.png",
        "riyadh-wide.png",
    ),
    (
        "media-generation-giuliani-0-a0a85da9-76ff-4997-ab94-db29f9439367.png",
        "giuliani-wide.png",
    ),
    (
        "media-generation-cia-0-7e671052-527c-41c0-80c0-feb9a320dddc.png",
        "cia-wide.png",
    ),
    (
        "media-generation-sarkozy-0-06aae495-a188-45f0-80d8-4222c29d49f1.png",
        "sarkozy-wide.png",
    ),
]:
    middle_band(src, 229 / 48, out, 458)

print("all crops done")
