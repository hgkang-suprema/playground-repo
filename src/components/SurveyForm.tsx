"use client";

import React, { useState, FormEvent } from "react";
import { Send } from "lucide-react";

export interface SurveyData {
  name: string;
  email: string;
  feedback: string;
}

const SurveyForm: React.FC = () => {
  const [formData, setFormData] = useState<SurveyData>({
    name: "",
    email: "",
    feedback: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 설문조사 데이터 처리 (API 호출 등)
    console.log("설문 제출:", formData);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg animate-fadeIn"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">설문조사 입력폼</h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
          이름
        </label>
        <input 
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          placeholder="이름을 입력하세요"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
          이메일
        </label>
        <input 
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          placeholder="이메일을 입력하세요"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="feedback" className="block text-gray-700 font-medium mb-1">
          의견
        </label>
        <textarea
          id="feedback"
          name="feedback"
          value={formData.feedback}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          placeholder="의견을 입력하세요"
          rows={4}
          required
        />
      </div>

      <button 
        type="submit"
        className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-bold py-2 px-4 rounded-lg"
      >
        제출
        <Send className="ml-2" size={18} />
      </button>
    </form>
  );
};

export default SurveyForm;