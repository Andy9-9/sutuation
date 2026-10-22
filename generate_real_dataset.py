# -*- coding: utf-8 -*-
"""
Script to generate the complete 42 authentic historical lessons and 14 dossiers
according to the official Vietnamese Ministry of Education GDPT 2018 History curriculum.
"""
import json

catalog_items = [
    # ================= KHỐI 10 (14 BÀI CHUẨN) =================
    {
        "code": "10.01A",
        "examCode": "MD-10.01",
        "grade": "10",
        "topic": "Hiện thực lịch sử và nhận thức lịch sử",
        "lesson": "Bài 1. Hiện thực lịch sử và nhận thức lịch sử.",
        "scenario": "“Ngòi bút Thái sử công Tư Mã Thiên và công lý lịch sử”, đối thoại giữa Tư Mã Thiên và môn sinh về việc ghi chép sự thật khách quan không luồn cúi cường quyền.",
        "format": "Đối thoại lịch sử",
        "focus": "Phân biệt hiện thực lịch sử (tồn tại khách quan ngoài ý muốn con người) và nhận thức lịch sử (chủ quan của người chép sử), nguyên tắc trung thực, khách quan của sử học.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Năm 99 TCN, Tư Mã Thiên vì can ngăn Hán Vũ Đế bảo vệ Lý Lăng mà chịu nhục hình. Ông dốc trọn phần đời còn lại viết bộ Sử Ký gồm 130 thiên, đặt nền móng cho sử học phương Đông với phương châm 'chép đúng sự thực, không che giấu điều xấu, không thêm thắt điều tốt'.",
        "characters": [
            { "name": "Thái sử công Tư Mã Thiên", "type": "HISTORICAL_FACT", "desc": "Nhà sử học vĩ đại thời Tây Hán, tác giả bộ Sử Ký: kiên định nguyên tắc ngòi bút chép sử phải trung thực với hậu thế." },
            { "name": "Môn sinh đệ tử", "type": "CREATIVE_REP", "desc": "Vai đại diện thế hệ trẻ ghi chép thẻ tre: băn khoăn về sự an nguy cá nhân khi ghi chép sự thật trái ý bậc đế vương." }
        ],
        "relatedDocs": ["DOC-1001A"],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 1: Hiện thực lịch sử và nhận thức lịch sử."
    },
    {
        "code": "10.02A",
        "examCode": "MD-10.02",
        "grade": "10",
        "topic": "Tri thức lịch sử và cuộc sống",
        "lesson": "Bài 2. Tri thức lịch sử và cuộc sống.",
        "scenario": "“Bảo tồn ký ức phố Hội”, phiên thảo luận giữa nhà nghiên cứu di sản, người dân phố cổ Hội An và hướng dẫn viên du lịch về bảo tồn nhà cổ trước nguy cơ thương mại hóa quá mức.",
        "format": "Tiểu phẩm",
        "focus": "Vai trò của tri thức lịch sử trong bảo tồn và phát huy giá trị di sản văn hóa, phát triển du lịch bền vững và giáo dục truyền thống.",
        "originType": "SGK_FRAMEWORK",
        "context": "Đô thị cổ Hội An (Quảng Nam) là Di sản văn hóa thế giới UNESCO, minh chứng sinh động cho thương cảng quốc tế sầm uất thế kỷ XVII–XVIII. Việc bảo tồn kiến trúc gỗ, nếp sống văn hóa truyền thống gắn liền với sinh kế của cộng đồng cư dân bản địa.",
        "characters": [
            { "name": "Chuyên gia bảo tồn di sản", "type": "CREATIVE_REP", "desc": "Phân tích giá trị từng vì kèo gỗ, mái ngói âm dương của nhà cổ, cảnh báo nguy cơ biến dạng di sản." },
            { "name": "Cư dân phố cổ Hội An", "type": "CREATIVE_REP", "desc": "Chủ căn nhà cổ trăm năm: chia sẻ khó khăn giữa việc trùng tu bảo tồn nghiêm ngặt và nhu cầu sinh hoạt thường ngày." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 2: Tri thức lịch sử và cuộc sống."
    },
    {
        "code": "10.03A",
        "examCode": "MD-10.03",
        "grade": "10",
        "topic": "Sử học với các lĩnh vực khoa học khác",
        "lesson": "Bài 3. Sử học với các lĩnh vực khoa học khác.",
        "scenario": "“Dưới tầng đất Hoàng thành Thăng Long”, cuộc khảo sát tại hố khai quật 18 Hoàng Diệu giữa nhà sử học, nhà khảo cổ học và chuyên gia giám định niên đại Carbon C14.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Mối quan hệ liên ngành giữa Sử học với Khảo cổ học, Địa chất học và Hóa học trong việc xác thực các tầng văn hóa Đại Việt qua các triều đại Lý – Trần – Lê.",
        "originType": "SGK_FRAMEWORK",
        "context": "Năm 2002–2003, cuộc khai quật khảo cổ học tại 18 Hoàng Diệu (Hà Nội) phát lộ quần thể di tích nghìn năm chồng lớp liên tục qua các thời kỳ tiền Thăng Long, Đinh – Tiền Lê, Lý, Trần, Lê sơ, Mạc, Lê Trung hưng và Nguyễn.",
        "characters": [
            { "name": "Nhà khảo cổ học chủ trì khai quật", "type": "CREATIVE_REP", "desc": "Cầm mảnh gốm hoa nâu thời Trần và đầu rồng thời Lý, thuyết minh kỹ thuật bóc tách từng tầng địa tầng khảo cổ." },
            { "name": "Chuyên gia phân tích niên đại C14", "type": "CREATIVE_REP", "desc": "Báo cáo kết quả phân tích mẫu cọc gỗ móng cung điện thời Lý, chứng minh độ tuổi gần 1000 năm." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 3: Sử học với các lĩnh vực khoa học khác."
    },
    {
        "code": "10.04A",
        "examCode": "MD-10.04",
        "grade": "10",
        "topic": "Văn minh phương Đông cổ – trung đại",
        "lesson": "Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại.",
        "scenario": "“Bên dòng sông Nile”, tái hiện người nông dân, người ghi chép và người thợ kể về công việc của mình.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Mối liên hệ giữa điều kiện tự nhiên, sản xuất và thành tựu văn minh Ai Cập.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Ai Cập cổ đại hình thành dọc lưu vực sông Nile. Hằng năm, nước lũ sông Nile dâng cao bồi đắp phù sa màu mỡ, thúc đẩy cư dân canh tác nông nghiệp, đo đạc lại ruộng đất (hình học), quan sát thiên văn làm lịch và sử dụng chữ tượng hình ghi chép trên giấy Papyrus.",
        "characters": [
            { "name": "Người nông dân bên bờ sông Nile", "type": "CREATIVE_REP", "desc": "Vai đại diện cư dân nông nghiệp: kể về chu kỳ nước lũ sông Nile, việc đắp đê, đào kênh và gieo trồng lúa mì." },
            { "name": "Người ghi chép (Viên thư lại - Scribe)", "type": "CREATIVE_REP", "desc": "Vai đại diện tầng lớp trí thức – hành chính: cầm cuộn giấy Papyrus, giải thích cách dùng chữ tượng hình và toán học để đo lại diện tích ruộng đất sau mùa lũ." },
            { "name": "Người thợ thủ công – xây dựng", "type": "CREATIVE_REP", "desc": "Vai đại diện lao động kỹ thuật: chia sẻ về kỹ thuật chế tác đá, sức lao động tập thể và tri thức hình học phục vụ kiến trúc Kim tự tháp." }
        ],
        "relatedDocs": ["DOC-1004A"],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 4: Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại."
    },
    {
        "code": "10.04B",
        "examCode": "MD-10.05",
        "grade": "10",
        "topic": "Văn minh phương Đông cổ – trung đại",
        "lesson": "Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại.",
        "scenario": "“Xưởng giấy và la bàn Trường An”, cuộc trò chuyện giữa người làm giấy, thương nhân hàng hải và học giả về ứng dụng bốn phát minh lớn.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Ý nghĩa và tác động của tứ đại phát minh (làm giấy, kỹ thuật in, la bàn, thuốc súng) của văn minh Trung Hoa đối với thế giới.",
        "originType": "SGK_FRAMEWORK",
        "context": "Văn minh Trung Hoa thời cổ – trung đại đạt nhiều thành tựu rực rỡ về tư tưởng, chữ viết, văn học và đặc biệt là bốn phát minh lớn về kỹ thuật có ảnh hưởng sâu rộng đến tiến trình văn minh nhân loại.",
        "characters": [
            { "name": "Thợ chế tác giấy (kế thừa kỹ thuật Thái Luân)", "type": "CREATIVE_REP", "desc": "Giới thiệu quy trình tận dụng vỏ cây, lưới cũ tạo ra giấy viết thay thế thẻ tre, lụa." },
            { "name": "Thương nhân vượt biển", "type": "CREATIVE_REP", "desc": "Giải thích vai trò của kim chỉ nam (la bàn) trong việc định hướng hải trình." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Phần Văn minh Trung Hoa thời cổ – trung đại."
    },
    {
        "code": "10.04C",
        "examCode": "MD-10.06",
        "grade": "10",
        "topic": "Văn minh phương Đông cổ – trung đại",
        "lesson": "Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại (Văn minh Lưỡng Hà).",
        "scenario": "“Bộ luật khắc trên phiến đá Hammurabi”, phiên tòa xử kiện tại quảng trường thành Babylon dựa trên Bộ luật Hammurabi.",
        "format": "Mô phỏng nghị sự",
        "focus": "Ý nghĩa của Bộ luật Hammurabi – bộ luật thành văn cổ xưa nhất còn bảo tồn tương đối nguyên vẹn, phản ánh cấu trúc xã hội Lưỡng Hà cổ đại.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Vua Hammurabi (khoảng thế kỷ XVIII TCN) trị vì Vương quốc Cổ Babylon đã ban hành bộ luật gồm 282 điều khắc trên phiến đá bazan hình trụ, mở đầu bằng cảnh thần Mặt trời Shamash trao luật pháp cho đức vua nhằm bảo vệ trật tự nhà nước.",
        "characters": [
            { "name": "Quan tòa thành Babylon", "type": "CREATIVE_REP", "desc": "Trích dẫn điều luật bảo vệ giao ước kinh tế, đê điều và quy định mức bồi thường thiệt hại sản xuất." },
            { "name": "Thương nhân Lưỡng Hà", "type": "CREATIVE_REP", "desc": "Tranh biện về văn khế đất đai và hợp đồng vận chuyển ngũ cốc trên thuyền buồm xuôi dòng Euphrates." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 4: Văn minh Lưỡng Hà."
    },
    {
        "code": "10.04D",
        "examCode": "MD-10.07",
        "grade": "10",
        "topic": "Văn minh phương Đông cổ – trung đại",
        "lesson": "Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại (Văn minh Ấn Độ).",
        "scenario": "“Cội bồ đề và lời truyền dạy bác ái của Đức Phật”, cuộc trò chuyện giữa Đức Phật Thích Ca Mâu Ni và vua Asoka (A-dục) về thuyết từ bi, xóa bỏ định kiến đẳng cấp Varna.",
        "format": "Đối thoại lịch sử",
        "focus": "Giá trị nhân đạo sâu sắc của Phật giáo Ấn Độ cổ đại, phản đối chế độ phân biệt đẳng cấp khắc nghiệt và ảnh hưởng lan tỏa khắp châu Á.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Phật giáo ra đời ở Ấn Độ vào thế kỷ VI TCN do Tất-đạt-đa Cồ-đàm (Siddhartha Gautama) sáng lập, chủ trương bình đẳng chúng sinh. Đến thế kỷ III TCN, Hoàng đế Asoka quy y Phật giáo, dựng các cột đá khắc chiếu chỉ từ bi khắp đế chế Maurya.",
        "characters": [
            { "name": "Hoàng đế Asoka (A-dục vương)", "type": "HISTORICAL_FACT", "desc": "Vị vua thống nhất Ấn Độ, từ bỏ bạo lực chiến tranh sau trận Kalinga để truyền bá thông điệp hòa bình." },
            { "name": "Cao tăng đệ tử Phật pháp", "type": "CREATIVE_REP", "desc": "Giải thích Tứ diệu đế và con đường Bát chính đạo giải thoát khổ đau cho muôn loài." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 4: Văn minh Ấn Độ."
    },
    {
        "code": "10.05A",
        "examCode": "MD-10.08",
        "grade": "10",
        "topic": "Văn minh phương Tây cổ – trung đại",
        "lesson": "Bài 5. Một số nền văn minh phương Tây thời cổ – trung đại.",
        "scenario": "“Quảng trường Agora ở Athens”, phiên tranh luận công khai giữa các công dân về quyền bầu cử, luật pháp và triết học.",
        "format": "Mô phỏng nghị sự",
        "focus": "Bản chất nền dân chủ cổ đại ở Athens và những thành tựu tiêu biểu của văn minh Hy Lạp – La Mã.",
        "originType": "SGK_FRAMEWORK",
        "context": "Tại thành bang Athens (Hy Lạp cổ đại), thể chế dân chủ chủ nô phát triển cao, cho phép công dân tự do (nam giới đủ tuổi) tham gia Đại hội nhân dân thảo luận và biểu quyết các công việc trọng đại của thành bang.",
        "characters": [
            { "name": "Pê-ri-clét (Pericles)", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử có thật: Nhà chính trị tiêu biểu của Athens thế kỷ V TCN." },
            { "name": "Công dân thành bang Athens", "type": "CREATIVE_REP", "desc": "Vai đại diện công dân tự do tham gia chất vấn về quyền lợi và nghĩa vụ tại quảng trường." }
        ],
        "relatedDocs": ["DOC-1005A"],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 5: Một số nền văn minh phương Tây thời cổ – trung đại."
    },
    {
        "code": "10.05B",
        "examCode": "MD-10.09",
        "grade": "10",
        "topic": "Văn minh phương Tây cổ – trung đại",
        "lesson": "Bài 5. Một số nền văn minh phương Tây thời cổ – trung đại (Phong trào Văn hóa Phục hưng).",
        "scenario": "“Xưởng vẽ thành Florence và bức họa tinh thần nhân văn”, cuộc đàm đạo giữa họa sĩ thời Phục hưng và học giả về đề cao con người, giải phóng tư tưởng khỏi thần quyền.",
        "format": "Đối thoại lịch sử",
        "focus": "Bản chất nhân văn, những thành tựu rực rỡ về nghệ thuật, triết học và khoa học của phong trào Văn hóa Phục hưng.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Từ thế kỷ XIV đến thế kỷ XVII, phong trào Văn hóa Phục hưng bùng nổ ở Tây Âu (khởi đầu từ Florence, Ý), khôi phục những giá trị tinh hoa của văn hóa Hy Lạp – La Mã cổ đại và đặt nền móng cho thời kỳ cận đại.",
        "characters": [
            { "name": "Leonardo da Vinci (hoặc danh họa đại diện)", "type": "HISTORICAL_FACT", "desc": "Danh họa, nhà khoa học thời Phục hưng: chia sẻ về giải phẫu học, tỉ lệ vàng và quan niệm con người là trung tâm của vũ trụ." },
            { "name": "Học giả nhân văn thành Florence", "type": "CREATIVE_REP", "desc": "Trí thức thành thị bảo vệ quan điểm tự do tư tưởng, chỉ trích sự áp đặt hà khắc của giáo hội thời Trung cổ." }
        ],
        "relatedDocs": ["DOC-1005A"],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 5: Phong trào Văn hóa Phục hưng."
    },
    {
        "code": "10.06A",
        "examCode": "MD-10.10",
        "grade": "10",
        "topic": "Cộng đồng các dân tộc Việt Nam",
        "lesson": "Bài 6. Đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam.",
        "scenario": "“Nhịp chày trên nương và mái Nhà Rông đại ngàn”, buổi sinh hoạt cộng đồng buôn làng Tây Nguyên quanh bếp lửa nhà Rông trước mùa gieo hạt.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Tính đa dạng và thống nhất trong văn hóa các dân tộc anh em tại Việt Nam, sự gắn kết cộng đồng và tín ngưỡng dân gian hòa hợp với thiên nhiên.",
        "originType": "SGK_FRAMEWORK",
        "context": "Việt Nam là quốc gia đa dân tộc với 54 dân tộc anh em. Mỗi dân tộc có phong tục, trang phục, kiến trúc và kho tàng tri thức bản địa riêng biệt nhưng luôn gắn kết thành khối thống nhất qua hàng nghìn năm dựng nước và giữ nước.",
        "characters": [
            { "name": "Già làng buôn Tây Nguyên", "type": "CREATIVE_REP", "desc": "Kể sử thi Đam San bên bếp lửa, truyền dạy con cháu giữ gìn hồn chiêng và nguồn nước." },
            { "name": "Thanh niên đan gùi, dệt thổ cẩm", "type": "CREATIVE_REP", "desc": "Thể hiện sự kế thừa kỹ nghệ truyền thống của buôn làng." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 6: Đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam."
    },
    {
        "code": "10.08A",
        "examCode": "MD-10.11",
        "grade": "10",
        "topic": "Văn minh cổ trên đất nước Việt Nam",
        "lesson": "Bài 8. Một số nền văn minh cổ trên đất nước Việt Nam (Văn minh Văn Lang – Âu Lạc).",
        "scenario": "“Tiếng trống đồng ngày hội mùa”, tái hiện cảnh đúc trống đồng, giã gạo và lễ hội cầu mùa của cư dân Văn Lang – Âu Lạc.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Đời sống vật chất, tinh thần và trình độ kỹ thuật luyện kim đồng thau của cư dân Văn Lang – Âu Lạc.",
        "originType": "SGK_FRAMEWORK",
        "context": "Nền văn minh Văn Lang – Âu Lạc hình thành gắn liền với nền nông nghiệp lúa nước lưu vực sông Hồng, sông Mã, sông Cả và đỉnh cao là kỹ thuật đúc trống đồng Đông Sơn.",
        "characters": [
            { "name": "Nghệ nhân đúc đồng Đông Sơn", "type": "CREATIVE_REP", "desc": "Giải thích ý nghĩa các hoa văn mặt trời, chim Lạc, thuyền chiến khắc trên mặt trống." },
            { "name": "Lạc dân canh tác lúa nước", "type": "CREATIVE_REP", "desc": "Tái hiện đời sống lao động gắn kết cộng đồng." }
        ],
        "relatedDocs": ["DOC-1008A"],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Văn minh Văn Lang – Âu Lạc."
    },
    {
        "code": "10.08B",
        "examCode": "MD-10.12",
        "grade": "10",
        "topic": "Văn minh cổ trên đất nước Việt Nam",
        "lesson": "Bài 8. Một số nền văn minh cổ trên đất nước Việt Nam (Văn minh Phù Nam).",
        "scenario": "“Thương cảng Óc Eo và những hải trình viễn dương”, cuộc gặp gỡ, trao đổi sản vật giữa thương nhân bản địa với thương thuyền Ấn Độ và La Mã.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Đặc trưng kinh tế thương nghiệp hàng hải, tính chất mở và vị trí trung chuyển quốc tế của văn minh Phù Nam.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Hình thành từ thế kỷ I đến thế kỷ VII tại lưu vực sông Mê Kông (Nam Bộ ngày nay), Phù Nam phát triển rực rỡ thành một đế chế hàng hải với đô thị cảng Óc Eo phồn vinh bậc nhất Đông Nam Á cổ đại.",
        "characters": [
            { "name": "Thương nhân đô thị cảng Óc Eo", "type": "CREATIVE_REP", "desc": "Đại diện cư dân sông nước Nam Bộ: kiểm đếm hương liệu, trầm hương, ngọc trai và các sản vật nhiệt đới." },
            { "name": "Thuyền trưởng thương thuyền viễn dương (Ấn Độ/La Mã)", "type": "CREATIVE_REP", "desc": "Giới thiệu tiền vàng La Mã (Antoninus Pius), đồ gốm và gương đồng mang đến trao đổi." }
        ],
        "relatedDocs": ["DOC-1008A"],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 8: Văn minh Phù Nam."
    },
    {
        "code": "10.09A",
        "examCode": "MD-10.13",
        "grade": "10",
        "topic": "Văn minh Chăm-pa",
        "lesson": "Bài 9. Văn minh Chăm-pa.",
        "scenario": "“Nghệ nhân tháp Chàm và vũ điệu Apsara”, tái hiện cảnh các nghệ nhân tạc tượng thần Shiva và vũ nữ tập luyện vũ điệu cung đình tại thánh địa Mỹ Sơn.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Thành tựu kiến trúc đền tháp, kỹ thuật xây gạch không mạch vữa và sự tiếp biến văn hóa Ấn Độ giáo của cư dân Chăm-pa.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Vương quốc Chăm-pa hình thành và phát triển ở dải đất duyên hải miền Trung Việt Nam, để lại di sản kiến trúc đền tháp bằng gạch nung độc đáo và nền nghệ thuật điêu khắc đá giàu biểu cảm.",
        "characters": [
            { "name": "Nghệ nhân điêu khắc đá Chăm-pa", "type": "CREATIVE_REP", "desc": "Tỉ mỉ tạc phù điêu vũ nữ Trà Kiệu hoặc thần Shiva, giải thích kỹ thuật mài chập gắn kết gạch nung bằng nhựa cây." },
            { "name": "Nữ vũ công cung đình (Apsara)", "type": "CREATIVE_REP", "desc": "Tái hiện động tác uốn tay, nhịp chân theo tiếng trống Ginăng và đàn Kanhi hướng về đền thiêng." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 10 (Chương trình GDPT 2018) – Bài 9: Văn minh Chăm-pa."
    },
    {
        "code": "10.10A",
        "examCode": "MD-10.14",
        "grade": "10",
        "topic": "Văn minh Đại Việt",
        "lesson": "Bài 10. Văn minh Đại Việt.",
        "scenario": "“Khoa thi ở Quốc Tử Giám và Bia Tiến sĩ”, cuộc đối thoại giữa nho sĩ ứng thí và quan giám khảo về câu khắc 'Hiền tài là nguyên khí của quốc gia'.",
        "format": "Đối thoại lịch sử",
        "focus": "Thành tựu giáo dục, khoa cử và tư tưởng trọng dụng nhân tài của nền văn minh Đại Việt.",
        "originType": "SGK_FRAMEWORK",
        "context": "Năm 1484, vua Lê Thánh Tông cho dựng bia Tiến sĩ tại Văn Miếu – Quốc Tử Giám. Bài ký của Thân Nhân Trung khẳng định: 'Hiền tài là nguyên khí của quốc gia'.",
        "characters": [
            { "name": "Thân Nhân Trung", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử: Danh thần triều Lê sơ, người soạn bài văn bia Tiến sĩ khoa Nhâm Tuất (1442) dựng năm 1484." },
            { "name": "Tân Tiến sĩ", "type": "CREATIVE_REP", "desc": "Vai đại diện trí thức nho học bày tỏ chí hướng phụng sự đất nước." }
        ],
        "relatedDocs": ["DOC-1010A"],
        "sources": "Sách giáo khoa Lịch sử 10 & Tư liệu Văn bia Tiến sĩ Văn Miếu – Quốc Tử Giám (1484)."
    },

    # ================= KHỐI 11 (14 BÀI CHUẨN) =================
    {
        "code": "11.01A",
        "examCode": "MD-11.01",
        "grade": "11",
        "topic": "Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản",
        "lesson": "Bài 1. Một số vấn đề chung về cách mạng tư sản.",
        "scenario": "“Đêm trước Hội nghị Ba đẳng cấp tại Pháp (1789)”, cuộc tranh luận giữa đại diện Đẳng cấp thứ ba với Quý tộc và Tăng lữ về gánh nặng thuế khóa.",
        "format": "Tiểu phẩm",
        "focus": "Tiền đề kinh tế, chính trị, xã hội và động lực bùng nổ các cuộc cách mạng tư sản.",
        "originType": "SGK_FRAMEWORK",
        "context": "Trước năm 1789, xã hội Pháp chia làm 3 đẳng cấp. Đẳng cấp thứ ba (tư sản, nông dân, bình dân thành thị) chiếm hơn 98% dân số, làm ra của cải nhưng không có quyền lực chính trị và phải gánh chịu mọi thứ thuế.",
        "characters": [
            { "name": "Đại biểu Đẳng cấp thứ ba", "type": "CREATIVE_REP", "desc": "Trình bày bản kiến nghị đòi quyền bình đẳng và cải cách thuế." },
            { "name": "Đại diện Quý tộc phong kiến", "type": "CREATIVE_REP", "desc": "Bảo vệ đặc quyền phong kiến lâu đời, làm bật lên mâu thuẫn xã hội." }
        ],
        "relatedDocs": ["DOC-1101A"],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 1: Một số vấn đề chung về cách mạng tư sản."
    },
    {
        "code": "11.02A",
        "examCode": "MD-11.02",
        "grade": "11",
        "topic": "Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản",
        "lesson": "Bài 2. Sự xác lập và phát triển của chủ nghĩa tư bản (Cách mạng công nghiệp).",
        "scenario": "“Tiếng còi xưởng dệt và máy hơi nước James Watt”, cuộc trao đổi giữa nhà sáng chế James Watt, chủ xưởng cơ khí và công nhân về cuộc cách mạng công nghiệp.",
        "format": "Tiểu phẩm",
        "focus": "Tác động to lớn của phát minh máy móc đến năng suất lao động và sự hình thành hai giai cấp cơ bản trong xã hội tư bản chủ nghĩa.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Khởi đầu từ nước Anh vào nửa sau thế kỷ XVIII, cuộc Cách mạng công nghiệp đã thay thế lao động thủ công bằng máy móc, làm biến đổi căn bản diện mạo kinh tế – xã hội thế giới.",
        "characters": [
            { "name": "Gieêm Oát (James Watt)", "type": "HISTORICAL_FACT", "desc": "Nhà sáng chế máy hơi nước hoàn chỉnh: giải thích nguyên lý chuyển hóa nhiệt năng thành cơ năng." },
            { "name": "Chủ xưởng dệt công nghiệp", "type": "CREATIVE_REP", "desc": "Đại diện giai cấp tư sản công nghiệp: tính toán sản lượng tăng vọt và việc mở rộng thị trường." },
            { "name": "Người công nhân xưởng máy", "type": "CREATIVE_REP", "desc": "Đại diện giai cấp vô sản: chia sẻ nỗi gian truân làm việc 14 giờ mỗi ngày bên guồng máy ồn ào." }
        ],
        "relatedDocs": ["DOC-1101A"],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản."
    },
    {
        "code": "11.03A",
        "examCode": "MD-11.03",
        "grade": "11",
        "topic": "Sự hình thành Liên bang Cộng hòa xã hội chủ nghĩa Xô viết",
        "lesson": "Bài 3. Sự hình thành Liên bang Cộng hòa xã hội chủ nghĩa Xô viết.",
        "scenario": "“Rạng đông tại điện Smolny (11/1917)”, V.I. Lênin đọc Sắc lệnh Hòa bình và Sắc lệnh Ruộng đất trước Đại hội Xô viết toàn Nga lần thứ hai.",
        "format": "Sân khấu tư liệu",
        "focus": "Ý nghĩa bước ngoặt của Cách mạng tháng Mười Nga năm 1917 và việc thành lập Liên bang Xô viết năm 1922 – nhà nước công nông đầu tiên trên thế giới.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Đêm 24 rạng sáng 25/10/1917 (lịch Nga cũ), cuộc khởi nghĩa vũ trang Petrograd thắng lợi, Cung điện Mùa Đông bị đánh chiếm. Tối 25/10, Lênin xuất hiện tại Đại hội Xô viết công - nông - binh toàn Nga tại điện Smolny tuyên bố chính quyền về tay các Xô viết.",
        "characters": [
            { "name": "V.I. Lênin", "type": "HISTORICAL_FACT", "desc": "Lãnh tụ vĩ đại của giai cấp vô sản thế giới, người soạn thảo bản Sắc lệnh Hòa bình và Ruộng đất." },
            { "name": "Thủy thủ tàu tuần dương Rạng Đông", "type": "CREATIVE_REP", "desc": "Tái hiện tiếng súng hiệu lịch sử tấn công Cung điện Mùa Đông." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 3: Sự hình thành Liên Xô."
    },
    {
        "code": "11.04A",
        "examCode": "MD-11.04",
        "grade": "11",
        "topic": "Sự phát triển của chủ nghĩa xã hội từ sau CTTG II",
        "lesson": "Bài 4. Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai đến nay.",
        "scenario": "“Đoàn kết quốc tế vì hòa bình và độc lập dân tộc”, cuộc gặp gỡ giữa các đại biểu thanh niên quốc tế tại Liên hoan Thanh niên – Sinh viên thế giới ủng hộ cuộc đấu tranh của nhân dân Việt Nam.",
        "format": "Mô phỏng nghị sự",
        "focus": "Sự hình thành hệ thống xã hội chủ nghĩa thế giới và vai trò to lớn của tình đoàn kết quốc tế đối với các phong trào giải phóng dân tộc.",
        "originType": "SGK_FRAMEWORK",
        "context": "Sau năm 1945, chủ nghĩa xã hội vượt ra khỏi phạm vi một nước, trở thành hệ thống thế giới trải dài từ Đông Âu sang châu Á và Mỹ Latinh (Cuba), đóng vai trò thành trì bảo vệ hòa bình và giải phóng dân tộc.",
        "characters": [
            { "name": "Đại biểu thanh niên Việt Nam", "type": "CREATIVE_REP", "desc": "Cảm ơn sự giúp đỡ vô tư của nhân dân các nước XHCN đối với cuộc kháng chiến chính nghĩa của Việt Nam." },
            { "name": "Bạn bè quốc tế", "type": "CREATIVE_REP", "desc": "Hô vang khẩu hiệu đoàn kết và phản đối chiến tranh xâm lược." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 4: Hệ thống Xã hội chủ nghĩa."
    },
    {
        "code": "11.05A",
        "examCode": "MD-11.05",
        "grade": "11",
        "topic": "Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á",
        "lesson": "Bài 5. Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á.",
        "scenario": "“Phát súng tại cửa biển Đà Nẵng và tiếng súng Cần Vương”, cuộc hội nghị bí mật giữa các thủ lĩnh nghĩa quân chống Pháp sau khi triều đình ký Hiệp ước Hác-măng (1883).",
        "format": "Sân khấu tư liệu",
        "focus": "Bản chất xâm lược của chủ nghĩa thực dân phương Tây và ngọn lửa yêu nước quật khởi của các tầng lớp nhân dân Đông Nam Á chống áp bức đô hộ.",
        "originType": "SGK_FRAMEWORK",
        "context": "Từ ngày 1/9/1858, liên quân Pháp – Tây Ban Nha nổ súng đánh vào bán đảo Sơn Trà (Đà Nẵng), mở đầu cuộc chiến tranh xâm lược Việt Nam. Dù triều đình nhà Nguyễn lần lượt đầu hàng, phong trào kháng chiến dân gian và phong trào Cần Vương vẫn bùng cháy mạnh mẽ khắp ba kỳ.",
        "characters": [
            { "name": "Nghĩa sĩ Cần Vương", "type": "CREATIVE_REP", "desc": "Đọc Chiếu Cần Vương của vua Hàm Nghi hiệu triệu văn thân sĩ phu phò vua cứu nước." },
            { "name": "Cư dân vùng vịnh Đà Nẵng", "type": "CREATIVE_REP", "desc": "Kể lại cảnh quân dân theo chỉ huy của danh tướng Nguyễn Tri Phương kiên cường lập chiến lũy chặn giặc." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 5: Chủ nghĩa thực dân ở Đông Nam Á."
    },
    {
        "code": "11.06A",
        "examCode": "MD-11.06",
        "grade": "11",
        "topic": "Hành trình đi đến độc lập dân tộc ở Đông Nam Á",
        "lesson": "Bài 6. Hành trình đi đến độc lập dân tộc ở Đông Nam Á.",
        "scenario": "“Tia lửa Katipunan của Jose Rizal và Andres Bonifacio”, cuộc họp kín của phong trào Katipunan tại Manila chuẩn bị cho cuộc Tổng khởi nghĩa chống thực dân Tây Ban Nha (1896).",
        "format": "Đối thoại lịch sử",
        "focus": "Hai khuynh hướng cải cách ôn hòa và bạo động cách mạng trong phong trào giải phóng dân tộc ở Đông Nam Á cuối thế kỷ XIX – đầu thế kỷ XX.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Năm 1892, Andres Bonifacio thành lập Hiệp hội Những người con của Đất nước (Katipunan) tại Philippines, giương cao ngọn cờ đấu tranh vũ trang lật đổ ách thống trị tàn bạo của thực dân Tây Ban Nha, mở đường cho cuộc Cách mạng Philippines 1896.",
        "characters": [
            { "name": "Andres Bonifacio", "type": "HISTORICAL_FACT", "desc": "Lãnh tụ khởi nghĩa vũ trang Katipunan, người con anh hùng của phong trào công nhân Manila." },
            { "name": "Trí thức yêu nước Philippines", "type": "CREATIVE_REP", "desc": "Tranh luận về ảnh hưởng tác phẩm văn học thức tỉnh dân tộc của nhà yêu nước Jose Rizal." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 6: Hành trình đi đến độc lập ở Đông Nam Á."
    },
    {
        "code": "11.07A",
        "examCode": "MD-11.07",
        "grade": "11",
        "topic": "Chiến tranh bảo vệ Tổ quốc và chiến tranh giải phóng dân tộc",
        "lesson": "Bài 7. Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam.",
        "scenario": "“Lời thề Hội nghị Diên Hồng (1284)”, các bô lão từ khắp các lộ về kinh thành Thăng Long bàn kế sách đánh hay hòa trước họa xâm lăng Nguyên – Mông.",
        "format": "Đối thoại lịch sử",
        "focus": "Vai trò của khối đại đoàn kết toàn dân và nghệ thuật quân sự chiến tranh nhân dân bảo vệ Tổ quốc.",
        "originType": "SGK_FRAMEWORK",
        "context": "Tháng Chạp năm Giáp Thân (đầu năm 1285), trước thế giặc Nguyên – Mông hung bạo lần thứ hai, Thượng hoàng Trần Thánh Tông triệu tập phụ lão cả nước về thềm điện Diên Hồng hỏi kế sách.",
        "characters": [
            { "name": "Thượng hoàng Trần Thánh Tông", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử xác thực theo Đại Việt sử ký toàn thư." },
            { "name": "Các bô lão đại diện hương ấp", "type": "CREATIVE_REP", "desc": "Đồng thanh hô vang 'Đánh!' thể hiện ý chí toàn dân." }
        ],
        "relatedDocs": ["DOC-1107A"],
        "sources": "Đại Việt sử ký toàn thư & Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018)."
    },
    {
        "code": "11.07B",
        "examCode": "MD-11.08",
        "grade": "11",
        "topic": "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam",
        "lesson": "Bài 7. Khái quát về chiến tranh bảo vệ Tổ quốc (Kháng chiến chống Tống thời Lý 1075 – 1077).",
        "scenario": "“Bài thơ thần 'Nam quốc sơn hà' bên sông Như Nguyệt (1077)”, Lý Thường Kiệt cho người ngâm thơ vang dội trong đền Trương Hống, Trương Hát giữa đêm tối làm tan vỡ nhuệ khí quân Tống.",
        "format": "Sân khấu tư liệu",
        "focus": "Bản Tuyên ngôn Độc lập đầu tiên của dân tộc, nghệ thuật 'Tiên phát chế nhân' và tác chiến tâm lý xuất sắc của danh tướng Lý Thường Kiệt.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Mùa xuân năm 1077, hơn 30 vạn quân Tống do Quách Quỳ chỉ huy tràn vào nước ta, bị chặn đứng trước phòng tuyến sông Như Nguyệt (sông Cầu, Bắc Ninh). Đêm đêm, từ đền thờ thần bên sông cất lên bài thơ: 'Nam quốc sơn hà Nam đế cư / Tiệt nhiên định phận tại thiên thư...'.",
        "characters": [
            { "name": "Thái úy Lý Thường Kiệt", "type": "HISTORICAL_FACT", "desc": "Tổng chỉ huy quân đội Đại Việt, nhà chiến lược quân sự kiệt xuất thời Lý." },
            { "name": "Tướng lĩnh phòng tuyến Như Nguyệt", "type": "CREATIVE_REP", "desc": "Sắp xếp thuyền chiến, chông tre và chỉ huy quân sĩ phản công đêm phá tan giặc Tống." }
        ],
        "relatedDocs": ["DOC-1107A"],
        "sources": "Đại Việt sử ký toàn thư & Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018)."
    },
    {
        "code": "11.07C",
        "examCode": "MD-11.09",
        "grade": "11",
        "topic": "Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam",
        "lesson": "Bài 7. Ba lần kháng chiến chống quân xâm lược Mông – Nguyên (1258, 1285, 1287 – 1288).",
        "scenario": "“Hịch tướng sĩ và trận thủy chiến Bạch Đằng (1288)”, Tiết chế Quốc công Hưng Đạo Đại vương Trần Quốc Tuấn hiệu triệu tướng sĩ và chỉ huy trận cọc ngầm Bạch Đằng bắt sống Ô Mã Nhi.",
        "format": "Sân khấu tư liệu",
        "focus": "Lòng yêu nước nồng nàn qua 'Hịch tướng sĩ', nghệ thuật lợi dụng thủy triều cắm cọc gỗ và tinh thần quyết chiến 'Sát Thát' của quân dân nhà Trần.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Tháng 4 năm 1288, đoàn thuyền chiến của đạo quân xâm lược Nguyên do Ô Mã Nhi chỉ huy rút chạy trên sông Bạch Đằng rơi vào trận địa cọc ngầm của Trần Quốc Tuấn khi thủy triều rút kiệt, toàn bộ đạo thủy binh địch bị tiêu diệt và bắt sống.",
        "characters": [
            { "name": "Hưng Đạo Đại vương Trần Quốc Tuấn", "type": "HISTORICAL_FACT", "desc": "Vị anh hùng dân tộc, tác giả Hịch tướng sĩ và Binh thư yếu lược." },
            { "name": "Tướng quân Phạm Ngũ Lão / Yết Kiêu", "type": "HISTORICAL_FACT", "desc": "Thần tướng lặn sông đục thuyền địch, phối hợp khép chặt vòng vây cọc ngầm Bạch Đằng." }
        ],
        "relatedDocs": ["DOC-1107A"],
        "sources": "Đại Việt sử ký toàn thư & Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018)."
    },
    {
        "code": "11.08A",
        "examCode": "MD-11.10",
        "grade": "11",
        "topic": "Khởi nghĩa Lam Sơn và Nguyễn Trãi",
        "lesson": "Bài 8. Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (Khởi nghĩa Lam Sơn 1418 – 1427).",
        "scenario": "“Đêm viết Bình Ngô đại cáo và Hội thề Đông Quan (1427)”, Nguyễn Trãi và Lê Lợi đối thoại về tư tưởng 'Việc nhân nghĩa cốt ở yên dân' và quyết định cấp thuyền, ngựa cho quân Minh rút về nước.",
        "format": "Sân khấu tư liệu",
        "focus": "Tư tưởng nhân nghĩa, nghệ thuật quân sự kết hợp đấu tranh ngoại giao trong Khởi nghĩa Lam Sơn.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Sau chiến thắng Chi Lăng – Xương Giang (1427), nghĩa quân Lam Sơn mở Hội thề Đông Quan (10/12/1427), tha chết và cấp phương tiện cho Vương Thông rút quân về nước để dập tắt muôn đời ngọn lửa chiến tranh. Đầu năm 1428, Nguyễn Trãi thay lời Lê Lợi soạn Bình Ngô đại cáo.",
        "characters": [
            { "name": "Bình Định Vương Lê Lợi", "type": "HISTORICAL_FACT", "desc": "Lãnh tụ tối cao của cuộc khởi nghĩa Lam Sơn." },
            { "name": "Nguyễn Trãi", "type": "HISTORICAL_FACT", "desc": "Mưu sĩ, nhà chính trị, ngoại giao, tác giả Quân trung từ mệnh tập và Bình Ngô đại cáo." }
        ],
        "relatedDocs": ["DOC-1108A"],
        "sources": "Hồ sơ tư liệu dự án: Nguyễn Trãi – Khởi nghĩa Lam Sơn & Sách giáo khoa Lịch sử 11."
    },
    {
        "code": "11.08B",
        "examCode": "MD-11.11",
        "grade": "11",
        "topic": "Chiến tranh bảo vệ Tổ quốc và chiến tranh giải phóng dân tộc",
        "lesson": "Bài 8. Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam (Phong trào Tây Sơn).",
        "scenario": "“Hịch xuất quân Thăng Long mùa xuân Kỷ Dậu (1789)”, Quang Trung – Nguyễn Huệ hiệu triệu tướng sĩ tại Nghệ An trước trận đại phá 29 vạn quân Thanh.",
        "format": "Sân khấu tư liệu",
        "focus": "Nghệ thuật hành quân thần tốc, tư tưởng yêu nước quật cường và quyết tâm 'đánh cho để dài tóc, đánh cho để đen răng' của vua Quang Trung.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Cuối năm 1788, 29 vạn quân Mãn Thanh ồ ạt tràn vào xâm lược nước ta. Nhận được cấp báo, Nguyễn Huệ lên ngôi Hoàng đế tại Phú Xuân (Huế), lập tức tiến quân ra Bắc, tuyển thêm quân tại Nghệ An và mở cuộc phản công chớp nhoáng giải phóng Thăng Long.",
        "characters": [
            { "name": "Hoàng đế Quang Trung (Nguyễn Huệ)", "type": "HISTORICAL_FACT", "desc": "Vị chỉ huy thiên tài của dân tộc: đọc lời dụ tướng sĩ vang dội hào khí sông núi, lệnh ăn Tết trước rồi hẹn ngày mùng 7 vào Thăng Long ăn Tết lại." },
            { "name": "Đại tư mã Ngô Văn Sở / Tướng sĩ Tây Sơn", "type": "HISTORICAL_FACT", "desc": "Báo cáo tình hình rút lui bảo toàn lực lượng tại Tam Điệp – Biện Sơn và đồng lòng thề quyết chiến." }
        ],
        "relatedDocs": ["DOC-1108A"],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 8: Phong trào Tây Sơn."
    },
    {
        "code": "11.09A",
        "examCode": "MD-11.12",
        "grade": "11",
        "topic": "Các cuộc cải cách lớn trong lịch sử Việt Nam",
        "lesson": "Bài 9. Cuộc cải cách của Hồ Quý Ly và triều Hồ (cuối thế kỷ XIV – đầu thế kỷ XV).",
        "scenario": "“Phiên triều nghị về phép Hạn điền, Hạn nô và tiền giấy Thông bảo hội sao”, tái hiện cuộc tranh biện giữa Hồ Quý Ly với các quý tộc nhà Trần và tâm tư người dân.",
        "format": "Đối thoại lịch sử",
        "focus": "Nội dung, tính chất tiến bộ, những hạn chế và bài học lịch sử từ cuộc cải cách của Hồ Quý Ly.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Cuối thế kỷ XIV, nhà Trần suy yếu trầm trọng. Hồ Quý Ly tiến hành hàng loạt cải cách táo bạo trên các lĩnh vực kinh tế (phát hành tiền giấy Thông bảo hội sao năm 1396, ban hành phép hạn điền năm 1397, hạn gia nô), văn hóa – giáo dục (chữ Nôm, sửa đổi thi cử) và quân sự.",
        "characters": [
            { "name": "Hồ Quý Ly", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử: Nhà cải cách cuối thế kỷ XIV – đầu thế kỷ XV." },
            { "name": "Quan đại thần bảo thủ", "type": "CREATIVE_REP", "desc": "Vai đại diện tầng lớp quý tộc điền trang phản đối chính sách hạn điền và tiền giấy." },
            { "name": "Thương nhân & Nông dân", "type": "CREATIVE_REP", "desc": "Vai đại diện phản ánh tác động thực tế của tiền giấy Thông bảo hội sao trong lưu thông." }
        ],
        "relatedDocs": ["DOC-1109A"],
        "sources": "Hồ sơ tư liệu dự án: Cải cách Hồ Quý Ly & Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018)."
    },
    {
        "code": "11.10A",
        "examCode": "MD-11.13",
        "grade": "11",
        "topic": "Các cuộc cải cách lớn trong lịch sử Việt Nam",
        "lesson": "Bài 10. Cuộc cải cách của Lê Thánh Tông (thế kỷ XV) và Minh Mạng (nửa đầu thế kỷ XIX).",
        "scenario": "“Lập Lục bộ và vẽ Bản đồ Hồng Đức”, vua Lê Thánh Tông khảo sát báo cáo hành chính từ các đạo thừa tuyên.",
        "format": "Sân khấu tư liệu",
        "focus": "Tổ chức bộ máy nhà nước quân chủ chuyên chế trung ương tập quyền và hoàn thiện pháp luật (Quốc triều hình luật).",
        "originType": "SGK_FRAMEWORK",
        "context": "Cuộc cải cách của vua Lê Thánh Tông nửa sau thế kỷ XV đã bãi bỏ các chức Tể tướng, Đại hành khiển, trực tiếp nắm Lục bộ, chia cả nước thành 13 đạo thừa tuyên và ban hành bộ Quốc triều hình luật (Luật Hồng Đức).",
        "characters": [
            { "name": "Vua Lê Thánh Tông", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử: Vị vua tiến hành cuộc cải cách hành chính lớn thế kỷ XV." },
            { "name": "Quan Thượng thư Lục bộ", "type": "CREATIVE_REP", "desc": "Vai đại diện trình tấu công việc hành chính, hộ tịch và hình luật." }
        ],
        "relatedDocs": ["DOC-1110A"],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Cải cách Lê Thánh Tông."
    },
    {
        "code": "11.10B",
        "examCode": "MD-11.14",
        "grade": "11",
        "topic": "Các cuộc cải cách lớn & Biển Đảo Việt Nam",
        "lesson": "Bài 10 & 12. Cuộc cải cách của Minh Mạng (thế kỷ XIX) và Vị trí Biển Đông trong lịch sử.",
        "scenario": "“Định danh 30 tỉnh và Lễ khao lề thế lính Hoàng Sa”, vua Minh Mạng chuẩn tấu chia tỉnh và triều đình cử Đội Hoàng Sa cắm mốc chủ quyền.",
        "format": "Mô phỏng nghị sự",
        "focus": "Thống nhất hành chính cả nước (30 tỉnh, 1 phủ Thừa Thiên) và bằng chứng lịch sử khẳng định chủ quyền đối với quần đảo Hoàng Sa, Trường Sa.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Từ năm 1831 – 1832, vua Minh Mạng chia cả nước thành 30 tỉnh và 1 phủ Thừa Thiên, thiết lập chức vụ Tổng đốc, Tuần phủ. Hằng năm, triều Nguyễn cử Hải đội Hoàng Sa đi đo đạc hải trình, dựng bia chủ quyền trên quần đảo Hoàng Sa và Trường Sa.",
        "characters": [
            { "name": "Vua Minh Mạng", "type": "HISTORICAL_FACT", "desc": "Hoàng đế trị vì tiến hành cải cách hành chính toàn diện và liên tục sai phái thủy quân ra Hoàng Sa." },
            { "name": "Cai đội Thủy quân Hoàng Sa", "type": "CREATIVE_REP", "desc": "Nhận lệnh bài, thẻ đồng và hải trình từ triều đình chuẩn bị dong buồm ra Biển Đông cắm mốc." }
        ],
        "relatedDocs": ["DOC-1110A"],
        "sources": "Sách giáo khoa Lịch sử 11 (Chương trình GDPT 2018) – Bài 10 & 12: Cải cách Minh Mạng và Biển Đông."
    },

    # ================= KHỐI 12 (14 BÀI CHUẨN) =================
    {
        "code": "12.01A",
        "examCode": "MD-12.01",
        "grade": "12",
        "topic": "Trật tự thế giới trong và sau Chiến tranh lạnh",
        "lesson": "Bài 1. Liên hợp quốc và trật tự thế giới hai cực Ianta.",
        "scenario": "“Phiên họp thông qua Hiến chương tại San Francisco (1945)”, các đại biểu thảo luận về mục tiêu duy trì hòa bình và nguyên tắc tôn trọng chủ quyền quốc gia.",
        "format": "Mô phỏng nghị sự",
        "focus": "Bối cảnh thành lập, mục tiêu, nguyên tắc hoạt động của Liên hợp quốc và sự hình thành Trật tự hai cực Ianta.",
        "originType": "SGK_FRAMEWORK",
        "context": "Từ ngày 25/4 đến 26/6/1945, đại biểu 50 nước họp tại San Francisco (Mỹ) thông qua Hiến chương Liên hợp quốc nhằm duy trì hòa bình, an ninh quốc tế và thúc đẩy hợp tác giữa các quốc gia.",
        "characters": [
            { "name": "Chủ tọa phiên họp San Francisco", "type": "CREATIVE_REP", "desc": "Điều hành phiên thảo luận các điều khoản cốt lõi của Hiến chương." },
            { "name": "Đại biểu các quốc gia thành viên", "type": "CREATIVE_REP", "desc": "Trình bày lập trường về nguyên tắc bình đẳng chủ quyền và giải quyết tranh chấp bằng biện pháp hòa bình." }
        ],
        "relatedDocs": ["DOC-1201A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 1: Liên hợp quốc."
    },
    {
        "code": "12.02A",
        "examCode": "MD-12.02",
        "grade": "12",
        "topic": "Trật tự thế giới trong và sau Chiến tranh lạnh",
        "lesson": "Bài 2. Trật tự thế giới trong Chiến tranh lạnh.",
        "scenario": "“Cuộc đối đầu tại trạm gác Checkpoint Charlie (Berlin 1961)”, cuộc chạm trán căng thẳng giữa xe tăng hai phe tại biên giới Đông – Tây Berlin.",
        "format": "Sân khấu tư liệu",
        "focus": "Nguồn gốc, biểu hiện đối đầu quân sự – ý thức hệ và tác động nặng nề của Chiến tranh lạnh đối với hòa bình và an ninh thế giới.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Sau Chiến tranh thế giới thứ hai, sự đối đầu giữa hai cực Xô – Mỹ đẩy thế giới vào tình trạng Chiến tranh lạnh kéo dài hơn bốn thập kỷ. Đỉnh điểm căng thẳng diễn ra tại châu Âu với cuộc khủng hoảng Berlin năm 1961.",
        "characters": [
            { "name": "Sĩ quan quân cảnh tại trạm kiểm soát Checkpoint Charlie", "type": "CREATIVE_REP", "desc": "Tái hiện giây phút nín thở khi xe tăng Liên Xô và Mỹ đối diện nhau từng mét trên đường phố Friedrichstrasse." },
            { "name": "Phóng viên chiến trường quốc tế", "type": "CREATIVE_REP", "desc": "Ghi nhận bản tin truyền hình trực tiếp về sự chia cắt sâu sắc của nước Đức và thế đối đầu hạt nhân." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 2: Trật tự thế giới trong Chiến tranh lạnh."
    },
    {
        "code": "12.03A",
        "examCode": "MD-12.03",
        "grade": "12",
        "topic": "Trật tự thế giới sau Chiến tranh lạnh",
        "lesson": "Bài 3. Trật tự thế giới sau Chiến tranh lạnh.",
        "scenario": "“Thế giới đa cực và cơ hội hội nhập của các quốc gia đang phát triển”, diễn đàn đối thoại kinh tế toàn cầu về xu thế đa phương hóa và cuộc cách mạng công nghệ số.",
        "format": "Mô phỏng nghị sự",
        "focus": "Xu thế phát triển của thế giới sau khi trật tự hai cực Ianta sụp đổ: hòa bình, hợp tác, xu thế đa cực và cạnh tranh kinh tế – công nghệ.",
        "originType": "SGK_FRAMEWORK",
        "context": "Sau năm 1991, thế giới bước vào kỷ nguyên mới. Dù Mỹ ra sức thiết lập trật tự đơn cực, xu thế đa cực nhiều trung tâm (Mỹ, EU, Nhật Bản, Trung Quốc, Nga, ASEAN...) cùng sự bùng nổ của toàn cầu hóa đã định hình cục diện thế giới mới.",
        "characters": [
            { "name": "Đại diện ngoại giao quốc gia đang phát triển", "type": "CREATIVE_REP", "desc": "Phân tích lợi thế mở cửa thương mại và thách thức bảo vệ chủ quyền kinh tế số." },
            { "name": "Chuyên gia phân tích quan hệ quốc tế", "type": "CREATIVE_REP", "desc": "Đánh giá tầm quan trọng của luật pháp quốc tế và các cơ chế đa phương trong việc ngăn chặn xung đột." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 3: Trật tự thế giới sau Chiến tranh lạnh."
    },
    {
        "code": "12.04A",
        "examCode": "MD-12.04",
        "grade": "12",
        "topic": "Các tổ chức quốc tế và khu vực",
        "lesson": "Bài 4. Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN).",
        "scenario": "“Tuyên bố Băng Cốc (8/1967) và tinh thần 'Phương cách ASEAN'”, phiên đàm đạo giữa 5 ngoại trưởng sáng lập ASEAN về tinh thần đoàn kết khu vực.",
        "format": "Mô phỏng nghị sự",
        "focus": "Mục tiêu thành lập, nguyên tắc hoạt động cơ bản (Đồng thuận, không can thiệp nội bộ) và quá trình mở rộng thành viên của ASEAN.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Ngày 8/8/1967, tại Băng Cốc (Thái Lan), năm ngoại trưởng của Indonesia, Malaysia, Philippines, Singapore và Thái Lan ký bản Tuyên bố Băng Cốc khai sinh Hiệp hội các quốc gia Đông Nam Á (ASEAN).",
        "characters": [
            { "name": "Thanat Khoman / Adam Malik", "type": "HISTORICAL_FACT", "desc": "Đại diện sáng lập ASEAN: phát biểu về sự cần thiết hợp tác kinh tế, văn hóa và duy trì hòa bình khu vực." },
            { "name": "Đại diện ngoại giao Việt Nam (gia nhập 1995)", "type": "CREATIVE_REP", "desc": "Liên hệ ý nghĩa việc Việt Nam gia nhập ASEAN năm 1995, mở ra kỷ nguyên hòa bình, hữu nghị toàn khu vực." }
        ],
        "relatedDocs": ["DOC-1201A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 4: Sự ra đời và phát triển của ASEAN."
    },
    {
        "code": "12.05A",
        "examCode": "MD-12.05",
        "grade": "12",
        "topic": "Các tổ chức quốc tế và khu vực",
        "lesson": "Bài 5. Cộng đồng ASEAN: Ý tưởng và hiện thực.",
        "scenario": "“Hiến chương ASEAN và khát vọng Ngôi nhà chung Đông Nam Á”, phiên lễ ký kết Hiến chương ASEAN tại Singapore (2007) hướng tới thành lập Cộng đồng ASEAN năm 2015.",
        "format": "Mô phỏng nghị sự",
        "focus": "Ý nghĩa bước ngoặt của Hiến chương ASEAN trong việc tạo lập cơ sở pháp lý và thể chế vững chắc cho tiến trình hội nhập khu vực trên cả 3 trụ cột.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Tháng 11/2007, Hội nghị Cấp cao ASEAN lần thứ 13 tại Singapore đã ký kết Hiến chương ASEAN, chính thức có hiệu lực từ ngày 15/12/2008, chuyển ASEAN từ một hiệp hội lỏng lẻo thành tổ chức liên chính phủ có tư cách pháp nhân.",
        "characters": [
            { "name": "Tổng Thư ký ASEAN", "type": "HISTORICAL_FACT", "desc": "Tuyên bố sự ra đời của bản Hiến chương tạo nền móng xây dựng Cộng đồng ASEAN 2015." },
            { "name": "Đại sứ Việt Nam tại ASEAN", "type": "CREATIVE_REP", "desc": "Khẳng định cam kết chủ động, tích cực và có trách nhiệm của Việt Nam vì một Đông Nam Á hòa bình, thịnh vượng." }
        ],
        "relatedDocs": ["DOC-1201A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 5: Cộng đồng ASEAN."
    },
    {
        "code": "12.06A",
        "examCode": "MD-12.06",
        "grade": "12",
        "topic": "Cách mạng tháng Tám năm 1945",
        "lesson": "Bài 6. Cách mạng tháng Tám năm 1945.",
        "scenario": "“Thời khắc quyết định tại Tân Trào và Quân lệnh số 1 (8/1945)”, Ủy ban Khởi nghĩa toàn quốc ban Quân lệnh số 1 và khí thế quần chúng giành chính quyền.",
        "format": "Sân khấu tư liệu",
        "focus": "Nghệ thuật chớp thời cơ 'ngàn năm có một' và sức mạnh tổng khởi nghĩa toàn dân trong Cách mạng tháng Tám 1945.",
        "originType": "SGK_FRAMEWORK",
        "context": "Khi Nhật Bản đầu hàng Đồng minh không điều kiện (8/1945), Hội nghị toàn quốc của Đảng và Quốc dân Đại hội tại Tân Trào (Tuyên Quang) đã kịp thời phát lệnh Tổng khởi nghĩa giành chính quyền trên cả nước.",
        "characters": [
            { "name": "Đại biểu Quốc dân Đại hội Tân Trào", "type": "CREATIVE_REP", "desc": "Tái hiện không khí khẩn trương thông qua 10 chính sách lớn của Việt Minh." },
            { "name": "Thanh niên tự vệ Hà Nội", "type": "CREATIVE_REP", "desc": "Tái hiện khí thế ngày 19/8/1945 tại Quảng trường Nhà hát Lớn." }
        ],
        "relatedDocs": ["DOC-1206A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 6: Cách mạng tháng Tám năm 1945."
    },
    {
        "code": "12.06B",
        "examCode": "MD-12.07",
        "grade": "12",
        "topic": "Cách mạng tháng Tám năm 1945 và sự ra đời của nước Việt Nam Dân chủ Cộng hòa",
        "lesson": "Bài 6. Sự ra đời của nước Việt Nam Dân chủ Cộng hòa (2/9/1945).",
        "scenario": "“Tiếng nói Bác Hồ giữa Quảng trường Ba Đình mùa thu lịch sử”, tái hiện lễ Tuyên ngôn Độc lập chiều ngày 2/9/1945 tại Hà Nội khai sinh nước Việt Nam mới.",
        "format": "Sân khấu tư liệu",
        "focus": "Giá trị pháp lý, giá trị nhân văn và ý nghĩa lịch sử thiêng liêng của bản Tuyên ngôn Độc lập do Chủ tịch Hồ Chí Minh tuyên đọc.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Chiều 2/9/1945, tại Quảng trường Ba Đình rực rỡ cờ hoa trước hơn 50 vạn đồng bào Thủ đô và vùng phụ cận, Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập tuyên bố với thế giới: Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do, độc lập!",
        "characters": [
            { "name": "Chủ tịch Hồ Chí Minh", "type": "HISTORICAL_FACT", "desc": "Vị lãnh tụ kính yêu của dân tộc, đọc bản Tuyên ngôn Độc lập với câu hỏi ân cần: 'Tôi nói đồng bào nghe rõ không?'." },
            { "name": "Đại biểu phụ nữ và thanh niên cứu quốc", "type": "CREATIVE_REP", "desc": "Tuyên thệ sắt son bảo vệ nền độc lập tự do vừa giành được trước quốc dân đồng bào." }
        ],
        "relatedDocs": ["DOC-1206A"],
        "sources": "Văn kiện Đảng Toàn tập & Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018)."
    },
    {
        "code": "12.07A",
        "examCode": "MD-12.08",
        "grade": "12",
        "topic": "Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)",
        "lesson": "Bài 7. Cuộc kháng chiến chống thực dân Pháp (Chiến dịch Điện Biên Phủ 1954).",
        "scenario": "“Sở chỉ huy Mường Phăng – Quyết định lịch sử (1/1954)”, cuộc hội ý căng thẳng giữa Đại tướng Võ Nguyên Giáp và Đảng ủy mặt trận quyết định chuyển phương châm 'Đánh nhanh thắng nhanh' sang 'Đánh chắc tiến chắc'.",
        "format": "Sân khấu tư liệu",
        "focus": "Bản lĩnh lãnh đạo, tư duy quân sự khoa học, nghệ thuật chiến dịch và ý nghĩa quyết định thắng lợi 'lừng lẫy năm châu, chấn động địa cầu' của Chiến dịch Điện Biên Phủ.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Ngày 26/1/1954, trước giờ nổ súng dự kiến đánh tập đoàn cứ điểm Điện Biên Phủ, Đại tướng Tổng tư lệnh Võ Nguyên Giáp đã nhận định địa hình thay đổi và hỏa lực địch tăng cường. Với trách nhiệm trước sinh mệnh bộ đội và thắng lợi của dân tộc, ông đã đưa ra 'quyết định khó khăn nhất trong cuộc đời chỉ huy' để chuyển sang phương châm đánh chắc tiến chắc.",
        "characters": [
            { "name": "Đại tướng Võ Nguyên Giáp", "type": "HISTORICAL_FACT", "desc": "Chỉ huy trưởng kiêm Bí thư Đảng ủy mặt trận: phân tích tương quan lực lượng, thuyết phục Đảng ủy mặt trận và ra lệnh kéo pháo ra chuẩn bị lại trận địa." },
            { "name": "Cán bộ tác chiến / Chỉ huy pháo binh", "type": "CREATIVE_REP", "desc": "Báo cáo tình hình mở đường và tinh thần chiến đấu quả cảm của bộ đội ta vượt đèo kéo pháo." }
        ],
        "relatedDocs": ["DOC-1207A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 7: Chiến thắng lịch sử Điện Biên Phủ 1954."
    },
    {
        "code": "12.07B",
        "examCode": "MD-12.09",
        "grade": "12",
        "topic": "Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)",
        "lesson": "Bài 7. Đấu tranh ngoại giao và Hiệp định Genève năm 1954 về Đông Dương.",
        "scenario": "“Đấu trí trên bàn đàm phán Genève và khát vọng hòa bình thống nhất”, phái đoàn Việt Nam Dân chủ Cộng hòa do Phó Thủ tướng Phạm Văn Đồng dẫn đầu bảo vệ các quyền dân tộc cơ bản.",
        "format": "Đối thoại lịch sử",
        "focus": "Ý nghĩa lịch sử của Hiệp định Genève 1954 – văn bản pháp lý quốc tế đầu tiên công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của ba nước Việt Nam, Lào, Campuchia.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Sau chiến thắng Điện Biên Phủ, ngày 8/5/1954, Hội nghị Genève về Đông Dương khai mạc. Sau 75 ngày đàm phán gay gắt, ngày 21/7/1954, các văn bản của Hiệp định Genève được ký kết, chấm dứt cuộc chiến tranh xâm lược của thực dân Pháp kéo dài gần một thế kỷ.",
        "characters": [
            { "name": "Phó Thủ tướng Phạm Văn Đồng", "type": "HISTORICAL_FACT", "desc": "Trưởng đoàn đàm phán Việt Nam Dân chủ Cộng hòa kiên định lập trường nguyên tắc độc lập và toàn vẹn lãnh thổ." },
            { "name": "Phóng viên báo chí quốc tế tại Thụy Sĩ", "type": "CREATIVE_REP", "desc": "Tường thuật không khí ký kết hiệp định chấm dứt tiếng súng tại Đông Dương." }
        ],
        "relatedDocs": ["DOC-1207A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 7: Hiệp định Genève 1954."
    },
    {
        "code": "12.08A",
        "examCode": "MD-12.10",
        "grade": "12",
        "topic": "Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975) & Ngoại giao",
        "lesson": "Bài 8 & Bài 13. Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975) & Đấu tranh ngoại giao tại Hội nghị Paris.",
        "scenario": "“Bàn tròn Kleber – Cuộc đấu trí tại Hội nghị Paris (1968 – 1973)”, tái hiện phiên đàm phán ngoại giao sau thắng lợi Điện Biên Phủ trên không (12/1972) dẫn tới lễ ký Hiệp định Paris ngày 27/1/1973.",
        "format": "Sân khấu tư liệu",
        "focus": "Mối quan hệ biện chứng giữa thắng lợi trên chiến trường ('đánh') và thắng lợi trên bàn đàm phán ('đàm'), ý nghĩa lịch sử của Hiệp định Paris 1973.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Sau gần 5 năm đàm phán căng thẳng và đặc biệt sau thắng lợi 'Điện Biên Phủ trên không' (12/1972), ngày 27/1/1973, Hiệp định về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết tại Paris, buộc Hoa Kỳ tôn trọng độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam và rút hết quân đội về nước.",
        "characters": [
            { "name": "Bộ trưởng Nguyễn Thị Bình", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử: Trưởng phái đoàn đàm phán Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam." },
            { "name": "Bộ trưởng Xuân Thủy & Cố vấn đặc biệt Lê Đức Thọ", "type": "HISTORICAL_FACT", "desc": "Nhân vật lịch sử: Đại diện phái đoàn Việt Nam Dân chủ Cộng hòa tại Hội nghị Paris." },
            { "name": "Phóng viên quốc tế tại Paris", "type": "CREATIVE_REP", "desc": "Vai dẫn chuyện và đặt câu hỏi trong cuộc họp báo quốc tế tại Trung tâm Hội nghị Kleber." }
        ],
        "relatedDocs": ["DOC-1208A"],
        "sources": "Hồ sơ tư liệu dự án: Hiệp định Paris 1973 & Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018)."
    },
    {
        "code": "12.08B",
        "examCode": "MD-12.11",
        "grade": "12",
        "topic": "Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)",
        "lesson": "Bài 8. Cuộc Tổng tiến công và nổi dậy Xuân 1975 (Chiến dịch Hồ Chí Minh lịch sử).",
        "scenario": "“Mệnh lệnh 'Thần tốc' và thời khắc trưa ngày 30/4/1975 tại Dinh Độc Lập”, tái hiện bức điện mật của Đại tướng Võ Nguyên Giáp và hình ảnh xe tăng 390 húc đổ cổng Dinh Độc Lập.",
        "format": "Sân khấu tư liệu",
        "focus": "Nghệ thuật tạo thời cơ, chớp thời cơ chiến lược và sức mạnh tổng hợp của khối đại đoàn kết toàn dân trong Đại thắng Mùa xuân 1975 giải phóng hoàn toàn miền Nam.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Ngày 7/4/1975, Đại tướng Võ Nguyên Giáp phát đi bức điện lịch sử: 'Thần tốc, thần tốc hơn nữa; táo bạo, táo bạo hơn nữa; tranh thủ từng giờ, từng phút xốc tới mặt trận giải phóng miền Nam'. Trưa ngày 30/4/1975, lá cờ cách mạng tung bay trên nóc Dinh Độc Lập, non sông thu về một mối.",
        "characters": [
            { "name": "Đại diện Bộ Chính trị / Quân ủy Trung ương", "type": "HISTORICAL_FACT", "desc": "Khẳng định thời cơ chiến lược đã chín muồi, chỉ đạo tiến công thần tốc giải phóng miền Nam." },
            { "name": "Chiến sĩ lái xe tăng tiến vào Dinh Độc Lập", "type": "CREATIVE_REP", "desc": "Tái hiện giây phút cắm cờ chiến thắng lúc 11 giờ 30 phút ngày 30 tháng 4 năm 1975." }
        ],
        "relatedDocs": ["DOC-1208A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 8: Đại thắng mùa Xuân 1975."
    },
    {
        "code": "12.08C",
        "examCode": "MD-12.12",
        "grade": "12",
        "topic": "Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)",
        "lesson": "Bài 8. Cuộc kháng chiến chống Mỹ, cứu nước (Phong trào Đồng khởi và Tuyến đường Trường Sơn).",
        "scenario": "“Tiếng mõ Mỏ Cày của Đội quân tóc dài và ngọn lửa Trường Sơn”, bà Nguyễn Thị Định lãnh đạo nhân dân Định Thủy nổi dậy đồng khởi kết hợp tái hiện chiến sĩ công binh mở đường Trường Sơn.",
        "format": "Hoạt cảnh đời sống",
        "focus": "Bước phát triển nhảy vọt của cách mạng miền Nam từ giữ gìn lực lượng sang thế tiến công, vai trò huyết mạch chi viện chiến lược của Đường Trường Sơn – Đường Hồ Chí Minh.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Ngày 17/1/1960, dưới sự chỉ đạo của Tỉnh ủy Bến Tre mà trực tiếp là bà Nguyễn Thị Định, cuộc Đồng khởi nổ ra tại ba xã Định Thủy, Phước Hiệp, Bình Khánh (huyện Mỏ Cày) rồi lan rộng như bão táp khắp miền Nam, dẫn tới sự ra đời của Mặt trận Dân tộc Giải phóng miền Nam Việt Nam (20/12/1960).",
        "characters": [
            { "name": "Nữ tướng Nguyễn Thị Định", "type": "HISTORICAL_FACT", "desc": "Người chỉ huy phong trào Đồng khởi Bến Tre, linh hồn của 'Đội quân tóc dài' huyền thoại." },
            { "name": "Nữ thanh niên xung phong Trường Sơn", "type": "CREATIVE_REP", "desc": "Đứng gác ngã ba Đồng Lộc, rọi đèn tiêu chỉ đường cho đoàn xe vượt bom đạn ra tiền tuyến." }
        ],
        "relatedDocs": ["DOC-1208A"],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 8: Phong trào Đồng khởi & Đường Trường Sơn."
    },
    {
        "code": "12.10A",
        "examCode": "MD-12.13",
        "grade": "12",
        "topic": "Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay",
        "lesson": "Bài 10. Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay.",
        "scenario": "“Đại hội VI (12/1986) – Quyết tâm 'Nhìn thẳng vào sự thật, nói rõ sự thật'”, phiên thảo luận thông qua đường lối Đổi mới toàn diện đất nước.",
        "format": "Mô phỏng nghị sự",
        "focus": "Bối cảnh khủng hoảng kinh tế – xã hội, tính tất yếu và nội dung cốt lõi của đường lối Đổi mới: xóa bỏ bao cấp, phát triển kinh tế thị trường định hướng XHCN và mở rộng quan hệ quốc tế.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Tháng 12/1986, Đại hội đại biểu toàn quốc lần thứ VI của Đảng Cộng sản Việt Nam họp tại Hà Nội với phương châm 'Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật', chính thức khởi xướng công cuộc Đổi mới toàn diện đất nước.",
        "characters": [
            { "name": "Tổng Bí thư Nguyễn Văn Linh", "type": "HISTORICAL_FACT", "desc": "Đại diện tiếng nói đổi mới: phát biểu nhấn mạnh 'đổi mới là mệnh lệnh của cuộc sống', phải cởi trói cho sức sản xuất và giải phóng tiềm năng nhân dân." },
            { "name": "Đại biểu nông nghiệp / công nghiệp cơ sở", "type": "CREATIVE_REP", "desc": "Chia sẻ về hiệu quả từ các mô hình thí điểm 'khoán hộ' (khoán 100, khoán 10), phản ánh mong mỏi xóa bỏ chế độ tem phiếu bao cấp." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 10: Công cuộc Đổi mới."
    },
    {
        "code": "12.12A",
        "examCode": "MD-12.14",
        "grade": "12",
        "topic": "Lịch sử ngoại giao Việt Nam thời kỳ Đổi mới và Hội nhập quốc tế",
        "lesson": "Bài 12 & Bài 13. Công cuộc Đổi mới và Ngoại giao Việt Nam thời kỳ hiện đại.",
        "scenario": "“Trường phái ngoại giao Cây tre Việt Nam và hành trình gia nhập WTO”, lễ trao văn kiện Việt Nam chính thức trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO, 2007).",
        "format": "Đối thoại lịch sử",
        "focus": "Nội hàm trường phái đối ngoại 'Cây tre Việt Nam' (Gốc vững, thân chắc, cành uyển chuyển), độc lập tự chủ và đa dạng hóa, đa phương hóa quan hệ quốc tế.",
        "originType": "VERIFIED_ORIGINAL",
        "context": "Ngày 11/1/2007, Việt Nam chính thức trở thành thành viên thứ 150 của WTO. Đến nay, Việt Nam đã thiết lập quan hệ ngoại giao với gần 200 quốc gia, xây dựng mạng lưới Đối tác Chiến lược Toàn diện với tất cả các cường quốc thường trực Hội đồng Bảo an Liên hợp quốc.",
        "characters": [
            { "name": "Bộ trưởng Ngoại giao / Trưởng phái đoàn đàm phán WTO", "type": "CREATIVE_REP", "desc": "Kể về hành trình 11 năm kiên trì đàm phán bảo vệ lợi ích nông dân và doanh nghiệp Việt Nam." },
            { "name": "Đại diện phái đoàn quốc tế tại Geneva", "type": "CREATIVE_REP", "desc": "Chúc mừng thành tựu cải cách vượt bậc và sự hội nhập chủ động, uy tín của Việt Nam trên trường quốc tế." }
        ],
        "relatedDocs": [],
        "sources": "Sách giáo khoa Lịch sử 12 (Chương trình GDPT 2018) – Bài 10, 12 & 13: Đổi mới và Ngoại giao thời kỳ hội nhập."
    }
]

document_items = [
    {
        "id": "DOC-1001A",
        "title": "Hồ sơ tư liệu Bài 1 (10.01A): Thái sử công Tư Mã Thiên & Chuẩn mực chép sử trung thực",
        "code": "10.01A",
        "grade": "10",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "Sử Ký Tư Mã Thiên (bản dịch Nhượng Tống, Phan Ngọc) & SGK Lịch sử 10",
        "content": """MÃ NỘI DUNG: 10.01A
CHỦ ĐỀ: Hiện thực lịch sử và nhận thức lịch sử.
1. DỮ KIỆN LỊCH SỬ XÁC THỰC:
- Tư Mã Thiên (khoảng 145 TCN – 86 TCN) là Thái sử lệnh thời Hán Vũ Đế, tác giả công trình vĩ đại 'Sử Ký' (130 thiên, hơn 52 vạn chữ).
- Năm 99 TCN, vì bênh vực tướng Lý Lăng bị quân Hung Nô vây hãm, ông bị vua kết án tử hình hoặc chuộc bằng thiến (nhục hình). Vì chưa hoàn thành bộ Sử Ký, ông đã cắn răng chịu nhục hình để hoàn thành tác phẩm.
- Lời tự tự của Tư Mã Thiên: 'Cứ thực sự cầu thị, chép việc thiện để khuyên răn, chép điều ác để răn đe, tuyệt không dua nịnh bậc đế vương mà bẻ cong ngòi bút.'
2. ĐỊNH HƯỚNG SÂN KHẤU HÓA:
- Khắc họa xung đột nội tâm gay gắt giữa sự an nguy của bản thân và trách nhiệm đạo đức trước lịch sử của người cầm bút."""
    },
    {
        "id": "DOC-1004A",
        "title": "Hồ sơ tư liệu Bài 4 (10.04A): Văn minh Ai Cập cổ đại & Hoạt cảnh 'Bên dòng sông Nile'",
        "code": "10.04A",
        "grade": "10",
        "format": "DOCX",
        "updatedAt": "2026-10-20",
        "source": "SGK Lịch sử 10 (GDPT 2018) & Tài liệu hướng dẫn hoạt cảnh Situation",
        "content": """MÃ NỘI DUNG: 10.04A
BÀI HỌC: Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông thời cổ – trung đại.
GỢI Ý HOẠT CẢNH: “Bên dòng sông Nile”, tái hiện người nông dân, người ghi chép và người thợ kể về công việc của mình.
HÌNH THỨC PHÙ HỢP: Hoạt cảnh đời sống.
TRỌNG TÂM HỌC TẬP: Mối liên hệ giữa điều kiện tự nhiên, sản xuất và thành tựu văn minh Ai Cập.

1. DỮ KIỆN LỊCH SỬ BẮT BUỘC BẢO TOÀN:
- Sông Nile đóng vai trò huyết mạch đối với sự hình thành và phát triển của văn minh Ai Cập (Herodotus từng gọi 'Ai Cập là tặng phẩm của sông Nile').
- Nhu cầu trị thủy, làm thủy lợi và đo đạc lại ruộng đất bị phù sa xóa ranh giới sau mỗi mùa lũ đã thúc đẩy sự ra đời sớm của Toán học (đặc biệt là Hình học) và Thiên văn học (Nông lịch 365 ngày).
- Chữ viết: Chữ tượng hình viết trên giấy Papyrus hoặc khắc trên đá.

2. GỢI Ý TRIỂN KHAI HOẠT CẢNH (3–5 PHÚT):
- Cảnh mở đầu bên bờ sông Nile sau mùa nước rút: Người nông dân cầm cuốc gỗ trao đổi với Viên thư lại đang căng dây đo lại mảnh ruộng.
- Người thợ xây Kim tự tháp bước vào giải thích cách vận dụng hình học và sức kéo tập thể để dựng nên công trình kiến trúc trường tồn."""
    },
    {
        "id": "DOC-1005A",
        "title": "Hồ sơ tư liệu (10.05A & 10.05B): Dân chủ cổ đại Athens & Tinh thần nhân văn Phục hưng",
        "code": "10.05A",
        "grade": "10",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "SGK Lịch sử 10 (GDPT 2018) & Tư liệu Lịch sử Thế giới Cổ – Trung đại",
        "content": """MÃ NỘI DUNG: 10.05A & 10.05B
CHỦ ĐỀ: Văn minh phương Tây thời cổ – trung đại.
1. NỀN DÂN CHỦ HY LẠP CỔ ĐẠI (ATHENS):
- Bản chất: Là nền dân chủ chủ nô. Quyền công dân chỉ thuộc về nam giới tự do từ 18 tuổi trở lên; phụ nữ, kiều dân và nô lệ không có quyền công dân.
- Cơ quan quyền lực tối cao: Đại hội nhân dân (Ecclesia) họp công khai tại đồi Pnyx hoặc quảng trường Agora, biểu quyết bằng hình thức giơ tay hoặc bỏ phiếu bằng vỏ sò (Ostrakon).
2. TINH THẦN NHÂN VĂN THỜI PHỤC HƯNG:
- Lấy con người làm trung tâm (Chủ nghĩa nhân văn - Humanism), giải phóng tư tưởng và cảm xúc con người khỏi sự thống trị tuyệt đối của thần quyền và giáo hội phong kiến."""
    },
    {
        "id": "DOC-1008A",
        "title": "Hồ sơ tư liệu (10.08A & 10.08B): Cư dân Đông Sơn – Văn Lang và Thương cảng Óc Eo – Phù Nam",
        "code": "10.08A",
        "grade": "10",
        "format": "PDF",
        "updatedAt": "2026-10-21",
        "source": "Viện Khảo cổ học Việt Nam & SGK Lịch sử 10",
        "content": """MÃ NỘI DUNG: 10.08A & 10.08B
CHỦ ĐỀ: Một số nền văn minh cổ trên đất nước Việt Nam.
1. VĂN LANG – ÂU LẠC:
- Biểu tượng đỉnh cao: Trống đồng Đông Sơn (trống Ngọc Lũ, Hoàng Hạ) phản ánh kỹ thuật luyện kim đồng thau tinh xảo.
- Hoa văn trên mặt trống đồng: Mặt trời ở trung tâm, chim hạc bay, cảnh giã gạo, múa vũ trang, chèo thuyền... phản ánh sinh động thế giới quan nông nghiệp lúa nước và tín ngưỡng phồn thực.
2. VĂN MINH PHÙ NAM & THƯƠNG CẢNG ÓC EO:
- Khai quật tại An Giang: Phát hiện đồng tiền vàng La Mã thời hoàng đế Antoninus Pius, tượng Phật bằng gỗ, đồ gốm Ấn Độ chứng minh Óc Eo là trạm dừng chân quốc tế trọng yếu trên Con đường Tơ lụa trên biển."""
    },
    {
        "id": "DOC-1010A",
        "title": "Hồ sơ tư liệu Bài 10 (10.10A): Văn bia Tiến sĩ Văn Miếu – Quốc Tử Giám khoa 1442",
        "code": "10.10A",
        "grade": "10",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "Văn bia Quốc Tử Giám Hà Nội & Đại Việt sử ký toàn thư",
        "content": """MÃ NỘI DUNG: 10.10A
CHỦ ĐỀ: Văn minh Đại Việt – Giáo dục và khoa cử.
TRÍCH BÀI VĂN BIA TIẾN SĨ NĂM 1484 (Thân Nhân Trung soạn):
'Hiền tài là nguyên khí của quốc gia, nguyên khí thịnh thì thế nước mạnh, rồi lên cao; nguyên khí suy thì thế nước yếu, rồi xuống thấp. Vì thế các đấng thánh đế minh vương chẳng ai không lấy việc bồi dưỡng nhân tài, kén chọn kẻ sĩ, vun trồng nguyên khí làm việc đầu tiên.'
BÀI HỌC SÂN KHẤU HÓA:
- Nhấn mạnh tinh thần hiếu học, công bằng trong tuyển trạch nhân tài và trách nhiệm của người trí thức đối với vận mệnh quốc gia dân tộc."""
    },
    {
        "id": "DOC-1101A",
        "title": "Hồ sơ tư liệu (11.01A & 11.02A): Cách mạng tư sản Pháp 1789 & Cách mạng công nghiệp",
        "code": "11.01A",
        "grade": "11",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "Tuyên ngôn Nhân quyền và Dân quyền Pháp (1789) & SGK Lịch sử 11",
        "content": """MÃ NỘI DUNG: 11.01A & 11.02A
CHỦ ĐỀ: Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản.
1. TUYÊN NGÔN NHÂN QUYỀN VÀ DÂN QUYỀN PHÁP (Tháng 8/1789):
- Điều 1 khẳng định: 'Người ta sinh ra tự do và bình đẳng về quyền lợi; và luôn luôn được tự do và bình đẳng về quyền lợi.'
- Thể hiện tư tưởng tiến bộ của trào lưu Triết học Ánh sáng (Montesquieu, Voltaire, Rousseau).
2. CÁCH MẠNG CÔNG NGHIỆP:
- Năm 1784, James Watt được cấp bằng phát minh máy hơi nước hoàn chỉnh.
- Làm biến đổi cấu trúc xã hội: dẫn tới sự đối đầu giữa giai cấp tư sản nắm tư liệu sản xuất và giai cấp vô sản làm thuê."""
    },
    {
        "id": "DOC-1107A",
        "title": "Hồ sơ tư liệu (11.07A, 11.07B & 11.07C): Hội nghị Diên Hồng, Bài thơ thần & Bạch Đằng 1288",
        "code": "11.07A",
        "grade": "11",
        "format": "TXT",
        "updatedAt": "2026-10-21",
        "source": "Đại Việt sử ký toàn thư & SGK Lịch sử 11",
        "content": """MÃ NỘI DUNG: 11.07A, 11.07B & 11.07C
CHỦ ĐỀ: Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam.
1. HỘI NGHỊ DIÊN HỒNG (1284):
'Thượng hoàng triệu các phụ lão trong nước họp ở thềm điện Diên Hồng, ban yến và hỏi kế đánh hay hòa. Các phụ lão đều đồng thanh hô: ĐÁNH! Muôn người cùng cất tiếng, tiếng vang như sấm dậy.'
2. BÀI THƠ THẦN SÔNG NHƯ NGUYỆT (1077):
'Nam quốc sơn hà Nam đế cư
Tiệt nhiên định phận tại thiên thư
Như hà nghịch lỗ lai xâm phạm
Nhữ đẳng hành khan thủ bại hư.'
3. CHIẾN THẮNG BẠCH ĐẰNG (1288):
Trần Quốc Tuấn cắm cọc ngầm lim bịt sắt bịt đầu nhọn đón thủy triều, bắt sống tướng giặc Ô Mã Nhi, Phàn Tiếp, đập tan vĩnh viễn mộng bành trướng của đế chế Nguyên – Mông sang Đông Nam Á."""
    },
    {
        "id": "DOC-1108A",
        "title": "Hồ sơ tư liệu & Kịch bản đối chiếu (11.08A & 11.08B): Khởi nghĩa Lam Sơn & Phong trào Tây Sơn",
        "code": "11.08A",
        "grade": "11",
        "format": "DOCX",
        "updatedAt": "2026-10-20",
        "source": "Bản thuyết minh NCKH 'Từ tư liệu đến sân khấu' & SGK Lịch sử 11",
        "content": """MÃ NỘI DUNG: 11.08A & 11.08B
CHỦ ĐỀ: Khởi nghĩa Lam Sơn (1418 – 1427) & Phong trào Tây Sơn (1771 – 1802).
1. KHỞI NGHĨA LAM SƠN:
- Tư tưởng chỉ đạo xuyên suốt: 'Việc nhân nghĩa cốt ở yên dân / Quân điếu phạt trước lo trừ bạo'.
- Nghệ thuật kết hợp quân sự và ngoại giao: Sau trận Chi Lăng – Xương Giang, nghĩa quân tổ chức Hội thề Đông Quan (10/12/1427), cấp 500 chiến thuyền và hàng nghìn con ngựa cho Vương Thông rút về nước an toàn.
2. PHONG TRÀO TÂY SƠN:
- Lời hịch xuất quân của Quang Trung tại Nghệ An (1789):
'Đánh cho để dài tóc / Đánh cho để đen răng / Đánh cho nó chích luân bất phản / Đánh cho nó phiến giáp bất hoàn / Đánh cho sử tri nam quốc anh hùng chi hữu chủ.'
- Tốc độ hành quân thần tốc đánh tan 29 vạn quân Mãn Thanh trong 5 ngày Tết Kỷ Dậu."""
    },
    {
        "id": "DOC-1109A",
        "title": "Hồ sơ tư liệu & Kịch bản đối chiếu (11.09A): Cải cách của Hồ Quý Ly và triều Hồ",
        "code": "11.09A",
        "grade": "11",
        "format": "PDF",
        "updatedAt": "2026-10-20",
        "source": "Bản thuyết minh NCKH 'Từ tư liệu đến sân khấu' & SGK Lịch sử 11",
        "content": """MÃ NỘI DUNG: 11.09A
CHỦ ĐỀ: Cuộc cải cách của Hồ Quý Ly và triều Hồ (cuối thế kỷ XIV – đầu thế kỷ XV).
1. SỰ THẬT TƯ LIỆU:
- Năm 1396: Phát hành tiền giấy 'Thông bảo hội sao' thay thế tiền đồng – dấu mốc tiền giấy đầu tiên ở Việt Nam.
- Năm 1397: Ban hành chính sách 'Hạn điền' (hạn chế diện tích ruộng đất tư hữu của quý tộc, quan lại) và dời đô về Tây Đô (Thành nhà Hồ, Thanh Hóa).
- Năm 1401: Ban hành phép 'Hạn nô' (quy định số lượng gia nô được phép sở hữu tùy theo phẩm cấp).
- Về văn hóa – giáo dục: Đề cao chữ Nôm, dịch kinh Thi, kinh Thư ra chữ Nôm để dạy học, đưa toán học vào thi cử.
2. BÀI HỌC LỊCH SỬ KHI SÂN KHẤU HÓA:
- Phản ánh cả tư duy cải cách vượt thời đại lẫn bài học mất lòng dân: 'Thần không sợ đánh, chỉ sợ lòng dân không theo' (Hồ Nguyên Trừng)."""
    },
    {
        "id": "DOC-1110A",
        "title": "Hồ sơ tư liệu (11.10A & 11.10B): Cải cách hành chính của vua Lê Thánh Tông và Minh Mạng",
        "code": "11.10A",
        "grade": "11",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "Khâm định Việt sử thông giám cương mục & SGK Lịch sử 11",
        "content": """MÃ NỘI DUNG: 11.10A & 11.10B
CHỦ ĐỀ: Các cuộc cải cách lớn trong lịch sử Việt Nam.
1. CẢI CÁCH LÊ THÁNH TÔNG (Thế kỷ XV):
- Bãi bỏ các chức quan trung gian quyền lực lớn (Tướng quốc, Đại tư mã), Hoàng đế trực tiếp điều hành Lục bộ (Lại, Hộ, Lễ, Binh, Hình, Công).
- Chia cả nước thành 13 đạo thừa tuyên, ban hành Quốc triều hình luật (Bộ luật Hồng Đức) và vẽ bản đồ Hồng Đức.
2. CẢI CÁCH MINH MẠNG (1831 – 1832):
- Xóa bỏ Bắc Thành và Gia Định Thành, chia cả nước thành 30 tỉnh và 1 phủ Thừa Thiên.
- Thiết lập chế độ quan lại địa phương phân cấp rõ ràng (Tổng đốc, Tuần phủ), hoàn thiện chế độ quan liêu trung ương tập quyền."""
    },
    {
        "id": "DOC-1201A",
        "title": "Hồ sơ tư liệu (12.01A & 12.04A): Hiến chương Liên hợp quốc 1945 & Tuyên bố Băng Cốc ASEAN 1967",
        "code": "12.01A",
        "grade": "12",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "Hiến chương Liên hợp quốc & Văn kiện sáng lập ASEAN 1967",
        "content": """MÃ NỘI DUNG: 12.01A & 12.04A
CHỦ ĐỀ: Các tổ chức quốc tế và khu vực.
1. NGUYÊN TẮC HOẠT ĐỘNG CỦA LIÊN HỢP QUỐC (Hiến chương San Francisco 1945):
- Bình đẳng chủ quyền giữa các quốc gia thành viên.
- Tôn trọng toàn vẹn lãnh thổ và độc lập chính trị.
- Giải quyết các tranh chấp quốc tế bằng biện pháp hòa bình.
- Không can thiệp vào công việc nội bộ của bất kỳ quốc gia nào.
2. TUYÊN BỐ BĂNG CỐC KHAI SINH ASEAN (8/8/1967):
- Thúc đẩy tăng trưởng kinh tế, tiến bộ xã hội và phát triển văn hóa trong khu vực.
- Duy trì hòa bình và ổn định khu vực thông qua tôn trọng công lý và nguyên tắc của Hiến chương LHQ."""
    },
    {
        "id": "DOC-1206A",
        "title": "Hồ sơ tư liệu (12.06A & 12.06B): Thời khắc Tân Trào & Tuyên ngôn Độc lập 2/9/1945",
        "code": "12.06A",
        "grade": "12",
        "format": "DOCX",
        "updatedAt": "2026-10-21",
        "source": "Văn kiện Đảng Toàn tập & Tuyên ngôn Độc lập (Hồ Chí Minh)",
        "content": """MÃ NỘI DUNG: 12.06A & 12.06B
CHỦ ĐỀ: Cách mạng tháng Tám năm 1945 và sự ra đời của nước Việt Nam Dân chủ Cộng hòa.
1. QUÂN LỆNH SỐ 1 CỦA ỦY BAN KHỞI NGHĨA (Đêm 13/8/1945):
'Hỡi quân dân toàn quốc! Giờ tổng khởi nghĩa đã đánh! Cơ hội có một cho quân dân Việt Nam cùng giành lấy quyền độc lập của nước nhà!'
2. TUYÊN NGÔN ĐỘC LẬP (2/9/1945):
- Mở đầu bằng trích dẫn Tuyên ngôn Độc lập 1776 của nước Mỹ và Tuyên ngôn Nhân quyền và Dân quyền 1789 của Cách mạng Pháp để khẳng định quyền sống, quyền tự do và quyền mưu cầu hạnh phúc của mọi dân tộc trên thế giới.
- Kết luận đanh thép: 'Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do, độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy.'"""
    },
    {
        "id": "DOC-1207A",
        "title": "Hồ sơ tư liệu (12.07A & 12.07B): Quyết định lịch sử Mường Phăng (1954) & Hiệp định Genève",
        "code": "12.07A",
        "grade": "12",
        "format": "TXT",
        "updatedAt": "2026-10-21",
        "source": "Hồi ức 'Điện Biên Phủ - Điểm hẹn lịch sử' (Đại tướng Võ Nguyên Giáp) & Biên bản Hội nghị Genève",
        "content": """MÃ NỘI DUNG: 12.07A & 12.07B
CHỦ ĐỀ: Chiến dịch Điện Biên Phủ và Hiệp định Genève (1954).
1. QUYẾT ĐỊNH KHÓ KHĂN NHẤT CỦA ĐẠI TƯỚNG VÕ NGUYÊN GIÁP:
- Sáng ngày 26/1/1954, chỉ vài giờ trước khi nổ súng đánh nhanh trong 3 ngày 2 đêm, Đại tướng triệu tập Đảng ủy Mặt trận, kết luận: Nếu đánh nhanh sẽ tổn thất vô cùng lớn và không chắc thắng 100% như lời Bác dặn ('Chắc thắng mới đánh, không chắc thắng không đánh').
- Quyết định chuyển sang: 'ĐÁNH CHẮC TIẾN CHẮC', hoãn nổ súng và lệnh kéo pháo ra chuẩn bị lại trận địa.
2. HIỆP ĐỊNH GENÈVE (21/7/1954):
- Pháp và các nước tham dự cam kết tôn trọng độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam, Lào, Campuchia."""
    },
    {
        "id": "DOC-1208A",
        "title": "Hồ sơ tư liệu (12.08A & 12.08B): Bàn tròn Kleber – Hội nghị Paris 1973 & Đại thắng Mùa xuân 1975",
        "code": "12.08A",
        "grade": "12",
        "format": "PDF",
        "updatedAt": "2026-10-21",
        "source": "Biên bản Hội nghị Paris & SGK Lịch sử 12",
        "content": """MÃ NỘI DUNG: 12.08A & 12.08B
CHỦ ĐỀ: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975).
1. CUỘC ĐẤU TRÍ NGOẠI GIAO TẠI HỘI NGHỊ PARIS (1968 – 1973):
- Kéo dài gần 5 năm (từ tháng 5/1968 đến ngày 27/1/1973) với 201 phiên họp công khai và 45 cuộc gặp riêng giữa Cố vấn đặc biệt Lê Đức Thọ và Henry Kissinger.
- Nguyên tắc đàm phán: 'Vừa đánh vừa đàm', thắng lợi Điện Biên Phủ trên không (12/1972) đã buộc Mỹ phải ký Hiệp định Paris, cam kết tôn trọng độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam, rút hết quân đội về nước.
2. ĐẠI THẮNG MÙA XUÂN 1975:
- Tạo thế và lực cho Chiến dịch Hồ Chí Minh lịch sử, giải phóng hoàn toàn miền Nam ngày 30/4/1975."""
    }
]

print(f"Loaded {len(catalog_items)} catalog items and {len(document_items)} documents.")
grade10 = [i for i in catalog_items if i["grade"] == "10"]
grade11 = [i for i in catalog_items if i["grade"] == "11"]
grade12 = [i for i in catalog_items if i["grade"] == "12"]
print(f"Grade 10: {len(grade10)} items")
print(f"Grade 11: {len(grade11)} items")
print(f"Grade 12: {len(grade12)} items")
