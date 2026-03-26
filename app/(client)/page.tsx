'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Coffee, Beer, Pizza, Star, Crown, Diamond } from 'lucide-react';
import { motion } from 'motion/react';
import CheckoutModal from '@/components/CheckoutModal';

export default function Home() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{name: string, durationMonths: number, price: number} | null>(null);

  const handleBuyPackage = (pkg: {name: string, durationMonths: number, price: number}) => {
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=2070&auto=format&fit=crop"
            alt="Billiards background"
            fill
            className="object-cover opacity-20"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950"></div>
        </div>
        
        <div className="container relative z-10 mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 text-5xl font-black uppercase tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Trải nghiệm <br />
            <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">Đẳng cấp</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 md:text-xl"
          >
            Hệ thống câu lạc bộ Billiards sang trọng bậc nhất với không gian Dark Luxury, bàn tiêu chuẩn thi đấu và dịch vụ hoàn hảo.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/tables" className="flex items-center gap-2 rounded-lg bg-amber-400 px-8 py-4 text-sm font-bold uppercase tracking-wider text-zinc-950 transition-all hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:-translate-y-1">
              Đặt bàn ngay <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#memberships" className="flex items-center gap-2 rounded-lg border border-amber-400/50 bg-zinc-900/50 px-8 py-4 text-sm font-bold uppercase tracking-wider text-amber-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:-translate-y-1">
              Gói Thành Viên
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Membership Packages Section */}
      <section id="memberships" className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold uppercase tracking-wider text-white md:text-4xl">Gói Thành Viên Đặc Quyền</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-4">Đăng ký gói thành viên để nhận ưu đãi giảm giá giờ chơi, tích lũy Điểm Lì Xì và trải nghiệm dịch vụ đẳng cấp.</p>
          <div className="mx-auto h-1 w-20 rounded-full bg-amber-400"></div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Silver */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-transform hover:-translate-y-2"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-zinc-100">Thẻ Bạc (1 Tháng)</h3>
            <p className="mb-6 text-sm text-zinc-400">Trải nghiệm dịch vụ cơ bản</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">500.000đ</span>
            </div>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Giảm 10% tiền giờ chơi</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Tích lũy Điểm Lì Xì (x1)</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Tặng 1 đồ uống miễn phí/lần</li>
            </ul>
            <button 
              onClick={() => handleBuyPackage({ name: 'Thẻ Bạc (1 Tháng)', durationMonths: 1, price: 500000 })}
              className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 py-3 text-center text-sm font-bold text-white hover:bg-zinc-700"
            >
              Đăng ký ngay
            </button>
          </motion.div>

          {/* Gold */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex flex-col rounded-2xl border border-amber-400/50 bg-zinc-900 p-8 shadow-[0_0_30px_rgba(251,191,36,0.1)] transition-transform hover:-translate-y-2"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-zinc-950">Phổ biến nhất</div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
              <Crown className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-amber-400">Thẻ Vàng (6 Tháng)</h3>
            <p className="mb-6 text-sm text-zinc-400">Lựa chọn tối ưu cho cơ thủ</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">2.500.000đ</span>
            </div>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Giảm 20% tiền giờ chơi</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Tích lũy Điểm Lì Xì (x2)</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Tặng 2 đồ uống miễn phí/lần</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Ưu tiên đặt bàn VIP</li>
            </ul>
            <button 
              onClick={() => handleBuyPackage({ name: 'Thẻ Vàng (6 Tháng)', durationMonths: 6, price: 2500000 })}
              className="block w-full rounded-lg bg-amber-400 py-3 text-center text-sm font-bold text-zinc-950 hover:bg-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            >
              Đăng ký ngay
            </button>
          </motion.div>

          {/* Diamond */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-transform hover:-translate-y-2"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Diamond className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-zinc-100">Thẻ Kim Cương (1 Năm)</h3>
            <p className="mb-6 text-sm text-zinc-400">Đẳng cấp thượng lưu</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">4.500.000đ</span>
            </div>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Giảm 30% tiền giờ chơi</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Tích lũy Điểm Lì Xì (x3)</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Miễn phí F&B không giới hạn</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Sử dụng phòng Super VIP miễn phí 2h/tháng</li>
            </ul>
            <button 
              onClick={() => handleBuyPackage({ name: 'Thẻ Kim Cương (1 Năm)', durationMonths: 12, price: 4500000 })}
              className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 py-3 text-center text-sm font-bold text-white hover:bg-zinc-700"
            >
              Đăng ký ngay
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold uppercase tracking-wider text-white md:text-4xl">Bảng giá giờ chơi</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-amber-400"></div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Standard */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-transform hover:-translate-y-2"
          >
            <h3 className="mb-2 text-xl font-bold text-zinc-100">Bàn Thường</h3>
            <p className="mb-6 text-sm text-zinc-400">Phù hợp cho giải trí hàng ngày</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">80.000đ</span>
              <span className="text-zinc-500">/giờ</span>
            </div>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Bàn Pool tiêu chuẩn</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Cơ cá nhân cơ bản</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Phục vụ nước suối miễn phí</li>
            </ul>
            <Link href="/tables" className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 py-3 text-center text-sm font-bold text-white hover:bg-zinc-700">Chọn bàn</Link>
          </motion.div>

          {/* VIP */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex flex-col rounded-2xl border border-amber-400/50 bg-zinc-900 p-8 shadow-[0_0_30px_rgba(251,191,36,0.1)] transition-transform hover:-translate-y-2"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-zinc-950">Phổ biến nhất</div>
            <h3 className="mb-2 text-xl font-bold text-amber-400">Bàn VIP</h3>
            <p className="mb-6 text-sm text-zinc-400">Trải nghiệm đẳng cấp, riêng tư</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">120.000đ</span>
              <span className="text-zinc-500">/giờ</span>
            </div>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Bàn thi đấu quốc tế</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Khu vực riêng tư, sofa lounge</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Cơ carbon cao cấp</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-amber-400" /> Nhân viên phục vụ riêng</li>
            </ul>
            <Link href="/tables" className="block w-full rounded-lg bg-amber-400 py-3 text-center text-sm font-bold text-zinc-950 hover:bg-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]">Đặt bàn VIP</Link>
          </motion.div>

          {/* Super VIP */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-transform hover:-translate-y-2"
          >
            <h3 className="mb-2 text-xl font-bold text-zinc-100">Phòng Super VIP</h3>
            <p className="mb-6 text-sm text-zinc-400">Không gian khép kín hoàn toàn</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">200.000đ</span>
              <span className="text-zinc-500">/giờ</span>
            </div>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Phòng lạnh riêng biệt</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Hệ thống âm thanh, TV riêng</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Tủ rượu vang & Cigar</li>
              <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Trợ lý AI phân tích trận đấu</li>
            </ul>
            <Link href="/tables" className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 py-3 text-center text-sm font-bold text-white hover:bg-zinc-700">Liên hệ đặt phòng</Link>
          </motion.div>
        </div>
      </section>

      {/* F&B Menu Section */}
      <section id="menu" className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold uppercase tracking-wider text-white md:text-4xl">Thực đơn F&B</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-amber-400"></div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Cà phê sữa đá', price: '35.000đ', icon: Coffee },
            { name: 'Bia Heineken', price: '40.000đ', icon: Beer },
            { name: 'Mì xào bò', price: '55.000đ', icon: Pizza },
            { name: 'Nước suối', price: '15.000đ', icon: Coffee },
            { name: 'Bò húc', price: '25.000đ', icon: Coffee },
            { name: 'Trà đào cam sả', price: '45.000đ', icon: Coffee },
            { name: 'Cơm chiên hải sản', price: '65.000đ', icon: Pizza },
            { name: 'Trái cây dĩa', price: '80.000đ', icon: Pizza },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 cursor-pointer"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200">{item.name}</h4>
                <p className="text-sm font-medium text-amber-400">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        packageData={selectedPackage} 
      />
    </div>
  );
}
