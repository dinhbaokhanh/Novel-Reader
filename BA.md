# BA REPORT — AI NOVEL WORKSPACE & READER

**Phiên bản:** 0.1  
**Trạng thái:** Đề xuất phạm vi MVP  
**Loại sản phẩm:** Web Application — AI-assisted Novel Writing & Reading  
**Đối tượng sử dụng ban đầu:** Một người dùng cá nhân  
**Định hướng kỹ thuật:** Portfolio Backend Fresher  
**Ưu tiên:** Chi phí thấp, dữ liệu riêng tư, dễ mở rộng, tận dụng Claude Pro.

---

## 1. Executive Summary — Tổng quan dự án

### 1.1. Mô tả sản phẩm

AI Novel Workspace & Reader là ứng dụng web cho phép người dùng quản lý, sáng tác và đọc các bộ tiểu thuyết dài kỳ.

Mỗi novel tương ứng với một project độc lập, bao gồm nội dung truyện, nhân vật, thế giới, cốt truyện, Canon và bộ nhớ dài hạn. AI có thể truy xuất thông tin liên quan để tiếp tục sáng tác, đồng thời đề xuất cập nhật bộ nhớ sau khi tạo hoặc chỉnh sửa chương.

Các chương đã hoàn thành được lưu thành nội dung ổn định và hiển thị trên giao diện đọc truyện chuyên dụng. Người dùng có thể chuyển chương, xem mục lục, đánh dấu bookmark, tiếp tục đọc và chủ động chỉnh sửa chương của mình.

### 1.2. Vấn đề cần giải quyết

Các công cụ AI hội thoại thuận tiện cho việc sáng tác nhưng việc quản lý một bộ truyện dài hàng trăm chương có thể gặp các vấn đề:

- Thông tin nhân vật, sự kiện và quy tắc thế giới bị quên hoặc mâu thuẫn.
- Context sáng tác nằm rải rác trong nhiều cuộc hội thoại.
- Chương truyện chưa được quản lý như những tài liệu có phiên bản và trạng thái rõ ràng.
- Người dùng phải chuyển đổi giữa công cụ AI và website đọc truyện.
- Chi phí sinh nội dung có thể tăng nhanh nếu gửi lại toàn bộ lịch sử hoặc sử dụng AI không giới hạn.

### 1.3. Định hướng giải pháp

Xây dựng một hệ thống kết hợp hai thành phần:

1. **Novel Workspace:** Quản lý project, Canon, nội dung chương và quá trình sáng tác.
2. **Novel Reader:** Đọc truyện bằng giao diện web, với mục lục, bookmark, lịch sử đọc và điều hướng chương.

Trong MVP, Claude Pro được sử dụng thông qua custom remote MCP connector để đọc dữ liệu, hỗ trợ sáng tác và lưu chương. Backend không gọi Claude API trực tiếp trong luồng này.

---

## 2. Business Objectives — Mục tiêu kinh doanh và sản phẩm

Mặc dù MVP chưa hướng tới thương mại hóa, sản phẩm cần đạt các mục tiêu sau:

**BO-01 — Quản lý tập trung:** Tất cả novel và chương truyện được tổ chức tại một hệ thống duy nhất.

**BO-02 — Duy trì tính nhất quán:** AI có thể truy xuất Canon và ngữ cảnh phù hợp khi tiếp tục sáng tác.

**BO-03 — Kiểm soát nội dung:** Người dùng có quyền chỉnh sửa và quyết định nội dung cuối cùng của truyện.

**BO-04 — Trải nghiệm đọc hoàn chỉnh:** Nội dung đã lưu có thể đọc lại ổn định, không phụ thuộc việc gọi AI.

**BO-05 — Tối ưu chi phí:** Ưu tiên tận dụng Claude Pro hiện có, chưa phát sinh chi phí sử dụng API trong quy trình sáng tác qua Claude.ai.

**BO-06 — Giá trị portfolio:** Thể hiện năng lực thiết kế database, authorization, quản lý phiên bản, tích hợp AI/MCP, xử lý nghiệp vụ bất đồng bộ và thiết kế hệ thống.

