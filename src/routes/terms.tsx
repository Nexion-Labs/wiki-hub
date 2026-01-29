import { createFileRoute, Link } from '@tanstack/react-router';
import { Card } from '../components';

function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Điều khoản sử dụng</h1>
        <p className="text-slate-500">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <Card padding="lg">
        <div className="prose prose-slate max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Giới thiệu</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Chào mừng bạn đến với Wiki Hub - nền tảng quản lý tri thức nội bộ của doanh nghiệp. 
              Hệ thống cung cấp hai chức năng chính:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">📚 Wiki Knowledge Base</h3>
                <p className="text-sm text-blue-700">
                  Tạo, quản lý và chia sẻ tài liệu kỹ thuật, hướng dẫn, quy trình làm việc 
                  và kiến thức chuyên môn trong tổ chức.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                <h3 className="font-semibold text-amber-900 mb-2">⏰ EOL Software Tracking</h3>
                <p className="text-sm text-amber-700">
                  Theo dõi vòng đời phần mềm, cảnh báo End-of-Life, quản lý phiên bản 
                  và lập kế hoạch nâng cấp hệ thống.
                </p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Bằng việc truy cập và sử dụng hệ thống này, bạn đồng ý tuân thủ các điều khoản và 
              điều kiện được nêu dưới đây.
            </p>
          </section>

          {/* Access and Usage */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Quyền truy cập và sử dụng</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">2.1. Tài khoản người dùng</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chỉ nhân viên được cấp quyền mới có thể truy cập hệ thống</li>
                  <li>Mỗi người dùng chịu tr책nhiệm bảo mật thông tin đăng nhập của mình</li>
                  <li>Không được chia sẻ tài khoản cho người khác</li>
                  <li>Thông báo ngay cho quản trị viên nếu phát hiện truy cập trái phép</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">2.2. Sử dụng hợp lệ</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sử dụng hệ thống chỉ cho mục đích công việc</li>
                  <li>Không tải lên nội dung vi phạm pháp luật hoặc quy định công ty</li>
                  <li>Không spam, quấy rối hoặc gây phiền nhiễu cho người dùng khác</li>
                  <li>Không cố gắng truy cập trái phép vào các phần hệ thống bị hạn chế</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Content Guidelines */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Hướng dẫn sử dụng chức năng</h2>
            
            <div className="space-y-6 text-slate-600">
              {/* Wiki Guidelines */}
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📚</span> 3.1. Sử dụng Wiki Knowledge Base
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Nội dung được khuyến khích:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-blue-700">
                      <li>Tài liệu kỹ thuật, API documentation và hướng dẫn sử dụng</li>
                      <li>Quy trình làm việc, workflows và best practices</li>
                      <li>Troubleshooting guides và FAQ</li>
                      <li>Kiến thức chuyên môn, case studies và lessons learned</li>
                      <li>Onboarding materials cho nhân viên mới</li>
                      <li>Coding standards và architecture decisions</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Trách nhiệm người dùng:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-blue-700">
                      <li>Đảm bảo nội dung chính xác và cập nhật</li>
                      <li>Sử dụng cú pháp Markdown đúng chuẩn</li>
                      <li>Tổ chức nội dung logic và dễ tìm kiếm</li>
                      <li>Ghi rõ nguồn tham khảo khi trích dẫn</li>
                      <li>Review và cập nhật định kỳ các bài viết cũ</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* EOL Guidelines */}
              <div className="p-5 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <span>⏰</span> 3.2. Sử dụng EOL Software Tracking
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Mục đích sử dụng:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-amber-700">
                      <li>Theo dõi vòng đời (lifecycle) của phần mềm và công nghệ đang sử dụng</li>
                      <li>Nhận cảnh báo về các phiên bản sắp End-of-Life hoặc End-of-Support</li>
                      <li>Quản lý danh sách phần mềm, frameworks, libraries trong tổ chức</li>
                      <li>Lập kế hoạch nâng cấp và migration trước khi phần mềm hết hỗ trợ</li>
                      <li>Đánh giá rủi ro bảo mật từ các phiên bản lỗi thời</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Quy trình cập nhật EOL:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-amber-700">
                      <li>Chỉ Admin và Tech Lead được phép thêm/sửa thông tin EOL</li>
                      <li>Thông tin phải được xác minh từ nguồn chính thức (vendor, trang chủ sản phẩm)</li>
                      <li>Cập nhật ngay khi có thông báo EOL mới từ nhà cung cấp</li>
                      <li>Ghi rõ nguồn tham khảo và link documentation</li>
                      <li>Phân loại sản phẩm theo category để dễ quản lý</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Trách nhiệm theo vai trò:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-amber-700">
                      <li><strong>Admin:</strong> Quản lý danh sách sản phẩm, phiên bản và EOL dates</li>
                      <li><strong>Tech Lead:</strong> Review và đề xuất kế hoạch nâng cấp</li>
                      <li><strong>Developer:</strong> Theo dõi cảnh báo EOL của công nghệ đang sử dụng</li>
                      <li><strong>Manager:</strong> Phê duyệt ngân sách và timeline cho migration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prohibited Content */}
              <div className="p-5 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-3">3.3. Nội dung bị cấm</h3>
                <ul className="list-disc pl-6 space-y-2 text-red-700">
                  <li>Thông tin mật của công ty chưa được phê duyệt công khai</li>
                  <li>Credentials, API keys, passwords hoặc thông tin bảo mật nhạy cảm</li>
                  <li>Dữ liệu cá nhân của khách hàng (PII - Personally Identifiable Information)</li>
                  <li>Nội dung xúc phạm, phân biệt đối xử hoặc không phù hợp</li>
                  <li>Tài liệu vi phạm bản quyền hoặc license của bên thứ ba</li>
                  <li>Thông tin sai lệch hoặc chưa được kiểm chứng</li>
                  <li>Nội dung quảng cáo hoặc spam</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Quyền sở hữu trí tuệ</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Tất cả nội dung được tạo ra trên Wiki Hub thuộc sở hữu của công ty. Người dùng 
              giữ quyền tác giả đối với nội dung do mình tạo ra nhưng cấp cho công ty quyền 
              sử dụng, chỉnh sửa và phân phối nội dung đó trong phạm vi nội bộ.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Bảo mật dữ liệu</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Công ty cam kết bảo vệ dữ liệu và thông tin của người dùng. Tuy nhiên, người dùng 
              cũng có trách nhiệm:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Phân loại và đánh dấu mức độ bảo mật cho nội dung</li>
              <li>Chỉ chia sẻ thông tin với những người có quyền truy cập</li>
              <li>Báo cáo ngay lập tức nếu phát hiện rò rỉ thông tin</li>
            </ul>
          </section>

          {/* Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Giới hạn trách nhiệm</h2>
            <p className="text-slate-600 leading-relaxed">
              Hệ thống được cung cấp "nguyên trạng". Công ty không chịu trách nhiệm về:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-4">
              <li>Tính chính xác hoặc đầy đủ của nội dung do người dùng tạo ra</li>
              <li>Mất mát dữ liệu do lỗi kỹ thuật hoặc sự cố bất khả kháng</li>
              <li>Thiệt hại gián tiếp phát sinh từ việc sử dụng hệ thống</li>
            </ul>
          </section>

          {/* Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Thay đổi điều khoản</h2>
            <p className="text-slate-600 leading-relaxed">
              Công ty có quyền cập nhật các điều khoản này bất cứ lúc nào. Người dùng sẽ được 
              thông báo về các thay đổi quan trọng qua email hoặc thông báo trên hệ thống.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Liên hệ</h2>
            <p className="text-slate-600 leading-relaxed">
              Nếu có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ:
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700"><strong>Email:</strong> support@wiki-hub.com</p>
              <p className="text-slate-700"><strong>Bộ phận:</strong> IT Support & Administration</p>
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
        <Link to="/privacy">
          <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Xem chính sách bảo mật →
          </button>
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});
