#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

UPLOADS_DIR = "uploads"
CDN_BASE = "https://andy9-9.github.io/sutuation/uploads"

# 1. Toàn bộ 17 bài trong file Danh_Muc_Hoat_Canh_Khoi_10.pdf
KHOI_10_ITEMS = [
    {
        "code": "10.01",
        "grade": "10",
        "examCode": "MD-10.01",
        "lesson": "Bài 1. Hiện thực lịch sử và lịch sử được con người nhận thức",
        "topic": "Hiện thực lịch sử và nhận thức lịch sử",
        "format": "Đối thoại lịch sử",
        "scenario": "“Một sự kiện, nhiều lời kể”: người dẫn chuyện đưa ra các lời kể khác nhau; nhóm học sinh dùng tư liệu để kiểm tra.",
        "focus": "Phân biệt sự kiện đã xảy ra với cách con người nhận thức về sự kiện.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Đưa ra các lời kể khác nhau về cùng một sự kiện lịch sử" },
            { "name": "Nhóm học sinh kiểm chứng tư liệu", "type": "CREATIVE_REP", "desc": "Dùng tư liệu gốc để đối chiếu, phân biệt sự kiện đã xảy ra với nhận thức chủ quan" }
        ]
    },
    {
        "code": "10.02",
        "grade": "10",
        "examCode": "MD-10.02",
        "lesson": "Bài 2. Tri thức lịch sử và cuộc sống",
        "topic": "Tri thức lịch sử và cuộc sống",
        "format": "Phỏng vấn tái hiện; kể chuyện",
        "scenario": "“Câu chuyện sau một hiện vật”: học sinh hỏi người thân về ảnh, giấy tờ hoặc đồ vật cũ.",
        "focus": "Nhận ra ý nghĩa của việc tìm hiểu lịch sử trong đời sống.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Học sinh phỏng vấn", "type": "CREATIVE_REP", "desc": "Đặt câu hỏi tìm hiểu xuất xứ, hoàn cảnh lịch sử của bức ảnh, giấy tờ hoặc kỷ vật gia đình" },
            { "name": "Người thân (Ông/Bà/Cha/Mẹ)", "type": "CREATIVE_REP", "desc": "Kể lại câu chuyện đời sống gắn với hiện vật qua các thời kỳ lịch sử" }
        ]
    },
    {
        "code": "10.03",
        "grade": "10",
        "examCode": "MD-10.03",
        "lesson": "Bài 3. Vai trò của sử học",
        "topic": "Vai trò của sử học và bảo tồn di sản",
        "format": "Tiểu phẩm",
        "scenario": "“Giữ lại hay thay mới?”: cộng đồng trao đổi về một công trình có giá trị lịch sử đang xuống cấp.",
        "focus": "Vai trò của sử học đối với bảo tồn di sản và phát triển du lịch.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Nhà nghiên cứu sử học / Di sản", "type": "CREATIVE_REP", "desc": "Phân tích giá trị lịch sử, văn hóa và phương án trùng tu bảo tồn nguyên trạng" },
            { "name": "Đại diện cộng đồng địa phương", "type": "CREATIVE_REP", "desc": "Trao đổi về nhu cầu an toàn sinh hoạt, bảo tồn di tích gắn với phát triển du lịch bền vững" }
        ]
    },
    {
        "code": "10.04A",
        "grade": "10",
        "examCode": "MD-10.04",
        "lesson": "Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại (Hoạt cảnh 1: Bên dòng sông Nile)",
        "topic": "Văn minh phương Đông cổ – trung đại",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Bên dòng sông Nile”: người nông dân, người ghi chép và người thợ kể về công việc của mình (Kịch bản chuẩn 3 phần).",
        "focus": "Mối liên hệ giữa điều kiện tự nhiên, sản xuất và thành tựu văn minh Ai Cập.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập bối cảnh bên dòng sông Nile và kết nối các cảnh" },
            { "name": "Người làm ruộng", "type": "CREATIVE_REP", "desc": "Tái hiện lao động nông nghiệp gắn với mùa nước ngập phù sa sông Nile" },
            { "name": "Người ghi chép", "type": "CREATIVE_REP", "desc": "Ghi chép số lượng thóc lúa, đo đạc ruộng đất và quản lý kho" },
            { "name": "Người thợ", "type": "CREATIVE_REP", "desc": "Sửa dụng cụ và làm đồ đựng, phối hợp nghề thủ công với nông nghiệp" },
            { "name": "Người học việc", "type": "CREATIVE_REP", "desc": "Đặt câu hỏi và đối chiếu vai trò của lao động, kỹ thuật và ghi chép" }
        ]
    },
    {
        "code": "10.04B",
        "grade": "10",
        "examCode": "MD-10.05",
        "lesson": "Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại (Hoạt cảnh 2: Khi chữ viết ra đời)",
        "topic": "Văn minh phương Đông cổ – trung đại",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Khi chữ viết ra đời”: mô phỏng việc ghi chép, lưu giữ và truyền đạt thông tin tại một nền văn minh được chọn (Kịch bản chuẩn 3 phần).",
        "focus": "Vai trò của chữ viết; phân biệt đặc điểm giữa các nền văn minh.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập bối cảnh kho lương thực giả định tại Lưỡng Hà cổ đại" },
            { "name": "Người giữ kho", "type": "CREATIVE_REP", "desc": "Kiểm tra, đối chiếu các lượt hàng hóa giao nhận" },
            { "name": "Người giao hàng", "type": "CREATIVE_REP", "desc": "Nêu nhu cầu xác nhận số lượng lúa mạch đã giao" },
            { "name": "Người ghi chép", "type": "CREATIVE_REP", "desc": "Ghi loại hàng và số lượng lên bảng đất sét mô phỏng để lưu giữ thông tin" },
            { "name": "Người học việc", "type": "CREATIVE_REP", "desc": "Phân biệt hiện vật chữ hình nêm thật với ký hiệu mô phỏng lớp học" }
        ]
    },
    {
        "code": "10.05A",
        "grade": "10",
        "examCode": "MD-10.08",
        "lesson": "Bài 5. Một số nền văn minh phương Tây thời cổ – trung đại (Hoạt cảnh 3: Tiếng nói ở Athens)",
        "topic": "Văn minh phương Tây cổ – trung đại",
        "format": "Đối thoại lịch sử",
        "scenario": "“Tiếng nói ở Athens”: đối thoại giữa công dân và những người không được tham gia đời sống chính trị (Kịch bản chuẩn 3 phần).",
        "focus": "Đặc điểm và giới hạn của nền dân chủ Athens.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh hội nghị công dân Athens thời cổ điển" },
            { "name": "Demos (Công dân nam Athens)", "type": "CREATIVE_REP", "desc": "Trình bày quyền trực tiếp bàn bạc và biểu quyết trong hội nghị công dân" },
            { "name": "Thaleia (Phụ nữ Athens)", "type": "CREATIVE_REP", "desc": "Nêu góc nhìn của phụ nữ bị loại khỏi quyền biểu quyết chính trị" },
            { "name": "Leon (Ngoại kiều cư trú)", "type": "CREATIVE_REP", "desc": "Làm rõ sự khác biệt giữa quyền cư trú, đóng góp kinh tế và quyền công dân" },
            { "name": "Người điều phối", "type": "CREATIVE_REP", "desc": "Giải thích quy định thiết chế thành bang Athens" }
        ]
    },
    {
        "code": "10.05B",
        "grade": "10",
        "examCode": "MD-10.05B",
        "lesson": "Bài 5. Một số nền văn minh phương Tây thời cổ – trung đại (Phần B: Văn hóa Phục hưng)",
        "topic": "Văn minh phương Tây cổ – trung đại",
        "format": "Sân khấu tư liệu",
        "scenario": "“Con người và khát vọng sáng tạo”: người dẫn chuyện giới thiệu nghệ sĩ, nhà khoa học thời Phục hưng qua thành tựu cụ thể.",
        "focus": "Tinh thần nhân văn và thành tựu văn hóa Phục hưng.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh phong trào Văn hóa Phục hưng và các tác phẩm tiêu biểu" },
            { "name": "Danh họa / Nhà khoa học Phục hưng", "type": "HISTORICAL_FACT", "desc": "Độc thoại có tư liệu về giá trị con người, vẻ đẹp tự nhiên và tinh thần khoa học thực nghiệm" }
        ]
    },
    {
        "code": "10.06",
        "grade": "10",
        "examCode": "MD-10.06",
        "lesson": "Bài 6. Các cuộc cách mạng công nghiệp thời cận đại (Hoạt cảnh 4: Từ xưởng thủ công đến nhà máy)",
        "topic": "Các cuộc cách mạng công nghiệp thời cận đại",
        "format": "Tiểu phẩm",
        "scenario": "“Từ xưởng thủ công đến nhà máy”: gia đình thợ thủ công trước sự xuất hiện của máy móc và phương thức sản xuất mới (Kịch bản chuẩn 3 phần).",
        "focus": "Thành tựu và tác động của cách mạng công nghiệp.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn chuyện chuyển tiếp hai cảnh: xưởng dệt gia đình và nhà máy cơ giới hóa" },
            { "name": "Cha (Thợ dệt thủ công)", "type": "CREATIVE_REP", "desc": "Trải nghiệm sự thay đổi từ lao động thủ công tại nhà sang nhịp máy trong công xưởng" },
            { "name": "Con", "type": "CREATIVE_REP", "desc": "Đặt câu hỏi về năng suất máy móc, giờ làm và điều kiện an toàn lao động" },
            { "name": "Người thợ vận hành", "type": "CREATIVE_REP", "desc": "Mô tả yêu cầu kỹ năng vận hành máy và đời sống thực tế của công nhân" },
            { "name": "Người quản lý", "type": "CREATIVE_REP", "desc": "Nêu yêu cầu phối hợp dây chuyền theo giờ và bài toán chi phí sản xuất" }
        ]
    },
    {
        "code": "10.07",
        "grade": "10",
        "examCode": "MD-10.07",
        "lesson": "Bài 7. Các cuộc cách mạng công nghiệp thời hiện đại",
        "topic": "Các cuộc cách mạng công nghiệp thời hiện đại",
        "format": "Tiểu phẩm",
        "scenario": "“Ba thế hệ, một công việc”: ba thế hệ kể cách làm việc, liên lạc và tìm kiếm thông tin.",
        "focus": "Những thay đổi do công nghệ; cơ hội và thách thức.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Thế hệ Ông/Bà (Thế kỷ XX)", "type": "CREATIVE_REP", "desc": "Chia sẻ cách tra cứu tài liệu giấy, gửi thư bưu điện và lao động cơ khí - điện tử sơ kỳ" },
            { "name": "Thế hệ Cha/Mẹ (Thời kỳ Internet)", "type": "CREATIVE_REP", "desc": "Tái hiện sự bùng nổ của máy tính cá nhân, thư điện tử và toàn cầu hóa thông tin" },
            { "name": "Thế hệ Trẻ (Kỷ nguyên số & AI)", "type": "CREATIVE_REP", "desc": "Trình bày ứng dụng trí tuệ nhân tạo, dữ liệu lớn cùng cơ hội và thách thức đạo đức số" }
        ]
    },
    {
        "code": "10.08",
        "grade": "10",
        "examCode": "MD-10.08A",
        "lesson": "Bài 8. Hành trình phát triển và thành tựu của văn minh Đông Nam Á thời cổ – trung đại",
        "topic": "Văn minh Đông Nam Á cổ – trung đại",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Gặp nhau tại thương cảng”: thương nhân, người dân và người làm nghề trao đổi hàng hóa, tri thức.",
        "focus": "Giao lưu văn hóa và sự tiếp thu có chọn lọc.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Thương nhân hàng hải", "type": "CREATIVE_REP", "desc": "Đem sản vật, chữ viết và tôn giáo giao lưu tại thương cảng Đông Nam Á" },
            { "name": "Cư dân & Nghệ nhân bản địa", "type": "CREATIVE_REP", "desc": "Trao đổi hương liệu, sản vật địa phương và tiếp thu văn hóa ngoại sinh có chọn lọc" }
        ]
    },
    {
        "code": "10.09A",
        "grade": "10",
        "examCode": "MD-10.09",
        "lesson": "Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam (Hoạt cảnh 5: Một ngày của cư dân Văn Lang)",
        "topic": "Văn minh cổ trên đất nước Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Một ngày của cư dân Văn Lang”: tái hiện sản xuất, sinh hoạt và đời sống cộng đồng (Kịch bản chuẩn 3 phần).",
        "focus": "Đặc điểm văn minh Văn Lang – Âu Lạc.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn chuyện nhịp sống lao động, sinh hoạt của cư dân Văn Lang" },
            { "name": "Người trồng lúa", "type": "CREATIVE_REP", "desc": "Tái hiện canh tác nông nghiệp lúa nước và trị thủy, giữ nước" },
            { "name": "Người thợ", "type": "CREATIVE_REP", "desc": "Chế tác, sửa chữa nông cụ, đồ đựng phục vụ sản xuất và sinh hoạt" },
            { "name": "Người đi thuyền", "type": "CREATIVE_REP", "desc": "Di chuyển, vận chuyển đồ dùng theo mạng lưới sông nước" },
            { "name": "Người trẻ", "type": "CREATIVE_REP", "desc": "Tìm hiểu mối gắn kết cộng đồng xóm làng và đối chiếu hiện vật khảo cổ Đông Sơn" }
        ]
    },
    {
        "code": "10.09B",
        "grade": "10",
        "examCode": "MD-10.09B",
        "lesson": "Bài 9. Một số nền văn minh cổ trên đất nước Việt Nam (Phần B: Văn minh Chăm-pa & Phù Nam)",
        "topic": "Văn minh cổ trên đất nước Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Dấu chân thương nhân”: chọn bối cảnh Chăm-pa hoặc Phù Nam, tái hiện hoạt động trao đổi hàng hóa.",
        "focus": "Đặc điểm kinh tế, văn hóa của nền văn minh được chọn.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh cảng thị Óc Eo (Phù Nam) hoặc thương cảng Chăm-pa" },
            { "name": "Cư dân & Thương nhân Chăm-pa / Phù Nam", "type": "CREATIVE_REP", "desc": "Tái hiện hoạt động giao thương đường biển, chế tác gốm, trang sức và kiến trúc đền tháp" }
        ]
    },
    {
        "code": "10.10A",
        "grade": "10",
        "examCode": "MD-10.10A",
        "lesson": "Bài 10. Văn minh Đại Việt (Phần A: Giáo dục và Khoa cử)",
        "topic": "Văn minh Đại Việt",
        "format": "Tiểu phẩm",
        "scenario": "“Đường đến khoa trường”: người học, gia đình và người dạy trao đổi về việc học, thi cử.",
        "focus": "Giáo dục, khoa cử và vị trí của người có học.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Thầy đồ / Quan đốc học", "type": "CREATIVE_REP", "desc": "Giảng giải đạo lý 'Hiền tài là nguyên khí của quốc gia' và phép tắc thi cử Đại Việt" },
            { "name": "Sĩ tử & Gia đình", "type": "CREATIVE_REP", "desc": "Trao đổi về chí hướng đèn sách, vượt khó dự thi Hương, thi Hội để giúp nước" }
        ]
    },
    {
        "code": "10.10B",
        "grade": "10",
        "examCode": "MD-10.10B",
        "lesson": "Bài 10. Văn minh Đại Việt (Phần B: Thủ công nghiệp & Làng nghề)",
        "topic": "Văn minh Đại Việt",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Tiếng nói của làng nghề”: người thợ giới thiệu quá trình làm một sản phẩm và ý nghĩa của nghề.",
        "focus": "Thành tựu thủ công nghiệp; giá trị di sản.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Nghệ nhân làng nghề Đại Việt", "type": "CREATIVE_REP", "desc": "Giới thiệu quy trình chế tác gốm Bát Tràng, đúc đồng hoặc dệt lụa truyền thống" },
            { "name": "Thợ phụ & Người học nghề", "type": "CREATIVE_REP", "desc": "Thực hành các công đoạn tỉ mỉ và nêu giá trị di sản văn hóa vật thể của làng nghề" }
        ]
    },
    {
        "code": "10.11",
        "grade": "10",
        "examCode": "MD-10.11",
        "lesson": "Bài 11. Các dân tộc trên đất nước Việt Nam",
        "topic": "Cộng đồng các dân tộc Việt Nam",
        "format": "Sân khấu tư liệu",
        "scenario": "“Chúng mình cùng kể”: học sinh đóng vai người giới thiệu các cộng đồng dân tộc qua thông tin đã kiểm chứng.",
        "focus": "Nhận thức về sự đa dạng của cộng đồng các dân tộc.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Thuyết minh viên văn hóa dân tộc", "type": "CREATIVE_REP", "desc": "Giới thiệu sự phân bố, ngữ hệ và bản sắc của 54 dân tộc anh em trên đất nước Việt Nam" },
            { "name": "Đại diện các cộng đồng dân tộc", "type": "CREATIVE_REP", "desc": "Chia sẻ nét đặc trưng về ngôn ngữ, địa bàn cư trú qua tư liệu đã kiểm chứng" }
        ]
    },
    {
        "code": "10.12",
        "grade": "10",
        "examCode": "MD-10.12",
        "lesson": "Bài 12. Khái quát về đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam",
        "topic": "Cộng đồng các dân tộc Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Chuyện kể trong một mái nhà”: giới thiệu cách ở, trang phục, nghề nghiệp và sinh hoạt của một cộng đồng cụ thể.",
        "focus": "Đặc điểm văn hóa và ý thức tôn trọng sự khác biệt.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Chủ nhà / Nghệ nhân bản địa", "type": "CREATIVE_REP", "desc": "Giới thiệu kiến trúc nhà ở, hoa văn thổ cẩm, ẩm thực và lễ hội truyền thống" },
            { "name": "Khách thăm / Học sinh tìm hiểu", "type": "CREATIVE_REP", "desc": "Trải nghiệm đời sống vật chất, tinh thần và thể hiện thái độ tôn trọng sự đa dạng văn hóa" }
        ]
    },
    {
        "code": "10.13",
        "grade": "10",
        "examCode": "MD-10.13",
        "lesson": "Bài 13. Khối đại đoàn kết dân tộc trong lịch sử Việt Nam",
        "topic": "Khối đại đoàn kết dân tộc Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Cùng góp sức”: chọn một sự kiện có tư liệu về sự phối hợp, đóng góp của các cộng đồng dân tộc.",
        "focus": "Vai trò của khối đại đoàn kết trong lịch sử.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_10.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện lịch sử", "type": "CREATIVE_REP", "desc": "Kết nối mạch tư liệu về truyền thống đoàn kết miền xuôi - miền ngược trong dựng nước và giữ nước" },
            { "name": "Đại diện đồng bào các dân tộc", "type": "CREATIVE_REP", "desc": "Tái hiện sự phối hợp bảo vệ biên cương, tiếp tế lương thực và xây dựng đất nước" }
        ]
    }
]