### Tiêu chí thành công của MVP

- Có thể tạo và quản lý nhiều novel độc lập.
- Có thể lưu và đọc ít nhất 200 chương trong một novel.
- Bookmark và lịch sử đọc được duy trì giữa các phiên.
- Claude có thể truy xuất context và lưu chương thông qua MCP.
- Chương tự động bị khóa sau khi lưu hoàn chỉnh.
- Chỉnh sửa chương không làm mất lịch sử phiên bản.
- AI không tự động ghi đè Canon đã được xác nhận.
- Hệ thống hoạt động bình thường khi Claude không khả dụng.

---

## 3. Stakeholders & User

### 3.1. Người dùng chính

**Novel Owner — Chủ sở hữu novel**

Là người tạo và quản lý novel. Người dùng có thể:

- Tạo và chỉnh sửa metadata của novel.
- Quản lý nhân vật, thế giới, Canon và các tuyến truyện.
- Yêu cầu AI tạo chương thông qua Claude.
- Đọc, chỉnh sửa, khóa và mở khóa chương.
- Xem lịch sử phiên bản và khôi phục nội dung.
- Quản lý tiến độ đọc.

### 3.2. Hệ thống bên ngoài

**Claude.ai / Claude Pro:** Đóng vai trò trợ lý sáng tác, sử dụng các công cụ MCP được ứng dụng cung cấp.

**MCP Server:** Cầu nối giữa Claude và nghiệp vụ backend, cung cấp khả năng đọc context, tìm kiếm chương và ghi dữ liệu theo quyền được cấp.

**Database:** Lưu trữ dữ liệu nghiệp vụ lâu dài, độc lập với lịch sử hội thoại Claude.

---

## 4. Scope — Phạm vi triển khai

### 4.1. In Scope — Thuộc MVP

| Module             | Phạm vi chức năng                                           |
| ------------------ | ----------------------------------------------------------- |
| Novel Management   | Tạo, sửa metadata, xem danh sách và truy cập novel          |
| Chapter Management | Tạo, lưu, đọc và điều hướng chương                          |
| Reader             | Nội dung chương, mục lục, bookmark, lịch sử đọc             |
| Chapter Editing    | Khóa/mở khóa, chỉnh sửa và lưu phiên bản                    |
| AI Integration     | MCP connector để Claude đọc context và lưu nội dung         |
| Canon & Memory     | Quản lý nhân vật, sự kiện, quy tắc thế giới và tuyến truyện |
| Security           | Xác thực, phân quyền, bảo vệ MCP và dữ liệu riêng tư        |

### 4.2. Out of Scope — Chưa triển khai

- Xuất bản novel công khai.
- Nền tảng nhiều người dùng hoặc cộng đồng độc giả.
- Bán truyện, thuê bao hoặc thanh toán.
- AI tự động sáng tác liên tục không cần yêu cầu.
- Huấn luyện model riêng.
- Multi-agent phức tạp.
- Microservices phân tán ngay từ đầu.
- Cam kết tự phát hiện chính xác mọi mâu thuẫn trong tiểu thuyết.

Các chức năng này chỉ được xem xét sau khi MVP hoạt động ổn định.

---

## 5. Functional Requirements — Yêu cầu chức năng

### 5.1. Novel Management

**FR-01 — Create Novel**

Người dùng có thể tạo novel với tên, mô tả, thể loại, ngôn ngữ, phong cách viết và trạng thái riêng tư.

**FR-02 — Novel Isolation**

Dữ liệu của mỗi novel phải được cô lập. AI không được sử dụng Canon hoặc nội dung của novel khác nếu không có yêu cầu và quyền truy cập rõ ràng.

**FR-03 — Project Context**

Người dùng có thể lưu chỉ dẫn sáng tác, tài liệu tham khảo, thiết lập nhân vật và quy tắc thế giới.

### 5.2. Chapter Management

**FR-04 — Chapter Navigation**

Người dùng có thể xem mục lục, chọn chương cụ thể, chuyển chương trước/sau và tiếp tục đọc từ vị trí đã lưu.

