import glob
import os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

def process_image(src_path, dest_paths, white_thresh=245, feather_radius=1.2):
    print(f"Đang xử lý: {src_path} ...")
    im = Image.open(src_path).convert("RGBA")
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape

    rgb = arr[:, :, :3]
    # Khoảng cách Euclidean tới màu trắng (255, 255, 255)
    dist_to_white = np.sqrt(np.sum((255.0 - rgb) ** 2, axis=2))

    # Pixel được coi là màu nền nếu gần trắng (khoảng cách < 22, tương đương mỗi kênh >= 242)
    is_bg_candidate = dist_to_white < 24.0

    # Flood-fill từ tất cả các điểm mép viền của ảnh để chỉ lấy vùng nền bên ngoài
    visited = np.zeros((h, w), dtype=bool)
    q = deque()

    # Thêm các pixel trên 4 cạnh biên vào hàng đợi nếu là ứng viên nền
    for x in range(w):
        if is_bg_candidate[0, x]:
            visited[0, x] = True
            q.append((0, x))
        if is_bg_candidate[h - 1, x]:
            visited[h - 1, x] = True
            q.append((h - 1, x))
    for y in range(h):
        if is_bg_candidate[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if is_bg_candidate[y, w - 1]:
            visited[y, w - 1] = True
            q.append((y, w - 1))

    # BFS loang toàn bộ vùng nền kết nối với biên
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg_candidate[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

    # Tạo mask alpha: 0 cho vùng nền ngoài, 255 cho vùng con pet
    alpha_mask = np.where(visited, 0, 255).astype(np.uint8)

    # Làm mượt đường biên (anti-aliasing) bằng Gaussian Blur nhẹ nhàng
    mask_im = Image.fromarray(alpha_mask, mode="L")
    mask_blurred = mask_im.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    # Ghép mask alpha mới vào ảnh gốc
    result = im.copy()
    result.putalpha(mask_blurred)

    # Lưu vào tất cả các thư mục đích
    for dest in dest_paths:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        result.save(dest, format="PNG", optimize=True)
        print(f" -> Đã lưu: {dest}")

def main():
    backup_dir = "brand/pet_original_backup"
    if not os.path.exists(backup_dir):
        print("Không tìm thấy thư mục backup!")
        return

    files = sorted(glob.glob(f"{backup_dir}/*.png"))
    for src in files:
        fname = os.path.basename(src)
        targets = [
            f"brand/pet/{fname}",
            f"public/brand/pet/{fname}",
            f"public/pets/{fname}",
        ]
        process_image(src, targets)

    print("\n✅ Đã hoàn tất bóc nền trong suốt cho toàn bộ 8 tệp ảnh!")

if __name__ == "__main__":
    main()
