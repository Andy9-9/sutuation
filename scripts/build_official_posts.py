#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import base64
import json

UPLOADS_DIR = "uploads"

files_meta = [
    {
        "code": "10.GV01",
        "grade": "10",
        "examCode": "MD-10.DM01",
        "lesson": "Hồ sơ Tư liệu & Danh mục Hoạt cảnh Lịch sử Khối 10 (Chuẩn GDPT 2018)",
        "topic": "Văn minh thế giới & Việt Nam cổ – trung đại",
        "format": "Tài liệu PDF",
        "scenario": "Bảng phân loại chi tiết các bài học SGK Lịch sử 10 có khả năng hoạt cảnh hóa, định hướng tái hiện đời sống, thành tựu văn minh và sinh hoạt xã hội.",
        "focus": "Nắm vững định hướng sân khấu hóa SGK Lịch sử 10: Văn minh Ai Cập, Lưỡng Hà, Hy Lạp - La Mã, Văn Lang - Âu Lạc, Chăm-pa, Phù Nam.",
        "author": "Tổ Lịch sử THPT",
        "school": "Chương trình GDPT 2018",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Cư dân sông Nile / Lưỡng Hà", "type": "HISTORICAL_FACT", "desc": "Tái hiện đời sống lao động sản xuất và sáng tạo chữ viết cổ đại" },
            { "name": "Công dân Athens / La Mã", "type": "HISTORICAL_FACT", "desc": "Mô phỏng hội nghị đàm thoại, tranh biện dân chủ cổ đại" },
            { "name": "Cư dân Văn Lang - Âu Lạc", "type": "HISTORICAL_FACT", "desc": "Tái hiện đời sống vật chất, tinh thần thời đại Hùng Vương" }
        ]
    },
    {
        "code": "11.GV01",
        "grade": "11",
        "examCode": "MD-11.DM01",
        "lesson": "Hồ sơ Tư liệu & Danh mục Hoạt cảnh Lịch sử Khối 11 (Chuẩn GDPT 2018)",
        "topic": "Cách mạng, Cải cách & Chiến tranh bảo vệ Tổ quốc",
        "format": "Tài liệu PDF",
        "scenario": "Hệ thống hóa các tình huống ra quyết định lịch sử, tranh luận cải cách triều đại, phối hợp tác chiến bảo vệ chủ quyền biên cương và biển đảo.",
        "focus": "Trọng tâm khai thác đối thoại lịch sử, xung đột lập trường và quyết sách dân tộc: Kháng chiến chống ngoại xâm, Cải cách Hồ Quý Ly, Lê Thánh Tông, Đội Hoàng Sa.",
        "author": "Tổ Lịch sử THPT",
        "school": "Chương trình GDPT 2018",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Tướng sĩ Bạch Đằng / Binh sĩ nhà Trần", "type": "HISTORICAL_FACT", "desc": "Chuẩn bị trận địa cọc, đối thoại chiến thuật tác chiến trên sông" },
            { "name": "Bô lão Diên Hồng", "type": "HISTORICAL_FACT", "desc": "Đồng thanh 'Đánh', thể hiện ý chí quật cường toàn dân tộc" },
            { "name": "Thủy binh Đội Hoàng Sa", "type": "HISTORICAL_FACT", "desc": "Theo lệnh triều đình cắm mốc, đo đạc hải trình và bảo vệ quần đảo" }
        ]
    },
    {
        "code": "12.GV01",
        "grade": "12",
        "examCode": "MD-12.DM01",
        "lesson": "Hồ sơ Tư liệu & Danh mục Hoạt cảnh Lịch sử Khối 12 (Chuẩn GDPT 2018)",
        "topic": "Thế giới hiện đại & Việt Nam từ năm 1945 đến nay",
        "format": "Tài liệu PDF",
        "scenario": "Sân khấu tư liệu, mô phỏng nghị sự ngoại giao, tái hiện các chặng đường kháng chiến và đàm phán quốc tế trên nền tư liệu lịch sử có thật.",
        "focus": "Khai thác tư liệu hình ảnh, phim, hiệp ước lịch sử: Hiệp định Paris 1973, Gia nhập ASEAN 1995, Cách mạng tháng Tám, Điện Biên Phủ, Tuyến đường Trường Sơn.",
        "author": "Tổ Lịch sử THPT",
        "school": "Chương trình GDPT 2018",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Đại biểu đàm phán Hiệp định Paris", "type": "HISTORICAL_FACT", "desc": "Đấu tranh kiên quyết trên bàn ngoại giao vì hòa bình và độc lập" },
            { "name": "Chiến sĩ vận tải / Giao liên Trường Sơn", "type": "CREATIVE_REP", "desc": "Phối hợp các mắt xích thông tin, bảo đảm đường chi viện tiền tuyến" },
            { "name": "Dân công hỏa tuyến Điện Biên", "type": "CREATIVE_REP", "desc": "Tiếp tế đạn dược, kéo pháo vào trận địa, mở đường thắng lợi" }
        ]
    },
    {
        "code": "12.W15",
        "grade": "12",
        "examCode": "MD-15.PDF",
        "lesson": "Tuyển tập 15 Hoạt cảnh Lịch sử THPT Chuẩn Sư phạm (Tài liệu gốc GDPT 2018 - Bản đầy đủ 47 trang)",
        "topic": "Tuyển tập 15 Hoạt cảnh Lịch sử THPT (Chương trình GDPT 2018)",
        "format": "Tài liệu PDF",
        "scenario": "Tài liệu sư phạm toàn diện 47 trang bao gồm đầy đủ 15 kịch bản dạng bảng, phân vai học sinh, lời thoại gốc, thao tác thẻ dàn dựng và câu hỏi sau xem.",
        "focus": "Tài liệu chính thức dành cho Giáo viên tổ chức và Học sinh luyện tập hoạt cảnh trên lớp bám sát mục tiêu phẩm chất và năng lực SGK GDPT 2018.",
        "author": "Tổ Chuyên môn Lịch sử THPT",
        "school": "Chương trình GDPT 2018",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện hoạt cảnh", "type": "CREATIVE_REP", "desc": "Giữ mạch kết nối các cảnh và dẫn nhập bối cảnh lịch sử" },
            { "name": "Nhân vật lịch sử chính sử", "type": "HISTORICAL_FACT", "desc": "Tôn trọng tuyệt đối dữ kiện thời gian, sự kiện có thật" },
            { "name": "Nhân vật kịch bản hóa sáng tạo", "type": "CREATIVE_REP", "desc": "Khắc họa tâm lý, đời sống và góc nhìn xã hội thời đại" }
        ]
    },
    {
        "code": "11.W15",
        "grade": "11",
        "examCode": "MD-15.DOCX",
        "lesson": "Trọn bộ 15 Kịch bản Hoạt cảnh Lịch sử Dạng bảng (Tệp Microsoft Word .docx biên soạn)",
        "topic": "Kịch bản Sân khấu hóa 15 bài học Lịch sử THPT",
        "format": "Kịch bản Word (.docx)",
        "scenario": "Tệp Word nguyên bản chuẩn soạn giảng của giáo viên, chia sẵn bảng phân vai 3 phần và lời thoại để in ấn phát cho các nhóm học sinh.",
        "focus": "Công cụ sư phạm linh hoạt cho phép Thầy/Cô và các nhóm lớp tùy chỉnh tên học sinh, kịch bản chi tiết và tổ chức hoạt động trải nghiệm.",
        "author": "Tổ Chuyên môn Lịch sử THPT",
        "school": "Chương trình GDPT 2018",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.docx",
        "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "characters": [
            { "name": "Giáo viên / Nhóm trưởng phụ trách", "type": "CREATIVE_REP", "desc": "Điều phối phân vai, kiểm tra đạo cụ và bấm giờ luyện tập" },
            { "name": "Các diễn viên học sinh", "type": "CREATIVE_REP", "desc": "Nhận vai, thuộc thoại và tập theo thao tác thẻ gợi ý" }
        ]
    }
]

