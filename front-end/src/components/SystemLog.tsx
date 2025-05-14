import React, { useEffect, useState } from "react";
import { systemLogApi } from "../services/api";

interface User {
  taikhoanid: number;
  tendangnhap: string;
  matkhau: string;
  vaitro: string;
}

interface SystemLogItem {
  logid: number;
  actionname: string;
  tablename: string;
  recordid: number;
  actiondate: string;
  description: string;
  user: User;
}

const SystemLog = () => {
  const [systemLogs, setSystemLogs] = useState<SystemLogItem[]>([]);

  useEffect(() => {
    const fetchSystemLogs = async () => {
      try {
        const response = await systemLogApi.getAll();
        setSystemLogs(response.data);
      } catch (error) {
        console.error("Error fetching system logs:", error);
        alert("An error occurred while loading system logs");
      }
    };

    fetchSystemLogs();
  }, []);

  return (
    <div className="h-screen w-1/6 bg-[#1b172e] p-4 text-[#e1dce4]">
      <p className="mb-10 text-gray-500">Recent Action</p>
      <ul className="grid gap-2">
        {systemLogs.map((log) => (
          <li key={log.logid}>
            <p className="font-bold">{log.actionname}</p>
            <p>{log.description}</p>
            <p className="text-gray-500">
              {new Date(log.actiondate).toLocaleString()}
            </p>
            <p className="text-gray-400">
              User: {log.user.tendangnhap} - Role: {log.user.vaitro}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemLog;
