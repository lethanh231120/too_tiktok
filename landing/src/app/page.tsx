"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Apple, ArrowRight, Video, Sparkles, Zap, MessageCircle, Phone, Mail, Github, Facebook, ShieldAlert, Terminal, Copy, Check, ChevronDown } from "lucide-react";
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
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

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
          <button onClick={() => document.getElementById("troubleshoot")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Khắc phục</button>
          <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Liên hệ</button>
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

        {/* macOS Troubleshooting Section */}
        <section id="troubleshoot" className="w-full pt-32 mt-12 flex flex-col items-center">
          <div className="text-center mb-16 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
              <ShieldAlert className="w-4 h-4" />
              <span>Dành cho người dùng macOS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Khắc phục lỗi cài đặt</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Nếu bạn gặp thông báo <span className="text-amber-400 font-semibold">&ldquo;is damaged and can&apos;t be opened&rdquo;</span> khi mở ứng dụng, hãy làm theo hướng dẫn bên dưới
            </p>
          </div>

          <div className="w-full max-w-3xl px-4 flex flex-col gap-4">
            {/* Method 1 - Terminal Command */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full text-left"
              >
                <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md rounded-2xl hover:bg-white/[0.08] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">Cách 1: Chạy lệnh Terminal</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">Khuyến nghị</span>
                        </div>
                        <p className="text-zinc-400 text-sm mt-1">Xóa thuộc tính cách ly (quarantine) của macOS</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openFaq === 0 ? "rotate-180" : ""}`} />
                  </div>
                </Card>
              </button>
              {openFaq === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-zinc-300 text-sm mb-4">Mở ứng dụng <strong className="text-white">Terminal</strong> (tìm trong Spotlight bằng cách nhấn <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">⌘ + Space</kbd> rồi gõ &ldquo;Terminal&rdquo;), sau đó dán lệnh sau:</p>
                  <div className="relative group">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-sm text-emerald-400 overflow-x-auto">
                      <span className="text-zinc-500 select-none">$ </span>xattr -cr "/Applications/TikTok Video Generator.app"
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy('xattr -cr "/Applications/TikTok Video Generator.app"'); }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Sao chép lệnh"
                    >
                      {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>
                  <p className="text-zinc-500 text-xs mt-3">💡 Nếu app nằm ở thư mục <strong>Downloads</strong>, thay đường dẫn thành: <code className="text-zinc-400">~/Downloads/TikTok\ Video\ Generator.app</code></p>
                </motion.div>
              )}
            </motion.div>

            {/* Method 2 - System Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full text-left"
              >
                <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md rounded-2xl hover:bg-white/[0.08] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Cách 2: Mở từ System Settings</h3>
                        <p className="text-zinc-400 text-sm mt-1">Cho phép ứng dụng qua cài đặt bảo mật</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openFaq === 1 ? "rotate-180" : ""}`} />
                  </div>
                </Card>
              </button>
              {openFaq === 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6"
                >
                  <ol className="space-y-3 text-sm text-zinc-300 list-decimal list-inside">
                    <li>Mở <strong className="text-white">System Settings</strong> (Cài đặt hệ thống)</li>
                    <li>Chọn <strong className="text-white">Privacy & Security</strong> (Quyền riêng tư & Bảo mật)</li>
                    <li>Cuộn xuống phần <strong className="text-white">Security</strong></li>
                    <li>Tìm thông báo về ứng dụng bị chặn → Nhấn <strong className="text-white">&ldquo;Open Anyway&rdquo;</strong></li>
                    <li>Xác nhận mở ứng dụng trong hộp thoại xuất hiện</li>
                  </ol>
                </motion.div>
              )}
            </motion.div>

            {/* Method 3 - Disable Gatekeeper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full text-left"
              >
                <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md rounded-2xl hover:bg-white/[0.08] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Cách 3: Tắt Gatekeeper tạm thời</h3>
                        <p className="text-zinc-400 text-sm mt-1">Tắt tính năng kiểm tra bảo mật của macOS</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openFaq === 2 ? "rotate-180" : ""}`} />
                  </div>
                </Card>
              </button>
              {openFaq === 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-zinc-300 text-sm mb-4">Chạy lệnh sau trong Terminal để tắt Gatekeeper:</p>
                  <div className="relative group mb-3">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-sm text-amber-400 overflow-x-auto">
                      <span className="text-zinc-500 select-none">$ </span>sudo spctl --master-disable
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy('sudo spctl --master-disable'); }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Sao chép lệnh"
                    >
                      {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>
                  <p className="text-zinc-300 text-sm mb-3">Sau khi mở app thành công, <strong className="text-white">bật lại</strong> Gatekeeper:</p>
                  <div className="relative group">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-sm text-emerald-400 overflow-x-auto">
                      <span className="text-zinc-500 select-none">$ </span>sudo spctl --master-enable
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy('sudo spctl --master-enable'); }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Sao chép lệnh"
                    >
                      {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-400 text-xs">⚠️ Lưu ý: Nhớ bật lại Gatekeeper sau khi mở app để đảm bảo an toàn cho máy tính của bạn.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Why this happens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
            >
              <p className="text-zinc-500 text-sm leading-relaxed">
                💬 <strong className="text-zinc-400">Tại sao lỗi này xảy ra?</strong> macOS có tính năng bảo mật <em>Gatekeeper</em> tự động chặn các ứng dụng chưa được Apple công chứng (notarize). Ứng dụng TikTokGen hoàn toàn an toàn — lỗi này chỉ do app chưa được đăng ký với Apple Developer Program.
              </p>
            </motion.div>
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

      {/* Contact Section */}
      <section id="contact" className="w-full pt-16 mt-8 flex flex-col items-center relative z-20 pb-20">
        <div className="w-full max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Bạn cần hỗ trợ?</h2>
          <p className="text-zinc-400 mb-10 max-w-lg mx-auto">Nếu bạn có câu hỏi về việc cài đặt hoặc sử dụng phần mềm, đừng ngần ngại liên hệ trực tiếp với chúng tôi qua các kênh sau:</p>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-left transition-all hover:bg-white/[0.08]">
            <div className="flex-shrink-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl shadow-black/50">
                <img src="/avatar_info.jpg" alt="Vũ Lưu" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col flex-grow justify-center py-2 h-full">
               <h3 className="text-2xl font-bold text-white mb-2 text-center md:text-left">Vũ Lưu (vuluu2k)</h3>
               <p className="text-zinc-400 mb-8 max-w-md text-center md:text-left text-sm md:text-base leading-relaxed">
                 Xin chào, mình là nhà phát triển của TikTokGen. Nếu bạn có gặp bất kỳ khó khăn nào trong quá trình cài đặt hay tối ưu quy trình Affiliate, hãy liên hệ ngay để được hỗ trợ tốt nhất!
               </p>
               <div className="flex flex-wrap gap-3 w-full">
                  <a href="https://zalo.me/0823489529" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Zalo</span>
                      <span className="text-sm font-bold text-white">0823489529</span>
                    </div>
                  </a>
                  
                  <a href="tel:0823489529" className="flex-1 min-w-[140px] flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hotline</span>
                      <span className="text-sm font-bold text-white">0823489529</span>
                    </div>
                  </a>
                  
                  <a href="mailto:vuluu040320@gmail.com" className="flex-1 min-w-[140px] flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</span>
                      <span className="text-sm font-bold text-white truncate text-ellipsis max-w-[120px]" title="vuluu040320@gmail.com">vuluu0403...</span>
                    </div>
                  </a>

                  <a href="https://github.com/vuluu2k" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] flex items-center gap-3 p-3 rounded-xl bg-zinc-500/10 border border-zinc-500/20 hover:bg-zinc-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-zinc-500/20 text-zinc-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Github className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Github</span>
                      <span className="text-sm font-bold text-white">vuluu2k</span>
                    </div>
                  </a>

                  <a href="https://facebook.com/vuluu2k" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Facebook</span>
                      <span className="text-sm font-bold text-white">vuluu2k</span>
                    </div>
                  </a>
               </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/40 py-8 text-center text-zinc-500 text-sm pb-12">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 opacity-50 grayscale" />
          <span className="font-semibold text-zinc-400">TikTokGen</span>
        </div>
        <p>© 2026 TikTok Video Generator. Powering Affiliate automation.</p>
      </footer>

    </div>
  );
}