# 2. Toàn bộ 18 bài trong file Danh_Muc_Hoat_Canh_Khoi_11.pdf
KHOI_11_ITEMS = [
    {
        "code": "11.01",
        "grade": "11",
        "examCode": "MD-11.01",
        "lesson": "Bài 1. Một số vấn đề chung về cách mạng tư sản",
        "topic": "Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản",
        "format": "Đối thoại lịch sử",
        "scenario": "“Những tiếng nói trước cách mạng”: chọn một cuộc cách mạng, tái hiện yêu cầu của các lực lượng xã hội.",
        "focus": "Tiền đề, mục tiêu, lực lượng và kết quả của cách mạng tư sản.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Đại diện tầng lớp Tư sản / Quý tộc mới", "type": "CREATIVE_REP", "desc": "Nêu mâu thuẫn giữa sự phát triển kinh tế tư bản chủ nghĩa với chế độ phong kiến chuyên chế" },
            { "name": "Đại diện Nông dân & Bình dân thành thị", "type": "CREATIVE_REP", "desc": "Bày tỏ nguyện vọng xóa bỏ áp bức thuế khóa, đòi quyền tự do và ruộng đất" }
        ]
    },
    {
        "code": "11.02",
        "grade": "11",
        "examCode": "MD-11.02",
        "lesson": "Bài 2. Sự xác lập và phát triển của chủ nghĩa tư bản",
        "topic": "Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản",
        "format": "Tiểu phẩm",
        "scenario": "“Những đổi thay trong thành phố”: chủ doanh nghiệp, người lao động và người dân trao đổi về thay đổi kinh tế - xã hội.",
        "focus": "Sự phát triển của chủ nghĩa tư bản và những vấn đề đặt ra.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Chủ doanh nghiệp tư bản", "type": "CREATIVE_REP", "desc": "Trình bày sự mở rộng quy mô sản xuất, thương mại và đô thị hóa" },
            { "name": "Người lao động & Cư dân đô thị", "type": "CREATIVE_REP", "desc": "Phản ánh đời sống lao động làm thuê, phân hóa giàu nghèo và các vấn đề xã hội" }
        ]
    },
    {
        "code": "11.03",
        "grade": "11",
        "examCode": "MD-11.03",
        "lesson": "Bài 3. Sự hình thành Liên bang Cộng hòa xã hội chủ nghĩa Xô viết",
        "topic": "Chủ nghĩa xã hội từ năm 1917 đến nay",
        "format": "Mô phỏng nghị sự",
        "scenario": "“Vì sao cần một liên bang?”: người dẫn chuyện trình bày bối cảnh, các vai đại diện giải thích nhu cầu liên kết.",
        "focus": "Hoàn cảnh, quá trình và ý nghĩa của sự thành lập Liên Xô.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện lịch sử", "type": "CREATIVE_REP", "desc": "Trình bày bối cảnh nước Nga Xô viết và các nước cộng hòa đồng minh năm 1922" },
            { "name": "Đại biểu các nước Cộng hòa Xô viết", "type": "CREATIVE_REP", "desc": "Thảo luận dựa trên tư liệu về yêu cầu hợp tác kinh tế, quốc phòng và bình đẳng dân tộc" }
        ]
    },
    {
        "code": "11.04",
        "grade": "11",
        "examCode": "MD-11.04",
        "lesson": "Bài 4. Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai đến nay",
        "topic": "Chủ nghĩa xã hội từ năm 1917 đến nay",
        "format": "Sân khấu tư liệu",
        "scenario": "“Một gia đình trước đổi thay”: chọn một quốc gia và giai đoạn trong bài, tái hiện đời sống qua tư liệu.",
        "focus": "Thành tựu, khó khăn và quá trình đổi mới, cải cách.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh lịch sử và các mốc cải cách, đổi mới" },
            { "name": "Các thành viên gia đình", "type": "CREATIVE_REP", "desc": "Kể chuyện đời sống kinh tế, giáo dục, xã hội trước và sau công cuộc cải cách, mở cửa" }
        ]
    },
    {
        "code": "11.05",
        "grade": "11",
        "examCode": "MD-11.05",
        "lesson": "Bài 5. Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á",
        "topic": "Quá trình giành độc lập dân tộc ở Đông Nam Á",
        "format": "Tiểu phẩm",
        "scenario": "“Cuộc sống dưới chế độ thuộc địa”: chọn một địa bàn cụ thể, thể hiện tác động của chính sách cai trị tới người dân.",
        "focus": "Chính sách thuộc địa và những biến đổi kinh tế – xã hội.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người nông dân / Công nhân đồn điền", "type": "CREATIVE_REP", "desc": "Phản ánh gánh nặng sưu thuế, cướp đoạt ruộng đất và khai thác tài nguyên thuộc địa" },
            { "name": "Tầng lớp trí thức / Thị dân bản xứ", "type": "CREATIVE_REP", "desc": "Nhận diện sự biến đổi cơ cấu kinh tế - xã hội và tinh thần dân tộc thức tỉnh" }
        ]
    },
    {
        "code": "11.06",
        "grade": "11",
        "examCode": "MD-11.06",
        "lesson": "Bài 6. Hành trình đi đến độc lập dân tộc ở Đông Nam Á",
        "topic": "Quá trình giành độc lập dân tộc ở Đông Nam Á",
        "format": "Sân khấu tư liệu",
        "scenario": "“Ngày đón tin độc lập”: người dân ở một quốc gia Đông Nam Á tiếp nhận tin độc lập.",
        "focus": "Tiến trình giành độc lập; điểm chung và nét riêng.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Phát thanh viên bản tin lịch sử", "type": "CREATIVE_REP", "desc": "Điểm lại các mốc tuyên bố độc lập tiêu biểu tại Đông Nam Á (Indonesia, Việt Nam, Lào...)" },
            { "name": "Người dân đón nhận tin độc lập", "type": "CREATIVE_REP", "desc": "Tái hiện niềm tự hào và so sánh điểm chung, nét riêng trong con đường giành độc lập" }
        ]
    },
    {
        "code": "11.07A",
        "grade": "11",
        "examCode": "MD-11.07",
        "lesson": "Bài 7. Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam (Hoạt cảnh 6: Bạch Đằng – chuẩn bị cho trận đánh)",
        "topic": "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Bạch Đằng – chuẩn bị cho trận đánh”: chọn năm 938, tập trung vào việc chuẩn bị và phối hợp quân dân (Kịch bản chuẩn 3 phần).",
        "focus": "Vai trò lãnh đạo, địa hình và nghệ thuật quân sự.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập bối cảnh năm 938 trước cuộc tiến công của quân Nam Hán" },
            { "name": "Ngô Quyền", "type": "HISTORICAL_FACT", "desc": "Chỉ huy chọn cách đánh dựa vào địa hình sông nước, thủy triều và sự phối hợp toàn quân" },
            { "name": "Người quen sông nước", "type": "CREATIVE_REP", "desc": "Phân tích quy luật con nước lên – nước rút và vật cản dưới lòng sông" },
            { "name": "Người làm cọc", "type": "CREATIVE_REP", "desc": "Chuẩn bị gỗ, vạt nhọn và bố trí trận địa cọc theo hiệp đồng" },
            { "name": "Người chèo thuyền", "type": "CREATIVE_REP", "desc": "Thực hiện nhiệm vụ nhử địch gắn chặt với thời điểm nước rút và trận địa mai phục" }
        ]
    },
    {
        "code": "11.07B",
        "grade": "11",
        "examCode": "MD-11.07B",
        "lesson": "Bài 7. Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam (Phần B: Phòng tuyến Như Nguyệt)",
        "topic": "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Như Nguyệt – giữ vững phòng tuyến”: tái hiện việc tổ chức phòng thủ và tinh thần quân dân.",
        "focus": "Nghệ thuật tổ chức kháng chiến thời Lý.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh phòng tuyến sông Như Nguyệt trong kháng chiến chống Tống (1075–1077)" },
            { "name": "Tướng sĩ & Quân dân nhà Lý", "type": "CREATIVE_REP", "desc": "Tái hiện việc đắp lũy tre đất, canh giữ bờ nam và tinh thần quyết chiến bảo vệ sơn hà" }
        ]
    },
    {
        "code": "11.07C",
        "grade": "11",
        "examCode": "MD-11.09",
        "lesson": "Bài 7. Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam (Hoạt cảnh 7: Diên Hồng – tiếng nói đồng lòng)",
        "topic": "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam",
        "format": "Đối thoại lịch sử",
        "scenario": "“Diên Hồng – tiếng nói đồng lòng”: dựng cảnh tham khảo từ tư liệu về quyết tâm chống giặc (Kịch bản chuẩn 3 phần).",
        "focus": "Sức mạnh đoàn kết trong kháng chiến chống Mông – Nguyên.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập bối cảnh hội nghị Diên Hồng trước cuộc kháng chiến chống Nguyên lần thứ hai" },
            { "name": "Người truyền lời", "type": "CREATIVE_REP", "desc": "Nêu câu hỏi về nguy cơ xâm lược và việc giữ nước của muôn dân" },
            { "name": "Bô lão vùng ruộng", "type": "CREATIVE_REP", "desc": "Bàn việc lo lương thực, chăm sóc hậu phương và tiếp sức quân đội" },
            { "name": "Bô lão miền núi", "type": "CREATIVE_REP", "desc": "Khẳng định sự đồng lòng giữa các vùng miền, góp công dẫn lối và vận chuyển" },
            { "name": "Người trẻ", "type": "CREATIVE_REP", "desc": "Nhận thức ý nghĩa đoàn kết bằng hành động cụ thể khi trở về làng xóm" }
        ]
    },
    {
        "code": "11.07D",
        "grade": "11",
        "examCode": "MD-11.07D",
        "lesson": "Bài 7. Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam (Phần D: Đại thắng Kỷ Dậu 1789)",
        "topic": "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Mùa xuân tiến quân”: kể chuyện cuộc hành quân của nghĩa quân Tây Sơn trong kháng chiến chống Thanh.",
        "focus": "Vai trò lãnh đạo và cách tổ chức chiến đấu.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Tái hiện nhịp hành quân thần tốc mùa xuân năm Kỷ Dậu 1789 của nghĩa quân Tây Sơn" },
            { "name": "Nghĩa binh Tây Sơn & Dân binh", "type": "CREATIVE_REP", "desc": "Phối hợp cáng võng hành quân, hiệp đồng các đạo quân tiến đánh Ngọc Hồi - Đống Đa" }
        ]
    },
    {
        "code": "11.08A",
        "grade": "11",
        "examCode": "MD-11.08A",
        "lesson": "Bài 8. Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (Phần A: Khởi nghĩa Hai Bà Trưng)",
        "topic": "Khởi nghĩa và chiến tranh giải phóng dân tộc",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Hưởng ứng Hai Bà Trưng”: người dân tham gia, góp sức cho cuộc khởi nghĩa.",
        "focus": "Nguyên nhân, lực lượng và ý nghĩa cuộc khởi nghĩa.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh ách cai trị hà khắc của nhà Đông Hán và lời hịch Mê Linh năm 40" },
            { "name": "Hào kiệt & Nhân dân các quận", "type": "CREATIVE_REP", "desc": "Rèn sắm vũ khí, tụ nghĩa hưởng ứng Hai Bà Trưng nổi dậy giành quyền tự chủ" }
        ]
    },
    {
        "code": "11.08B",
        "grade": "11",
        "examCode": "MD-11.11",
        "lesson": "Bài 8. Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (Hoạt cảnh 8: Lam Sơn – từ gian khó đến thắng lợi)",
        "topic": "Khởi nghĩa và chiến tranh giải phóng dân tộc",
        "format": "Tiểu phẩm",
        "scenario": "“Lam Sơn – từ gian khó đến thắng lợi”: dựng cảnh đời sống nghĩa quân và sự hỗ trợ của nhân dân (Kịch bản chuẩn 3 phần).",
        "focus": "Vai trò của nhân dân; quá trình phát triển của khởi nghĩa.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn chuyện từ những năm đầu gian khó tại Lam Sơn đến thắng lợi năm 1427" },
            { "name": "Người mẹ", "type": "CREATIVE_REP", "desc": "Chia sẻ lương thực tiếp tế cho nghĩa quân và giữ gìn hậu phương" },
            { "name": "Người con", "type": "CREATIVE_REP", "desc": "Phụ giúp chuẩn bị đồ dùng, buộc túi gạo và tìm hiểu ý nghĩa sự đóng góp của dân" },
            { "name": "Người nghĩa quân", "type": "CREATIVE_REP", "desc": "Trân trọng sự đùm bọc của nhân dân, phối hợp lực lượng vượt qua vây ráp" },
            { "name": "Người chuyển tin", "type": "CREATIVE_REP", "desc": "Giữ liên lạc, kết nối đường đi và điểm nhận lương thực an toàn" }
        ]
    },
    {
        "code": "11.08C",
        "grade": "11",
        "examCode": "MD-11.08C",
        "lesson": "Bài 8. Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (Phần C: Phong trào Tây Sơn)",
        "topic": "Khởi nghĩa và chiến tranh giải phóng dân tộc",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Tây Sơn – những người cùng đứng dậy”: tập trung vào bối cảnh và lực lượng tham gia phong trào.",
        "focus": "Nguyên nhân, quá trình và đóng góp của phong trào Tây Sơn.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Khái quát bối cảnh Đàng Trong nửa cuối thế kỷ XVIII và cuộc khởi nghĩa bùng nổ năm 1771" },
            { "name": "Nông dân, Thợ thủ công & Đồng bào Thượng", "type": "CREATIVE_REP", "desc": "Cùng hội tụ dưới ngọn cờ Tây Sơn, góp phần xóa bỏ chia cắt và bảo vệ độc lập dân tộc" }
        ]
    },
    {
        "code": "11.09",
        "grade": "11",
        "examCode": "MD-11.12",
        "lesson": "Bài 9. Cuộc cải cách của Hồ Quý Ly và triều Hồ (Hoạt cảnh 9: Một chính sách, nhiều góc nhìn)",
        "topic": "Các cuộc cải cách lớn trong lịch sử Việt Nam",
        "format": "Đối thoại lịch sử",
        "scenario": "“Một chính sách, nhiều góc nhìn”: chọn một chính sách, các vai trao đổi về mục tiêu và khó khăn khi thực hiện (Kịch bản chuẩn 3 phần).",
        "focus": "Nội dung, kết quả và giới hạn của cải cách.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Giới thiệu bối cảnh năm 1397 khi ban hành phép hạn điền" },
            { "name": "Người thi hành", "type": "CREATIVE_REP", "desc": "Giải thích chủ trương hạn chế tập trung ruộng tư và yêu cầu đo đạc, kê khai" },
            { "name": "Người sở hữu nhiều ruộng", "type": "CREATIVE_REP", "desc": "Thể hiện phản ứng của nhóm bị tác động quyền lợi trước quy định mới" },
            { "name": "Người làm ruộng", "type": "CREATIVE_REP", "desc": "Quan tâm tác động thực tế của chính sách đến việc cày cấy và đời sống" },
            { "name": "Người ghi sổ", "type": "CREATIVE_REP", "desc": "Kiểm tra số liệu, phân biệt mục tiêu chính sách, cách thực thi và kết quả thực tế" }
        ]
    },
    {
        "code": "11.10",
        "grade": "11",
        "examCode": "MD-11.10",
        "lesson": "Bài 10. Cuộc cải cách của Lê Thánh Tông",
        "topic": "Các cuộc cải cách lớn trong lịch sử Việt Nam",
        "format": "Mô phỏng nghị sự",
        "scenario": "“Tổ chức lại việc nước”: mô phỏng trao đổi về quản lý, pháp luật hoặc tuyển chọn quan lại.",
        "focus": "Nội dung và ý nghĩa của cải cách.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Quan chưởng lục bộ / Ngự sử đài", "type": "CREATIVE_REP", "desc": "Trình bày cơ chế phân quyền Lục bộ - Lục tự - Lục khoa và giám sát quan lại" },
            { "name": "Quan soạn thảo Quốc triều hình luật", "type": "CREATIVE_REP", "desc": "Thảo luận các điều khoản pháp luật bảo vệ chủ quyền, trật tự xã hội và tuyển dụng qua khoa cử" }
        ]
    },
    {
        "code": "11.11",
        "grade": "11",
        "examCode": "MD-11.11A",
        "lesson": "Bài 11. Cuộc cải cách của Minh Mạng",
        "topic": "Các cuộc cải cách lớn trong lịch sử Việt Nam",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Từ trung ương đến địa phương”: người dẫn chuyện và các vai giải thích sự thay đổi trong tổ chức hành chính.",
        "focus": "Cải cách bộ máy nhà nước và quản lý lãnh thổ.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện", "type": "CREATIVE_REP", "desc": "Giới thiệu bản đồ hành chính 30 tỉnh và 1 phủ Thừa Thiên thời Minh Mạng (1831–1832)" },
            { "name": "Quan Nội các & Tổng đốc / Tuần phủ", "type": "CREATIVE_REP", "desc": "Giải thích cơ chế thống nhất quản lý hành chính từ triều đình Huế đến các tỉnh, phủ, huyện" }
        ]
    },
    {
        "code": "11.12",
        "grade": "11",
        "examCode": "MD-11.12A",
        "lesson": "Bài 12. Vị trí và tầm quan trọng của Biển Đông",
        "topic": "Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông",
        "format": "Tiểu phẩm",
        "scenario": "“Những nghề gắn với biển”: người làm nghề biển, vận tải và nghiên cứu trao đổi về vai trò của biển.",
        "focus": "Giá trị của Biển Đông đối với kinh tế và quốc phòng.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Ngư dân & Thuyền trưởng vận tải biển", "type": "CREATIVE_REP", "desc": "Chia sẻ tầm quan trọng của tuyến hàng hải quốc tế và nguồn lợi thủy sản, tài nguyên Biển Đông" },
            { "name": "Nhà nghiên cứu biển & Chiến sĩ hải quân", "type": "CREATIVE_REP", "desc": "Phân tích vị trí địa chiến lược trọng yếu về quốc phòng, an ninh và giao thương khu vực" }
        ]
    },
    {
        "code": "11.13",
        "grade": "11",
        "examCode": "MD-11.13",
        "lesson": "Bài 13. Việt Nam và Biển Đông (Hoạt cảnh 10: Theo dấu đội Hoàng Sa)",
        "topic": "Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông",
        "format": "Sân khấu tư liệu",
        "scenario": "“Theo dấu đội Hoàng Sa”: kể chuyện hoạt động thực thi chủ quyền qua tư liệu lịch sử đã kiểm chứng (Kịch bản chuẩn 3 phần).",
        "focus": "Quá trình xác lập, thực thi và bảo vệ chủ quyền.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Kết nối giữa lớp học tra cứu Phủ biên tạp lục và cảnh tái hiện đội Hoàng Sa" },
            { "name": "Người tra cứu", "type": "CREATIVE_REP", "desc": "Trình bày thông tin về đội Hoàng Sa từ tư liệu của Lê Quý Đôn biên soạn năm 1776" },
            { "name": "Người kiểm nguồn", "type": "CREATIVE_REP", "desc": "Kiểm tra tác giả, tác phẩm, năm biên soạn và phân biệt tư liệu gốc với lời thoại tái hiện" },
            { "name": "Đội viên giả định", "type": "CREATIVE_REP", "desc": "Tái hiện công việc chuẩn bị hành trang vượt biển theo sự tổ chức của nhà nước" },
            { "name": "Người ghi chép giả định", "type": "CREATIVE_REP", "desc": "Kiểm đếm phần việc, báo cáo kết quả và giao nộp theo quy định triều đình" }
        ]
    }
]