posts = []
docs = []

for meta in files_meta:
    fname = meta["fileName"]
    fpath = os.path.join(UPLOADS_DIR, fname)
    if not os.path.exists(fpath):
        print(f"Warning: file not found: {fpath}")
        continue

    size = os.path.getsize(fpath)
    with open(fpath, "rb") as f:
        bytes_data = f.read()
    b64_str = base64.b64encode(bytes_data).decode("utf-8")
    data_url = f"data:{meta['fileType']};base64,{b64_str}"

    post = {
        "code": meta["code"],
        "grade": meta["grade"],
        "examCode": meta["examCode"],
        "lesson": meta["lesson"],
        "topic": meta["topic"],
        "format": meta["format"],
        "scenario": meta["scenario"],
        "focus": meta["focus"],
        "context": "Bám sát chương trình Giáo dục Phổ thông 2018 môn Lịch sử THPT và tài liệu tập huấn chuyên môn.",
        "sources": "Chương trình GDPT 2018 — Môn Lịch sử THPT (Bộ Giáo dục và Đào tạo)",
        "author": meta["author"],
        "school": meta["school"],
        "createdAt": "24/10/2026",
        "authLevel": "Cấp 1 - Cơ bản (SU2026)",
        "originType": "TEACHER_CONTRIBUTED",
        "fileName": fname,
        "fileSize": size,
        "fileType": meta["fileType"],
        "fileUrl": f"uploads/{fname}",
        "fileData": data_url,
        "characters": meta["characters"]
    }
    posts.append(post)

    doc_id = f"DOC-{meta['code'].replace('.', '')}"
    doc = {
        "id": doc_id,
        "code": meta["code"],
        "title": meta["lesson"],
        "format": meta["format"],
        "topic": meta["topic"],
        "originType": "TEACHER_CONTRIBUTED",
        "origin": "TEACHER_CONTRIBUTED",
        "source": meta["author"] + " — " + meta["school"],
        "fileName": fname,
        "fileUrl": f"uploads/{fname}",
        "fileData": data_url,
        "fileSize": size,
        "fileType": meta["fileType"]
    }
    docs.append(doc)