**FR-05 — Stable Content**

Chương đã lưu phải được hiển thị ổn định. Việc mở trang đọc không được kích hoạt AI viết lại nội dung.

**FR-06 — Bookmark & Reading Progress**

Người dùng có thể đánh dấu chương hoặc vị trí đọc và tiếp tục từ trạng thái trước đó.

### 5.3. Chapter Editing

**FR-07 — Auto Lock**

Chương do AI tạo chỉ được chuyển sang trạng thái khóa sau khi quá trình sinh nội dung hoàn tất và nội dung được lưu thành công.

**FR-08 — Manual Unlock**

Chủ sở hữu có thể chủ động mở quyền chỉnh sửa cho từng chương.

**FR-09 — Version History**

Mỗi lần chỉnh sửa được lưu thành phiên bản mới. Người dùng có thể xem lịch sử và khôi phục một phiên bản trước.

**FR-10 — Canon Impact**

Khi nội dung chương cũ thay đổi, hệ thống phải đánh dấu Canon hoặc các chương phía sau có khả năng bị ảnh hưởng.

### 5.4. AI & Canon

**FR-11 — Retrieve Context**

AI có thể lấy Canon, tóm tắt cốt truyện, các sự kiện gần đây và các chương liên quan trước khi viết.

**FR-12 — Save Generated Chapter**

AI có thể gửi nội dung chương vào backend thông qua MCP. Backend xác thực quyền, kiểm tra dữ liệu và lưu chương.

**FR-13 — Canon Proposal**

Sau khi chương được lưu, AI có thể đề xuất bổ sung hoặc thay đổi Canon. Thay đổi quan trọng không được tự động ghi đè Canon đã xác nhận.

**FR-14 — Plot Thread Management**

Hệ thống quản lý các tuyến truyện đang mở, bí mật chưa tiết lộ và những sự kiện cần được tiếp tục phát triển.

---

## 6. Business Rules — Quy tắc nghiệp vụ

**BR-01 — Chapter State**

Chương có các trạng thái cơ bản:

- `generating`: Đang tạo nội dung.
- `completed_locked`: Nội dung đã lưu hoàn chỉnh và bị khóa.
- `completed_editable`: Nội dung đã lưu và được phép chỉnh sửa.
- `failed`: Quá trình tạo hoặc lưu thất bại.

Không được khóa một chương chưa lưu hoàn chỉnh.

**BR-02 — Authorization**

Chỉ chủ sở hữu hoặc tài khoản được cấp quyền phù hợp mới có thể chỉnh sửa chương. Quyền truy cập phải được kiểm tra tại backend, không chỉ tại giao diện.

**BR-03 — Versioning**

Chỉnh sửa chương không xóa đè lịch sử cũ. Nội dung phiên bản mới được lưu riêng hoặc được quản lý bằng cơ chế versioning tương đương.

**BR-04 — Canon Authority**

Nội dung chương đã được người dùng chấp nhận là căn cứ ưu tiên khi xác định diễn biến truyện. Canon là bản ghi tri thức có cấu trúc; nếu phát hiện mâu thuẫn, hệ thống đánh dấu để xử lý thay vì âm thầm tự chọn một phiên bản.

**BR-05 — AI Failure**

Nếu Claude hoặc MCP thất bại, các chương đã lưu vẫn phải đọc bình thường. Không được lưu một chương ở trạng thái hoàn thành khi nội dung chưa đầy đủ.

**BR-06 — Privacy**

Novel mặc định ở chế độ riêng tư. Không xuất bản hoặc chia sẻ nội dung nếu chưa có hành động cho phép của người dùng.

---

## 7. User Journey — Luồng nghiệp vụ chính

### 7.1. Tạo và đọc novel

1. Người dùng tạo novel.
2. Hệ thống tạo project và bộ dữ liệu Canon ban đầu.
3. Người dùng thêm chương viết sẵn hoặc yêu cầu AI tạo chương.
4. Chương được lưu với số thứ tự và metadata.
5. Người dùng mở reader để đọc, bookmark hoặc chuyển chương.

