import { StudySpace } from '@/types/studyspace';

export const INITIAL_SPACES: StudySpace[] = [
  {
    id: 'space-ai-math',
    name: 'Toán cho Trí tuệ Nhân tạo',
    subject: 'Khoa học Máy tính',
    description: 'Không gian nghiên cứu Đại số tuyến tính, Giải tích đa biến và Tối ưu hoá cho AI.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    items: [
      {
        id: 'doc-book-ml',
        type: 'book',
        title: 'Giáo trình Cơ Sở Machine Learning & Deep Learning',
        x: 460,
        y: 180,
        rotation: -2,
        scale: 1,
        zIndex: 10,
        pageCount: 8,
        currentPageIndex: 0,
        colorTheme: '#1e3a8a',
        isBinder: false,
        pages: [
          {
            id: 'p1',
            pageNumber: 1,
            title: 'Chương 1: Mở đầu về Học Máy',
            text: `Machine Learning (Học máy) là một phân nhánh của Trí tuệ Nhân tạo tập trung vào việc xây dựng các hệ thống có khả năng học hỏi từ dữ liệu thay vì tuân theo các quy tắc lập trình cứng.

1. Supervised Learning (Học có giám sát):
Mô hình được huấn luyện trên tập dữ liệu có gán nhãn (X, y). Mục tiêu là tìm hàm f(X) ≈ y.
Ví dụ: Phân loại hình ảnh, dự đoán giá nhà.

2. Unsupervised Learning (Học không giám sát):
Mô hình tìm kiếm các cấu trúc, cụm ẩn trong tập dữ liệu không có nhãn X.
Ví dụ: Phân cụm khách hàng (K-Means), giảm số chiều (PCA).`
          },
          {
            id: 'p2',
            pageNumber: 2,
            title: 'Chương 1: Các Độ đo Đánh giá Mô hình',
            text: `Để đánh giá một mô hình phân loại (Classification), ta sử dụng Ma trận nhầm lẫn (Confusion Matrix):
- True Positive (TP): Dự đoán Đúng là Dương tính
- False Positive (FP): Dự đoán Sai là Dương tính (Lỗi loại I)
- True Negative (TN): Dự đoán Đúng là Âm tính
- False Negative (FN): Dự đoán Sai là Âm tính (Lỗi loại II)

Độ chính xác (Accuracy):
Accuracy = (TP + TN) / (TP + TN + FP + FN)

Độ phủ (Recall / Sensitivity):
Recall = TP / (TP + FN)

Độ chuẩn xác (Precision):
Precision = TP / (TP + FP)

Điểm F1-Score:
F1 = 2 * (Precision * Recall) / (Precision + Recall)`
          },
          {
            id: 'p3',
            pageNumber: 3,
            title: 'Chương 2: Hồi quy Tuyến tính (Linear Regression)',
            text: `Hồi quy tuyến tính là thuật toán cơ bản mô hình hóa mối quan hệ giữa biến phụ thuộc liên tục y và một hoặc nhiều biến độc lập X.

Mô hình dạng ma trận:
y = X * w + b

Hàm mất mát (Mean Squared Error - MSE):
L(w) = (1 / 2m) * ∑ (f(x_i) - y_i)^2

Mục tiêu là tìm bộ trọng số w* sao cho hàm mất mát L(w) đạt giá trị cực tiểu.
Có hai phương pháp chính để tìm nghiệm:
1. Nghiệm giải tích (Normal Equation): w = (X^T * X)^(-1) * X^T * y
2. Thuật toán tối ưu Gradient Descent lặp từng bước.`
          },
          {
            id: 'p4',
            pageNumber: 4,
            title: 'Chương 2: Thuật toán Tối ưu Gradient Descent',
            text: `Gradient Descent là phương pháp tối ưu hóa bậc nhất tìm cực tiểu địa phương của hàm khả vi.

Quy tắc cập nhật trọng số:
w_(t+1) = w_t - η * ∇L(w_t)

Trong đó:
- η (eta) là tốc độ học (Learning Rate). Nếu η quá lớn, thuật toán sẽ phân kỳ (Diverge). Nếu η quá nhỏ, tốc độ hội tụ rất chậm.
- ∇L(w_t) là gradient (vectơ đạo hàm riêng) của hàm mất mát theo w.

Biến thể:
- Batch Gradient Descent: Tính gradient trên toàn bộ dữ liệu.
- Stochastic Gradient Descent (SGD): Cập nhật trọng số theo từng mẫu ngẫu nhiên.
- Mini-batch SGD: Cập nhật theo từng nhóm nhỏ (kích thước batch: 32, 64, 128).`
          },
          {
            id: 'p5',
            pageNumber: 5,
            title: 'Chương 3: Mạng Nơ-ron Nhân tạo (Neural Networks)',
            text: `Mạng nơ-ron nhân tạo lấy cảm hứng từ cấu trúc sinh học của não bộ.

Thành phần cơ bản của một Perceptron:
z = ∑ (w_i * x_i) + b
a = σ(z)

Hàm kích hoạt phi tuyến (Activation Functions):
1. Sigmoid: σ(z) = 1 / (1 + e^(-z)) (nén giá trị về khoảng [0, 1]).
2. ReLU: f(z) = max(0, z) (phổ biến nhất vì tính toán nhanh và tránh triệt tiêu gradient ở miền dương).
3. Softmax: Dùng ở lớp đầu ra cho bài toán phân loại đa lớp để biểu diễn phân phối xác suất.`
          },
          {
            id: 'p6',
            pageNumber: 6,
            title: 'Chương 3: Lan truyền Ngược (Backpropagation)',
            text: `Thuật toán Lan truyền ngược là trụ cột huấn luyện mạng nơ-ron sâu (Deep Learning).

Nguyên lý Chain Rule (Quy tắc dây chuyền):
Đạo hàm của hàm hợp:
∂L / ∂w = (∂L / ∂a) * (∂a / ∂z) * (∂z / ∂w)

Các bước thực hiện trong mỗi lượt huấn luyện (Epoch):
1. Forward Pass: Truyền tín hiệu từ đầu vào qua các lớp ẩn để tính giá trị dự đoán y_hat và hàm mất mát L.
2. Backward Pass: Tính đạo hàm của L ngược từ lớp ra về lớp vào.
3. Weight Update: Điều chỉnh trọng số w bằng Optimizer (SGD, Adam, RMSProp).`
          },
          {
            id: 'p7',
            pageNumber: 7,
            title: 'Chương 4: Hiện tượng Overfitting & Biện pháp Khắc phục',
            text: `Overfitting xảy ra khi mô hình học quá kỹ các chi tiết ngẫu nhiên và nhiễu (noise) của tập huấn luyện, dẫn đến độ chính xác cao trên Train nhưng suy giảm mạnh trên Test.

Các kỹ thuật Regularization phổ biến:
1. L2 Regularization (Ridge / Weight Decay): Phạt các trọng số có độ lớn cao: L_reg = L + λ * ||w||_2^2
2. L1 Regularization (Lasso): Tạo ra các trọng số thưa (Sparse weights): L_reg = L + λ * ||w||_1
3. Dropout: Tắt ngẫu nhiên một tỷ lệ nơ-ron (vd 20% - 50%) trong mỗi lượt huấn luyện để ngăn chặn sự phụ thuộc lẫn nhau.
4. Early Stopping: Dừng huấn luyện khi mất mát trên tập Validation bắt đầu tăng.`
          },
          {
            id: 'p8',
            pageNumber: 8,
            title: 'Chương 4: Lời kết & Tài liệu Tham khảo',
            text: `Học thuyết về Học máy là nền tảng để tiếp cận các mô hình ngôn ngữ lớn (LLM), Thị giác máy tính (Computer Vision), và Hệ thống Tự hành.

Tài liệu khuyên đọc:
- "Deep Learning" - Ian Goodfellow, Yoshua Bengio
- "Pattern Recognition and Machine Learning" - Christopher Bishop
- Khoá học CS229 / CS231n của Đại học Stanford.

Ghi chú từ ViTudy: Hãy dùng tính năng Inteline bôi đen bất kỳ công thức hoặc thuật ngữ nào trong cuốn sách này để hỏi AI giải thích chi tiết!`
          }
        ]
      },
      {
        id: 'doc-paper-review',
        type: 'paper',
        title: 'Tờ Tóm Tắt Nhanh: Đạo hàm & Gradient',
        x: 100,
        y: 220,
        rotation: 4,
        scale: 1,
        zIndex: 12,
        pageCount: 2,
        currentPageIndex: 0,
        colorTheme: '#047857',
        isBinder: false,
        pages: [
          {
            id: 'p-rev-1',
            pageNumber: 1,
            title: 'Công thức Đạo hàm Cơ bản',
            text: `Tờ ôn tập nhanh trước kỳ thi:
- Đạo hàm của hàm mũ: d/dx (x^n) = n * x^(n-1)
- Đạo hàm hàm số e^x: d/dx (e^x) = e^x
- Đạo hàm ln(x): d/dx (ln(x)) = 1/x
- Quy tắc tích: (u * v)' = u' * v + u * v'
- Quy tắc thương: (u / v)' = (u' * v - u * v') / v^2
- Đạo hàm hàm hợp (Chain rule): dy/dx = (dy/du) * (du/dx)`
          },
          {
            id: 'p-rev-2',
            pageNumber: 2,
            title: 'Gradient trong Không gian Đa chiều',
            text: `Cho hàm nhiều biến f(x_1, x_2, ..., x_n):
Gradient của f, ký hiệu ∇f, là một vectơ gồm tất cả các đạo hàm riêng:
∇f = [ ∂f/∂x_1, ∂f/∂x_2, ..., ∂f/∂x_n ]^T

Ý nghĩa hình học quan trọng:
1. Vectơ gradient luôn chỉ theo hướng hàm số TĂNG NHANH NHẤT.
2. Vectơ đối nghịch (-∇f) luôn chỉ theo hướng hàm số GIẢM NHANH NHẤT (Nguyên lý thuật toán Gradient Descent).
3. Độ dài (Norm) của gradient thể hiện tốc độ biến thiên tại điểm đó.`
          }
        ]
      },
      {
        id: 'doc-sticky-1',
        type: 'sticky_note',
        title: 'Ghi chú nhớ ôn thi',
        x: 1080,
        y: 200,
        rotation: -6,
        scale: 1,
        zIndex: 15,
        pageCount: 1,
        currentPageIndex: 0,
        stickyColor: '#fef08a',
        stickyText: '💡 Lưu ý: Tuần sau thi giữa kỳ môn Học máy! Nhớ dùng công cụ STudy tạo 20 câu hỏi trắc nghiệm từ Chương 2 & 3 để luyện tập!',
        pages: []
      }
    ]
  }
];