# 1. Ghi file js/official-posts-data.js
js_content = f"""/**
 * ====================================================================
 * CÁC BÀI ĐĂNG GIÁO VIÊN & HỒ SƠ TƯ LIỆU GỐC ĐÍNH KÈM FILE (GDPT 2018)
 * Nền tảng Lịch sử Sử Tuation • Tự động tích hợp sẵn trên Web & Netlify
 * ====================================================================
 */

const OFFICIAL_TEACHER_POSTS = {json.dumps(posts, ensure_ascii=False, indent=2)};

const OFFICIAL_TEACHER_DOCS = {json.dumps(docs, ensure_ascii=False, indent=2)};

if (typeof window !== "undefined") {{
    window.OFFICIAL_TEACHER_POSTS = OFFICIAL_TEACHER_POSTS;
    window.OFFICIAL_TEACHER_DOCS = OFFICIAL_TEACHER_DOCS;
}}
if (typeof module !== "undefined" && module.exports) {{
    module.exports = {{ OFFICIAL_TEACHER_POSTS, OFFICIAL_TEACHER_DOCS }};
}}
"""

with open("js/official-posts-data.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"✓ Generated js/official-posts-data.js with {len(posts)} posts and {len(docs)} docs!")

# 2. Cập nhật situation_database.json
db_path = "situation_database.json"
current_db = {
    "version": int(os.path.getmtime(db_path) * 1000) if os.path.exists(db_path) else 1792806125120,
    "lastUpdated": "2026-10-24T01:42:05.120Z",
    "teacherPosts": posts,
    "teacherDocs": docs,
    "deletedCodes": [],
    "studentSubmissions": [],
    "customDocs": []
}

with open(db_path, "w", encoding="utf-8") as f:
    json.dump(current_db, f, ensure_ascii=False, indent=2)
print(f"✓ Updated {db_path} with all 5 teacher posts and documents!")
