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
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    // Thay đổi cổng API nếu backend của bạn chạy ở cổng khác 3000
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
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
    // API của bạn dùng @Body('id'), nhưng chuẩn hơn là dùng @Param('id')
    // Tạm thời gửi id trong body để khớp với controller hiện tại
    await axios.put(`${API_URL}/todos/${id}`, {
      id: id,
      isCompleted: updatedTodo.isCompleted,
    });
    setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
  };

  const handleDeleteTodo = async (id: number) => {
    // Tương tự, tạm thời gửi id trong body
    await axios.delete(`${API_URL}/todos/${id}`, { data: { id: id } });
    setTodos(todos.filter((t) => t.id !== id));
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