### 7.2. Claude tạo chương mới

1. Người dùng mở Claude.ai và yêu cầu tiếp tục novel.
2. Claude gọi `get_novel_context` để lấy Canon và các thông tin cần thiết.
3. Claude gọi `search_chapters` hoặc `get_chapter` nếu cần.
4. Claude sáng tác chương mới.
5. Claude gửi nội dung tới `save_generated_chapter`.
6. Backend kiểm tra quyền, novel, số thứ tự và trạng thái tác vụ.
7. Backend lưu nội dung hoàn chỉnh, tạo phiên bản đầu tiên và khóa chương.
8. Người dùng mở website và đọc chương vừa tạo.

### 7.3. Chỉnh sửa chương cũ

1. Chủ sở hữu mở khóa chương.
2. Người dùng chỉnh sửa nội dung.
3. Backend lưu phiên bản mới.
4. Hệ thống đánh dấu Canon và các chương liên quan có thể bị ảnh hưởng.
5. AI phân tích và đề xuất cập nhật Canon.
6. Người dùng xác nhận các thay đổi quan trọng.

---

## 8. Data Model — Mô hình dữ liệu sơ bộ

| Entity             | Vai trò                                     |
| ------------------ | ------------------------------------------- |
| `User`             | Tài khoản và danh tính người dùng           |
| `Novel`            | Thông tin và cấu hình của novel             |
| `Chapter`          | Nội dung, số thứ tự và trạng thái khóa      |
| `ChapterVersion`   | Lịch sử các phiên bản chương                |
| `Bookmark`         | Chương hoặc vị trí đọc được đánh dấu        |
| `ReadingProgress`  | Tiến độ đọc theo novel                      |
| `Character`        | Hồ sơ và trạng thái nhân vật                |
| `CanonFact`        | Các sự kiện, quy tắc và dữ kiện đã xác nhận |
| `PlotThread`       | Các tuyến truyện đang mở                    |
| `ChapterCanonLink` | Liên kết giữa chương và các dữ kiện Canon   |
| `AIJob`            | Trạng thái và kết quả tác vụ AI             |
| `AuditLog`         | Lịch sử các thao tác quan trọng             |

### Quan hệ cốt lõi

- Một `Novel` có nhiều `Chapter`.
- Một `Chapter` có nhiều `ChapterVersion`.
- Một `Novel` có nhiều `Character`, `CanonFact` và `PlotThread`.
- Một chương có thể liên quan đến nhiều dữ kiện Canon.
- Một người dùng có thể có nhiều bookmark và tiến độ đọc.
- Một `AIJob` có thể tạo ra một chương hoặc một đề xuất cập nhật Canon.

Đối với MVP, nên dùng PostgreSQL làm nguồn dữ liệu chính. Chưa cần vector database riêng; có thể bổ sung tìm kiếm ngữ nghĩa sau khi cách truy xuất Canon bằng SQL và full-text search không còn đáp ứng nhu cầu.

---

## 9. Solution Architecture — Kiến trúc đề xuất

### 9.1. Kiến trúc tổng thể

- **Frontend:** Next.js.
- **Backend:** NestJS theo modular monolith.
- **Database:** PostgreSQL.
- **ORM:** Prisma hoặc Drizzle.
- **AI integration:** Remote MCP Server.
- **AI client:** Claude.ai với gói Pro hiện có.
- **Hosting:** Ưu tiên gói miễn phí phù hợp, chấp nhận các giới hạn về tài nguyên, thời gian hoạt động và kết nối.

Các module NestJS có thể gồm `NovelsModule`, `ChaptersModule`, `CanonModule`, `ReaderModule`, `AIJobsModule`, `MCPModule` và `AuthModule`.

### 9.2. Quyết định tích hợp Claude Pro

Claude Pro và Anthropic API là hai sản phẩm có cơ chế sử dụng và thanh toán riêng. Theo tài liệu chính thức của Anthropic, Claude Pro không bao gồm chi phí gọi API qua Console. Tuy nhiên, Claude hỗ trợ custom connector dựa trên remote MCP ở gói Pro.

