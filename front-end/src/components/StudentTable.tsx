import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { studentApi } from "../services/api";
import { formatDate } from "../utils/format";

interface Student {
  accountid: number;
  studentcode: string;
  fullname: string;
  class: string;
  gender: string;
  dateofbirth: string;
  birthplace: string;
  email: string;
  phonenumber: string;
  address: string;
  idcard: string;
  status: string;
  roomregistrations?: {
    room: {
      roomname: string;
      building: {
        buildingname: string;
      };
    };
  }[];
}

interface StudentTableProps {
  searchTerm?: string;
}

const StudentTable = ({ searchTerm }: StudentTableProps) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    accountid: null as number | null,
    fullname: "",
  });

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: "fullname",
        sortOrder: "ASC",
      };

      const response = await studentApi.getAll(params);

      if (response.data && response.data.data) {
        setStudents(response.data.data);
        setTotalItems(response.data.total);
      } else {
        setStudents([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sinh viên:", error);
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.accountid) return;

    try {
      await studentApi.delete(deleteModal.accountid);
      setDeleteModal({ isOpen: false, accountid: null, fullname: "" });
      fetchStudents(); // Refresh sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa sinh viên:", error);
      alert("Đã xảy ra lỗi khi xóa sinh viên");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStatusBadgeClass = (status: string | null | undefined) => {
    if (!status) return "bg-gray-700/30 text-gray-400";

    switch (status) {
      case "Pending":
        return "bg-yellow-700/30 text-yellow-400";
      case "Approved":
        return "bg-green-700/30 text-green-400";
      case "Rejected":
        return "bg-red-700/30 text-red-400";
      default:
        return "bg-gray-700/30 text-gray-400";
    }
  };

  const getGenderBadgeClass = (gender: string | null | undefined) => {
    if (!gender) return "bg-gray-700/30 text-gray-400";

    switch (gender) {
      case "Male":
        return "bg-blue-700/30 text-blue-400";
      case "Female":
        return "bg-pink-700/30 text-pink-400";
      default:
        return "bg-gray-700/30 text-gray-400";
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 rounded px-3 py-1 ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="mx-1 rounded bg-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          Trước
        </button>
        {pages}
        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="mx-1 rounded bg-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    );
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-600">
          <thead>
            <tr className="bg-[#201b39] text-left">
              <th className="border border-gray-600 px-4 py-2">MSSV</th>
              <th className="border border-gray-600 px-4 py-2">Họ và tên</th>
              <th className="border border-gray-600 px-4 py-2">Lớp</th>
              <th className="border border-gray-600 px-4 py-2">Giới tính</th>
              <th className="border border-gray-600 px-4 py-2">Ngày sinh</th>
              <th className="border border-gray-600 px-4 py-2">
                Số điện thoại
              </th>
              <th className="border border-gray-600 px-4 py-2">Phòng</th>
              <th className="border border-gray-600 px-4 py-2">Trạng thái</th>
              <th className="border border-gray-600 px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student.accountid}>
                  <td className="border border-gray-600 px-4 py-2">
                    {student.studentcode}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {student.fullname}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {student.class || "---"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-sm ${getGenderBadgeClass(student.gender)}`}
                    >
                      {student.gender || "---"}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {student.dateofbirth
                      ? formatDate(student.dateofbirth)
                      : "---"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {student.phonenumber || "---"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {student.roomregistrations &&
                    student.roomregistrations.length > 0
                      ? `${student.roomregistrations[0]?.room?.roomname || ""} - ${student.roomregistrations[0]?.room?.building?.buildingname || ""}`
                      : "Chưa đăng ký"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-sm ${getStatusBadgeClass(student.status)}`}
                    >
                      {student.status || "---"}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/student/${student.accountid}`)
                        }
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/student/edit/${student.accountid}`)
                        }
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            accountid: student.accountid,
                            fullname: student.fullname,
                          })
                        }
                        className="text-red-500 hover:text-red-400"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="border border-gray-600 px-4 py-8 text-center"
                >
                  {searchTerm
                    ? "Không tìm thấy sinh viên phù hợp"
                    : "Chưa có sinh viên nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa sinh viên "${deleteModal.fullname}" không? Hành động này không thể hoàn tác.`}
        onClose={() =>
          setDeleteModal({ isOpen: false, accountid: null, fullname: "" })
        }
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default StudentTable;
