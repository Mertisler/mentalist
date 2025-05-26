'use client';

import { useState } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Sol taraf - Bilgi ve Görsel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-1/2 text-center md:text-left"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Mentalist</h1>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Ruh Sağlığınızı <br />
                  <span className="text-indigo-600">Takip Edin</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Günlük ruh halinizi kaydedin, duygusal yolculuğunuzu görün ve kendinizi daha iyi tanıyın.
                </p>
                <div className="hidden md:block">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                      <div className="text-2xl mb-2">📊</div>
                      <h3 className="font-semibold">Duygu Takibi</h3>
                      <p className="text-sm text-gray-600">Günlük ruh halinizi kaydedin</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                      <div className="text-2xl mb-2">📝</div>
                      <h3 className="font-semibold">Notlar</h3>
                      <p className="text-sm text-gray-600">Düşüncelerinizi kaydedin</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sağ taraf - Giriş/Kayıt Formu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-1/2"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <div className="flex justify-center space-x-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLogin(true)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      isLogin
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Giriş Yap
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLogin(false)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      !isLogin
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Kayıt Ol
                  </motion.button>
                </div>
                {isLogin ? <LoginForm /> : <RegisterForm />}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 