# 3. Toàn bộ 13 bài trong file Danh_Muc_Hoat_Canh_Khoi_12.pdf
KHOI_12_ITEMS = [
    {
        "code": "12.01",
        "grade": "12",
        "examCode": "MD-12.01",
        "lesson": "Bài 1. Liên hợp quốc (Hoạt cảnh 11: Cùng tìm một giải pháp hòa bình)",
        "topic": "Liên hợp quốc và Trật tự thế giới",
        "format": "Mô phỏng nghị sự",
        "scenario": "“Cùng tìm một giải pháp hòa bình”: mô phỏng cuộc thảo luận về một vấn đề quốc tế (Kịch bản chuẩn 3 phần).",
        "focus": "Mục tiêu, nguyên tắc và vai trò của Liên hợp quốc.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Giới thiệu phiên đối thoại mô phỏng giải quyết bất đồng nguồn nước bằng biện pháp hòa bình" },
            { "name": "Đại diện nước A", "type": "CREATIVE_REP", "desc": "Trình bày nhu cầu nguồn nước và đề xuất kiểm tra số liệu tại các điểm đo" },
            { "name": "Đại diện nước B", "type": "CREATIVE_REP", "desc": "Đối chiếu dữ liệu và thống nhất mời chuyên gia kiểm tra chung" },
            { "name": "Điều phối viên", "type": "CREATIVE_REP", "desc": "Điều phối thương lượng dựa trên nguyên tắc hòa bình của Hiến chương Liên hợp quốc" },
            { "name": "Đại diện cứu trợ", "type": "CREATIVE_REP", "desc": "Đề xuất hỗ trợ nhân đạo nước sạch thiết yếu cho người dân trong khi tiếp tục đàm phán" }
        ]
    },
    {
        "code": "12.02",
        "grade": "12",
        "examCode": "MD-12.02",
        "lesson": "Bài 2. Trật tự thế giới trong Chiến tranh lạnh",
        "topic": "Liên hợp quốc và Trật tự thế giới",
        "format": "Sân khấu tư liệu",
        "scenario": "“Thế giới nhìn từ hai phía”: người dẫn chuyện dùng bản đồ và tư liệu để giới thiệu sự phân chia, đối đầu.",
        "focus": "Đặc điểm của trật tự hai cực và tác động của Chiến tranh lạnh.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện tư liệu", "type": "CREATIVE_REP", "desc": "Sử dụng bản đồ thế giới sau Hội nghị Ianta (1945) để thuyết minh sự hình thành hai cực" },
            { "name": "Hai bình luận viên lịch sử", "type": "CREATIVE_REP", "desc": "Đối thoại phân tích đặc điểm đối đầu Đông – Tây và tác động của Chiến tranh lạnh tới quan hệ quốc tế" }
        ]
    },
    {
        "code": "12.03",
        "grade": "12",
        "examCode": "MD-12.03",
        "lesson": "Bài 3. Trật tự thế giới sau Chiến tranh lạnh",
        "topic": "Liên hợp quốc và Trật tự thế giới",
        "format": "Mô phỏng nghị sự",
        "scenario": "“Hợp tác hay đối đầu?”: các vai thảo luận một tình huống quốc tế được giáo viên lựa chọn.",
        "focus": "Những xu thế và biến chuyển của thế giới.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Điều phối viên diễn đàn quốc tế", "type": "CREATIVE_REP", "desc": "Nêu các xu thế phát triển chính của thế giới sau năm 1991: đa cực, lấy kinh tế làm trọng tâm, đối thoại hợp tác" },
            { "name": "Các đại biểu phân tích chiến lược", "type": "CREATIVE_REP", "desc": "Thảo luận cơ hội hợp tác kinh tế, khoa học công nghệ và thách thức an ninh phi truyền thống" }
        ]
    },
    {
        "code": "12.04",
        "grade": "12",
        "examCode": "MD-12.04",
        "lesson": "Bài 4. Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN) (Hoạt cảnh 12: Cùng mở một chặng đường)",
        "topic": "Hiệp hội các quốc gia Đông Nam Á (ASEAN)",
        "format": "Mô phỏng nghị sự",
        "scenario": "“Cùng mở một chặng đường”: sân khấu kể chuyện về sự thành lập và mở rộng ASEAN (Kịch bản chuẩn 3 phần).",
        "focus": "Hoàn cảnh ra đời, mục tiêu và quá trình phát triển.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn chuyện hai mốc lịch sử: thành lập ASEAN (8/8/1967) và Việt Nam gia nhập (28/7/1995)" },
            { "name": "Vai Indonesia & Malaysia", "type": "CREATIVE_REP", "desc": "Nêu nhu cầu hợp tác khu vực và giữ môi trường hòa bình, ổn định" },
            { "name": "Vai Philippines & Singapore", "type": "CREATIVE_REP", "desc": "Làm rõ nguyên tắc hợp tác giữa các quốc gia độc lập và theo dõi từng chặng mở rộng" },
            { "name": "Vai Thái Lan", "type": "CREATIVE_REP", "desc": "Kiểm tra mốc Tuyên bố Bangkok ngày 8/8/1967 với 5 nước sáng lập" }
        ]
    },
    {
        "code": "12.05",
        "grade": "12",
        "examCode": "MD-12.05",
        "lesson": "Bài 5. Cộng đồng ASEAN: Từ ý tưởng đến hiện thực",
        "topic": "Hiệp hội các quốc gia Đông Nam Á (ASEAN)",
        "format": "Tiểu phẩm",
        "scenario": "“Một dự án chung của thanh niên ASEAN”: các vai đề xuất hợp tác về giáo dục, văn hóa hoặc môi trường.",
        "focus": "Các trụ cột cộng đồng, cơ hội và thách thức.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Đại diện Thanh niên Việt Nam", "type": "CREATIVE_REP", "desc": "Đề xuất sáng kiến kết nối di sản văn hóa, chuyển đổi số và bảo vệ môi trường khu vực" },
            { "name": "Đại diện Thanh niên các nước ASEAN", "type": "CREATIVE_REP", "desc": "Thảo luận sự gắn kết giữa 3 trụ cột (APSC, AEC, ASCC) cùng cơ hội và thách thức hội nhập" }
        ]
    },
    {
        "code": "12.06A",
        "grade": "12",
        "examCode": "MD-12.06",
        "lesson": "Bài 6. Cách mạng tháng Tám năm 1945 (Hoạt cảnh 13: Khi thời cơ đến)",
        "topic": "Cách mạng tháng Tám năm 1945",
        "format": "Sân khấu tư liệu",
        "scenario": "“Khi thời cơ đến”: người dẫn chuyện trình bày tin tức, quần chúng chuẩn bị và tham gia giành chính quyền (Kịch bản chuẩn 3 phần).",
        "focus": "Nhận diện thời cơ và vai trò của quần chúng.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập bối cảnh tháng 8/1945 khi phát xít Nhật đầu hàng Đồng minh" },
            { "name": "Người chuyển tin", "type": "CREATIVE_REP", "desc": "Chuyển bản tin chính xác, đối chiếu chỉ đạo cho các cơ sở cách mạng" },
            { "name": "Người phụ trách cơ sở", "type": "CREATIVE_REP", "desc": "Làm rõ mối quan hệ giữa thời cơ khách quan với quá trình chuẩn bị lực lượng bền bỉ" },
            { "name": "Thanh niên", "type": "CREATIVE_REP", "desc": "Nhận thức ý nghĩa hành động kịp thời gắn với tổ chức chặt chẽ" },
            { "name": "Người dân", "type": "CREATIVE_REP", "desc": "Tham gia đoàn thể, phối hợp giành chính quyền thắng lợi" }
        ]
    },
    {
        "code": "12.06B",
        "grade": "12",
        "examCode": "MD-12.06B",
        "lesson": "Bài 6. Cách mạng tháng Tám năm 1945 (Phần B: Ngày Độc lập 2/9/1945)",
        "topic": "Cách mạng tháng Tám năm 1945",
        "format": "Sân khấu tư liệu",
        "scenario": "“Ngày độc lập qua lời người chứng kiến”: kể lại không khí ngày 2/9/1945 dựa trên hồi ký, ảnh và văn bản.",
        "focus": "Kết quả và ý nghĩa của Cách mạng tháng Tám.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện tư liệu", "type": "CREATIVE_REP", "desc": "Giới thiệu tư liệu ảnh Quảng trường Ba Đình ngày 2/9/1945 và bản Tuyên ngôn Độc lập" },
            { "name": "Nhân chứng lịch sử (Qua hồi ký)", "type": "CREATIVE_REP", "desc": "Kể lại cảm xúc thiêng liêng của người dân tự do trong ngày khai sinh nước Việt Nam Dân chủ Cộng hòa" }
        ]
    },
    {
        "code": "12.07A",
        "grade": "12",
        "examCode": "MD-12.07A",
        "lesson": "Bài 7. Cuộc kháng chiến chống thực dân Pháp (1945–1954) (Phần A: Cả nước cùng góp sức)",
        "topic": "Kháng chiến chống thực dân Pháp (1945–1954)",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Cả nước cùng góp sức”: chọn hoạt động góp lương thực, học chữ hoặc hỗ trợ chính quyền sau cách mạng.",
        "focus": "Khó khăn sau cách mạng và sức mạnh của nhân dân.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Cán bộ Bình dân học vụ / Hũ gạo cứu đói", "type": "CREATIVE_REP", "desc": "Vận động nhân dân tham gia diệt giặc đói, diệt giặc dốt và Tuần lễ Vàng" },
            { "name": "Người dân các tầng lớp", "type": "CREATIVE_REP", "desc": "Đồng lòng nhường cơm sẻ áo, đi học chữ Quốc ngữ và bảo vệ chính quyền cách mạng non trẻ" }
        ]
    },
    {
        "code": "12.07B",
        "grade": "12",
        "examCode": "MD-12.09",
        "lesson": "Bài 7. Cuộc kháng chiến chống thực dân Pháp (1945–1954) (Hoạt cảnh 14: Đường đến Điện Biên)",
        "topic": "Kháng chiến chống thực dân Pháp (1945–1954)",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Đường đến Điện Biên”: dân công vận chuyển, người dân tiếp tế, chiến sĩ phối hợp (Kịch bản chuẩn 3 phần).",
        "focus": "Hậu phương, hậu cần và sức mạnh chiến tranh nhân dân.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập mạng lưới hậu cần chiến dịch Điện Biên Phủ năm 1954" },
            { "name": "Người dân công", "type": "CREATIVE_REP", "desc": "Chằng buộc hàng hóa cẩn thận, vận chuyển bằng xe đạp thồ qua từng chặng" },
            { "name": "Người sửa xe", "type": "CREATIVE_REP", "desc": "Kiểm tra khung xe, gia cố tay thồ phù hợp địa hình đèo dốc" },
            { "name": "Người dân tiếp tế", "type": "CREATIVE_REP", "desc": "Ghi chép loại hàng, nơi nhận và bàn giao chính xác giữa các chặng" },
            { "name": "Người chiến sĩ", "type": "CREATIVE_REP", "desc": "Phối hợp tiếp nhận lương thực, đạn dược nơi tiền tuyến" }
        ]
    },
    {
        "code": "12.08A",
        "grade": "12",
        "examCode": "MD-12.10",
        "lesson": "Bài 8. Cuộc kháng chiến chống Mỹ, cứu nước (1954–1975) (Hoạt cảnh 15: Một chuyến hàng trên Trường Sơn)",
        "topic": "Kháng chiến chống Mỹ, cứu nước (1954–1975)",
        "format": "Hoạt cảnh đời sống",
        "scenario": "“Một chuyến hàng trên Trường Sơn”: câu chuyện giữa người giao liên, vận tải và lực lượng bảo đảm tuyến đường (Kịch bản chuẩn 3 phần).",
        "focus": "Vai trò của tuyến vận tải và sự phối hợp các lực lượng.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.pdf",
        "fileType": "application/pdf",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn", "type": "CREATIVE_REP", "desc": "Dẫn nhập hệ thống chi viện chiến lược Trường Sơn (Đoàn 559)" },
            { "name": "Người vận chuyển", "type": "CREATIVE_REP", "desc": "Đưa hàng hóa vượt cung đường hiểm trở theo sự chỉ dẫn của mạng lưới thông tin" },
            { "name": "Người giao liên", "type": "CREATIVE_REP", "desc": "Nắm bắt tình hình thay đổi trên tuyến, kết nối nơi giao và nơi nhận" },
            { "name": "Người bảo đảm đường", "type": "CREATIVE_REP", "desc": "San lấp, thông đường và báo cáo trung thực tình trạng từng cung đoạn" },
            { "name": "Người tiếp nhận", "type": "CREATIVE_REP", "desc": "Kiểm nhận hàng hóa, tiếp chuyển kịp thời cho chiến trường miền Nam" }
        ]
    },
    {
        "code": "12.08B",
        "grade": "12",
        "examCode": "MD-12.08B",
        "lesson": "Bài 8. Cuộc kháng chiến chống Mỹ, cứu nước (1954–1975) (Phần B: Hậu phương gửi tới tiền tuyến)",
        "topic": "Kháng chiến chống Mỹ, cứu nước (1954–1975)",
        "format": "Tiểu phẩm",
        "scenario": "“Hậu phương gửi tới tiền tuyến”: chọn câu chuyện sản xuất, chi viện hoặc chăm sóc gia đình chiến sĩ.",
        "focus": "Quan hệ hậu phương – tiền tuyến.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Xã viên hợp tác xã / Công nhân hậu phương miền Bắc", "type": "CREATIVE_REP", "desc": "Thi đua 'Thóc không thiếu một cân, quân không thiếu một người', vừa sản xuất vừa chiến đấu" },
            { "name": "Gia đình quân nhân & Thanh niên xung phong", "type": "CREATIVE_REP", "desc": "Viết thư động viên tiền tuyến và sẵn sàng lên đường chi viện cho miền Nam ruột thịt" }
        ]
    },
    {
        "code": "12.08C",
        "grade": "12",
        "examCode": "MD-12.08C",
        "lesson": "Bài 8. Cuộc kháng chiến chống Mỹ, cứu nước (1954–1975) (Phần C: Ngày đất nước thống nhất 30/4/1975)",
        "topic": "Kháng chiến chống Mỹ, cứu nước (1954–1975)",
        "format": "Sân khấu tư liệu",
        "scenario": "“Ngày đất nước thống nhất”: gia đình tiếp nhận tin chiến thắng, gặp lại người thân.",
        "focus": "Ý nghĩa lịch sử của thắng lợi năm 1975.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Người dẫn chuyện bản tin chiến thắng", "type": "CREATIVE_REP", "desc": "Truyền đi bản tin lịch sử trưa ngày 30/4/1975 chiến dịch Hồ Chí Minh toàn thắng" },
            { "name": "Gia đình đoàn tụ Bắc – Nam", "type": "CREATIVE_REP", "desc": "Tái hiện giây phút vỡ òa hạnh phúc non sông thu về một mối sau 21 năm chia cắt" }
        ]
    },
    {
        "code": "12.09",
        "grade": "12",
        "examCode": "MD-12.09A",
        "lesson": "Bài 9. Đấu tranh bảo vệ Tổ quốc sau tháng 4/1975 và bài học lịch sử",
        "topic": "Đấu tranh bảo vệ Tổ quốc từ sau tháng 4/1975 đến nay",
        "format": "Sân khấu tư liệu",
        "scenario": "“Giữ bình yên nơi biên giới”: chọn câu chuyện có tư liệu về sự phối hợp giữa nhân dân và lực lượng bảo vệ biên giới.",
        "focus": "Nhiệm vụ bảo vệ Tổ quốc; trách nhiệm và sức mạnh đoàn kết.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Chiến sĩ Biên phòng / Hải đảo", "type": "CREATIVE_REP", "desc": "Ngày đêm tuần tra bảo vệ từng tấc đất biên cương, cột mốc và biển đảo Tổ quốc" },
            { "name": "Người dân vùng biên giới", "type": "CREATIVE_REP", "desc": "Phối hợp giữ gìn an ninh thôn bản, tiếp sức bộ đội và phát huy bài học đại đoàn kết dân tộc" }
        ]
    }
]

