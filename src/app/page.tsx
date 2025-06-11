"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { Sun, Moon, Trash2, Calendar, Plus, Loader2 } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

// Interface và ThemeSwitcher giữ nguyên...
interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const ThemeSwitcher = () => {
  // ... (giữ nguyên code)
};

export default function HomePage() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/todos`)
      .then((res) => {
        setTodos(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch todos:", err);
        setError(
          "Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối và cấu hình API."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTodoData = {
      title: input,
      isCompleted: false,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    };
    try {
      const response = await axios.post(`${API_URL}/todos`, newTodoData);
      setTodos([response.data, ...todos]);
      setInput("");
      setDueDate(null);
    } catch (err) {
      console.error("Failed to add todo:", err);
      setError("Không thể thêm công việc mới.");
    }
  };

  const toggleComplete = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

    // SỬA LỖI: Chỉ gửi trường cần cập nhật, không gửi lại ID trong body.
    try {
      await axios.put(`${API_URL}/todos/${id}`, {
        isCompleted: updatedTodo.isCompleted,
      });
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err) {
      console.error("Failed to update todo:", err);
      setError("Không thể cập nhật công việc.");
    }
  };

  const handleDeleteTodo = async (id: number) => {
    // SỬA LỖI: Không gửi body trong request DELETE.
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Không thể xóa công việc.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">
            Việc cần làm
          </h1>
          <ThemeSwitcher />
        </header>

        {/* Input Form */}
        <form
          onSubmit={handleAddTodo}
          className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex items-center gap-2 sm:gap-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Thêm một công việc mới..."
            className="flex-grow bg-transparent focus:outline-none text-lg"
          />
          <div className="relative">
            <DatePicker
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              className="w-32 bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-center cursor-pointer focus:outline-none"
              isClearable
            />
          </div>
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold p-2 rounded-full transition-colors flex-shrink-0"
          >
            <Plus size={22} />
          </button>
        </form>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center p-4 rounded-lg shadow-sm transition-all duration-300 ${
                todo.isCompleted
                  ? "bg-green-100 dark:bg-green-900/50 opacity-60"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => toggleComplete(todo.id)}
                className="form-checkbox h-5 w-5 rounded text-sky-600 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-sky-500 cursor-pointer"
              />
              <div className="ml-4 flex-grow">
                <p
                  className={`font-medium ${
                    todo.isCompleted
                      ? "line-through text-slate-500"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {todo.title}
                </p>
                {todo.dueDate && (
                  <div
                    className={`flex items-center text-sm mt-1 ${
                      todo.isCompleted
                        ? "text-slate-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Calendar size={14} className="mr-1.5" />
                    <span>{format(new Date(todo.dueDate), "dd/MM/yyyy")}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="ml-4 p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
