import Layout from "../../components/Layout";
import { TbBuildingPlus } from "react-icons/tb";
import RoomTable from "../../components/RoomTable";
import { IoIosSearch } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const RoomPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce effect để delay việc tìm kiếm
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  return (
    <Layout>
      <div className="min-h-full bg-[#130f21] p-5 text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 text-center text-3xl font-bold uppercase">
          Phòng
        </h1>
        <div className="grid gap-5 p-3">
          <div className="flex justify-between gap-5">
            <div className="relative w-full max-w-sm">
              <div className="relative">
                <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm phòng..."
                  className="w-full rounded-lg border border-gray-600 bg-[#201b39] py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => navigate("/room/create")}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 hover:bg-blue-600"
            >
              <TbBuildingPlus />
              <span>Thêm phòng</span>
            </button>
          </div>
          <div className="scrollbar-hidden overflow-auto">
            <RoomTable searchTerm={debouncedSearchTerm} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoomPage;
