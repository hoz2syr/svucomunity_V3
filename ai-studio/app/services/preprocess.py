import os
import logging
import cv2
import numpy as np
from pdf2image import convert_from_path

logger = logging.getLogger(__name__)


def pdf_to_images(pdf_path: str, output_dir: str) -> list:
    try:
        pages = convert_from_path(pdf_path, dpi=300)
    except Exception as exc:
        raise RuntimeError(f"Failed to convert PDF to images: {exc}") from exc

    image_paths = []
    for i, page in enumerate(pages):
        image_path = os.path.join(output_dir, f"page_{i + 1}.jpg")
        try:
            page.save(image_path, "JPEG")
            image_paths.append(image_path)
        except Exception as exc:
            logger.warning("Failed to save page %d: %s", i + 1, exc)
    return image_paths


def enhance_image(image_path: str, output_path: str) -> str:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to load image: {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

    binary = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

    cv2.imwrite(output_path, cleaned)
    return output_path


def deskew_image(image_path: str, output_path: str) -> str:
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Failed to load image: {image_path}")

    coords = np.column_stack(np.where(img > 0))
    if coords.size == 0:
        cv2.imwrite(output_path, img)
        return output_path

    angle = cv2.minAreaRect(coords.astype(np.float32))[-1]

    if angle > 45:
        angle = 90 - angle
    elif angle < -45:
        angle = -90 - angle

    if abs(angle) > 0.5:
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        cv2.imwrite(output_path, rotated)
    else:
        cv2.imwrite(output_path, img)
    return output_path
