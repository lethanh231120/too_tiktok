"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Apple, ArrowRight, Video, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MINIO_URL = "https://ss3.fastfol.io.vn/tiktok-releases";

export default function Home() {
  const downloadLinks = {
    macSilicon: `${MINIO_URL}/TikTok%20Video%20Generator-1.0.0-arm64.dmg`,
    macIntel: `${MINIO_URL}/TikTok%20Video%20Generator-1.0.0.dmg`,
    windows: `${MINIO_URL}/TikTok%20Video%20Generator%20Setup%201.0.0.exe`
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-rose-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-cyan-500 flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">TikTok<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-cyan-400">Gen</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Tính năng</button>
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Hướng dẫn</button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center px-4 pt-24 pb-32 text-center md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-white/5 border border-white/10 text-zinc-300 mb-8"
        >
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>Sora Video Generation Automation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] md:leading-[1.1] mb-6"
        >
          Biến ý tưởng thành video với <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500">Sora Automation</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12"
        >
          Ứng dụng desktop hoàn hảo cho tiếp thị liên kết TikTok. Tự động hóa quy trình phân tích sản phẩm, tạo kịch bản AI, và render video với công nghệ Sora tiên tiến nhất.
        </motion.p>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-center w-full max-w-4xl"
        >
          {/* macOS Apple Silicon */}
          <a href={downloadLinks.macSilicon} target="_blank" rel="noopener noreferrer">
            <Button className="group relative h-[72px] px-6 rounded-2xl bg-white text-black hover:bg-zinc-100 hover:-translate-y-1 transition-all duration-300 flex items-center justify-start gap-4 w-full md:w-[260px] shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <Apple className="w-8 h-8 ml-2" />
              <div className="flex flex-col items-start text-left border-l border-black/10 pl-4 h-10 justify-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Tải về cho</span>
                <span className="text-base font-bold leading-none">Apple Silicon</span>
              </div>
            </Button>
          </a>

          {/* macOS Intel */}
          <a href={downloadLinks.macIntel} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="group h-[72px] px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-start gap-4 w-full md:w-[260px]">
              <Apple className="w-8 h-8 ml-2 text-zinc-400 group-hover:text-white transition-colors" />
              <div className="flex flex-col items-start text-left border-l border-white/10 pl-4 h-10 justify-center group-hover:border-white/20 transition-colors">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Tải về cho</span>
                <span className="text-base font-bold text-zinc-300 group-hover:text-white transition-colors leading-none">Intel Mac</span>
              </div>
            </Button>
          </a>
          
          {/* Windows */}
          <a href={downloadLinks.windows} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="group h-[72px] px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-start gap-4 w-full md:w-[260px]">
              <Monitor className="w-8 h-8 ml-2 text-zinc-400 group-hover:text-white transition-colors" />
              <div className="flex flex-col items-start text-left border-l border-white/10 pl-4 h-10 justify-center group-hover:border-white/20 transition-colors">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Tải về cho</span>
                <span className="text-base font-bold text-zinc-300 group-hover:text-white transition-colors leading-none">Windows</span>
              </div>
            </Button>
          </a>
        </motion.div>

        {/* Feature Cards Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4"
        >
          <Card className="bg-white/5 border-white/10 p-8 backdrop-blur-md rounded-3xl hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-2 text-left flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Tạo video tự động</h3>
            <p className="text-zinc-400 leading-relaxed text-base">Kết nối trực tiếp với tài khoản Sora của bạn, tự động hóa toàn bộ quy trình cấu hình video, gửi prompt và tải video về máy mà không cần thao tác tay.</p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8 backdrop-blur-md rounded-3xl hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-2 text-left flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Xử lý hàng loạt</h3>
            <p className="text-zinc-400 leading-relaxed text-base">Đồng bộ link sản phẩm TikTok Affiliate, tự động phân tích thông tin chi tiết và tạo kịch bản video AI chuyên nghiệp với sức mạnh của Google Gemini.</p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8 backdrop-blur-md rounded-3xl hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-2 text-left flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Download className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Quản lý trọn vẹn</h3>
            <p className="text-zinc-400 leading-relaxed text-base">Lưu trữ khoa học, xem trước nhanh chóng nội dung kịch bản và sắp xếp tất cả các video đã render thành công ngay trên giao diện ứng dụng.</p>
          </Card>
        </motion.div>
      </main>

      {/* Decorative dashboard preview behind */}
      <div className="relative max-w-6xl mx-auto px-4 mt-8 pb-32 z-10 w-full" style={{ perspective: "1000px" }}>
        <motion.div
            initial={{ opacity: 0, rotateX: 10, y: 100 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-[0_0_80px_rgba(37,244,238,0.1)] overflow-hidden aspect-[16/9] md:aspect-[21/9] flex flex-col relative"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            {/* Mock UI Topbar */}
            <div className="w-full h-12 border-b border-white/10 flex items-center px-4 gap-2 relative z-20">
              <div className="flex gap-1.5 opacity-50">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="mx-auto w-64 h-6 rounded-md bg-white/5" />
            </div>
            
            {/* Mock UI Content */}
            <div className="w-full flex-1 flex p-4 gap-4 opacity-60">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col gap-3 w-48 h-full rounded-xl bg-white/5 border border-white/5 p-3">
                <div className="w-full h-8 rounded-md bg-white/10 mb-4" />
                <div className="w-3/4 h-4 rounded text-xs bg-white/5" />
                <div className="w-5/6 h-4 rounded text-xs bg-white/5" />
                <div className="w-满 h-4 rounded text-xs bg-white/5" />
                <div className="w-2/3 h-4 rounded text-xs bg-white/5 mt-auto" />
              </div>
              
              {/* Main Canvas */}
              <div className="flex-1 h-full rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex flex-col gap-4 p-4">
                <div className="flex gap-4 h-1/3">
                   <div className="w-1/3 bg-white/5 rounded-lg border border-white/5" />
                   <div className="w-2/3 bg-white/5 rounded-lg border border-white/5 flex items-center p-4">
                     <div className="w-full h-1/2 bg-rose-500/20 rounded-lg" />
                   </div>
                </div>
                <div className="w-full flex-1 rounded-lg bg-black/50 border border-white/10 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {/* Play Button Mock */}
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white z-10 shadow-2xl">
                        <ArrowRight className="w-8 h-8 ml-1 text-white" />
                    </div>
                </div>
              </div>
            </div>
            
        </motion.div>
      </div>

    </div>
  );
}