# 4. 5 bài Trọn bộ Hồ sơ tệp gốc (để tải trực tiếp trọn bộ từng tệp PDF / Word)
SUMMARY_FILE_ITEMS = [
    {
        "code": "10.GV01",
        "grade": "10",
        "examCode": "MD-10.DM01",
        "lesson": "[Trọn bộ File Khối 10] Hồ sơ Tư liệu & Danh mục 17 Hoạt cảnh Lịch sử Khối 10 (Chuẩn GDPT 2018)",
        "topic": "Văn minh thế giới & Việt Nam cổ – trung đại",
        "format": "Tài liệu PDF",
        "scenario": "Bảng phân loại chi tiết toàn bộ 17 bài học SGK Lịch sử 10 có khả năng hoạt cảnh hóa, định hướng tái hiện đời sống, thành tựu văn minh và sinh hoạt xã hội.",
        "focus": "Nắm vững định hướng sân khấu hóa SGK Lịch sử 10: Văn minh Ai Cập, Lưỡng Hà, Hy Lạp - La Mã, Văn Lang - Âu Lạc, Chăm-pa, Phù Nam, Đại Việt.",
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
        "lesson": "[Trọn bộ File Khối 11] Hồ sơ Tư liệu & Danh mục 18 Hoạt cảnh Lịch sử Khối 11 (Chuẩn GDPT 2018)",
        "topic": "Cách mạng, Cải cách & Chiến tranh bảo vệ Tổ quốc",
        "format": "Tài liệu PDF",
        "scenario": "Hệ thống hóa toàn bộ 18 tình huống ra quyết định lịch sử, tranh luận cải cách triều đại, phối hợp tác chiến bảo vệ chủ quyền biên cương và biển đảo.",
        "focus": "Trọng tâm khai thác đối thoại lịch sử, xung đột lập trường và quyết sách dân tộc: Kháng chiến chống ngoại xâm, Cải cách Hồ Quý Ly, Lê Thánh Tông, Minh Mạng, Đội Hoàng Sa.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_11.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Tướng sĩ Bạch Đằng / Binh sĩ nhà Trần", "type": "HISTORICAL_FACT", "desc": "Chuẩn bị trận địa cọc, đối thoại chiến thuật tác chiến trên sông" },
            { "name": "Bô lão Diên Hồng", "type": "HISTORICAL_FACT", "desc": "Đồng thanh quyết tâm chống giặc, thể hiện ý chí quật cường toàn dân tộc" },
            { "name": "Thủy binh Đội Hoàng Sa", "type": "HISTORICAL_FACT", "desc": "Theo lệnh triều đình cắm mốc, đo đạc hải trình và bảo vệ quần đảo" }
        ]
    },
    {
        "code": "12.GV01",
        "grade": "12",
        "examCode": "MD-12.DM01",
        "lesson": "[Trọn bộ File Khối 12] Hồ sơ Tư liệu & Danh mục 13 Hoạt cảnh Lịch sử Khối 12 (Chuẩn GDPT 2018)",
        "topic": "Thế giới hiện đại & Việt Nam từ năm 1945 đến nay",
        "format": "Tài liệu PDF",
        "scenario": "Sân khấu tư liệu, mô phỏng nghị sự ngoại giao, tái hiện toàn bộ 13 chặng đường kháng chiến và đàm phán quốc tế trên nền tư liệu lịch sử có thật.",
        "focus": "Khai thác tư liệu hình ảnh, phim, hiệp ước lịch sử: Liên hợp quốc, ASEAN, Cách mạng tháng Tám, Điện Biên Phủ, Tuyến đường Trường Sơn.",
        "fileName": "Danh_Muc_Hoat_Canh_Khoi_12.pdf",
        "fileType": "application/pdf",
        "characters": [
            { "name": "Đại biểu Liên hợp quốc / ASEAN", "type": "CREATIVE_REP", "desc": "Mô phỏng nghị sự quốc tế vì hòa bình, ổn định và hợp tác khu vực" },
            { "name": "Chiến sĩ vận tải / Giao liên Trường Sơn", "type": "CREATIVE_REP", "desc": "Phối hợp các mắt xích thông tin, bảo đảm đường chi viện tiền tuyến" },
            { "name": "Dân công hỏa tuyến Điện Biên", "type": "CREATIVE_REP", "desc": "Tiếp tế đạn dược, vận chuyển lương thực phục vụ chiến dịch" }
        ]
    },
    {
        "code": "12.W15",
        "grade": "12",
        "examCode": "MD-15.PDF",
        "lesson": "[Trọn bộ 47 Trang PDF] Tuyển tập 15 Hoạt cảnh Lịch sử THPT Chuẩn Sư phạm (Tài liệu gốc GDPT 2018)",
        "topic": "Tuyển tập 15 Hoạt cảnh Lịch sử THPT (Chương trình GDPT 2018)",
        "format": "Tài liệu PDF",
        "scenario": "Tài liệu sư phạm toàn diện 47 trang bao gồm đầy đủ 15 kịch bản dạng bảng (Mỗi khối 5 bài), phân vai học sinh, lời thoại gốc, thao tác thẻ dàn dựng và câu hỏi sau xem.",
        "focus": "Tài liệu chính thức dành cho Giáo viên tổ chức và Học sinh luyện tập hoạt cảnh trên lớp bám sát mục tiêu phẩm chất và năng lực SGK GDPT 2018.",
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
        "lesson": "[Trọn bộ Word .DOCX] 15 Kịch bản Hoạt cảnh Lịch sử Dạng bảng (Tệp Microsoft Word biên soạn)",
        "topic": "Kịch bản Sân khấu hóa 15 bài học Lịch sử THPT",
        "format": "Kịch bản Word (.docx)",
        "scenario": "Tệp Word nguyên bản chuẩn soạn giảng của giáo viên, chia sẵn bảng phân vai 3 phần và lời thoại để in ấn phát cho các nhóm học sinh.",
        "focus": "Công cụ sư phạm linh hoạt cho phép Thầy/Cô và các nhóm lớp tùy chỉnh tên học sinh, kịch bản chi tiết và tổ chức hoạt động trải nghiệm.",
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.docx",
        "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "characters": [
            { "name": "Giáo viên / Nhóm trưởng phụ trách", "type": "CREATIVE_REP", "desc": "Điều phối phân vai, kiểm tra đạo cụ và bấm giờ luyện tập" },
            { "name": "Các diễn viên học sinh", "type": "CREATIVE_REP", "desc": "Nhận vai, thuộc thoại và tập theo thao tác thẻ gợi ý" }
        ]
    }
]

