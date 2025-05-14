import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { roomApi, utilitiesApi } from "../../services/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  FaBed,
  FaUsers,
  FaCalendarAlt,
  FaRegLightbulb,
  FaTint,
} from "react-icons/fa";

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [phong, setPhong] = useState<any>(null);
  const [utilities, setUtilities] = useState<any[]>([]);
  const [loadingUtilities, setLoadingUtilities] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomApi.getById(Number(id));
        setPhong(response.data);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy thông tin phòng:", error);
        alert("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  useEffect(() => {
    const fetchUtilities = async () => {
      if (!id) return;

      try {
        // Assuming there's an endpoint to get utilities by room ID
        const response = await utilitiesApi.getAll();
        // Filter utilities for this room
        const roomUtilities = response.data.filter(
          (item: any) => item.roomid === Number(id),
        );
        setUtilities(roomUtilities);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy thông tin tiện ích:", error);
      } finally {
        setLoadingUtilities(false);
      }
    };

    fetchUtilities();
  }, [id]);

  // Get current students
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents =
    phong?.sinhviens?.slice(indexOfFirstStudent, indexOfLastStudent) || [];
  const totalPages = Math.ceil(
    (phong?.sinhviens?.length || 0) / studentsPerPage,
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          Đang tải...
        </div>
      </Layout>
    );
  }

  // Calculate occupancy rate
  const occupancyRate =
    phong?.sinhviens?.length > 0 && phong?.soghe
      ? Math.round((phong.sinhviens.length / phong.soghe) * 100)
      : 0;

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <div className="-mt-5 mb-2 flex items-center justify-between p-5">
          <button
            onClick={() => navigate("/room")}
            className="rounded-lg bg-gray-500 px-4 py-2 hover:bg-gray-600"
          >
            Quay lại
          </button>
          <h1 className="text-center text-3xl font-bold uppercase">
            {phong.tenphong}
          </h1>
          <div className="w-[100px]"></div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid gap-8">
            {/* Thông tin cơ bản */}
            <div className="rounded-lg bg-[#201b39] p-6">
              <h2 className="mb-4 text-xl font-semibold">Thông tin phòng</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-gray-400">Tòa nhà</p>
                  <p>{phong.toanha?.tentoanha}</p>
                </div>
                <div>
                  <p className="text-gray-400">Tầng</p>
                  <p>{phong.tang}</p>
                </div>
                <div>
                  <p className="text-gray-400">Loại phòng</p>
                  <p>{phong.loaiphong?.tenloaiphong}</p>
                </div>
                <div>
                  <p className="text-gray-400">Giới tính</p>
                  <p>{phong.loaiphong?.gioitinh}</p>
                </div>
                <div>
                  <p className="text-gray-400">Đơn giá</p>
                  <p>{phong.loaiphong?.dongia?.toLocaleString()} VNĐ</p>
                </div>
                <div>
                  <p className="text-gray-400">Trạng thái</p>
                  <p
                    className={`${
                      phong.trangthai === "Còn trống"
                        ? "text-green-500"
                        : phong.trangthai === "Đã đầy"
                          ? "text-red-500"
                          : "text-yellow-500"
                    }`}
                  >
                    {phong.trangthai}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Sức chứa</p>
                  <p>{phong.soghe || "Chưa xác định"} người</p>
                </div>
                <div>
                  <p className="text-gray-400">Đã đăng ký</p>
                  <p>{phong.sinhviens?.length || 0} người</p>
                </div>
              </div>
            </div>

            {/* Room Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-[#201b39] p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-500 p-3">
                    <FaUsers className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tỷ lệ lấp đầy</p>
                    <p className="text-2xl font-semibold">{occupancyRate}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#201b39] p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-500 p-3">
                    <FaBed className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Số giường trống</p>
                    <p className="text-2xl font-semibold">
                      {Math.max(
                        0,
                        (phong.soghe || 0) - (phong.sinhviens?.length || 0),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#201b39] p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-500 p-3">
                    <FaCalendarAlt className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Ngày cập nhật</p>
                    <p className="text-xl font-semibold">
                      {phong.updatedAt
                        ? new Date(phong.updatedAt).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiện ích */}
            <div className="rounded-lg bg-[#201b39] p-6">
              <h2 className="mb-4 text-xl font-semibold">Chỉ số tiện ích</h2>
              {loadingUtilities ? (
                <p>Đang tải thông tin tiện ích...</p>
              ) : utilities.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {utilities.map((utility, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-600 p-4"
                    >
                      <div className="mb-2 flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-2">
                            <FaRegLightbulb className="text-yellow-400" />
                            <FaTint className="text-blue-400" />
                          </div>
                          <span className="font-medium">
                            Tháng {new Date(utility.thoigian).getMonth() + 1}/
                            {new Date(utility.thoigian).getFullYear()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">
                            Chỉ số điện cũ
                          </p>
                          <p>{utility.chisodiencu}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">
                            Chỉ số điện mới
                          </p>
                          <p>{utility.chisodienmoi}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">
                            Chỉ số nước cũ
                          </p>
                          <p>{utility.chisonuoccu}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">
                            Chỉ số nước mới
                          </p>
                          <p>{utility.chisonuocmoi}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-400">Thành tiền</p>
                          <p className="font-semibold text-green-400">
                            {utility.thanhtien?.toLocaleString()} VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Chưa có thông tin tiện ích cho phòng này</p>
              )}
            </div>

            {/* Danh sách sinh viên */}
            <div className="rounded-lg bg-[#201b39] p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Danh sách sinh viên ({phong.sinhviens?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-600">
                  <thead>
                    <tr className="bg-[#130f21]">
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Mã SV
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Họ tên
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Giới tính
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Ngày sinh
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Email
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Số điện thoại
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length > 0 ? (
                      currentStudents.map((sv: any) => (
                        <tr key={sv.sinhvienid}>
                          <td className="border border-gray-600 px-4 py-2">
                            {sv.mssv}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {sv.hotensv}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {sv.gioitinh}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {new Date(sv.ngaysinh).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {sv.email}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {sv.sodienthoai}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="border border-gray-600 px-4 py-4 text-center"
                        >
                          Chưa có sinh viên nào trong phòng này
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded px-3 py-1 text-sm disabled:opacity-50"
                    >
                      <FaChevronLeft /> Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`rounded px-3 py-1 text-sm ${
                            currentPage === number
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-700"
                          }`}
                        >
                          {number}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Sau <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoomDetailPage;
