import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { roomTypeApi } from "../services/api";
import { formatCurrency } from "../utils/format";

interface RoomType {
  roomtypeid: number;
  roomtypename: string;
  price: string;
  gender: string;
  description: string;
  rooms: any[];
}

interface RoomTypeTableProps {
  searchTerm?: string;
}

const RoomTypeTable = ({ searchTerm }: RoomTypeTableProps) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    roomtypeid: null as number | null,
    roomtypename: "",
  });

  useEffect(() => {
    fetchRoomTypes();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: "roomtypename",
        sortOrder: "ASC",
      };

      const response = await roomTypeApi.getAll(params);

      if (response.data && response.data.data) {
        setRoomTypes(response.data.data);
        setTotalItems(response.data.total);
      } else {
        setRoomTypes([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách loại phòng:", error);
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.roomtypeid) return;

    try {
      await roomTypeApi.delete(deleteModal.roomtypeid);
      setDeleteModal({ isOpen: false, roomtypeid: null, roomtypename: "" });
      fetchRoomTypes(); // Refresh list after deletion
    } catch (error) {
      console.error("Lỗi khi xóa loại phòng:", error);
      alert("Đã xảy ra lỗi khi xóa loại phòng");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case "male":
      case "Male":
        return "Nam";
      case "female":
      case "Female":
        return "Nữ";
      case "mixed":
      case "Mixed":
        return "Hỗn hợp";
      default:
        return gender || "N/A";
    }
  };

  const getGenderBadgeClass = (gender: string) => {
    switch (gender) {
      case "male":
      case "Male":
        return "bg-blue-700/30 text-blue-400";
      case "female":
      case "Female":
        return "bg-pink-700/30 text-pink-400";
      case "mixed":
      case "Mixed":
        return "bg-purple-700/30 text-purple-400";
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

  if (loading && roomTypes.length === 0) {
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
              <th className="border border-gray-600 px-4 py-2">
                Tên loại phòng
              </th>
              <th className="border border-gray-600 px-4 py-2">Giá</th>
              <th className="border border-gray-600 px-4 py-2">Giới tính</th>
              <th className="border border-gray-600 px-4 py-2">Mô tả</th>
              <th className="border border-gray-600 px-4 py-2">Số phòng</th>
              <th className="border border-gray-600 px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.length > 0 ? (
              roomTypes.map((roomType) => (
                <tr key={roomType.roomtypeid}>
                  <td className="border border-gray-600 px-4 py-2">
                    {roomType.roomtypename}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {formatCurrency(parseFloat(roomType.price))} VNĐ
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-sm ${getGenderBadgeClass(roomType.gender)}`}
                    >
                      {getGenderDisplay(roomType.gender)}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {roomType.description || "Không có mô tả"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {roomType.rooms?.length || 0}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/room-type/edit/${roomType.roomtypeid}`)
                        }
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/room-type/${roomType.roomtypeid}`)
                        }
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            roomtypeid: roomType.roomtypeid,
                            roomtypename: roomType.roomtypename,
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
                  colSpan={6}
                  className="border border-gray-600 px-4 py-8 text-center"
                >
                  {searchTerm
                    ? "Không tìm thấy loại phòng phù hợp"
                    : "Chưa có loại phòng nào"}
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
        message={`Bạn có chắc chắn muốn xóa loại phòng "${deleteModal.roomtypename}"? Hành động này không thể hoàn tác.`}
        onClose={() =>
          setDeleteModal({ isOpen: false, roomtypeid: null, roomtypename: "" })
        }
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default RoomTypeTable;
