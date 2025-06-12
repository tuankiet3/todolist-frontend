"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { Sun, Moon, Trash2, Calendar, Plus } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";
// Tùy chọn: bạn có thể tạo file này để custom giao diện DatePicker cho dark mode
// import "./datepicker-custom.css";

interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}{" "}
    </button>
  );
};

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/todos`).then((res) => setTodos(res.data));
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTodo = {
      title: input,
      isCompleted: false,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    };
    const response = await axios.post(`${API_URL}/todos`, newTodo);
    setTodos([response.data, ...todos]);
    setInput("");
    setDueDate(null);
  };

  const toggleComplete = async (id: number) => {
    console.log(`Toggling todo with id: ${id}`); // Add this line for debugging
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      console.log(`Todo with id ${id} not found`); // Add this line for debugging
      return;
    }
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
    // API nên được cập nhật để nhận id từ URL param (@Param('id')) thay vì body
    try {
      await axios.put(`${API_URL}/todos/${id}`, {
        isCompleted: updatedTodo.isCompleted,
      });
      setTodos(prevTodos => prevTodos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error("Failed to update todo:", error); // Log any errors
    }
  };

  const handleDeleteTodo = async (id: number) => {
    // API nên được cập nhật để nhận id từ URL param (@Param('id'))
    await axios.delete(`${API_URL}/todos/${id}`);
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
      {" "}
      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        {" "}
        <header className="flex justify-between items-center mb-8">
          {/* Thay đổi: Kích thước chữ nhỏ hơn trên mobile */}{" "}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
            Việc cần làm{" "}
          </h1>
          <ThemeSwitcher />{" "}
        </header>{" "}
        {/* Thay đổi: Form xếp dọc trên mobile, xếp ngang trên màn hình lớn hơn */}{" "}
        <form
          onSubmit={handleAddTodo}
          className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
        >
          {" "}
          <div className="relative w-full flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-md p-2 sm:flex-grow">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Thêm một công việc mới..."
              className="flex-grow bg-transparent focus:outline-none text-lg w-full"
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold p-2 rounded-full transition-colors flex-shrink-0 sm:hidden"
              aria-label="Thêm công việc"
            >
              <Plus size={22} />
            </button>
          </div>{" "}
          <div className="relative w-full sm:w-auto">
            {" "}
            <DatePicker
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày hết hạn"
              // Thay đổi: Class responsive và thêm withPortal
              className="w-full sm:w-40 bg-slate-100 dark:bg-slate-700 p-2.5 sm:p-2 rounded-md text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
              isClearable
              withPortal // Hiển thị lịch ở trung tâm màn hình trên mobile
            />{" "}
          </div>{" "}
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold p-2 rounded-full transition-colors flex-shrink-0 hidden sm:block"
            aria-label="Thêm công việc"
          >
            <Plus size={22} />{" "}
          </button>{" "}
        </form>
        {/* Todo List */}{" "}
        <div className="space-y-4">
          {" "}
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center p-4 rounded-lg shadow-sm transition-all duration-300 ${
                todo.isCompleted
                  ? "bg-green-100 dark:bg-green-900/50 opacity-60"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              {" "}
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => toggleComplete(todo.id)}
                className="form-checkbox h-5 w-5 rounded text-sky-600 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-sky-500 cursor-pointer flex-shrink-0"
              />{" "}
              <div className="ml-4 flex-grow overflow-hidden">
                {" "}
                <p
                  className={`font-medium break-words ${
                    todo.isCompleted
                      ? "line-through text-slate-500"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {todo.title}{" "}
                </p>{" "}
                {todo.dueDate && (
                  <div
                    className={`flex items-center text-sm mt-1 ${
                      todo.isCompleted
                        ? "text-slate-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {" "}
                    <Calendar size={14} className="mr-1.5 flex-shrink-0" />{" "}
                    <span>
                      {/* Sửa đổi để tránh lỗi nếu dueDate không hợp lệ */}
                      {format(
                        new Date(todo.dueDate.replace(/-/g, "/")),
                        "dd/MM/yyyy"
                      )}
                    </span>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="ml-4 p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors flex-shrink-0"
                aria-label="Xóa công việc"
              >
                <Trash2 size={18} />{" "}
              </button>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
