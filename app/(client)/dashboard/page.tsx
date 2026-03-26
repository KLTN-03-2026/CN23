'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Calendar, History, User, Settings, LogOut, ChevronRight, Activity, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState<any[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [loadingAct, setLoadingAct] = useState(false);
  
  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdatingProfile(true);
    setProfileMessage('');
    
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone })
      });
      
      if (res.ok) {
        setProfileMessage('Cập nhật thông tin thành công!');
        // Ideally we should update the AuthContext user here, but a refresh works too
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        setProfileMessage(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setProfileMessage('Lỗi kết nối');
    } finally {
      setUpdatingProfile(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'bookings') {
      const fetchReservations = async () => {
        setLoadingRes(true);
        try {
          const res = await fetch('/api/reservations');
          const data = await res.json();
          if (data.reservations) {
            const userRes = data.reservations.filter((r: any) => r.customerName === user.name || r.phone === user.phone);
            setReservations(userRes);
          }
        } catch (error) {
          console.error('Failed to fetch reservations', error);
        } finally {
          setLoadingRes(false);
        }
      };
      fetchReservations();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && activeTab === 'overview') {
      const fetchActivities = async () => {
        setLoadingAct(true);
        try {
          const [transRes, ordersRes, resRes] = await Promise.all([
            fetch(`/api/transactions?customerId=${user.id}`),
            fetch(`/api/orders?userId=${user.id}`),
            fetch('/api/reservations')
          ]);
          
          const transData = await transRes.json();
          const ordersData = await ordersRes.json();
          const resData = await resRes.json();
          
          let combined: any[] = [];
          
          if (transData.transactions) {
            const mappedTrans = transData.transactions.map((t: any) => ({
              ...t,
              activityType: 'pos',
              title: `Thanh toán tiền bàn ${t.tableName}`,
              amount: t.totalAmount
            }));
            combined = [...combined, ...mappedTrans];
          }
          
          if (ordersData.orders) {
            const mappedOrders = ordersData.orders.map((o: any) => ({
              ...o,
              activityType: 'membership',
              title: `Mua gói ${o.packageName}`,
              amount: o.amount
            }));
            combined = [...combined, ...mappedOrders];
          }

          if (resData.reservations) {
            const userRes = resData.reservations.filter((r: any) => r.customerName === user.name || r.phone === user.phone);
            
            // Set upcoming reservations (pending or confirmed)
            const upcoming = userRes.filter((r: any) => r.status === 'pending' || r.status === 'confirmed');
            // Sort by time (assuming time string can be parsed or just string sort for now, better to sort by createdAt descending)
            upcoming.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setUpcomingReservations(upcoming);

            const mappedRes = userRes.map((r: any) => ({
              ...r,
              activityType: 'reservation',
              title: `Đặt bàn: ${r.tableType}`,
              amount: null // No amount for reservation
            }));
            combined = [...combined, ...mappedRes];
          }
          
          // Sort by date descending
          combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setActivities(combined.slice(0, 5)); // Show top 5 recent activities
        } catch (error) {
          console.error('Failed to fetch activities', error);
        } finally {
          setLoadingAct(false);
        }
      };
      fetchActivities();
    }
  }, [user, activeTab]);

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Xin chào, <span className="text-amber-400">{user.name}</span></h1>
          <p className="text-zinc-400 mt-1">Chào mừng bạn đến với không gian quản lý cá nhân của Luxe Bida.</p>
        </div>
        <Link href="/tables" className="inline-flex w-max items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]">
          Đặt bàn mới <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Sidebar / Quick Stats */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-white">{user.name}</h3>
                <p className="text-sm text-zinc-400">Thành viên Tiêu chuẩn</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-400">Số giờ đã chơi</span>
                <span className="font-bold text-white">{user.totalHoursPlayed || 0} giờ</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <span className="text-sm text-zinc-400">Điểm tích lũy</span>
                <span className="font-bold text-amber-400">{user.points || 0} điểm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Hạng thẻ</span>
                <span className="font-bold text-zinc-300">{user.membershipType || 'Thành viên Tiêu chuẩn'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
            >
              <Activity className={`h-5 w-5 ${activeTab === 'overview' ? 'text-amber-400' : ''}`} /> Tổng quan
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
            >
              <Calendar className={`h-5 w-5 ${activeTab === 'bookings' ? 'text-amber-400' : ''}`} /> Lịch sử đặt bàn
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
            >
              <Settings className={`h-5 w-5 ${activeTab === 'profile' ? 'text-amber-400' : ''}`} /> Cài đặt tài khoản
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-zinc-800/50 hover:text-red-300 mt-4 border border-red-500/20"
            >
              <LogOut className="h-5 w-5" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-3">
          
          {activeTab === 'overview' && (
            <>
              {/* Active Bookings */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-400" /> Lịch đặt sắp tới
                  </h2>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-amber-400 hover:underline">Xem tất cả</button>
                </div>
                
                {loadingAct ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
                  </div>
                ) : upcomingReservations.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingReservations.slice(0, 3).map((res) => (
                      <div key={res._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{res.tableType}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              res.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {res.status === 'pending' ? 'Chờ xác nhận' : 'Đã xác nhận'}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">Thời gian: <span className="text-zinc-200">{res.time}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 mb-2">Mã đặt bàn: {res._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/20 py-12 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-zinc-600" />
                    <h3 className="mb-2 text-lg font-medium text-zinc-300">Bạn chưa có lịch đặt nào sắp tới</h3>
                    <p className="mb-6 text-sm text-zinc-500">Hãy đặt bàn ngay để trải nghiệm dịch vụ của chúng tôi.</p>
                    <Link href="/tables" className="rounded-lg bg-zinc-800 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
                      Xem sơ đồ bàn
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="h-5 w-5 text-amber-400" /> Hoạt động gần đây
                  </h2>
                </div>
                
                {loadingAct ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((act) => (
                      <div key={act._id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            act.activityType === 'pos' ? 'bg-blue-500/10 text-blue-500' : 
                            act.activityType === 'reservation' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {act.activityType === 'pos' ? <Clock className="h-5 w-5" /> : 
                             act.activityType === 'reservation' ? <Calendar className="h-5 w-5" /> :
                             <User className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{act.title}</p>
                            <p className="text-xs text-zinc-500">{new Date(act.createdAt).toLocaleDateString('vi-VN')} - {new Date(act.createdAt).toLocaleTimeString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {act.amount !== null ? (
                            <p className="font-bold text-white">{act.amount.toLocaleString('vi-VN')}đ</p>
                          ) : (
                            <p className="font-bold text-white">-</p>
                          )}
                          <p className={`text-xs ${act.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {act.activityType === 'reservation' ? (act.status === 'pending' ? 'Chờ XN' : act.status === 'confirmed' ? 'Đã XN' : act.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành') : 'Thành công'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/20 py-8 text-center">
                    <p className="text-sm text-zinc-500">Chưa có hoạt động nào gần đây.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-400" /> Lịch sử đặt bàn
                </h2>
              </div>
              
              {loadingRes ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
                </div>
              ) : reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((res) => (
                    <div key={res._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{res.tableType}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            res.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            res.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            res.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {res.status === 'pending' ? 'Chờ xác nhận' : 
                             res.status === 'confirmed' ? 'Đã xác nhận' : 
                             res.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">Thời gian: <span className="text-zinc-200">{res.time}</span></p>
                        <p className="text-sm text-zinc-400">Tên người đặt: <span className="text-zinc-200">{res.customerName}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 mb-2">Mã đặt bàn: {res._id.substring(0, 8)}</p>
                        {res.status === 'pending' && (
                          <button className="text-sm text-red-400 hover:text-red-300 transition-colors">Hủy đặt bàn</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/20 py-12 text-center">
                  <History className="mb-4 h-12 w-12 text-zinc-600" />
                  <h3 className="mb-2 text-lg font-medium text-zinc-300">Chưa có lịch sử đặt bàn</h3>
                  <p className="mb-6 text-sm text-zinc-500">Bạn chưa thực hiện đặt bàn nào trên hệ thống.</p>
                  <Link href="/tables" className="rounded-lg bg-amber-400 px-6 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300">
                    Đặt bàn ngay
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-400" /> Cài đặt tài khoản
                </h2>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Họ và tên</label>
                    <input 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Chưa cập nhật"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-zinc-300">Email</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      disabled
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-zinc-500">Email không thể thay đổi sau khi đăng ký.</p>
                  </div>
                </div>
                
                {profileMessage && (
                  <div className={`p-3 rounded-lg text-sm ${profileMessage.includes('thành công') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {profileMessage}
                  </div>
                )}
                
                <div className="pt-4 border-t border-zinc-800">
                  <button 
                    type="submit" 
                    disabled={updatingProfile}
                    className="flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
                  >
                    {updatingProfile ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {updatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