# 5. Thêm 15 bài Kịch bản Hoạt cảnh Dạng bảng độc lập từ tệp 15_Hoat_Canh_Lich_Su_GDPT2018.docx / .pdf
SCRIPTS_15_DEDICATED_TUPLES = [
    ("MD-10.04", "10", "10.04A", "Hoạt cảnh 01 (Khối 10 - 10.04A): Bên dòng sông Nile — Kịch bản 3 phần dạng bảng", "Văn minh phương Đông cổ – trung đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh theo lượt thoại, Câu hỏi sau xem): Người nông dân, người ghi chép và người thợ bên dòng sông Nile.", "Mối liên hệ giữa điều kiện tự nhiên, sản xuất và thành tựu văn minh Ai Cập."),
    ("MD-10.05", "10", "10.04B", "Hoạt cảnh 02 (Khối 10 - 10.04B): Khi chữ viết ra đời — Kịch bản 3 phần dạng bảng", "Văn minh phương Đông cổ – trung đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh tại kho lương thực Lưỡng Hà, Câu hỏi sau xem): Mô phỏng việc ghi chép, lưu giữ thông tin trên bảng đất sét.", "Vai trò của chữ viết; phân biệt đặc điểm giữa các nền văn minh."),
    ("MD-10.08", "10", "10.05A", "Hoạt cảnh 03 (Khối 10 - 10.05A): Tiếng nói ở Athens — Kịch bản 3 phần dạng bảng", "Văn minh phương Tây cổ – trung đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Demos, Thaleia, Leon..., Bảng diễn 3 cảnh, Câu hỏi sau xem): Đối thoại giữa công dân nam Athens và những người không có quyền biểu quyết.", "Đặc điểm và giới hạn của nền dân chủ Athens."),
    ("MD-10.06", "10", "10.06", "Hoạt cảnh 04 (Khối 10 - 10.06): Từ xưởng thủ công đến nhà máy — Kịch bản 3 phần dạng bảng", "Các cuộc cách mạng công nghiệp thời cận đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 2 cảnh Trước - Sau khi vào nhà máy, Câu hỏi sau xem): Gia đình thợ dệt trước sự xuất hiện của máy móc.", "Thành tựu và tác động của cách mạng công nghiệp."),
    ("MD-10.09", "10", "10.09A", "Hoạt cảnh 05 (Khối 10 - 10.09A): Một ngày của cư dân Văn Lang — Kịch bản 3 phần dạng bảng", "Văn minh cổ trên đất nước Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh: Buổi sớm ra đồng - Việc nhà việc xóm - Nhịp sống bên nhau, Câu hỏi sau xem).", "Đặc điểm văn minh Văn Lang – Âu Lạc."),
    ("MD-11.07", "11", "11.07A", "Hoạt cảnh 06 (Khối 11 - 11.07A): Bạch Đằng – chuẩn bị cho trận đánh — Kịch bản 3 phần dạng bảng", "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Ngô Quyền, người quen sông, người làm cọc..., Bảng diễn 3 cảnh trên sa bàn năm 938, Câu hỏi sau xem).", "Vai trò lãnh đạo, địa hình và nghệ thuật quân sự."),
    ("MD-11.09", "11", "11.07C", "Hoạt cảnh 07 (Khối 11 - 11.07C): Diên Hồng – tiếng nói đồng lòng — Kịch bản 3 phần dạng bảng", "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Người truyền lời, Bô lão vùng ruộng, Bô lão miền núi..., Bảng diễn 3 cảnh, Câu hỏi sau xem).", "Sức mạnh đoàn kết trong kháng chiến chống Mông – Nguyên."),
    ("MD-11.11", "11", "11.08B", "Hoạt cảnh 08 (Khối 11 - 11.08B): Lam Sơn – từ gian khó đến thắng lợi — Kịch bản 3 phần dạng bảng", "Khởi nghĩa và chiến tranh giải phóng dân tộc", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Người mẹ, người con, nghĩa quân, người chuyển tin..., Bảng diễn 3 cảnh giai đoạn 1418–1427, Câu hỏi sau xem).", "Vai trò của nhân dân; quá trình phát triển của khởi nghĩa Lam Sơn."),
    ("MD-11.12", "11", "11.09", "Hoạt cảnh 09 (Khối 11 - 11.09): Một chính sách, nhiều góc nhìn (Hồ Quý Ly) — Kịch bản 3 phần dạng bảng", "Các cuộc cải cách lớn trong lịch sử Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh đối thoại giả định năm 1397 về phép hạn điền, Câu hỏi sau xem).", "Nội dung, kết quả và giới hạn của cải cách Hồ Quý Ly."),
    ("MD-11.13", "11", "11.13", "Hoạt cảnh 10 (Khối 11 - 11.13): Theo dấu đội Hoàng Sa — Kịch bản 3 phần dạng bảng", "Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai tra cứu Phủ biên tạp lục năm 1776 của Lê Quý Đôn và đội viên Hoàng Sa, Bảng diễn 3 cảnh, Câu hỏi sau xem).", "Quá trình xác lập, thực thi và bảo vệ chủ quyền Biển Đông."),
    ("MD-12.01", "12", "12.01", "Hoạt cảnh 11 (Khối 12 - 12.01): Cùng tìm một giải pháp hòa bình (LHQ) — Kịch bản 3 phần dạng bảng", "Liên hợp quốc và Trật tự thế giới", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Đại diện A, B, Điều phối viên, Cứu trợ..., Bảng diễn 3 cảnh thương lượng hòa bình, Câu hỏi sau xem).", "Mục tiêu, nguyên tắc và vai trò của Liên hợp quốc."),
    ("MD-12.04", "12", "12.04", "Hoạt cảnh 12 (Khối 12 - 12.04): Cùng mở một chặng đường (ASEAN) — Kịch bản 3 phần dạng bảng", "Hiệp hội các quốc gia Đông Nam Á (ASEAN)", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 6 vai đại diện 5 nước sáng lập ASEAN 8/8/1967 và mốc Việt Nam gia nhập 28/7/1995, Bảng diễn 3 cảnh, Câu hỏi sau xem).", "Hoàn cảnh ra đời, mục tiêu và quá trình phát triển của ASEAN."),
    ("MD-12.06", "12", "12.06A", "Hoạt cảnh 13 (Khối 12 - 12.06A): Khi thời cơ đến (Cách mạng tháng Tám 1945) — Kịch bản 3 phần dạng bảng", "Cách mạng tháng Tám năm 1945", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Người chuyển tin, phụ trách cơ sở, thanh niên, người dân..., Bảng diễn 3 cảnh tháng 8/1945, Câu hỏi sau xem).", "Nhận diện thời cơ và vai trò của quần chúng trong Cách mạng tháng Tám."),
    ("MD-12.09", "12", "12.07B", "Hoạt cảnh 14 (Khối 12 - 12.07B): Đường đến Điện Biên — Kịch bản 3 phần dạng bảng", "Kháng chiến chống thực dân Pháp (1945–1954)", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Dân công xe đạp thồ, người sửa xe, tiếp tế, chiến sĩ..., Bảng diễn 3 cảnh chiến dịch Điện Biên Phủ 1954, Câu hỏi sau xem).", "Hậu phương, hậu cần và sức mạnh chiến tranh nhân dân."),
    ("MD-12.10", "12", "12.08A", "Hoạt cảnh 15 (Khối 12 - 12.08A): Một chuyến hàng trên Trường Sơn — Kịch bản 3 phần dạng bảng", "Kháng chiến chống Mỹ, cứu nước (1954–1975)", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Giao liên, vận chuyển, bảo đảm đường, tiếp nhận..., Bảng diễn 3 cảnh trên tuyến đường Trường Sơn Đoàn 559, Câu hỏi sau xem).", "Vai trò của tuyến vận tải chiến lược Trường Sơn và sự phối hợp các lực lượng.")
]

