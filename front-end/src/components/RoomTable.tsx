import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { roomApi } from "../services/api";

interface Room {
  roomid: number;
  roomname: string;
  status: string;
  bedcount: number;
  building: {
    buildingname: string;
    buildingid: number;
  };
  roomtype: {
    roomtypename: string;
    price: string;
    gender: string;
  };
  roomregistrations: any[];
}

interface RoomTableProps {
  searchTerm: string;
  buildingId?: number;
  onRoomDeleted?: () => void;
}

const RoomTable = ({
  searchTerm,
  buildingId,
  onRoomDeleted,
}: RoomTableProps) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    roomid: null as number | null,
    roomname: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const roomsPerPage = 10;

  useEffect(() => {
    if (buildingId) {
      fetchRoomsByBuilding(buildingId);
    } else if (searchTerm) {
      searchRooms(searchTerm, currentPage);
    } else {
      fetchRooms(currentPage);
    }
  }, [currentPage, buildingId, searchTerm]);

  const fetchRoomsByBuilding = async (buildingId: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching rooms for building ${buildingId}...`);
      const response = await roomApi.getByBuilding(buildingId);
      console.log("Response:", response);

      if (response && response.data) {
        const roomsData = response.data.data || response.data;
        console.log("Building rooms data:", roomsData);
        setRooms(Array.isArray(roomsData) ? roomsData : []);

        setTotalRooms(Array.isArray(roomsData) ? roomsData.length : 0);
        setTotalPages(1);
      } else {
        setRooms([]);
        setError("Không thể tải dữ liệu phòng từ máy chủ");
      }
    } catch (error) {
      console.error("Error fetching rooms by building:", error);
      setError("Đã xảy ra lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching rooms for page ${page}...`);
      const response = await roomApi.getAll({
        page: page,
        limit: roomsPerPage,
      });
      console.log("Response:", response);

      if (response && response.data) {
        const roomsData = response.data.data || response.data;
        console.log("Rooms data:", roomsData);
        setRooms(Array.isArray(roomsData) ? roomsData : []);

        if (response.data.meta) {
          setTotalRooms(response.data.meta.total || 0);
          setTotalPages(response.data.meta.totalPages || 1);
        }
      } else {
        setRooms([]);
        setError("Không thể tải dữ liệu phòng từ máy chủ");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Đã xảy ra lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const searchRooms = async (query: string, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Searching rooms with query "${query}" on page ${page}...`);
      const response = await roomApi.search(query, {
        page: page,
        limit: roomsPerPage,
      });

      if (response && response.data) {
        const roomsData = response.data.data || response.data;
        console.log("Search results:", roomsData);
        setRooms(Array.isArray(roomsData) ? roomsData : []);

        if (response.data.meta) {
          setTotalRooms(response.data.meta.total || 0);
          setTotalPages(response.data.meta.totalPages || 1);
        }
      } else {
        setRooms([]);
        setError("Không thể tải dữ liệu phòng từ máy chủ");
      }
    } catch (error) {
      console.error("Error searching rooms:", error);
      setError("Đã xảy ra lỗi khi tìm kiếm phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.roomid) return;

    try {
      await roomApi.delete(deleteModal.roomid);
      setDeleteModal({ isOpen: false, roomid: null, roomname: "" });

      if (onRoomDeleted) {
        onRoomDeleted();
      } else if (buildingId) {
        fetchRoomsByBuilding(buildingId);
      } else {
        fetchRooms(currentPage);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Có lỗi xảy ra khi xóa phòng");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available":
        return "text-green-500";
      case "Occupied":
        return "text-red-500";
      case "Maintenance":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-white">
        {searchTerm ? "Đang tìm kiếm phòng..." : "Đang tải dữ liệu..."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        {error}
        <button
          onClick={() =>
            buildingId
              ? fetchRoomsByBuilding(buildingId)
              : fetchRooms(currentPage)
          }
          className="ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="py-4 text-center text-white">
        {buildingId
          ? "Không có phòng nào trong tòa nhà này"
          : "Không có phòng nào trong hệ thống"}
      </div>
    );
  }


  const renderPagination = () => {
  if (searchTerm && rooms.length === 0 && !loading) {
    return (
      <div className="py-4 text-center text-white">
        Không tìm thấy phòng nào phù hợp với từ khóa "{searchTerm}"
      </div>
    );
  }

    if (buildingId || searchTerm) return null;

    const pageNumbers = [];
    const maxDisplayedPages = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxDisplayedPages / 2),
    );
    let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);

    if (endPage - startPage + 1 < maxDisplayedPages) {
      startPage = Math.max(1, endPage - maxDisplayedPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`mx-1 rounded px-3 py-1 ${
            currentPage === 1
              ? "cursor-not-allowed bg-gray-500 text-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          &laquo; Trước
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="mx-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
              1
            </button>
            {startPage > 2 && <span className="mx-1">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => goToPage(number)}
            className={`mx-1 rounded px-3 py-1 ${
              currentPage === number
                ? "bg-blue-700 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1">...</span>}
            <button
              onClick={() => goToPage(totalPages)}
              className="mx-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`mx-1 rounded px-3 py-1 ${
            currentPage === totalPages
              ? "cursor-not-allowed bg-gray-500 text-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Sau &raquo;
        </button>
      </div>
    );
  };

  return (
    <div>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-[#201b39] text-left">
            <th className="border border-gray-300 px-4 py-2">Tên phòng</th>
            {!buildingId && (
              <th className="border border-gray-300 px-4 py-2">Tòa nhà</th>
            )}
            <th className="border border-gray-300 px-4 py-2">Loại phòng</th>
            <th className="border border-gray-300 px-4 py-2">Giới tính</th>
            <th className="border border-gray-300 px-4 py-2">Giá</th>
            <th className="border border-gray-300 px-4 py-2">Số giường</th>
            <th className="border border-gray-300 px-4 py-2">Đang ở</th>
            <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
            <th className="border border-gray-300 px-4 py-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.roomid}>
              <td className="border border-gray-300 px-4 py-2">
                {room.roomname}
              </td>
              {!buildingId && (
                <td className="border border-gray-300 px-4 py-2">
                  {room.building?.buildingname || "N/A"}
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2">
                {room.roomtype?.roomtypename || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {room.roomtype?.gender || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {room.roomtype?.price
                  ? parseFloat(room.roomtype.price).toLocaleString() + " VND"
                  : "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {room.bedcount}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {room.roomregistrations?.length || 0}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <span className={getStatusClass(room.status || "")}>
                  {room.status}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/room/edit/${room.roomid}`)}
                    className="text-yellow-500 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => navigate(`/admin/room/${room.roomid}`)}
                    className="text-blue-500 hover:underline"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        roomid: room.roomid,
                        roomname: room.roomname,
                      })
                    }
                    className="text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa phòng "${deleteModal.roomname}"? Hành động này không thể hoàn tác.`}
        onClose={() =>
          setDeleteModal({ isOpen: false, roomid: null, roomname: "" })
        }
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default RoomTable;
