import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { DesktopNav } from './DesktopNav';
import { MobileBottomNav } from './MobileBottomNav';
import { Drawer } from './Drawer';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { QRCodeModal } from '../common/QRCodeModal';
import { getLocalNotifications } from '../../services/storageService';

export const PublicLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getLocalNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Desktop / Tablet Navigation */}
      <DesktopNav onOpenQR={() => setQrOpen(true)} />

      {/* Main Page Content */}
      <main className="flex-1 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (5 items) */}
      <MobileBottomNav />

      {/* Drawers and Modals */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenQR={() => setQrOpen(true)}
      />

      <NotificationDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onUpdate={setNotifications}
      />

      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Share MY NSDA Directory"
        subtitle="Scan with your phone to access NSDA Doctors Directory"
        url={window.location.origin}
      />
    </div>
  );
};
