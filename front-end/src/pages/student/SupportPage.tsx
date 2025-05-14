import React from "react";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { FaLinkedin, FaClock } from "react-icons/fa";
import Layout from "../../components/Layout";

const SupportPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto h-full bg-[#130f21] px-4 py-8 text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 text-center text-3xl font-bold uppercase">
          Liên Hệ Với Chúng Tôi
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-semibold">Thông Tin Liên Hệ</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <MdEmail className="mr-4 text-2xl text-blue-600" />
                <span>Email: tuankiet2962003@gmail.com</span>
              </div>

              <div className="flex items-center">
                <MdPhone className="mr-4 text-2xl text-blue-600" />
                <span>Điện thoại: (84) 523-059-456</span>
              </div>

              <div className="flex items-center">
                <MdLocationOn className="mr-4 text-2xl text-blue-600" />
                <span>Địa chỉ: 2 Nguyễn Đình Chiểu, Vĩnh Thọ, Nha Trang</span>
              </div>

              <div className="flex items-center">
                <FaLinkedin className="mr-4 text-2xl text-blue-600" />
                <span>LinkedIn: linkedin.com/company/example</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-6 shadow-lg">
            <div className="mb-8">
              <h2 className="mb-4 flex items-center text-xl font-semibold">
                <FaClock className="mr-2 text-2xl text-blue-600" />
                Giờ Làm Việc
              </h2>
              <div className="space-y-2">
                <p>Thứ Hai - Thứ Sáu: 8:00 - 17:00</p>
                <p>Thứ Bảy: 8:00 - 12:00</p>
                <p>Chủ Nhật: Nghỉ</p>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold">Về Chúng Tôi</h2>
              <p className="text-gray-600">
                Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn.
                Đừng ngần ngại liên hệ với chúng tôi qua các kênh trên để được
                tư vấn và hỗ trợ tốt nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
