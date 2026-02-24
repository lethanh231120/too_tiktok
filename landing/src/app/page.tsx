"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Apple, ArrowRight, Video, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const MINIO_URL = "https://ss3.fastfol.io.vn/tiktok-releases";

export default function Home() {
  const [downloadLinks, setDownloadLinks] = useState({
    macSilicon: "#",
    macIntel: "#",
    windows: "#"
  });

  useEffect(() => {
    fetch("/downloads.json")
      .then(res => res.json())
      .then(data => {
        if (data && data.macSilicon && data.windows) {
          setDownloadLinks(data);
        }
      })
      .catch(err => console.error("Failed to load generic downloads.json, ensure the upload script was run:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-rose-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px]" />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-white/10 shrink-0">
            <img src="/logo.png" alt="TikTok Gen Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">TikTok<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-cyan-400">Gen</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Tính năng</button>
          <button onClick={() => document.getElementById("guide")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Hướng dẫn</button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center px-4 pt-32 pb-32 text-center md:pt-40">
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
        <section id="features" className="w-full pt-24 mt-8 flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Trợ lý đắc lực của bạn trong hành trình sáng tạo nội dung tiếp thị liên kết</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4"
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
        </section>

        {/* Guide Section */}
        <section id="guide" className="w-full pt-32 mt-12 flex flex-col items-center">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Hướng dẫn sử dụng</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">Chỉ với 3 bước đơn giản để bắt đầu hành trình sáng tạo hàng ngàn video bán hàng</p>
          </div>
          
          <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/50 to-cyan-500/0" />
            
            {[
              { 
                step: "01", 
                title: "Đăng nhập hệ thống", 
                desc: "Mở ứng dụng, tiến hành đăng nhập vào tài khoản OpenAI (Sora) và điền API Key Google Gemini của bạn vào phần cài đặt." 
              },
              { 
                step: "02", 
                title: "Nhập Link / Sản phẩm", 
                desc: "Dán đường dẫn sản phẩm TikTok Affiliate vào. Trí tuệ nhân tạo Gemini sẽ phân tích tính năng và viết nhiều kịch bản thu hút." 
              },
              { 
                step: "03", 
                title: "Tạo & Xuất Video", 
                desc: "Bấm nút Tạo Video. Phần mềm sẽ tự động gửi lệnh điều khiển cho Sora render những thước phim mượt mà và tải thẳng về máy tính." 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="w-32 h-32 rounded-full border-4 border-[#0A0A0A] bg-zinc-900 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center mb-8 relative">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed px-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Decorative dashboard preview behind */}
      <div className="relative max-w-6xl mx-auto px-4 mt-8 pb-32 z-10 w-full" style={{ perspective: "1000px" }}>
        <motion.div
            initial={{ opacity: 0, rotateX: 10, y: 100 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
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
                <div className="w-full h-4 rounded text-xs bg-white/5" />
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

      <footer className="border-t border-white/10 bg-black/40 py-8 text-center text-zinc-500 text-sm mt-12 pb-12">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 opacity-50 grayscale" />
          <span className="font-semibold text-zinc-400">TikTokGen</span>
        </div>
        <p>© 2026 TikTok Video Generator. Powering Affiliate automation.</p>
      </footer>

    </div>
  );
}
