import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './index';
import { notificationAPI } from '../api/api';
import type { AppNotification } from '../types';

export function useNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<{
    items: AppNotification[];
    pendingIds: Set<string>;
    isLoading: boolean;
  }>({
    items: [],
    pendingIds: new Set(),
    isLoading: true
  });

  // Derived Values
  const unreadCount = state.items.filter(n => !n.isRead && !state.pendingIds.has(n.id)).length;
  const filteredNotifications = state.items.filter(n => !n.isRead && !state.pendingIds.has(n.id));

  useEffect(() => {
    // 1. 로그아웃 상태일 때 초기화
    if (!user?.uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(prev => {
        if (prev.items.length === 0 && !prev.isLoading) return prev;
        return { items: [], pendingIds: new Set(), isLoading: false };
      });
      return;
    }

    // 2. 초기 데이터 로드 함수 정의 (Effect 안으로 이동하여 의존성 해결)
    const loadInitial = async () => {
      try {
        const res = await notificationAPI.getAll();
        if (res.success && res.notifications) {
          setState(prev => ({ ...prev, items: res.notifications, isLoading: false }));
        }
      } catch (err) {
        console.error('[DEBUG_NOTIF] REST Error:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadInitial();

    // 3. Firestore 실시간 구독
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifList: AppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
        } as AppNotification);
      });
      
      const sortedList = notifList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setState(prev => {
        const newPending = new Set(prev.pendingIds);
        snapshot.forEach(doc => {
          if (doc.data().isRead) newPending.delete(doc.id);
        });
        return {
          ...prev,
          items: sortedList,
          pendingIds: newPending,
          isLoading: false
        };
      });
    }, (error) => {
      console.error("[DEBUG_NOTIF] Snapshot Error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    });

    return () => unsubscribe();
  }, [user?.uid]); 

  const markAsRead = useCallback(async (notificationId: string) => {
    // 1. 즉각적인 로컬 상태 업데이트 (확정적으로 숨김)
    setState(prev => {
        const next = new Set(prev.pendingIds);
        next.add(notificationId);
        return { ...prev, pendingIds: next };
    });

    try {
      // REST API를 통해 백엔드에서 읽음 처리 (Admin SDK)
      await notificationAPI.markAsRead(notificationId);
      // 참고: 여기서 pendingIds를 지우지 않습니다. 
      // 오직 onSnapshot에서 서버의 isRead: true 가 확인될 때만 지워집니다.
    } catch (error) {
      console.error("Failed to mark notification as read via API:", error);
      // 실패시에만 복원
      setState(prev => {
        const next = new Set(prev.pendingIds);
        next.delete(notificationId);
        return { ...prev, pendingIds: next };
      });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    
    const unreadIds = state.items.filter(n => !n.isRead).map(n => n.id);
    
    setState(prev => {
      const next = new Set(prev.pendingIds);
      unreadIds.forEach(id => next.add(id));
      return { ...prev, pendingIds: next };
    });

    try {
      await notificationAPI.markAllAsRead();
      // 마찬가지로 onSnapshot이 모든 처리를 담당하게 둡니다.
    } catch (error) {
      console.error("Failed to mark all notifications as read via API:", error);
    }
  }, [user?.uid, state.items]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading: state.isLoading
  };
}
