import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, Badge } from '../components';

function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Chính sách bảo mật</h1>
        <p className="text-slate-500">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="info">Nội bộ</Badge>
          <Badge variant="success">Bảo mật cao</Badge>
        </div>
      </div>

      <Card padding="lg">
        <div className="prose prose-slate max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Cam kết bảo mật</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Wiki Hub cam kết bảo vệ quyền riêng tư và dữ liệu của tất cả người dùng. Chính sách 
              này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn 
              trong môi trường doanh nghiệp nội bộ.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Hệ thống bao gồm hai module chính - <strong>Wiki Knowledge Base</strong> và{' '}
              <strong>EOL Software Tracking</strong> - mỗi module có các yêu cầu bảo mật riêng biệt 
              được mô tả chi tiết dưới đây.
            </p>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Thu thập thông tin</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">2.1. Thông tin cá nhân</h3>
                <p className="mb-2">Chúng tôi thu thập các thông tin sau khi bạn đăng ký và sử dụng hệ thống:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Họ tên và email công ty</li>
                  <li>Tên đăng nhập và mật khẩu (được mã hóa)</li>
                  <li>Vai trò và phòng ban</li>
                  <li>Ảnh đại diện (nếu có)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">2.2. Dữ liệu hoạt động chung</h3>
                <p className="mb-2">Hệ thống tự động ghi nhận:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Lịch sử đăng nhập và thời gian truy cập</li>
                  <li>Địa chỉ IP và thông tin thiết bị</li>
                  <li>Trình duyệt và hệ điều hành</li>
                  <li>Cookies và session data</li>
                </ul>
              </div>

              {/* Wiki-specific data */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>📚</span> 2.3. Dữ liệu Wiki Knowledge Base
                </h3>
                <p className="text-blue-700 mb-2">Khi sử dụng chức năng Wiki, chúng tôi thu thập:</p>
                <ul className="list-disc pl-6 space-y-1 text-blue-700">
                  <li>Nội dung bài viết wiki bạn tạo ra (title, content, metadata)</li>
                  <li>Lịch sử chỉnh sửa và version control</li>
                  <li>Các bài viết bạn đã xem và thời gian đọc</li>
                  <li>Từ khóa tìm kiếm và kết quả tìm kiếm</li>
                  <li>Bình luận và tương tác với bài viết</li>
                  <li>Thống kê đóng góp (số bài viết, số lần chỉnh sửa)</li>
                </ul>
              </div>

              {/* EOL-specific data */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <span>⏰</span> 2.4. Dữ liệu EOL Software Tracking
                </h3>
                <p className="text-amber-700 mb-2">Khi sử dụng chức năng EOL, chúng tôi thu thập:</p>
                <ul className="list-disc pl-6 space-y-1 text-amber-700">
                  <li>Danh sách phần mềm và công nghệ bạn theo dõi</li>
                  <li>Phiên bản phần mềm đang sử dụng trong dự án</li>
                  <li>Cảnh báo EOL đã xem và hành động thực hiện</li>
                  <li>Ghi chú và kế hoạch migration</li>
                  <li>Thông tin về sản phẩm, vendor, và documentation links</li>
                  <li>Lịch sử cập nhật thông tin EOL</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Sử dụng thông tin</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Thông tin được thu thập sẽ được sử dụng cho các mục đích sau:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🔐 Bảo mật</h4>
                <p className="text-sm text-blue-700">
                  Xác thực danh tính, phát hiện và ngăn chặn truy cập trái phép
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-900 mb-2">📊 Phân tích</h4>
                <p className="text-sm text-emerald-700">
                  Cải thiện trải nghiệm người dùng, tối ưu tìm kiếm và đề xuất nội dung
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">📢 Thông báo</h4>
                <p className="text-sm text-purple-700">
                  Gửi cảnh báo EOL, cập nhật wiki quan trọng và thông báo hệ thống
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">🔍 Kiểm toán</h4>
                <p className="text-sm text-amber-700">
                  Tuân thủ quy định nội bộ, audit trail và yêu cầu pháp lý
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2">Mục đích cụ thể theo chức năng:</h4>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Wiki:</strong> Theo dõi đóng góp, đề xuất nội dung liên quan, cải thiện kết quả tìm kiếm</li>
                <li><strong>EOL:</strong> Gửi cảnh báo kịp thời, đề xuất kế hoạch nâng cấp, báo cáo rủi ro bảo mật</li>
              </ul>
            </div>
          </section>

          {/* Data Storage */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Lưu trữ và bảo vệ dữ liệu</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">4.1. Vị trí lưu trữ</h3>
                <p>
                  Tất cả dữ liệu được lưu trữ trên máy chủ nội bộ của công ty, đặt tại trung tâm 
                  dữ liệu được bảo mật cao. Không có dữ liệu nào được lưu trữ trên dịch vụ đám mây 
                  bên ngoài.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">4.2. Biện pháp bảo mật</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Mã hóa:</strong> Mật khẩu được mã hóa bằng thuật toán bcrypt</li>
                  <li><strong>HTTPS:</strong> Tất cả kết nối được mã hóa SSL/TLS</li>
                  <li><strong>Firewall:</strong> Hệ thống tường lửa đa lớp bảo vệ máy chủ</li>
                  <li><strong>Backup:</strong> Sao lưu dữ liệu tự động hàng ngày</li>
                  <li><strong>Giám sát:</strong> Theo dõi 24/7 để phát hiện bất thường</li>
                  <li><strong>Kiểm soát truy cập:</strong> Phân quyền dựa trên vai trò (RBAC)</li>
                  <li><strong>Version Control:</strong> Lưu trữ lịch sử thay đổi wiki để phục hồi khi cần</li>
                  <li><strong>Input Validation:</strong> Kiểm tra và làm sạch dữ liệu đầu vào để ngăn chặn XSS, SQL Injection</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">4.3. Thời gian lưu trữ</h3>
                <div className="space-y-3">
                  <p>
                    <strong>Dữ liệu người dùng:</strong> Lưu trữ trong suốt thời gian bạn là nhân viên. 
                    Sau khi nghỉ việc, dữ liệu cá nhân sẽ được lưu trữ thêm 12 tháng cho mục đích kiểm toán, 
                    sau đó sẽ được xóa hoặc ẩn danh hóa.
                  </p>
                  <p>
                    <strong>Nội dung Wiki:</strong> Được lưu trữ vô thời hạn vì là tài sản tri thức của công ty. 
                    Thông tin tác giả có thể được ẩn danh hóa sau khi nhân viên nghỉ việc.
                  </p>
                  <p>
                    <strong>Dữ liệu EOL:</strong> Được lưu trữ vô thời hạn để duy trì lịch sử lifecycle của 
                    phần mềm và hỗ trợ quyết định kỹ thuật trong tương lai.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Chia sẻ thông tin</h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <p className="text-amber-800">
                <strong>⚠️ Lưu ý quan trọng:</strong> Chúng tôi KHÔNG bao giờ chia sẻ thông tin 
                cá nhân của bạn với bên thứ ba bên ngoài công ty.
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Thông tin chỉ được chia sẻ nội bộ trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Với quản lý trực tiếp để đánh giá hiệu suất làm việc</li>
              <li>Với bộ phận IT để hỗ trợ kỹ thuật và bảo trì hệ thống</li>
              <li>Với bộ phận HR khi có yêu cầu hành chính</li>
              <li>Với team members khi cộng tác trên wiki hoặc dự án chung</li>
              <li>Khi có yêu cầu pháp lý từ cơ quan có thẩm quyền</li>
            </ul>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Quyền của người dùng</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">👁️</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Quyền truy cập</h4>
                  <p className="text-sm text-slate-600">Xem và tải xuống dữ liệu cá nhân, lịch sử wiki và EOL tracking của bạn</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">✏️</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Quyền chỉnh sửa</h4>
                  <p className="text-sm text-slate-600">Cập nhật thông tin cá nhân, chỉnh sửa hoặc xóa bài viết wiki của bạn</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">🗑️</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Quyền xóa</h4>
                  <p className="text-sm text-slate-600">Yêu cầu xóa dữ liệu cá nhân (wiki content có thể được giữ lại nhưng ẩn danh hóa tác giả)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">📋</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Quyền sao chép</h4>
                  <p className="text-sm text-slate-600">Nhận bản sao dữ liệu ở định dạng có cấu trúc (JSON, CSV)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Cookies và công nghệ theo dõi</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Chúng tôi sử dụng cookies và công nghệ tương tự để:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Duy trì phiên đăng nhập của bạn</li>
              <li>Ghi nhớ tùy chọn và cài đặt (theme, ngôn ngữ, layout)</li>
              <li>Phân tích cách sử dụng hệ thống và cải thiện UX</li>
              <li>Theo dõi tiến độ đọc wiki và đề xuất nội dung liên quan</li>
              <li>Lưu trữ bộ lọc và tùy chọn tìm kiếm EOL</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Bạn có thể quản lý cookies thông qua cài đặt trình duyệt, nhưng việc vô hiệu hóa 
              cookies có thể ảnh hưởng đến chức năng của hệ thống.
            </p>
          </section>

          {/* Data Breach */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Xử lý sự cố bảo mật</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Trong trường hợp xảy ra vi phạm dữ liệu, chúng tôi cam kết:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Thông báo cho người dùng bị ảnh hưởng trong vòng 72 giờ</li>
              <li>Điều tra nguyên nhân và phạm vi của sự cố</li>
              <li>Thực hiện các biện pháp khắc phục ngay lập tức</li>
              <li>Báo cáo cho cơ quan chức năng nếu cần thiết</li>
              <li>Cải thiện quy trình bảo mật để ngăn chặn sự cố tương tự</li>
              <li>Cung cấp hỗ trợ và hướng dẫn cho người dùng bị ảnh hưởng</li>
            </ul>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">9. Cập nhật chính sách</h2>
            <p className="text-slate-600 leading-relaxed">
              Chính sách bảo mật này có thể được cập nhật định kỳ để phản ánh các thay đổi trong 
              hoạt động của chúng tôi hoặc yêu cầu pháp lý. Chúng tôi sẽ thông báo cho bạn về 
              bất kỳ thay đổi quan trọng nào qua email hoặc thông báo trên hệ thống.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">10. Liên hệ về bảo mật</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào về quyền riêng tư và bảo mật 
              dữ liệu, vui lòng liên hệ:
            </p>
            <div className="p-6 bg-linear-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-3">Bộ phận Bảo mật Thông tin</h4>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> security@wiki-hub.com</p>
                <p><strong>Hotline:</strong> +84 (24) 1234 5678</p>
                <p><strong>Địa chỉ:</strong> Tầng 10, Tòa nhà ABC, Hà Nội</p>
                <p><strong>Giờ làm việc:</strong> 8:00 - 17:30 (Thứ 2 - Thứ 6)</p>
              </div>
            </div>
          </section>
        </div>
      </Card>

      {/* Footer Navigation */}
      <div className="flex justify-center gap-4 pt-6">
        <Link to="/">
          <button className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors">
            ← Quay lại trang chủ
          </button>
        </Link>
        <Link to="/terms">
          <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Xem điều khoản sử dụng →
          </button>
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});