SCRIPTS_15_ITEMS = []
for sc_code, sc_grade, base_code, sc_lesson, sc_topic, sc_format, sc_scenario, sc_focus in SCRIPTS_15_DEDICATED_TUPLES:
    SCRIPTS_15_ITEMS.append({
        "code": sc_code,
        "grade": sc_grade,
        "examCode": f"HC-{base_code}",
        "lesson": sc_lesson,
        "topic": sc_topic,
        "format": sc_format,
        "scenario": sc_scenario,
        "focus": sc_focus,
        "fileName": "15_Hoat_Canh_Lich_Su_GDPT2018.docx",
        "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "isOfficial15": True,
        "characters": [
            { "name": "Người dẫn & Nhóm diễn viên học sinh", "type": "CREATIVE_REP", "desc": "Thực hiện phân vai 3 phần theo bảng diễn chuẩn sư phạm" },
            { "name": "Kỹ thuật & Đạo cụ", "type": "CREATIVE_REP", "desc": "Sắp đạo cụ, bảng thẻ và điều phối chuyển cảnh theo dòng chỉ dẫn" }
        ]
    })

ALL_ITEMS = KHOI_10_ITEMS + KHOI_11_ITEMS + KHOI_12_ITEMS + SCRIPTS_15_ITEMS + SUMMARY_FILE_ITEMS

