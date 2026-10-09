# GitHub Trends Dashboard

Một dashboard trực quan để khám phá các repository đang hot trên GitHub theo thời gian, ngôn ngữ và chủ đề.

## Mô tả

GitHub Trends Dashboard là ứng dụng web tĩnh giúp người dùng:

- xem các repository phổ biến và đang tăng trưởng trên GitHub
- lọc theo ngôn ngữ, thời gian, topic và từ khóa tìm kiếm
- so sánh xu hướng stars theo các khoảng thời gian khác nhau
- phân tích sự phân bố ngôn ngữ của các repo trong kết quả lọc
- chuyển đổi giao diện giữa tiếng Việt và tiếng Anh
- bật/tắt chế độ sáng/tối
- xuất dữ liệu ra file CSV

## Tính năng chính

- Tìm kiếm repository theo tên
- Lọc theo:
  - ngôn ngữ (`JavaScript`, `Python`, `TypeScript`, ...)
  - khoảng thời gian (`7 ngày`, `30 ngày`, `90 ngày`, `1 năm`)
  - topic (`AI / ML`, `Web`, `Mobile`, `DevOps`, ...)
  - sắp xếp (`Stars`, `Forks`, `Mới nhất`)
- Hiển thị số liệu tổng quan:
  - tổng stars
  - tổng forks
  - số lượng repo
  - ngôn ngữ phổ biến nhất
- Biểu đồ 3D dạng bubble chart để trực quan hóa repo theo kích thước và màu sắc
- Biểu đồ line chart để so sánh xu hướng stars qua các khoảng thời gian
- Donut chart thể hiện tỷ lệ phân bố ngôn ngữ
- Danh sách repo chi tiết với thông tin ngắn gọn
- Cache cục bộ bằng `localStorage` để giảm số lần gọi API
- Đang hỗ trợ chế độ tối và giao diện đa ngôn ngữ

## Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript
- D3.js
- Three.js
- GitHub Search API

## Cấu trúc dự án

```text
GitHubTrending/
├── index.html
├── style.css
├── script.js
├── readme.md
└── .git/
```

## Cách chạy

Vì đây là dự án frontend tĩnh, bạn có thể mở trực tiếp file `index.html` trong trình duyệt hoặc chạy một local server đơn giản:

```bash
cd e:\AI\gitHubTrending
python -m http.server 8000
```

Sau đó mở:

```text
http://localhost:8000
```

## Ghi chú

- Dự án dùng GitHub API để lấy dữ liệu repository thực tế, nên cần có kết nối internet.
- GitHub API có giới hạn rate limit; ứng dụng sẽ ưu tiên dùng cache đã lưu trước đó khi đạt giới hạn.
- Không cần bước build hoặc cài đặt dependency phức tạp.

## Tác giả

- hoana2007

## Mục tiêu

Dự án nhằm tạo một công cụ xem xu hướng mã nguồn trên GitHub theo cách trực quan, nhanh và thân thiện với người dùng, đặc biệt phù hợp cho việc theo dõi các dự án hot trong cộng đồng developer.
# gitHubTrending:
https://github.com/hoana2007/gitHubTrending.git