Nguồn tham khảo:

- [Claude Pro Plan — Anthropic Help Center](https://support.anthropic.com/en/articles/8325606-what-is-the-pro-plan)
- [Custom Connectors Using Remote MCP — Claude Help Center](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

Với mô hình này, Claude.ai chủ động sử dụng các công cụ MCP mà ứng dụng cung cấp. Đây **không phải** phương thức biến Claude Pro thành API để backend tự gọi model.

Do đó, phiên bản đầu tiên chấp nhận luồng sáng tác khởi tạo từ Claude.ai. Nút Generate trong website, nếu cần tự gọi model qua backend, sẽ thuộc phạm vi mở rộng và cần một cơ chế suy luận được hỗ trợ riêng.

### 9.3. Thiết kế MCP tối thiểu

Các công cụ cần xây dựng:

- `get_novel_context`
- `search_chapters`
- `get_chapter`
- `get_open_plot_threads`
- `save_generated_chapter`
- `propose_canon_update`

MCP Server phải có cơ chế xác thực, phân quyền và kiểm tra đầu vào. Không cho phép AI tự do thực thi SQL hoặc thao tác database tùy ý.

---

## 10. Non-functional Requirements — Yêu cầu phi chức năng

**NFR-01 — Security:** Bảo vệ dữ liệu riêng tư; mọi API đọc/ghi cần kiểm tra quyền truy cập.

**NFR-02 — Data Integrity:** Việc lưu chương và cập nhật trạng thái phải có tính nhất quán, không để nội dung lưu dở mang trạng thái hoàn thành.

**NFR-03 — Reliability:** Lỗi từ Claude, MCP hoặc mạng không được làm mất chương đã lưu.

**NFR-04 — Recoverability:** Có thể khôi phục phiên bản chương cũ.

**NFR-05 — Maintainability:** Tách nghiệp vụ quản lý novel khỏi lớp tích hợp AI để dễ thay đổi nhà cung cấp.

**NFR-06 — Cost Control:** Giới hạn dung lượng context, số lần thử lại và số tác vụ AI.

**NFR-07 — Privacy:** Có khả năng sao lưu, xuất dữ liệu và xóa novel theo yêu cầu của chủ sở hữu.

**NFR-08 — Observability:** Có log cho các tác vụ tạo chương, lỗi tích hợp và thao tác thay đổi Canon; không ghi nội dung nhạy cảm vào log không cần thiết.

---

## 11. Cost Analysis — Chi phí dự kiến

### Giai đoạn portfolio cá nhân

Chi phí được phân thành các nhóm:

- **Claude:** Tiếp tục sử dụng gói Pro hiện có.
- **Hosting frontend/backend:** Ưu tiên gói miễn phí.
- **Database:** PostgreSQL trên gói miễn phí có giới hạn.
- **MCP server:** Cần endpoint HTTPS có thể truy cập từ Claude.ai; hosting có thể phát sinh giới hạn hoặc chi phí.
- **Domain:** Có thể dùng domain miễn phí do nền tảng cung cấp nếu chấp nhận.
- **AI API:** Chưa cần dùng trong luồng sáng tác bằng Claude.ai và MCP.

Không nên cam kết tổng chi phí bằng 0 tuyệt đối. Việc hosting remote MCP, lưu trữ dữ liệu, duy trì hoạt động liên tục và thay đổi giới hạn của nhà cung cấp có thể phát sinh chi phí.

### Biện pháp kiểm soát

- Không gửi toàn bộ lịch sử truyện trong mọi yêu cầu.
- Tạo tóm tắt và truy xuất context liên quan.
- Giới hạn kích thước chương và context.
- Lưu nội dung đã sinh để tránh tạo lại không cần thiết.
- Không thực hiện các tác vụ AI nền nếu người dùng chưa yêu cầu.

---

## 12. Legal & Copyright Risks — Rủi ro pháp lý và bản quyền

### 12.1. Chính sách sử dụng ở MVP

- Chỉ dùng cá nhân và giữ novel ở chế độ riêng tư.
- Ưu tiên tác phẩm tự sáng tạo hoặc tài liệu có quyền sử dụng hợp lệ.
- Tránh yêu cầu AI tái tạo sát tác phẩm của bên thứ ba.
- Không triển khai chức năng xuất bản công khai trong MVP.
- Cho phép người dùng lưu lịch sử prompt, chỉnh sửa và quyết định nội dung cuối cùng.

### 12.2. Quyền tác giả của nội dung có AI hỗ trợ

Theo Nghị định 134/2026/NĐ-CP, việc bảo hộ quyền tác giả đối với tác phẩm có sử dụng AI phụ thuộc vào các điều kiện pháp luật, bao gồm mức đóng góp sáng tạo đáng kể và mang tính quyết định của con người, trách nhiệm về nội dung và tính hợp pháp, cũng như việc không gây phương hại đến quyền đối với dữ liệu đầu vào.

Nguồn tham khảo: [Cổng Thông tin điện tử Chính phủ — Điều kiện bảo hộ tác phẩm do AI hỗ trợ tạo ra](https://baochinhphu.vn/dieu-kien-de-tac-pham-do-ai-ho-tro-tao-ra-duoc-phap-luat-bao-ho-quyen-tac-gia-102260415163902936.htm).

Vì vậy, hệ thống nên lưu lịch sử sáng tạo và chỉnh sửa, nhưng không tuyên bố rằng mọi nội dung do AI tạo ra mặc nhiên thuộc quyền tác giả của người dùng.

Nếu chuyển sang production công khai, cần rà soát thêm các nghĩa vụ liên quan đến quyền sở hữu trí tuệ, xử lý dữ liệu, minh bạch nội dung AI và quy trình tiếp nhận khiếu nại. Việc để nội dung ở chế độ riêng tư không tự động loại bỏ mọi rủi ro pháp lý.

---

## 13. Risk Register — Danh sách rủi ro

| Rủi ro                                | Mức độ     | Biện pháp xử lý                                               |
| ------------------------------------- | ---------- | ------------------------------------------------------------- |
| AI quên hoặc mâu thuẫn Canon          | Cao        | Context có cấu trúc, kiểm tra nhất quán, lưu lịch sử          |
| Sửa chương cũ làm sai mạch truyện     | Cao        | Đánh dấu dữ kiện và chương có khả năng bị ảnh hưởng           |
| Claude/MCP không khả dụng             | Trung bình | Chương đã lưu vẫn đọc được; cho phép thử lại tác vụ           |
| Chi phí AI tăng                       | Trung bình | Tận dụng Pro, giới hạn context và lượt sinh                   |
| Lộ dữ liệu qua MCP                    | Cao        | HTTPS, xác thực, phân quyền tối thiểu, log kiểm toán          |
| Nội dung có nguy cơ vi phạm bản quyền | Cao        | Giữ riêng tư, kiểm soát nguồn đầu vào, không xuất bản đại trà |
| Gói hosting miễn phí thay đổi         | Trung bình | Tách cấu hình triển khai, hỗ trợ sao lưu và di chuyển dữ liệu |
| Mất dữ liệu hoặc cập nhật sai         | Cao        | Versioning, backup và giao dịch database phù hợp              |

Mức độ rủi ro trên là đánh giá định tính cho giai đoạn thiết kế, cần cập nhật khi hệ thống được triển khai thực tế.

---

## 14. Implementation Roadmap — Lộ trình triển khai

### Phase 1 — Core Reader

Hoàn thành mô hình dữ liệu, CRUD novel/chapter, reader, mục lục, bookmark, tiến độ đọc, khóa/mở khóa và lưu phiên bản.

**Deliverable:** Website đọc và quản lý truyện có thể sử dụng mà không cần AI.

### Phase 2 — Claude Pro Integration

Xây dựng MCP Server và các công cụ đọc context, tìm kiếm chương, lưu chương. Thiết lập xác thực và quyền truy cập cho kết nối từ Claude.ai.

**Deliverable:** Claude có thể đọc dữ liệu novel được cho phép và lưu nội dung chương vào hệ thống.

### Phase 3 — Canon & Memory

Xây dựng mô hình Canon, trích xuất sự kiện, theo dõi tuyến truyện, đề xuất cập nhật và đánh dấu các dữ kiện bị ảnh hưởng khi người dùng sửa chương.

**Deliverable:** Bộ nhớ có cấu trúc phục vụ việc sáng tác dài kỳ.

### Phase 4 — Reliability & Portfolio Polish

Bổ sung kiểm thử nghiệp vụ, xử lý lỗi, sao lưu, audit log, hướng dẫn cài đặt và tài liệu kiến trúc.

**Deliverable:** Dự án portfolio có thể trình bày, demo và giải thích rõ các quyết định kỹ thuật.

---

## 15. Acceptance Criteria — Tiêu chí nghiệm thu MVP

1. Người dùng tạo được nhiều novel và truy cập độc lập.
2. Một novel có thể lưu và hiển thị 200 chương theo thứ tự.
3. Reader hỗ trợ chọn chương, chuyển chương, bookmark và tiến độ đọc.
4. Chương được khóa sau khi tạo và lưu hoàn tất.
5. Người dùng có thể mở khóa và chỉnh sửa chương của mình.
6. Lịch sử phiên bản cho phép khôi phục nội dung cũ.
7. Claude có thể lấy context và lưu chương thông qua MCP.
8. Dữ liệu MCP chỉ có thể được truy cập theo quyền được cấp.
9. Khi chỉnh sửa chương, hệ thống đánh dấu các dữ kiện Canon liên quan cần rà soát.
10. Khi AI ngừng hoạt động, các chương đã lưu vẫn truy cập được.
11. Có thể sao lưu và phục hồi dữ liệu cơ bản.
12. Có tài liệu mô tả kiến trúc, data model, API và luồng nghiệp vụ.

---

## 16. Assumptions & Open Questions

Các giả định hiện tại:

- Sản phẩm phục vụ một người dùng cá nhân trong MVP.
- Novel được giữ ở chế độ riêng tư.
- Người dùng chấp nhận mở Claude.ai để khởi tạo quá trình sáng tác.
- Claude Pro là công cụ AI chính ở giai đoạn đầu.
- Chi phí được tối ưu nhưng không giả định mọi dịch vụ hosting đều miễn phí vĩnh viễn.

Những điểm cần quyết định trước khi triển khai chi tiết:

- Có cần hỗ trợ nhập hàng trăm chương viết sẵn từ file hay không?
- Người dùng có muốn quản lý nhiều phiên bản Canon hoặc nhánh cốt truyện không?
- Chương được tự động khóa ngay sau khi lưu hay cho phép mở khóa theo phiên làm việc?
- Có cần hỗ trợ xuất toàn bộ novel ra Markdown, TXT hoặc EPUB ngay trong MVP không?

**Đề xuất:** Ưu tiên hoàn thành chức năng nhập và quản lý chương, vì đây là nền tảng để đưa một novel dài có sẵn vào hệ thống và kiểm thử Canon. Các chức năng xuất bản và chia sẻ công khai chưa cần triển khai.

---

## 17. Kết luận

AI Novel Workspace & Reader nên được triển khai như một ứng dụng quản lý tiểu thuyết riêng tư có khả năng tích hợp AI, thay vì một nền tảng xuất bản truyện ngay từ đầu.

Chiến lược phù hợp nhất là xây dựng Core Reader trước, tích hợp Claude Pro qua remote MCP tiếp theo và phát triển Canon & Memory thành giai đoạn riêng. Cách tiếp cận này giảm sự phụ thuộc vào API trả phí, giới hạn rủi ro triển khai và tạo ra một dự án backend có phạm vi rõ ràng để hoàn thành và trình bày trong portfolio.

**Quyết định kiến trúc sơ bộ:** Next.js + NestJS Modular Monolith + PostgreSQL + Remote MCP + Claude Pro.

**Ưu tiên triển khai:** Quản lý novel/chapter → Reader → Versioning & Permissions → MCP → Canon & Memory.