# Danh sách 24 mã khung chương trình cũ (placeholder) để ẩn đi khi đã nạp đủ 48 bài chính thức từ PDF
OLD_PLACEHOLDER_CODES = [
    "10.01A", "10.02A", "10.03A", "10.04C", "10.04D", "10.06A", "10.08A", "10.08B",
    "11.01A", "11.02A", "11.03A", "11.04A", "11.05A", "11.06A", "11.09A", "11.10A", "11.10B",
    "12.01A", "12.02A", "12.03A", "12.04A", "12.05A", "12.10A", "12.12A"
]

posts = []
docs = []

file_sizes = {}
for fname in ["Danh_Muc_Hoat_Canh_Khoi_10.pdf", "Danh_Muc_Hoat_Canh_Khoi_11.pdf", "Danh_Muc_Hoat_Canh_Khoi_12.pdf", "15_Hoat_Canh_Lich_Su_GDPT2018.pdf", "15_Hoat_Canh_Lich_Su_GDPT2018.docx"]:
    fpath = os.path.join(UPLOADS_DIR, fname)
    file_sizes[fname] = os.path.getsize(fpath) if os.path.exists(fpath) else 100000

for meta in ALL_ITEMS:
    fname = meta["fileName"]
    size = file_sizes.get(fname, 100000)
    cdn_url = f"{CDN_BASE}/{fname}"

    post = {
        "code": meta["code"],
        "grade": meta["grade"],
        "examCode": meta["examCode"],
        "lesson": meta["lesson"],
        "topic": meta["topic"],
        "format": meta["format"],
        "scenario": meta["scenario"],
        "focus": meta["focus"],
        "context": "Bám sát chương trình Giáo dục Phổ thông 2018 môn Lịch sử THPT và hồ sơ danh mục hoạt cảnh hóa chính thức.",
        "sources": f"Hồ sơ Danh mục & Kịch bản Hoạt cảnh Lịch sử Khối {meta['grade']} — Chương trình GDPT 2018 ({fname})",
        "author": "Tổ Chuyên môn Lịch sử THPT",
        "school": "Chương trình GDPT 2018",
        "createdAt": "24/10/2026",
        "authLevel": "Cấp 1 - Cơ bản (SU2026)",
        "originType": "TEACHER_CONTRIBUTED",
        "isOfficial15": bool(meta.get("isOfficial15", False)),
        "fileName": fname,
        "fileSize": size,
        "fileType": meta["fileType"],
        "fileUrl": f"uploads/{fname}",
        "fileData": cdn_url,
        "characters": meta["characters"]
    }
    posts.append(post)

    doc_id = f"DOC-{meta['code'].replace('.', '')}"
    doc = {
        "id": doc_id,
        "code": meta["code"],
        "title": f"Hồ sơ bài học ({meta['code']}): {meta['lesson']}",
        "fileName": fname,
        "fileSize": size,
        "fileType": meta["fileType"],
        "fileUrl": f"uploads/{fname}",
        "fileData": cdn_url,
        "format": "PDF" if fname.endswith(".pdf") else "DOCX",
        "grade": meta["grade"],
        "updatedAt": "2026-10-24",
        "source": f"Biên soạn: Tổ Chuyên môn Lịch sử THPT (Chương trình GDPT 2018)",
        "summary": meta["scenario"],
        "content": f"{meta['scenario']}\n\nTrọng tâm học tập: {meta['focus']}\n\nTệp gốc đính kèm: {fname} ({round(size/1024, 1)} KB)."
    }
    docs.append(doc)

