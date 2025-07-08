import { IoIosSearch } from "react-icons/io";
import Layout from "../../components/Layout";
import { TbBuildingPlus } from "react-icons/tb";
import RoomTypeTable from "../../components/RoomTypeTable";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const RoomTypePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Quản lý loại phòng
        </h1>
        <div className="px-8">
          <div className="flex justify-between gap-5">
            <div className="relative w-full max-w-sm">
              <div className="relative">
                <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm loại phòng..."
                  className="w-full rounded-lg border border-gray-600 bg-[#201b39] py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/room-type/create")}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 hover:bg-blue-600"
            >
              <TbBuildingPlus />
              <span>Thêm loại phòng</span>
            </button>
          </div>
        </div>
        <div className="scrollbar-hidden mt-5 flex-1 overflow-auto p-8 pt-5">
          <RoomTypeTable searchTerm={debouncedSearchTerm} />
        </div>
      </div>
    </Layout>
  );
};

export default RoomTypePage;
