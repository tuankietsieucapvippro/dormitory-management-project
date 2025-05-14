import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { buildingApi } from "../services/api";

interface Building {
  buildingid: number;
  buildingname: string;
  description: string;
  rooms: {
    roomid: number;
  }[];
}

interface BuildingTableProps {
  searchTerm: string;
}

const BuildingTable = ({ searchTerm }: BuildingTableProps) => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    buildingid: null as number | null,
    buildingname: "",
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await buildingApi.getAll({ includeRooms: true });
      if (response.data && response.data.data) {
        setBuildings(response.data.data);
      } else {
        setError("Định dạng dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi gọi API:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.buildingid) return;

    try {
      await buildingApi.delete(deleteModal.buildingid);
      setDeleteModal({ isOpen: false, buildingid: null, buildingname: "" });
      fetchBuildings();
    } catch (error) {
      console.error("Có lỗi xảy ra khi xóa tòa nhà:", error);
      alert("Có lỗi xảy ra khi xóa tòa nhà");
    }
  };

  const filteredBuildings = buildings.filter(
    (building) =>
      building.buildingname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (building.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ),
  );

  if (loading) {
    return <div className="py-4 text-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-[#201b39] text-left">
            <th className="border border-gray-300 px-4 py-2">Tên tòa nhà</th>
            <th className="border border-gray-300 px-4 py-2">Mô tả</th>
            <th className="border border-gray-300 px-4 py-2">Số lượng phòng</th>
            <th className="border border-gray-300 px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredBuildings.length > 0 ? (
            filteredBuildings.map((building) => (
              <tr key={building.buildingid}>
                <td className="border border-gray-300 px-4 py-2">
                  {building.buildingname}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {building.description}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {building.rooms?.length || 0}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/building/edit/${building.buildingid}`)
                      }
                      className="text-yellow-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/building/${building.buildingid}`)
                      }
                      className="text-blue-500"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          buildingid: building.buildingid,
                          buildingname: building.buildingname,
                        })
                      }
                      className="text-red-500"
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
                colSpan={4}
                className="border border-gray-300 px-4 py-2 text-center"
              >
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tòa nhà "${deleteModal.buildingname}" không? Hành động này không thể hoàn tác.`}
        onClose={() =>
          setDeleteModal({ isOpen: false, buildingid: null, buildingname: "" })
        }
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BuildingTable;