js_content = f"""/**
 * ====================================================================
 * OFFICIAL TEACHER POSTS & DOCUMENTS FROM 5 UPLOADED FILES
 * (js/official-posts-data.js)
 * ====================================================================
 * Tự động nạp toàn bộ 53 bài đăng Giáo viên (17 bài Khối 10 + 18 bài Khối 11
 * + 13 bài Khối 12 + 15 kịch bản 3 phần + 5 hồ sơ trọn bộ tệp gốc).
 */

const OFFICIAL_TEACHER_POSTS = {json.dumps(posts, ensure_ascii=False, indent=2)};

const OFFICIAL_TEACHER_DOCS = {json.dumps(docs, ensure_ascii=False, indent=2)};

const OFFICIAL_REPLACED_PLACEHOLDER_CODES = {json.dumps(OLD_PLACEHOLDER_CODES, ensure_ascii=False)};

(function injectOfficialTeacherFiles() {{
    try {{
        // 1. Ẩn 24 mã placeholder cũ đã được thay thế bởi 48 bài chính thức trong PDF
        if (typeof addDeletedCodes === "function") {{
            addDeletedCodes(OFFICIAL_REPLACED_PLACEHOLDER_CODES);
        }}
        if (typeof catalogData !== "undefined" && Array.isArray(catalogData)) {{
            const phSet = new Set(OFFICIAL_REPLACED_PLACEHOLDER_CODES);
            for (let i = catalogData.length - 1; i >= 0; i--) {{
                if (phSet.has(catalogData[i].code)) {{
                    catalogData.splice(i, 1);
                }}
            }}
        }}

        // 2. Nạp toàn bộ 53 bài vào catalogData
        if (typeof catalogData !== "undefined" && Array.isArray(catalogData)) {{
            OFFICIAL_TEACHER_POSTS.slice().reverse().forEach(post => {{
                if (typeof removeDeletedCode === "function") {{
                    removeDeletedCode(post.code);
                }}
                const existIdx = catalogData.findIndex(i => i.code === post.code);
                if (existIdx >= 0) {{
                    catalogData[existIdx] = Object.assign({{}}, catalogData[existIdx], post);
                }} else {{
                    catalogData.unshift(JSON.parse(JSON.stringify(post)));
                }}
            }});
        }}

        // 3. Nạp vào documentStore
        if (typeof documentStore !== "undefined" && Array.isArray(documentStore)) {{
            OFFICIAL_TEACHER_DOCS.slice().reverse().forEach(doc => {{
                const existIdx = documentStore.findIndex(d => d.id === doc.id || (doc.code && d.code === doc.code));
                if (existIdx >= 0) {{
                    documentStore[existIdx] = Object.assign({{}}, documentStore[existIdx], doc);
                }} else {{
                    documentStore.unshift(JSON.parse(JSON.stringify(doc)));
                }}
            }});
        }}
    }} catch (err) {{
        console.warn("Lỗi nạp dữ liệu bài đăng chính thức:", err);
    }}
}})();

if (typeof window !== "undefined") {{
    window.OFFICIAL_TEACHER_POSTS = OFFICIAL_TEACHER_POSTS;
    window.OFFICIAL_TEACHER_DOCS = OFFICIAL_TEACHER_DOCS;
    window.OFFICIAL_REPLACED_PLACEHOLDER_CODES = OFFICIAL_REPLACED_PLACEHOLDER_CODES;
}}
if (typeof module !== "undefined" && module.exports) {{
    module.exports = {{ OFFICIAL_TEACHER_POSTS, OFFICIAL_TEACHER_DOCS, OFFICIAL_REPLACED_PLACEHOLDER_CODES }};
}}
"""

os.makedirs("js", exist_ok=True)
with open("js/official-posts-data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Successfully generated js/official-posts-data.js with {len(posts)} posts and {len(docs)} docs ({len(js_content)/1024:.1f} KB)")

# 5. Thêm 15 bài Kịch bản Hoạt cảnh Dạng bảng độc lập từ tệp 15_Hoat_Canh_Lich_Su_GDPT2018.docx / .pdf
SCRIPTS_15_DEDICATED = [
    ("MD-10.04", "10", "10.04A", "Hoạt cảnh 01 (Khối 10 - 10.04A): Bên dòng sông Nile — Kịch bản 3 phần dạng bảng", "Văn minh phương Đông cổ – trung đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh theo lượt thoại, Câu hỏi sau xem): Người nông dân, người ghi chép và người thợ bên dòng sông Nile.", "Mối liên hệ giữa điều kiện tự nhiên, sản xuất và thành tựu văn minh Ai Cập."),
    ("MD-10.05", "10", "10.04B", "Hoạt cảnh 02 (Khối 10 - 10.04B): Khi chữ viết ra đời — Kịch bản 3 phần dạng bảng", "Văn minh phương Đông cổ – trung đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh tại kho lương thực Lưỡng Hà, Câu hỏi sau xem): Mô phỏng việc ghi chép, lưu giữ thông tin trên bảng đất sét.", "Vai trò của chữ viết; phân biệt đặc điểm giữa các nền văn minh."),
    ("MD-10.08", "10", "10.05A", "Hoạt cảnh 03 (Khối 10 - 10.05A): Tiếng nói ở Athens — Kịch bản 3 phần dạng bảng", "Văn minh phương Tây cổ – trung đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Demos, Thaleia, Leon..., Bảng diễn 3 cảnh, Câu hỏi sau xem): Đối thoại giữa công dân nam Athens và những người không có quyền biểu quyết.", "Đặc điểm và giới hạn của nền dân chủ Athens."),
    ("MD-10.06", "10", "10.06", "Hoạt cảnh 04 (Khối 10 - 10.06): Từ xưởng thủ công đến nhà máy — Kịch bản 3 phần dạng bảng", "Các cuộc cách mạng công nghiệp thời cận đại", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 2 cảnh Trước - Sau khi vào nhà máy, Câu hỏi sau xem): Gia đình thợ dệt trước sự xuất hiện của máy móc.", "Thành tựu và tác động của cách mạng công nghiệp."),
    ("MD-10.09", "10", "10.09A", "Hoạt cảnh 05 (Khối 10 - 10.09A): Một ngày của cư dân Văn Lang — Kịch bản 3 phần dạng bảng", "Văn minh cổ trên đất nước Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh: Buổi sớm ra đồng - Việc nhà việc xóm - Nhịp sống bên nhau, Câu hỏi sau xem).", "Đặc điểm văn minh Văn Lang – Âu Lạc."),
    ("MD-11.07", "11", "11.07A", "Hoạt cảnh 06 (Khối 11 - 11.07A): Bạch Đằng – chuẩn bị cho trận đánh — Kịch bản 3 phần dạng bảng", "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Ngô Quyền, người quen sông, người làm cọc..., Bảng diễn 3 cảnh trên sa bàn năm 938, Câu hỏi sau xem).", "Vai trò lãnh đạo, địa hình và nghệ thuật quân sự."),
    ("MD-11.09", "11", "11.07C", "Hoạt cảnh 07 (Khối 11 - 11.07C): Diên Hồng – tiếng nói đồng lòng — Kịch bản 3 phần dạng bảng", "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Người truyền lời, Bô lão vùng ruộng, Bô lão miền núi..., Bảng diễn 3 cảnh, Câu hỏi sau xem).", "Sức mạnh đoàn kết trong kháng chiến chống Mông – Nguyên."),
    ("MD-11.11", "11", "11.08B", "Hoạt cảnh 08 (Khối 11 - 11.08B): Lam Sơn – từ gian khó đến thắng lợi — Kịch bản 3 phần dạng bảng", "Khởi nghĩa và chiến tranh giải phóng dân tộc", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Người mẹ, người con, nghĩa quân, người chuyển tin..., Bảng diễn 3 cảnh giai đoạn 1418–1427, Câu hỏi sau xem).", "Vai trò của nhân dân; quá trình phát triển của khởi nghĩa Lam Sơn."),
    ("MD-11.12", "11", "11.09", "Hoạt cảnh 09 (Khối 11 - 11.09): Một chính sách, nhiều góc nhìn (Hồ Quý Ly) — Kịch bản 3 phần dạng bảng", "Các cuộc cải cách lớn trong lịch sử Việt Nam", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai, Bảng diễn 3 cảnh đối thoại giả định năm 1397 về phép hạn điền, Câu hỏi sau xem).", "Nội dung, kết quả và giới hạn của cải cách Hồ Quý Ly."),
    ("MD-11.13", "11", "11.13", "Hoạt cảnh 10 (Khối 11 - 11.13): Theo dấu đội Hoàng Sa — Kịch bản 3 phần dạng bảng", "Bảo vệ chủ quyền, các quyền và lợi ích hợp pháp của Việt Nam ở Biển Đông", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai tra cứu Phủ biên tạp lục năm 1776 của Lê Quý Đôn và đội viên Hoàng Sa, Bảng diễn 3 cảnh, Câu hỏi sau xem).", "Quá trình xác lập, thực thi và bảo vệ chủ quyền Biển Đông."),
    ("MD-12.01", "12", "12.01", "Hoạt cảnh 11 (Khối 12 - 12.01): Cùng tìm một giải pháp hòa bình (LHQ) — Kịch bản 3 phần dạng bảng", "Liên hợp quốc và Trật tự thế giới", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Đại diện A, B, Điều phối viên, Cứu trợ..., Bảng diễn 3 cảnh thương lượng hòa bình, Câu hỏi sau xem).", "Mục tiêu, nguyên tắc và vai trò của Liên hợp quốc."),
    ("MD-12.04", "12", "12.04", "Hoạt cảnh 12 (Khối 12 - 12.04): Cùng mở một chặng đường (ASEAN) — Kịch bản 3 phần dạng bảng", "Hiệp hội các quốc gia Đông Nam Á (ASEAN)", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 6 vai đại diện 5 nước sáng lập ASEAN 8/8/1967 và mốc Việt Nam gia nhập 28/7/1995, Bảng diễn 3 cảnh, Câu hỏi sau xem).", "Hoàn cảnh ra đời, mục tiêu và quá trình phát triển của ASEAN."),
    ("MD-12.06", "12", "12.06A", "Hoạt cảnh 13 (Khối 12 - 12.06A): Khi thời cơ đến (Cách mạng tháng Tám 1945) — Kịch bản 3 phần dạng bảng", "Cách mạng tháng Tám năm 1945", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Người chuyển tin, phụ trách cơ sở, thanh niên, người dân..., Bảng diễn 3 cảnh tháng 8/1945, Câu hỏi sau xem).", "Nhận diện thời cơ và vai trò của quần chúng trong Cách mạng tháng Tám."),
    ("MD-12.09", "12", "12.07B", "Hoạt cảnh 14 (Khối 12 - 12.07B): Đường đến Điện Biên — Kịch bản 3 phần dạng bảng", "Kháng chiến chống thực dân Pháp (1945–1954)", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Dân công xe đạp thồ, người sửa xe, tiếp tế, chiến sĩ..., Bảng diễn 3 cảnh chiến dịch Điện Biên Phủ 1954, Câu hỏi sau xem).", "Hậu phương, hậu cần và sức mạnh chiến tranh nhân dân."),
    ("MD-12.10", "12", "12.08A", "Hoạt cảnh 15 (Khối 12 - 12.08A): Một chuyến hàng trên Trường Sơn — Kịch bản 3 phần dạng bảng", "Kháng chiến chống Mỹ, cứu nước (1954–1975)", "Kịch bản Word (.docx)", "Kịch bản 3 phần chi tiết (Chuẩn bị phân vai 5 vai: Giao liên, vận chuyển, bảo đảm đường, tiếp nhận..., Bảng diễn 3 cảnh trên tuyến đường Trường Sơn Đoàn 559, Câu hỏi sau xem).", "Vai trò của tuyến vận tải chiến lược Trường Sơn và sự phối hợp các lực lượng.")
]
